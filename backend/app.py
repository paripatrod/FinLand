from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import joblib
import math
import os
import re
import html
from profile_details import profile_details

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS Configuration - Allow all origins for now (change in production)
CORS(app, 
     resources={r"/api/*": {"origins": "*"}},
     allow_headers=["Content-Type", "Accept"],
     methods=["GET", "POST", "OPTIONS"])

# Rate Limiting Configuration
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# Input Sanitization Functions
def sanitize_string(value):
    """Sanitize string input to prevent XSS attacks"""
    if value is None:
        return None
    if isinstance(value, str):
        # Remove HTML tags and escape special characters
        value = re.sub(r'<[^>]*>', '', value)
        value = html.escape(value)
        # Remove potential script injections
        value = re.sub(r'javascript:', '', value, flags=re.IGNORECASE)
        value = re.sub(r'on\w+\s*=', '', value, flags=re.IGNORECASE)
    return value

def sanitize_number(value, min_val=0, max_val=float('inf')):
    """Sanitize and validate numeric input"""
    try:
        num = float(value)
        if math.isnan(num) or math.isinf(num):
            return None
        if num < min_val or num > max_val:
            return None
        return num
    except (ValueError, TypeError):
        return None

def validate_input(data, required_fields):
    """Validate that required fields exist and are valid numbers"""
    if not data:
        return "No data provided"
    
    for field in required_fields:
        if field not in data:
            return f"Missing required field: {field}"
        
        # Sanitize and validate
        value = sanitize_number(data[field], min_val=0, max_val=1e12)
        if value is None:
            return f"Field '{field}' must be a valid positive number (max 1 trillion)"
        
        # Check for reasonable values
        if field in ['apr', 'interest_rate', 'int_rate'] and value > 100:
            return f"Interest rate '{field}' cannot exceed 100%"
        if field in ['term', 'term_months'] and value > 600:
            return f"Term cannot exceed 600 months (50 years)"
    
    return None

# Define EnterpriseProfilePredictor class (same as in train_model.py)
class EnterpriseProfilePredictor:
    """
    Enterprise-Grade Profile Predictor with Feature Engineering
    Version: 3.0.0 - Full 29 Features (matches training)
    """
    def __init__(self, model, scaler, version="3.0.0"):
        self.model = model
        self.scaler = scaler
        self.version = version
        self.n_features = 29  # Full feature set
    
    def _engineer_features(self, X):
        """Apply same feature engineering as training (EXACT MATCH)"""
        import numpy as np
        
        X_enhanced_list = []
        
        for i in range(X.shape[0]):
            loan = X[i, 0]
            rate = X[i, 1]
            term = X[i, 2]
            
            # Original features
            features = [loan, rate, term]
            
            # Derived features
            monthly_payment = (loan * (rate/100/12)) / (1 - (1 + rate/100/12)**(-term)) if rate > 0 else loan/term
            total_interest = (monthly_payment * term) - loan
            debt_to_term_ratio = loan / term
            rate_term_interaction = rate * term
            payment_to_loan_ratio = monthly_payment / loan if loan > 0 else 0
            
            # Advanced features
            effective_rate = ((1 + rate/100/12)**12 - 1) * 100  # Effective annual rate
            log_loan = np.log1p(loan)  # Log transformation
            sqrt_term = np.sqrt(term)
            
            # Multi-level loan type classification
            loan_type_student = 1 if rate <= 2.0 else 0
            loan_type_personal = 1 if 5.0 <= rate < 12.0 else 0
            loan_type_high_risk = 1 if 12.0 <= rate < 15.0 else 0
            loan_type_credit_card = 1 if rate >= 15.0 else 0
            
            # Rate bracket indicators
            rate_bracket_ultra_low = 1 if rate < 1.0 else 0
            rate_bracket_low = 1 if 1.0 <= rate < 2.0 else 0
            rate_bracket_medium = 1 if 5.0 <= rate < 10.0 else 0
            rate_bracket_high = 1 if 10.0 <= rate < 15.0 else 0
            rate_bracket_crisis = 1 if rate >= 20.0 else 0
            
            # Loan amount categories
            loan_tiny = 1 if loan < 50000 else 0
            loan_small = 1 if 50000 <= loan < 150000 else 0
            loan_medium = 1 if 150000 <= loan < 300000 else 0
            loan_large = 1 if loan >= 300000 else 0
            
            # Term categories
            term_short = 1 if term <= 36 else 0
            term_long = 1 if term >= 60 else 0
            
            # Combined features
            loan_rate_product = loan * rate
            total_payment = monthly_payment * term
            interest_ratio = total_interest / loan if loan > 0 else 0
            
            features.extend([
                monthly_payment,
                total_interest,
                debt_to_term_ratio,
                rate_term_interaction,
                payment_to_loan_ratio,
                effective_rate,
                log_loan,
                sqrt_term,
                loan_type_student,
                loan_type_personal,
                loan_type_high_risk,
                loan_type_credit_card,
                rate_bracket_ultra_low,
                rate_bracket_low,
                rate_bracket_medium,
                rate_bracket_high,
                rate_bracket_crisis,
                loan_tiny,
                loan_small,
                loan_medium,
                loan_large,
                term_short,
                term_long,
                loan_rate_product,
                total_payment,
                interest_ratio
            ])
            
            X_enhanced_list.append(features)
        
        return np.array(X_enhanced_list)
    
    def predict(self, X):
        """Predict with automatic feature engineering"""
        X_enhanced = self._engineer_features(X)
        X_scaled = self.scaler.transform(X_enhanced)
        return self.model.predict(X_scaled)
    
    def predict_proba(self, X):
        """Predict probabilities with automatic feature engineering"""
        X_enhanced = self._engineer_features(X)
        X_scaled = self.scaler.transform(X_enhanced)
        return self.model.predict_proba(X_scaled)

# Lazy load AI Model (optional) - Load only when first prediction request comes
model = None
model_loading_attempted = False
financial_advisor = None  # New v3.0 model
advisor_loading_attempted = False

def download_model_from_url():
    """Download model from external URL if not exists locally"""
    model_url = os.getenv('MODEL_URL', '')
    
    if not model_url:
        return False
    
    try:
        print(f"📥 Downloading AI Model from {model_url[:50]}...")
        import requests
        response = requests.get(model_url, timeout=300)
        response.raise_for_status()
        
        # Determine filename from URL
        if 'financial_advisor' in model_url:
            filename = 'financial_advisor_model.pkl'
        else:
            filename = 'model.pkl'
        
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Model downloaded successfully to {filename}!")
        return True
    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        return False

def get_model():
    """Lazy load the AI model on first use"""
    global model, model_loading_attempted
    
    if model_loading_attempted:
        return model
    
    model_loading_attempted = True
    
    # Try to download model if not exists locally
    if not os.path.exists('model.pkl'):
        print("📦 Model not found locally, checking for remote URL...")
        if not download_model_from_url():
            print("⚠️ AI model not available. To enable AI: Set MODEL_URL environment variable or provide model.pkl file.")
            return None
    
    try:
        print("📦 Loading AI Model...")
        model_data = joblib.load('model.pkl')
        
        # Handle both old format (EnterpriseProfilePredictor) and new format (dict)
        if isinstance(model_data, dict):
            # New format: wrap in EnterpriseProfilePredictor
            model = EnterpriseProfilePredictor(
                model_data['model'],
                model_data['scaler'],
                version=model_data.get('version', '3.0.0')
            )
            print(f"✅ AI Model loaded successfully! (v{model.version}, accuracy: {model_data.get('accuracy', 0)*100:.1f}%)")
        else:
            # Old format: already wrapped
            model = model_data
            print("✅ AI Model loaded successfully!")
        
        # Force garbage collection to free up memory
        import gc
        del model_data
        gc.collect()
        
        return model
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return None


def get_financial_advisor():
    """Lazy load the Financial Advisor v3.0 model"""
    global financial_advisor, advisor_loading_attempted
    
    if advisor_loading_attempted:
        return financial_advisor
    
    advisor_loading_attempted = True
    
    # Check if model exists
    if not os.path.exists('financial_advisor_model.pkl'):
        print("📦 Financial Advisor model not found locally, checking remote...")
        model_url = os.getenv('MODEL_URL', '')
        if model_url and 'financial_advisor' in model_url:
            download_model_from_url()
    
    if not os.path.exists('financial_advisor_model.pkl'):
        print("⚠️ Financial Advisor v3.0 not available")
        return None
    
    try:
        print("🧠 Loading Financial Advisor v3.0...")
        financial_advisor = joblib.load('financial_advisor_model.pkl')
        print(f"✅ Financial Advisor v3.0 loaded! ({financial_advisor.get('training_samples', 0):,} samples)")
        return financial_advisor
    except Exception as e:
        print(f"❌ Error loading Financial Advisor: {e}")
        return None

# API: Predict Profile
@app.route('/api/predict', methods=['POST'])
@limiter.limit("30 per minute")
def predict_profile():
    """Predict debt profile using AI model (with optional DTI analysis)"""
    current_model = get_model()
    
    if current_model is None:
        return jsonify({"error": "AI Model not loaded. Install numpy & scikit-learn and provide backend/model.pkl to enable."}), 500
    
    try:
        data = request.json
        print(f"📥 Received prediction request: {data}")
        
        # Support both naming conventions for flexibility
        loan_amnt = float(data.get('loan_amnt') or data.get('loan_amount') or 0)
        int_rate = float(data.get('int_rate') or data.get('interest_rate') or 0)
        term = data.get('term')
        monthly_income = float(data.get('monthly_income', 0) or 0)
        monthly_payment = float(data.get('monthly_payment', 0) or 0)
        
        # Validate required fields
        if loan_amnt <= 0:
            return jsonify({"error": "กรุณาระบุยอดหนี้"}), 400
        if int_rate <= 0:
            return jsonify({"error": "กรุณาระบุอัตราดอกเบี้ย"}), 400
        if term is None or term == 0:
            return jsonify({"error": "ไม่สามารถคำนวณได้ กรุณาตรวจสอบยอดจ่ายต่อเดือน"}), 400
        
        term = float(term)

        # Calculate monthly payment if not provided (for DTI calculation)
        if monthly_payment <= 0:
            try:
                monthly_rate = (int_rate / 100) / 12
                if monthly_rate > 0:
                    monthly_payment = loan_amnt * monthly_rate / (1 - math.pow(1 + monthly_rate, -term))
                else:
                    monthly_payment = loan_amnt / term
            except:
                monthly_payment = 0
        
        # Import numpy locally to avoid requiring it unless prediction is actually used
        import numpy as np
        user_input = np.array([[loan_amnt, int_rate, term]])
        prediction = current_model.predict(user_input)
        profile_id = int(prediction[0])
        
        # Try to get confidence score if model supports predict_proba
        confidence = None
        if hasattr(current_model, 'predict_proba'):
            try:
                probas = current_model.predict_proba(user_input)
                confidence = float(np.max(probas[0]) * 100)  # Convert to percentage
            except:
                pass
        
        result = profile_details.get(profile_id, {
            "name": "ไม่พบข้อมูล",
            "tip": "กรุณาลองใหม่อีกครั้ง",
            "severity": "unknown",
            "action": "ติดต่อผู้เชี่ยวชาญ",
            "risk_score": 50
        }).copy() # Copy to avoid modifying the global dictionary
        
        # ═══════════════════════════════════════════════════════════════════════
        # 🧠 PERSONALIZED ANALYSIS - Dynamic Tips based on user's actual data
        # ═══════════════════════════════════════════════════════════════════════
        
        # Calculate key metrics
        monthly_rate = (int_rate / 100) / 12
        monthly_interest = loan_amnt * monthly_rate
        total_interest = (monthly_payment * term) - loan_amnt if monthly_payment > 0 else 0
        years_to_payoff = term / 12
        
        # DTI Analysis
        dti_ratio = (monthly_payment / monthly_income * 100) if monthly_income > 0 else 0
        result['dti_ratio'] = round(dti_ratio, 2)
        
        # Generate PERSONALIZED tip based on actual numbers
        personalized_tips = []
        personalized_actions = []
        
        # 1. DTI-based advice
        if monthly_income > 0:
            if dti_ratio > 50:
                result['severity'] = 'critical'
                result['risk_score'] = min(99, result.get('risk_score', 50) + 25)
                personalized_tips.append(f"🚨 หนี้กินรายได้ถึง {dti_ratio:.0f}% (ควรต่ำกว่า 30%)")
                personalized_actions.append("หารายได้เสริมด่วน")
            elif dti_ratio > 40:
                result['severity'] = 'high'
                result['risk_score'] = min(90, result.get('risk_score', 50) + 15)
                personalized_tips.append(f"⚠️ ภาระหนี้ {dti_ratio:.0f}% ของรายได้ ค่อนข้างหนัก")
                personalized_actions.append("ลดรายจ่ายที่ไม่จำเป็น")
            elif dti_ratio > 30:
                result['severity'] = 'medium'
                result['risk_score'] = min(80, result.get('risk_score', 50) + 10)
                personalized_tips.append(f"📊 ภาระหนี้ {dti_ratio:.0f}% พอรับไหว แต่ควรระวัง")
            elif dti_ratio > 0:
                personalized_tips.append(f"✅ ภาระหนี้ {dti_ratio:.0f}% อยู่ในเกณฑ์ดี")
        
        # 2. Interest rate advice
        if int_rate >= 20:
            personalized_tips.append(f"🔥 ดอกเบี้ย {int_rate}% สูงมาก! เสียดอกเบี้ย ~{monthly_interest:,.0f} บาท/เดือน")
            personalized_actions.append("หาสินเชื่อดอกต่ำมาปิดด่วน")
        elif int_rate >= 15:
            personalized_tips.append(f"💳 ดอกเบี้ย {int_rate}% ระดับบัตรเครดิต ดอกเบี้ย ~{monthly_interest:,.0f} บาท/เดือน")
            personalized_actions.append("รีไฟแนนซ์หาดอกต่ำกว่า")
        elif int_rate >= 8:
            personalized_tips.append(f"📈 ดอกเบี้ย {int_rate}% ปานกลาง")
            if int_rate > 10:
                personalized_actions.append("เปรียบเทียบดอกเบี้ยธนาคารอื่น")
        elif int_rate >= 2:
            personalized_tips.append(f"👍 ดอกเบี้ย {int_rate}% ถือว่าต่ำ")
        else:
            personalized_tips.append(f"✨ ดอกเบี้ย {int_rate}% ต่ำมาก (ระดับ กยศ.)")
        
        # 3. Payoff timeline advice
        if years_to_payoff > 10:
            personalized_tips.append(f"⏰ ผ่อน {years_to_payoff:.1f} ปี ยาวมาก ดอกเบี้ยสะสม ~{total_interest:,.0f} บาท")
            personalized_actions.append("พิจารณาเพิ่มยอดจ่ายต่อเดือน")
        elif years_to_payoff > 5:
            personalized_tips.append(f"📅 ผ่อน {years_to_payoff:.1f} ปี ({term:.0f} เดือน)")
        else:
            personalized_tips.append(f"⚡ ผ่อน {years_to_payoff:.1f} ปี ไม่นานเกินไป")
        
        # 4. Payment increase suggestion
        if monthly_payment > 0 and monthly_income > 0:
            suggested_increase = monthly_payment * 0.2  # 20% increase
            new_payment = monthly_payment + suggested_increase
            
            # Calculate new payoff time with increased payment
            if new_payment > monthly_interest:
                new_months = 0
                temp_balance = loan_amnt
                while temp_balance > 0.01 and new_months < 600:
                    interest = temp_balance * monthly_rate
                    principal = new_payment - interest
                    temp_balance -= principal
                    new_months += 1
                
                months_saved = term - new_months
                if months_saved > 3:
                    personalized_tips.append(
                        f"💡 ถ้าเพิ่มจ่ายอีก {suggested_increase:,.0f} บาท/เดือน → ปิดหนี้เร็วขึ้น {months_saved:.0f} เดือน!"
                    )
        
        # 5. Emergency fund check
        if monthly_income > 0:
            emergency_months = loan_amnt / monthly_income
            if emergency_months > 12:
                personalized_actions.append("สำรองเงินฉุกเฉิน 6-12 เดือน")
        
        # Build final personalized response
        result['personalized_tip'] = " | ".join(personalized_tips) if personalized_tips else result.get('tip', '')
        result['personalized_action'] = " | ".join(personalized_actions) if personalized_actions else result.get('action', '')
        
        # Add financial summary
        result['financial_summary'] = {
            'loan_amount': loan_amnt,
            'interest_rate': int_rate,
            'term_months': term,
            'monthly_payment': round(monthly_payment, 2),
            'monthly_interest': round(monthly_interest, 2),
            'total_interest': round(total_interest, 2),
            'monthly_income': monthly_income,
            'dti_ratio': round(dti_ratio, 2),
            'years_to_payoff': round(years_to_payoff, 2)
        }
        
        response = {
            "success": True,
            "profile_id": profile_id,
            **result,
            "ai_version": "3.1.0-RealTime" if hasattr(current_model, 'predict_proba') else "1.0.0"
        }
        
        # Add confidence only if available (Enterprise model)
        if confidence is not None:
            response["confidence"] = round(confidence, 2)
        
        return jsonify(response)
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

# API: Calculate Credit Card Payoff
@app.route('/api/calculate/credit-card', methods=['POST'])
@limiter.limit("60 per minute")
def calculate_credit_card():
    try:
        data = request.json
        
        # Validation
        error = validate_input(data, ['balance', 'apr', 'monthly_payment'])
        if error:
            return jsonify({"error": error}), 400

        balance = float(data['balance'])
        apr = float(data['apr'])
        monthly_payment = float(data['monthly_payment'])
        
        if monthly_payment <= 0:
            return jsonify({"error": "ยอดจ่ายต่อเดือนต้องมากกว่า 0"}), 400
        
        monthly_rate = (apr / 100) / 12
        
        # Calculate minimum payment to avoid debt trap
        minimum_payment = balance * monthly_rate * 1.01  # Interest + 1% principal
        
        if monthly_payment < minimum_payment:
            first_month_interest = balance * monthly_rate
            return jsonify({
                "success": False,
                "error": f"⚠️ ยอดจ่ายต่ำเกินไป!",
                "error_type": "payment_too_low",
                "details": {
                    "monthly_payment": round(monthly_payment, 2),
                    "monthly_interest": round(first_month_interest, 2),
                    "minimum_payment": round(minimum_payment, 2),
                    "shortfall": round(first_month_interest - monthly_payment, 2)
                },
                "message": f"คุณจ่าย {monthly_payment:,.0f} บาท แต่ดอกเบี้ยเดือนแรก {first_month_interest:,.0f} บาท\nหนี้จะไม่ลดลงเลย แถมเพิ่มขึ้นอีก {first_month_interest - monthly_payment:,.0f} บาท/เดือน",
                "recommendation": f"💡 แนะนำ: จ่ายอย่างน้อย {minimum_payment:,.0f} บาท/เดือน เพื่อให้หนี้ลดลงได้จริง"
            }), 400
        
        total_paid = 0
        total_interest = 0
        months = 0
        schedule = []
        
        current_balance = balance
        
        while current_balance > 0 and months < 600:
            months += 1
            interest = current_balance * monthly_rate
            principal = min(monthly_payment - interest, current_balance)
            
            if principal <= 0:
                # This should now be caught by the check above
                return jsonify({
                    "error": "ยอดจ่ายต่อเดือนต่ำเกินไป ไม่สามารถปิดหนี้ได้",
                    "monthly_interest": round(interest, 2)
                }), 400
            
            current_balance -= principal
            total_paid += (interest + principal)
            total_interest += interest
            
            schedule.append({
                "month": months,
                "payment": round(interest + principal, 2),
                "interest": round(interest, 2),
                "principal": round(principal, 2),
                "remaining": round(max(0, current_balance), 2)
            })
        
        return jsonify({
            "success": True,
            "months": months,
            "total_paid": round(total_paid, 2),
            "total_interest": round(total_interest, 2),
            "schedule": schedule
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: Calculate Student Loan
@app.route('/api/calculate/student-loan', methods=['POST'])
@limiter.limit("60 per minute")
def calculate_student_loan():
    try:
        data = request.json
        
        # Validation
        error = validate_input(data, ['loan_amount', 'interest_rate', 'term_months'])
        if error:
            return jsonify({"error": error}), 400

        loan_amount = float(data['loan_amount'])
        interest_rate = float(data['interest_rate'])
        term_months = int(data['term_months'])
        
        monthly_rate = (interest_rate / 100) / 12
        
        if monthly_rate > 0:
            monthly_payment = loan_amount * monthly_rate / (1 - math.pow(1 + monthly_rate, -term_months))
        else:
            monthly_payment = loan_amount / term_months
        
        total_paid = 0
        total_interest = 0
        schedule = []
        current_balance = loan_amount
        
        for month in range(1, term_months + 1):
            interest = current_balance * monthly_rate
            principal = monthly_payment - interest
            current_balance -= principal
            total_paid += monthly_payment
            total_interest += interest
            
            schedule.append({
                "month": month,
                "payment": round(monthly_payment, 2),
                "interest": round(interest, 2),
                "principal": round(principal, 2),
                "remaining": round(max(0, current_balance), 2)
            })
        
        return jsonify({
            "success": True,
            "monthly_payment": round(monthly_payment, 2),
            "total_paid": round(total_paid, 2),
            "total_interest": round(total_interest, 2),
            "schedule": schedule
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ═══════════════════════════════════════════════════════════════════════════════
# 🧠 FINANCIAL ADVISOR v3.0 - 21 PREDICTIONS AI
# ═══════════════════════════════════════════════════════════════════════════════
@app.route('/api/ai-analyze', methods=['POST'])
@limiter.limit("30 per minute")
def ai_analyze():
    """
    🧠 AI Financial Advisor v3.0 - Comprehensive 21-Dimension Analysis
    """
    advisor = get_financial_advisor()
    
    if advisor is None:
        return jsonify({"error": "Financial Advisor model not loaded", "fallback": True}), 500
    
    try:
        import numpy as np
        data = request.json
        
        # Extract inputs
        loan_amount = float(data.get('loan_amount', 0))
        interest_rate = float(data.get('interest_rate', 0))
        term_months = float(data.get('term_months', 60))
        monthly_income = float(data.get('monthly_income', 0))
        monthly_payment = float(data.get('monthly_payment', 0))
        monthly_expenses = float(data.get('monthly_expenses', 0) or monthly_income * 0.5)
        emergency_months = float(data.get('emergency_months', 0))
        age = int(data.get('age', 30))
        job_stability = float(data.get('job_stability', 70))
        payment_history = float(data.get('payment_history', 80))
        account_age = int(data.get('account_age', 36))
        current_savings = float(data.get('current_savings', 0))
        
        # Validate
        if loan_amount <= 0:
            return jsonify({"error": "กรุณาระบุยอดหนี้"}), 400
        if monthly_income <= 0:
            return jsonify({"error": "กรุณาระบุรายได้ต่อเดือน"}), 400
        
        # Calculate derived features
        if monthly_payment <= 0:
            monthly_rate = interest_rate / 100 / 12
            if monthly_rate > 0:
                monthly_payment = loan_amount * monthly_rate / (1 - (1 + monthly_rate) ** (-term_months))
            else:
                monthly_payment = loan_amount / term_months
        
        dti_ratio = (monthly_payment / monthly_income * 100) if monthly_income > 0 else 100
        min_payment = monthly_payment  # Simplified
        effective_rate = ((1 + interest_rate/100/12)**12 - 1) * 100
        log_loan = np.log1p(loan_amount)
        log_income = np.log1p(monthly_income)
        payment_flexibility = monthly_income - monthly_payment - monthly_expenses
        debt_to_annual = loan_amount / (monthly_income * 12) if monthly_income > 0 else 10
        payment_to_min = 1.0
        savings_rate = ((monthly_income - monthly_payment - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        years_to_retirement = max(0, 60 - age)
        
        # Build feature vector (30 features)
        features = np.array([[
            loan_amount, interest_rate, term_months, monthly_income, monthly_payment,
            dti_ratio, min_payment, monthly_expenses, emergency_months, age,
            job_stability, payment_history, account_age, current_savings,
            effective_rate, log_loan, log_income, payment_flexibility,
            debt_to_annual, payment_to_min, savings_rate, years_to_retirement,
            1 if interest_rate <= 2 else 0,  # is_student_loan
            1 if 4 <= interest_rate < 15 else 0,  # is_personal_loan
            1 if 15 <= interest_rate < 20 else 0,  # is_credit_card
            1 if interest_rate >= 20 else 0,  # is_high_risk
            1 if age < 30 else 0,  # is_young
            1 if age >= 50 else 0,  # is_senior
            1 if emergency_months >= 3 else 0,  # has_emergency_fund
            1 if monthly_income >= 50000 else 0  # is_high_income
        ]])
        
        # Scale and predict
        scaler = advisor['scaler']
        features_scaled = scaler.transform(features)
        
        # Regression predictions (16 targets)
        reg_pred = advisor['regression_model'].predict(features_scaled)[0]
        
        # Classification predictions
        strategy_code = advisor['strategy_model'].predict(features_scaled)[0]
        action_code = advisor['action_model'].predict(features_scaled)[0]
        urgency_level = advisor['urgency_model'].predict(features_scaled)[0]
        support_type = advisor['support_model'].predict(features_scaled)[0]
        better_than_avg = advisor['better_model'].predict(features_scaled)[0]
        
        # Get labels
        strategy_labels = advisor['strategy_labels']
        action_labels = advisor['action_labels']
        urgency_labels = advisor['urgency_labels']
        support_labels = advisor['support_labels']
        
        # Build response
        response = {
            "success": True,
            "version": advisor.get('version', '3.0.0'),
            "training_samples": advisor.get('training_samples', 0),
            
            # Group A: Debt Analysis
            "debt_analysis": {
                "debt_freedom_months": round(max(0, reg_pred[0]), 0),
                "smart_payment_boost": round(max(0, reg_pred[1]), 0),
                "time_saved_months": round(max(0, reg_pred[2]), 0),
                "money_saved_total": round(max(0, reg_pred[3]), 0),
                "interest_burden_ratio": round(max(0, reg_pred[4]), 1)
            },
            
            # Group B: Financial Health
            "financial_health": {
                "health_score": round(min(100, max(0, reg_pred[5])), 0),
                "debt_stress_index": round(min(100, max(0, reg_pred[6])), 0),
                "stability_score": round(min(100, max(0, reg_pred[7])), 0),
                "wealth_potential": round(min(100, max(0, reg_pred[8])), 0)
            },
            
            # Group C: Planning
            "planning": {
                "emergency_buffer_months": round(max(0, reg_pred[9]), 0),
                "savings_potential": round(max(0, reg_pred[10]), 0),
                "investment_readiness": round(min(100, max(0, reg_pred[11])), 0),
                "retirement_gap_years": round(max(0, reg_pred[12]), 1)
            },
            
            # Group D: Comparison
            "comparison": {
                "percentile_rank": round(min(99, max(1, reg_pred[13])), 0),
                "better_than_average": bool(better_than_avg)
            },
            
            # Group E: Impact
            "impact": {
                "credit_score_impact": round(min(50, max(-50, reg_pred[14])), 0),
                "life_quality_score": round(min(100, max(0, reg_pred[15])), 0)
            },
            
            # Group F: Strategy
            "strategy": {
                "payoff_strategy": strategy_labels.get(int(strategy_code), "Standard"),
                "primary_action": action_labels.get(int(action_code), "รักษาระดับ"),
                "urgency_level": urgency_labels.get(int(urgency_level), "ปกติ"),
                "support_needed": support_labels.get(int(support_type), "Self-service")
            },
            
            # Input summary
            "input_summary": {
                "loan_amount": loan_amount,
                "interest_rate": interest_rate,
                "term_months": term_months,
                "monthly_income": monthly_income,
                "monthly_payment": round(monthly_payment, 2),
                "dti_ratio": round(dti_ratio, 1),
                "age": age
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ AI Analysis error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "fallback": True}), 500


# Health Check
@app.route('/api/health', methods=['GET'])
@limiter.limit("10 per minute")
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "model_ready": model_loading_attempted,
        "financial_advisor_ready": advisor_loading_attempted,
        "financial_advisor_loaded": financial_advisor is not None,
        "rate_limit": "enabled",
        "version": "5.0.0",
        "gemini_enabled": bool(os.environ.get('GEMINI_API_KEY'))
    })

# API: AI Chat with Gemini
@app.route('/api/ai-chat', methods=['POST'])
@limiter.limit("20 per minute")
def ai_chat():
    """AI Chat using Google Gemini for financial advice"""
    try:
        gemini_key = os.environ.get('GEMINI_API_KEY')
        
        if not gemini_key:
            return jsonify({
                "error": "Gemini API not configured",
                "fallback": True
            }), 400
        
        data = request.json
        question = sanitize_string(data.get('question', ''))
        balance = sanitize_number(data.get('balance'), 0, 1e12) or 0
        apr = sanitize_number(data.get('apr'), 0, 100) or 0
        payment = sanitize_number(data.get('payment'), 0, 1e12) or 0
        monthly_income = sanitize_number(data.get('monthly_income'), 0, 1e12) or 0
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        # Import and configure Gemini
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        
        # Calculate some useful metrics
        monthly_rate = apr / 100 / 12
        monthly_interest = balance * monthly_rate
        dti_ratio = (payment / monthly_income * 100) if monthly_income > 0 else 0
        
        # Estimate payoff time
        if payment > monthly_interest and balance > 0:
            months_to_payoff = 0
            temp_balance = balance
            while temp_balance > 0.01 and months_to_payoff < 600:
                interest = temp_balance * monthly_rate
                principal = payment - interest
                temp_balance -= principal
                months_to_payoff += 1
        else:
            months_to_payoff = -1  # Cannot pay off
        
        prompt = f"""คุณเป็นที่ปรึกษาการเงินส่วนบุคคลที่เชี่ยวชาญเรื่องหนี้บัตรเครดิตและการวางแผนการเงิน
ชื่อของคุณคือ "AI ที่ปรึกษาหนี้ FinLand"

📊 ข้อมูลทางการเงินของผู้ใช้:
- ยอดหนี้คงเหลือ: {balance:,.0f} บาท
- อัตราดอกเบี้ย: {apr}% ต่อปี
- ดอกเบี้ยต่อเดือน: ~{monthly_interest:,.0f} บาท
- ยอดผ่อนต่อเดือน: {payment:,.0f} บาท
- รายได้ต่อเดือน: {monthly_income:,.0f} บาท
- DTI Ratio: {dti_ratio:.1f}%
- คาดว่าปิดหนี้ได้ใน: {"ไม่สามารถปิดได้ (จ่ายน้อยกว่าดอกเบี้ย)" if months_to_payoff < 0 else f"{months_to_payoff} เดือน ({months_to_payoff // 12} ปี {months_to_payoff % 12} เดือน)"}

💬 คำถามของผู้ใช้: {question}

📝 กฎการตอบ (Strict Rules):
1. ตอบเป็นภาษาไทยเท่านั้น
2. **ห้ามแนะนำตัว** (เช่น "สวัสดีครับ ผมคือ...") ยกเว้นผู้ใช้ถามว่าคุณคือใคร
3. ใช้ **Markdown** จัดรูปแบบให้อ่านง่าย (ใช้ตัวหนา, รายการแบบจุด, ย่อหน้าสั้นๆ)
4. ตอบกระชับ ตรงประเด็น ไม่เกิน 200 คำ
5. ใช้ emoji ประกอบหัวข้อให้น่าอ่าน
6. ถ้าสถานการณ์อันตราย (DTI > 40% หรือจ่ายไม่พอดอกเบี้ย) ให้เตือนด้วย 🚨
7. อย่าให้คำแนะนำทางกฎหมายหรือการลงทุนที่ซับซ้อน"""

        # Try multiple models in order of preference
        models_to_try = [
            'gemini-2.0-flash', 
            'gemini-2.0-flash-001',
            'gemini-2.0-pro-exp',
            'gemini-flash-latest',
            'gemini-pro-latest',
            'gemini-1.5-flash', 
            'gemini-1.5-pro', 
            'gemini-1.0-pro', 
            'gemini-pro'
        ]
        answer = None
        used_model = None
        last_error = None

        for model_name in models_to_try:
            try:
                print(f"🤖 Trying Gemini model: {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                answer = response.text
                used_model = model_name
                print(f"✅ Success with model: {model_name}")
                break
            except Exception as e:
                print(f"⚠️ Failed with {model_name}: {str(e)}")
                last_error = e
                continue
        
        if not answer:
            # If all fail, try to list available models to debug
            try:
                print("📋 Listing available models...")
                for m in genai.list_models():
                    print(f"  - {m.name}")
            except:
                pass
            raise last_error or Exception("All models failed")
        
        return jsonify({
            "success": True,
            "answer": answer,
            "model": used_model,
            "context": {
                "balance": balance,
                "apr": apr,
                "payment": payment,
                "monthly_interest": round(monthly_interest, 2),
                "months_to_payoff": months_to_payoff,
                "dti_ratio": round(dti_ratio, 2)
            }
        })
        
    except Exception as e:
        print(f"❌ AI Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"AI error: {str(e)}",
            "fallback": True
        }), 500

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', '0') == '1'
    port = int(os.getenv('PORT', 5000))
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        from waitress import serve
        print(f"🚀 Starting Production Server on port {port}...")
        serve(app, host='0.0.0.0', port=port)
    else:
        print(f"🛠️ Starting Development Server on port {port}...")
        app.run(debug=debug_mode, port=port, host='0.0.0.0')