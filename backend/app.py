"""
FinLand Backend API - Clean Version
Financial Calculator & AI Advisor
"""

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
import numpy as np

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

ALLOWED_ORIGINS = [
    "https://financial-calculator-thailand.vercel.app",
    "https://fin-land.vercel.app",
    "https://finland.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]

CORS(app, 
     resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
     allow_headers=["Content-Type", "Accept", "X-Requested-With"],
     methods=["GET", "POST", "OPTIONS"],
     supports_credentials=False,
     max_age=86400)

limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
    strategy="fixed-window"
)

# ═══════════════════════════════════════════════════════════════════════════════
# MIDDLEWARE
# ═══════════════════════════════════════════════════════════════════════════════

@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://finland-ilb5.onrender.com https://generativelanguage.googleapis.com; "
        "frame-ancestors 'none';"
    )
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
    return response

# ═══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def sanitize_string(value):
    """Sanitize string input to prevent XSS attacks"""
    if not isinstance(value, str):
        return None
    value = re.sub(r'<[^>]*>', '', value)
    value = html.escape(value)
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
    """Validate required fields exist and are valid numbers"""
    if not data:
        return "No data provided"
    
    for field in required_fields:
        if field not in data:
            return f"Missing required field: {field}"
        
        value = sanitize_number(data[field], min_val=0, max_val=1e12)
        if value is None:
            return f"Field '{field}' must be a valid positive number (max 1 trillion)"
        
        if field in ['apr', 'interest_rate', 'int_rate'] and value > 100:
            return f"Interest rate '{field}' cannot exceed 100%"
        if field in ['term', 'term_months'] and value > 600:
            return f"Term cannot exceed 600 months (50 years)"
    
    return None

def calculate_monthly_payment(principal, annual_rate, term_months):
    """Calculate monthly payment for a loan"""
    if annual_rate <= 0:
        return principal / term_months if term_months > 0 else 0
    monthly_rate = annual_rate / 100 / 12
    return principal * monthly_rate / (1 - (1 + monthly_rate) ** (-term_months))

def calculate_payoff_months(balance, monthly_rate, monthly_payment):
    """Calculate months to pay off debt"""
    if monthly_payment <= balance * monthly_rate:
        return -1  # Can't pay off
    
    months = 0
    current_balance = balance
    while current_balance > 0.01 and months < 600:
        interest = current_balance * monthly_rate
        current_balance -= (monthly_payment - interest)
        months += 1
    return months

# ═══════════════════════════════════════════════════════════════════════════════
# AI MODEL LOADER
# ═══════════════════════════════════════════════════════════════════════════════

_financial_advisor = None
_advisor_loaded = False

def get_financial_advisor():
    """Lazy load Financial Advisor model"""
    global _financial_advisor, _advisor_loaded
    
    if _advisor_loaded:
        return _financial_advisor
    
    _advisor_loaded = True
    model_path = 'financial_advisor_model.pkl'
    
    # Try download if not exists
    if not os.path.exists(model_path):
        model_url = os.getenv('MODEL_URL', '')
        if model_url:
            try:
                import requests
                print(f"📥 Downloading model from {model_url[:50]}...")
                response = requests.get(model_url, timeout=300)
                response.raise_for_status()
                with open(model_path, 'wb') as f:
                    f.write(response.content)
                print("✅ Model downloaded!")
            except Exception as e:
                print(f"❌ Download failed: {e}")
    
    if not os.path.exists(model_path):
        print("⚠️ Financial Advisor model not available")
        return None
    
    try:
        print("🧠 Loading Financial Advisor...")
        _financial_advisor = joblib.load(model_path)
        print(f"✅ Loaded! ({_financial_advisor.get('training_samples', 0):,} samples)")
        return _financial_advisor
    except Exception as e:
        print(f"❌ Load error: {e}")
        return None

# ═══════════════════════════════════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route('/api/health', methods=['GET'])
@limiter.limit("10 per minute")
def health():
    advisor = get_financial_advisor()
    return jsonify({
        "status": "healthy",
        "version": "5.0.0",
        "financial_advisor_loaded": advisor is not None,
        "gemini_enabled": bool(os.environ.get('GEMINI_API_KEY'))
    })


@app.route('/api/calculate/credit-card', methods=['POST'])
@limiter.limit("60 per minute")
def calculate_credit_card():
    try:
        data = request.json
        error = validate_input(data, ['balance', 'apr', 'monthly_payment'])
        if error:
            return jsonify({"error": error}), 400

        balance = float(data['balance'])
        apr = float(data['apr'])
        monthly_payment = float(data['monthly_payment'])
        
        if monthly_payment <= 0:
            return jsonify({"error": "ยอดจ่ายต่อเดือนต้องมากกว่า 0"}), 400
        
        monthly_rate = apr / 100 / 12
        minimum_payment = balance * monthly_rate * 1.01
        
        if monthly_payment < minimum_payment:
            first_month_interest = balance * monthly_rate
            return jsonify({
                "success": False,
                "error": "⚠️ ยอดจ่ายต่ำเกินไป!",
                "error_type": "payment_too_low",
                "details": {
                    "monthly_payment": round(monthly_payment, 2),
                    "monthly_interest": round(first_month_interest, 2),
                    "minimum_payment": round(minimum_payment, 2)
                },
                "message": f"คุณจ่าย {monthly_payment:,.0f} บาท แต่ดอกเบี้ยเดือนแรก {first_month_interest:,.0f} บาท",
                "recommendation": f"💡 จ่ายอย่างน้อย {minimum_payment:,.0f} บาท/เดือน"
            }), 400
        
        # Calculate payoff schedule
        total_paid = 0
        total_interest = 0
        months = 0
        schedule = []
        current_balance = balance
        
        while current_balance > 0 and months < 600:
            months += 1
            interest = current_balance * monthly_rate
            principal = min(monthly_payment - interest, current_balance)
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


@app.route('/api/calculate/student-loan', methods=['POST'])
@limiter.limit("60 per minute")
def calculate_student_loan():
    try:
        data = request.json
        error = validate_input(data, ['loan_amount', 'interest_rate', 'term_months'])
        if error:
            return jsonify({"error": error}), 400

        loan_amount = float(data['loan_amount'])
        interest_rate = float(data['interest_rate'])
        term_months = int(data['term_months'])
        
        monthly_payment = calculate_monthly_payment(loan_amount, interest_rate, term_months)
        monthly_rate = interest_rate / 100 / 12
        
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


@app.route('/api/ai-analyze', methods=['POST'])
@limiter.limit("30 per minute")
def ai_analyze():
    """AI Financial Advisor - Comprehensive Analysis"""
    advisor = get_financial_advisor()
    
    if advisor is None:
        return jsonify({"error": "Financial Advisor model not loaded", "fallback": True}), 500
    
    try:
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
        
        # Calculate payment if not provided
        if monthly_payment <= 0:
            monthly_payment = calculate_monthly_payment(loan_amount, interest_rate, term_months)
        
        dti_ratio = (monthly_payment / monthly_income * 100) if monthly_income > 0 else 100
        monthly_rate = interest_rate / 100 / 12
        monthly_interest = loan_amount * monthly_rate
        total_interest = (monthly_payment * term_months) - loan_amount
        
        # Build feature vector
        features = _build_features(
            loan_amount, interest_rate, term_months, monthly_income, monthly_payment,
            dti_ratio, monthly_expenses, emergency_months, age, job_stability,
            payment_history, account_age, current_savings
        )
        
        # Get predictions
        scaler = advisor['scaler']
        features_scaled = scaler.transform(features)
        
        reg_pred = advisor['regression_model'].predict(features_scaled)[0]
        strategy_code = advisor['strategy_model'].predict(features_scaled)[0]
        action_code = advisor['action_model'].predict(features_scaled)[0]
        urgency_level = advisor['urgency_model'].predict(features_scaled)[0]
        support_type = advisor['support_model'].predict(features_scaled)[0]
        better_than_avg = advisor['better_model'].predict(features_scaled)[0]
        
        # Generate insights
        severity, risk_score = _calculate_risk(dti_ratio, interest_rate)
        tips, actions = _generate_tips(dti_ratio, interest_rate, monthly_interest, term_months, total_interest)
        
        # Calculate smart payment boost
        smart_boost, time_saved, money_saved = _calculate_smart_boost(
            loan_amount, monthly_rate, monthly_payment, monthly_income, term_months
        )
        
        if smart_boost > 0 and time_saved > 0:
            tips.append(f"💡 จ่ายเพิ่ม {smart_boost:,.0f}/เดือน เร็วขึ้น {time_saved} เดือน ประหยัด {money_saved:,.0f} บาท")
        
        # Health score commentary
        health_score = round(min(100, max(0, reg_pred[5])), 0)
        if health_score >= 80:
            tips.append("💚 สุขภาพการเงินดีเยี่ยม!")
        elif health_score >= 60:
            tips.append("💛 สุขภาพการเงินพอใช้ได้")
        elif health_score >= 40:
            tips.append("🟠 สุขภาพการเงินต้องระวัง")
        else:
            tips.append("❤️‍🩹 สุขภาพการเงินน่าเป็นห่วง")
        
        return jsonify({
            "success": True,
            "version": "4.0.0",
            "insights": {
                "severity": severity,
                "risk_score": round(risk_score),
                "tips": tips[:5],
                "actions": actions[:3],
                "monthly_interest": round(monthly_interest),
                "total_interest": round(total_interest)
            },
            "debt_analysis": {
                "debt_freedom_months": round(term_months),
                "smart_payment_boost": smart_boost,
                "time_saved_months": time_saved,
                "money_saved_total": round(money_saved),
                "interest_burden_ratio": round(max(0, reg_pred[4]), 1)
            },
            "financial_health": {
                "health_score": health_score,
                "debt_stress_index": round(min(100, max(0, reg_pred[6]))),
                "stability_score": round(min(100, max(0, reg_pred[7]))),
                "wealth_potential": round(min(100, max(0, reg_pred[8])))
            },
            "planning": {
                "emergency_buffer_months": round(max(0, reg_pred[9])),
                "savings_potential": round(max(0, reg_pred[10])),
                "investment_readiness": round(min(100, max(0, reg_pred[11]))),
                "retirement_gap_years": round(max(0, reg_pred[12]), 1)
            },
            "comparison": {
                "percentile_rank": round(min(99, max(1, reg_pred[13]))),
                "better_than_average": bool(better_than_avg)
            },
            "impact": {
                "credit_score_impact": round(min(50, max(-50, reg_pred[14]))),
                "life_quality_score": round(min(100, max(0, reg_pred[15])))
            },
            "strategy": {
                "payoff_strategy": advisor['strategy_labels'].get(int(strategy_code), "Standard"),
                "primary_action": advisor['action_labels'].get(int(action_code), "รักษาระดับ"),
                "urgency_level": advisor['urgency_labels'].get(int(urgency_level), "ปกติ"),
                "support_needed": advisor['support_labels'].get(int(support_type), "Self-service")
            },
            "input_summary": {
                "loan_amount": loan_amount,
                "interest_rate": interest_rate,
                "term_months": term_months,
                "monthly_income": monthly_income,
                "monthly_payment": round(monthly_payment, 2),
                "dti_ratio": round(dti_ratio, 1),
                "age": age
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "fallback": True}), 500


def _build_features(loan, rate, term, income, payment, dti, expenses, emergency, age, job_stab, pay_hist, acc_age, savings):
    """Build feature vector for ML model"""
    effective_rate = ((1 + rate/100/12)**12 - 1) * 100
    payment_flexibility = income - payment - expenses
    debt_to_annual = loan / (income * 12) if income > 0 else 10
    savings_rate = ((income - payment - expenses) / income * 100) if income > 0 else 0
    
    return np.array([[
        loan, rate, term, income, payment,
        dti, payment, expenses, emergency, age,
        job_stab, pay_hist, acc_age, savings,
        effective_rate, np.log1p(loan), np.log1p(income), payment_flexibility,
        debt_to_annual, 1.0, savings_rate, max(0, 60 - age),
        1 if rate <= 2 else 0,
        1 if 4 <= rate < 15 else 0,
        1 if 15 <= rate < 20 else 0,
        1 if rate >= 20 else 0,
        1 if age < 30 else 0,
        1 if age >= 50 else 0,
        1 if emergency >= 3 else 0,
        1 if income >= 50000 else 0
    ]])


def _calculate_risk(dti_ratio, interest_rate):
    """Calculate risk severity and score"""
    if dti_ratio > 50 or interest_rate >= 20:
        severity = 'critical'
        risk_score = min(99, 75 + max((dti_ratio - 50) / 2, interest_rate - 20))
    elif dti_ratio > 40 or interest_rate >= 15:
        severity = 'high'
        risk_score = min(85, 55 + max(dti_ratio - 40, (interest_rate - 15) * 2))
    elif dti_ratio > 30 or interest_rate >= 10:
        severity = 'medium'
        risk_score = min(65, 35 + max(dti_ratio - 30, (interest_rate - 10) * 2))
    else:
        severity = 'low'
        risk_score = max(10, 30 - (30 - dti_ratio) / 2)
    return severity, risk_score


def _generate_tips(dti, rate, monthly_interest, term_months, total_interest):
    """Generate personalized tips and actions"""
    tips = []
    actions = []
    years = term_months / 12
    
    # DTI Analysis
    if dti > 50:
        tips.append(f"🚨 หนี้กินรายได้ {dti:.0f}% วิกฤต! (ควรต่ำกว่า 30%)")
        actions.append("ตัดรายจ่ายไม่จำเป็นทันที และหาทางเพิ่มรายได้")
    elif dti > 40:
        tips.append(f"⚠️ ภาระหนี้ {dti:.0f}% ค่อนข้างหนัก")
        actions.append("ลดรายจ่ายฟุ่มเฟือย เพิ่มยอดจ่ายหนี้")
    elif dti > 30:
        tips.append(f"📊 ภาระหนี้ {dti:.0f}% พอรับไหว")
        actions.append("สร้างเงินสำรองฉุกเฉินควบคู่ไปด้วย")
    elif dti > 0:
        tips.append(f"✅ ภาระหนี้ {dti:.0f}% อยู่ในเกณฑ์ดีมาก!")
    
    # Interest Rate Analysis
    if rate >= 20:
        tips.append(f"🔥 ดอกเบี้ย {rate}% สูงมาก! (~{monthly_interest:,.0f} บาท/เดือน)")
        actions.append("เร่งจ่ายหนี้ก้อนนี้ก่อน")
    elif rate >= 15:
        tips.append(f"💳 ดอกเบี้ย {rate}% ระดับบัตรเครดิต")
        actions.append("หยุดใช้บัตรเพิ่ม เน้นจ่ายให้หมด")
    elif rate >= 8:
        tips.append(f"📈 ดอกเบี้ย {rate}% ปานกลาง")
    elif rate >= 2:
        tips.append(f"👍 ดอกเบี้ย {rate}% ถือว่าต่ำ")
    else:
        tips.append(f"✨ ดอกเบี้ย {rate}% ต่ำมาก")
    
    # Time Analysis
    if years > 10:
        tips.append(f"⏰ ผ่อนนาน {years:.1f} ปี ดอกเบี้ยรวม {total_interest:,.0f} บาท")
        actions.append("จ่ายเพิ่มทุกเดือนจะประหยัดมาก")
    elif years > 5:
        tips.append(f"📅 ผ่อน {years:.1f} ปี ({term_months:.0f} เดือน)")
    elif years > 0:
        tips.append(f"🎯 อีก {term_months:.0f} เดือน จะปลดหนี้!")
    
    return tips, actions


def _calculate_smart_boost(loan, monthly_rate, payment, income, term_months):
    """Calculate optimal payment boost"""
    if income <= 0 or payment <= 0 or loan <= 0:
        return 0, 0, 0
    
    max_payment = income * 0.4
    min_living = income * 0.4
    available = max(0, income - payment - min_living)
    smart_boost = min(max(0, max_payment - payment), available)
    smart_boost = round(smart_boost / 100) * 100
    
    if smart_boost <= 0 or monthly_rate <= 0:
        return 0, 0, 0
    
    # Calculate original months
    original_months = 0
    balance = loan
    while balance > 0 and original_months < 600:
        interest = balance * monthly_rate
        if payment <= interest:
            return 0, 0, 0
        balance -= (payment - interest)
        original_months += 1
    
    # Calculate new months with boost
    new_payment = payment + smart_boost
    new_months = 0
    balance = loan
    while balance > 0 and new_months < 600:
        interest = balance * monthly_rate
        balance -= (new_payment - interest)
        new_months += 1
    
    time_saved = original_months - new_months
    old_interest = (payment * original_months) - loan
    new_interest = (new_payment * new_months) - loan
    money_saved = max(0, old_interest - new_interest)
    
    return smart_boost, time_saved, money_saved


@app.route('/api/ai-chat', methods=['POST'])
@limiter.limit("20 per minute")
def ai_chat():
    """AI Chat using Google Gemini"""
    try:
        gemini_key = os.environ.get('GEMINI_API_KEY')
        if not gemini_key:
            return jsonify({"error": "Gemini API not configured", "fallback": True}), 400
        
        data = request.json
        question = sanitize_string(data.get('question', ''))
        balance = sanitize_number(data.get('balance'), 0, 1e12) or 0
        apr = sanitize_number(data.get('apr'), 0, 100) or 0
        payment = sanitize_number(data.get('payment'), 0, 1e12) or 0
        monthly_income = sanitize_number(data.get('monthly_income'), 0, 1e12) or 0
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
        
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        
        # Calculate metrics
        monthly_rate = apr / 100 / 12
        monthly_interest = balance * monthly_rate
        dti_ratio = (payment / monthly_income * 100) if monthly_income > 0 else 0
        months_to_payoff = calculate_payoff_months(balance, monthly_rate, payment)
        
        # Build prompt
        prompt = f"""คุณเป็นที่ปรึกษาการเงินชื่อ "AI ที่ปรึกษาหนี้ FinLand"

📊 ข้อมูลของผู้ใช้:
- ยอดหนี้: {balance:,.0f} บาท
- ดอกเบี้ย: {apr}%/ปี (~{monthly_interest:,.0f}/เดือน)
- ยอดผ่อน: {payment:,.0f} บาท/เดือน
- รายได้: {monthly_income:,.0f} บาท/เดือน
- DTI: {dti_ratio:.1f}%
- ปิดหนี้ใน: {"ไม่ได้ (จ่ายน้อยกว่าดอกเบี้ย)" if months_to_payoff < 0 else f"{months_to_payoff} เดือน"}

💬 คำถาม: {question}

📝 กฎ:
1. ตอบภาษาไทย ใช้ Markdown
2. ไม่แนะนำตัว
3. กระชับ ไม่เกิน 250 คำ
4. ใช้ emoji
5. ถ้า DTI > 40% ให้เตือน 🚨"""

        # Try models
        models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
        answer = None
        used_model = None
        
        for model_name in models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                answer = response.text
                used_model = model_name
                break
            except Exception:
                continue
        
        if not answer:
            raise Exception("All Gemini models failed")
        
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
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"AI error: {str(e)}", "fallback": True}), 500


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    env = os.getenv('FLASK_ENV', 'development')
    
    if env == 'production':
        from waitress import serve
        print(f"🚀 Production server on port {port}")
        serve(app, host='0.0.0.0', port=port)
    else:
        print(f"🛠️ Development server on port {port}")
        app.run(debug=True, port=port, host='0.0.0.0')
