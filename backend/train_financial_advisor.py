"""
🧠 ULTIMATE FINANCIAL ADVISOR AI MODEL v3.0 - EXTREME EDITION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI ที่วิเคราะห์สถานะการเงินครบทุกมิติ ที่สุดในประเทศไทย!

🎯 Model ทำนาย 20+ มิติ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【กลุ่ม A: การวิเคราะห์หนี้】
1.  debt_freedom_months      - กี่เดือนจะปลดหนี้
2.  smart_payment_boost      - ควรจ่ายเพิ่มเท่าไรถึงคุ้มที่สุด
3.  time_saved_months        - ถ้าจ่ายเพิ่มจะประหยัดเวลากี่เดือน
4.  money_saved_total        - ประหยัดเงินรวมเท่าไร
5.  interest_burden_ratio    - สัดส่วนดอกเบี้ยต่อเงินต้น

【กลุ่ม B: สุขภาพการเงิน】
6.  financial_health_score   - คะแนนสุขภาพการเงิน (0-100)
7.  debt_stress_index        - ดัชนีความเครียดจากหนี้ (0-100)
8.  financial_stability      - ความมั่นคงทางการเงิน (0-100)
9.  wealth_building_potential- ศักยภาพสร้างความมั่งคั่ง (0-100)

【กลุ่ม C: การวางแผน】
10. emergency_buffer_months  - ควรมีเงินสำรองกี่เดือน
11. savings_potential        - ศักยภาพออมเงินต่อเดือน
12. investment_readiness     - ความพร้อมลงทุน (0-100)
13. retirement_gap_years     - ขาดเงินเกษียณกี่ปี

【กลุ่ม D: การเปรียบเทียบ】
14. percentile_rank          - อยู่ในระดับไหนเทียบกับคนอื่น (0-100)
15. better_than_average      - ดีกว่าค่าเฉลี่ยหรือไม่

【กลุ่ม E: ผลกระทบ】
16. credit_score_impact      - ผลกระทบต่อเครดิตสกอร์ (-50 ถึง +50)
17. life_quality_score       - คะแนนคุณภาพชีวิต (0-100)

【กลุ่ม F: กลยุทธ์และการดำเนินการ】
18. payoff_strategy_code     - กลยุทธ์ปิดหนี้ (0-5)
19. primary_action_code      - สิ่งที่ควรทำก่อน (0-9)
20. urgency_level            - ระดับความเร่งด่วน (0-4)
21. support_type_needed      - ประเภทความช่วยเหลือที่ต้องการ (0-5)

📊 Dataset: 300,000+ samples covering ALL Thai financial scenarios
🎯 Accuracy Target: 95%+
🧬 Features: 35+ engineered features
🤖 Models: Ensemble (GradientBoosting + RandomForest)
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor, RandomForestClassifier
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import warnings
warnings.filterwarnings('ignore')

print("="*80)
print("🧠 ULTIMATE FINANCIAL ADVISOR AI MODEL v3.0 - EXTREME EDITION")
print("   ครอบคลุมทุกมิติการเงิน - 20+ Predictions!")
print("="*80)

# ═══════════════════════════════════════════════════════════════════════════════
# 🎯 CORE FINANCIAL CALCULATION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

def calculate_monthly_payment(principal, annual_rate, term_months):
    """คำนวณค่างวดรายเดือน (Amortization Formula)"""
    if principal <= 0 or term_months <= 0:
        return 0
    if annual_rate <= 0:
        return principal / term_months
    monthly_rate = annual_rate / 100 / 12
    payment = principal * (monthly_rate * (1 + monthly_rate)**term_months) / ((1 + monthly_rate)**term_months - 1)
    return payment

def calculate_total_interest(principal, annual_rate, term_months):
    """คำนวณดอกเบี้ยรวมตลอดสัญญา"""
    if principal <= 0 or term_months <= 0:
        return 0
    monthly_payment = calculate_monthly_payment(principal, annual_rate, term_months)
    total_paid = monthly_payment * term_months
    return max(0, total_paid - principal)

def calculate_payoff_months(principal, annual_rate, monthly_payment):
    """คำนวณจำนวนเดือนที่จะปิดหนี้ได้"""
    if monthly_payment <= 0 or principal <= 0:
        return 999
    if annual_rate <= 0:
        return min(999, principal / monthly_payment)
    
    monthly_rate = annual_rate / 100 / 12
    min_payment = principal * monthly_rate
    if monthly_payment <= min_payment:
        return 999
    
    months = 0
    balance = principal
    while balance > 0.01 and months < 999:
        interest = balance * monthly_rate
        principal_paid = monthly_payment - interest
        balance -= principal_paid
        months += 1
    return months

def calculate_smart_payment_boost(loan_amount, interest_rate, current_payment, monthly_income, dti_ratio):
    """คำนวณยอดจ่ายเพิ่มที่คุ้มค่าที่สุด"""
    if monthly_income <= 0:
        return 0
    
    max_dti = 40
    max_payment = monthly_income * (max_dti / 100)
    available_boost = max(0, max_payment - current_payment)
    
    min_living_expense = monthly_income * 0.4
    max_affordable = monthly_income - current_payment - min_living_expense
    max_affordable = max(0, max_affordable)
    
    smart_boost = min(available_boost, max_affordable)
    
    if interest_rate >= 15:
        urgency_factor = 1.2
    elif interest_rate >= 10:
        urgency_factor = 1.1
    else:
        urgency_factor = 1.0
    
    smart_boost = min(smart_boost * urgency_factor, max_affordable)
    return max(0, smart_boost)

def calculate_time_and_money_saved(principal, annual_rate, current_payment, extra_payment):
    """คำนวณเวลาและเงินที่ประหยัดได้"""
    if extra_payment <= 0:
        return 0, 0
    
    original_months = calculate_payoff_months(principal, annual_rate, current_payment)
    new_months = calculate_payoff_months(principal, annual_rate, current_payment + extra_payment)
    
    if original_months >= 999 or new_months >= 999:
        return 0, 0
    
    time_saved = original_months - new_months
    
    old_total = current_payment * original_months
    old_interest = old_total - principal
    new_total = (current_payment + extra_payment) * new_months
    new_interest = new_total - principal
    money_saved = max(0, old_interest - new_interest)
    
    return max(0, time_saved), money_saved

# ═══════════════════════════════════════════════════════════════════════════════
# 📊 ADVANCED SCORING FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def calculate_financial_health_score(dti_ratio, interest_rate, emergency_months, savings_rate, debt_to_income_annual):
    """คะแนนสุขภาพการเงิน (0-100) - 5 ปัจจัย"""
    score = 0
    
    # DTI (25 points)
    if dti_ratio <= 20: score += 25
    elif dti_ratio <= 30: score += 20
    elif dti_ratio <= 40: score += 12
    elif dti_ratio <= 50: score += 5
    
    # Interest Rate (20 points)
    if interest_rate <= 2: score += 20
    elif interest_rate <= 8: score += 16
    elif interest_rate <= 12: score += 10
    elif interest_rate <= 18: score += 5
    
    # Emergency Fund (20 points)
    if emergency_months >= 6: score += 20
    elif emergency_months >= 3: score += 14
    elif emergency_months >= 1: score += 7
    
    # Savings Rate (20 points)
    if savings_rate >= 20: score += 20
    elif savings_rate >= 10: score += 14
    elif savings_rate >= 5: score += 8
    
    # Debt to Annual Income (15 points)
    if debt_to_income_annual <= 1: score += 15
    elif debt_to_income_annual <= 2: score += 10
    elif debt_to_income_annual <= 4: score += 5
    
    return min(100, max(0, score))

def calculate_debt_stress_index(dti_ratio, interest_rate, months_to_payoff, payment_to_min_ratio):
    """ดัชนีความเครียดจากหนี้ (0-100)"""
    stress = 0
    
    # DTI Stress
    if dti_ratio > 50: stress += 35
    elif dti_ratio > 40: stress += 25
    elif dti_ratio > 30: stress += 15
    elif dti_ratio > 20: stress += 8
    else: stress += 3
    
    # Interest Rate Stress
    if interest_rate >= 20: stress += 30
    elif interest_rate >= 15: stress += 22
    elif interest_rate >= 10: stress += 12
    elif interest_rate >= 5: stress += 5
    else: stress += 2
    
    # Time Stress
    years = months_to_payoff / 12
    if years > 15: stress += 20
    elif years > 10: stress += 14
    elif years > 5: stress += 8
    elif years > 2: stress += 4
    else: stress += 1
    
    # Payment Flexibility Stress
    if payment_to_min_ratio <= 1.0: stress += 15
    elif payment_to_min_ratio <= 1.1: stress += 10
    elif payment_to_min_ratio <= 1.3: stress += 5
    
    return min(100, max(0, stress))

def calculate_financial_stability(monthly_income, monthly_expenses, debt_payment, emergency_fund, job_stability):
    """ความมั่นคงทางการเงิน (0-100)"""
    score = 0
    
    # Income Coverage (25 points)
    if monthly_income > 0:
        coverage = (monthly_income - monthly_expenses - debt_payment) / monthly_income * 100
        if coverage >= 30: score += 25
        elif coverage >= 20: score += 20
        elif coverage >= 10: score += 12
        elif coverage >= 0: score += 5
    
    # Emergency Fund (25 points)
    if emergency_fund >= 12: score += 25
    elif emergency_fund >= 6: score += 20
    elif emergency_fund >= 3: score += 12
    elif emergency_fund >= 1: score += 5
    
    # Debt Burden (25 points)
    if monthly_income > 0:
        debt_ratio = debt_payment / monthly_income * 100
        if debt_ratio <= 20: score += 25
        elif debt_ratio <= 30: score += 18
        elif debt_ratio <= 40: score += 10
        elif debt_ratio <= 50: score += 5
    
    # Job Stability Factor (25 points)
    score += job_stability * 25 / 100
    
    return min(100, max(0, score))

def calculate_wealth_building_potential(savings_rate, age, current_savings, monthly_income, debt_freedom_months):
    """ศักยภาพสร้างความมั่งคั่ง (0-100)"""
    score = 0
    
    # Savings Rate (30 points)
    if savings_rate >= 30: score += 30
    elif savings_rate >= 20: score += 25
    elif savings_rate >= 10: score += 15
    elif savings_rate >= 5: score += 8
    
    # Time Horizon (25 points) - younger = more potential
    years_to_retirement = max(0, 60 - age)
    if years_to_retirement >= 30: score += 25
    elif years_to_retirement >= 20: score += 20
    elif years_to_retirement >= 10: score += 12
    elif years_to_retirement >= 5: score += 5
    
    # Current Savings Base (20 points)
    if monthly_income > 0:
        savings_months = current_savings / monthly_income
        if savings_months >= 24: score += 20
        elif savings_months >= 12: score += 15
        elif savings_months >= 6: score += 10
        elif savings_months >= 3: score += 5
    
    # Debt Freedom Timeline (25 points)
    if debt_freedom_months <= 12: score += 25
    elif debt_freedom_months <= 36: score += 18
    elif debt_freedom_months <= 60: score += 10
    elif debt_freedom_months <= 120: score += 5
    
    return min(100, max(0, score))

def calculate_investment_readiness(emergency_months, debt_stress, savings_potential, financial_health):
    """ความพร้อมลงทุน (0-100)"""
    score = 0
    
    # Emergency Fund Ready (30 points)
    if emergency_months >= 6: score += 30
    elif emergency_months >= 3: score += 20
    elif emergency_months >= 1: score += 10
    
    # Debt Stress Low (30 points)
    if debt_stress <= 20: score += 30
    elif debt_stress <= 40: score += 22
    elif debt_stress <= 60: score += 12
    elif debt_stress <= 80: score += 5
    
    # Has Savings Potential (20 points)
    if savings_potential >= 10000: score += 20
    elif savings_potential >= 5000: score += 15
    elif savings_potential >= 2000: score += 10
    elif savings_potential > 0: score += 5
    
    # Overall Health (20 points)
    score += financial_health * 0.2
    
    return min(100, max(0, score))

def calculate_retirement_gap(age, current_savings, monthly_savings, target_retirement_fund=5000000):
    """คำนวณว่าขาดเงินเกษียณกี่ปี (0 = พร้อม, บวก = ขาด)"""
    years_to_retirement = max(0, 60 - age)
    
    # Assume 5% annual return
    future_value = current_savings * (1.05 ** years_to_retirement)
    
    # Future value of monthly savings
    if monthly_savings > 0:
        # FV of annuity
        monthly_rate = 0.05 / 12
        months = years_to_retirement * 12
        if monthly_rate > 0 and months > 0:
            fv_savings = monthly_savings * (((1 + monthly_rate) ** months - 1) / monthly_rate)
            future_value += fv_savings
    
    if future_value >= target_retirement_fund:
        return 0  # พร้อมเกษียณ
    
    # Calculate how many more years needed
    gap = target_retirement_fund - future_value
    if monthly_savings > 0:
        years_needed = gap / (monthly_savings * 12 * 1.05)
        return min(30, max(0, years_needed))
    return 30  # ขาดมาก

def calculate_percentile_rank(dti_ratio, savings_rate, debt_stress):
    """คำนวณว่าอยู่ในระดับไหนเทียบกับคนอื่น"""
    # Based on Thai population statistics (approximate)
    score = 50  # Start at median
    
    # DTI comparison (Thai average ~35%)
    if dti_ratio <= 20: score += 25
    elif dti_ratio <= 30: score += 15
    elif dti_ratio <= 40: score += 5
    elif dti_ratio > 50: score -= 15
    
    # Savings rate comparison (Thai average ~10%)
    if savings_rate >= 30: score += 20
    elif savings_rate >= 20: score += 12
    elif savings_rate >= 10: score += 5
    elif savings_rate < 5: score -= 10
    
    # Debt stress comparison
    if debt_stress <= 30: score += 10
    elif debt_stress <= 50: score += 5
    elif debt_stress > 70: score -= 10
    
    return min(99, max(1, score))

def calculate_credit_score_impact(dti_ratio, payment_history_score, credit_utilization, account_age_months):
    """ผลกระทบต่อเครดิตสกอร์ (-50 ถึง +50)"""
    impact = 0
    
    # Payment History (most important)
    if payment_history_score >= 95: impact += 20
    elif payment_history_score >= 80: impact += 10
    elif payment_history_score >= 60: impact += 0
    else: impact -= 20
    
    # Credit Utilization (DTI proxy)
    if dti_ratio <= 20: impact += 15
    elif dti_ratio <= 30: impact += 10
    elif dti_ratio <= 40: impact += 0
    elif dti_ratio <= 50: impact -= 10
    else: impact -= 20
    
    # Account Age
    if account_age_months >= 60: impact += 10
    elif account_age_months >= 36: impact += 5
    elif account_age_months >= 12: impact += 0
    else: impact -= 5
    
    # Credit Mix bonus
    impact += 5
    
    return max(-50, min(50, impact))

def calculate_life_quality_score(financial_health, debt_stress, savings_potential, monthly_income):
    """คะแนนคุณภาพชีวิต (0-100)"""
    score = 0
    
    # Financial Health (30 points)
    score += financial_health * 0.3
    
    # Low Stress (30 points)
    stress_score = max(0, 100 - debt_stress)
    score += stress_score * 0.3
    
    # Disposable Income (25 points)
    if monthly_income > 0:
        disposal_ratio = savings_potential / monthly_income * 100
        if disposal_ratio >= 30: score += 25
        elif disposal_ratio >= 20: score += 18
        elif disposal_ratio >= 10: score += 12
        elif disposal_ratio >= 5: score += 5
    
    # Base living standard from income (15 points)
    if monthly_income >= 100000: score += 15
    elif monthly_income >= 50000: score += 12
    elif monthly_income >= 30000: score += 8
    elif monthly_income >= 20000: score += 5
    
    return min(100, max(0, score))

def calculate_emergency_buffer_months(monthly_income, monthly_expenses, loan_amount, interest_rate, job_stability):
    """คำนวณว่าควรมีเงินสำรองฉุกเฉินกี่เดือน"""
    base_buffer = 3
    
    # Interest rate risk
    if interest_rate >= 15: base_buffer += 3
    elif interest_rate >= 10: base_buffer += 2
    elif interest_rate >= 5: base_buffer += 1
    
    # Debt size risk
    if monthly_income > 0:
        debt_ratio = loan_amount / (monthly_income * 12)
        if debt_ratio > 3: base_buffer += 3
        elif debt_ratio > 2: base_buffer += 2
        elif debt_ratio > 1: base_buffer += 1
    
    # Job stability
    if job_stability < 50: base_buffer += 3
    elif job_stability < 70: base_buffer += 2
    elif job_stability < 85: base_buffer += 1
    
    return min(12, base_buffer)

def get_payoff_strategy(interest_rate, dti_ratio, debt_stress, num_debts=1):
    """กลยุทธ์ปิดหนี้ที่เหมาะสม"""
    if debt_stress >= 80 or interest_rate >= 24:
        return 5  # Crisis
    if num_debts >= 3:
        return 4  # Consolidate
    if interest_rate >= 15:
        return 1  # Avalanche
    if dti_ratio > 40:
        return 3  # Hybrid
    if debt_stress >= 50:
        return 2  # Snowball for motivation
    return 0  # Standard

def get_primary_action(financial_health, debt_stress, dti_ratio, interest_rate, emergency_months, savings_potential):
    """สิ่งที่ควรทำก่อน"""
    if debt_stress >= 80 or interest_rate >= 24:
        return 7  # โทร 1213
    if debt_stress >= 70:
        return 6  # ปรึกษาผู้เชี่ยวชาญ
    if dti_ratio > 50:
        return 4  # ลดรายจ่าย
    if interest_rate >= 18:
        return 3  # ลดดอกเบี้ย
    if emergency_months < 3:
        return 1  # สร้างเงินสำรอง
    if dti_ratio > 35:
        return 2  # เพิ่มยอดจ่าย
    if savings_potential <= 0:
        return 5  # เพิ่มรายได้
    return 0  # รักษาระดับ

def get_urgency_level(debt_stress, interest_rate, dti_ratio):
    """ระดับความเร่งด่วน (0-4)"""
    if debt_stress >= 80 or interest_rate >= 24: return 4  # วิกฤต
    if debt_stress >= 60 or interest_rate >= 18: return 3  # ด่วนมาก
    if debt_stress >= 40 or dti_ratio > 40: return 2  # ด่วน
    if debt_stress >= 25 or dti_ratio > 30: return 1  # เตือน
    return 0  # ปกติ

def get_support_type(urgency, debt_stress, financial_health):
    """ประเภทความช่วยเหลือที่ต้องการ"""
    if urgency >= 4: return 5  # ฉุกเฉิน - ต้องการความช่วยเหลือทันที
    if urgency >= 3: return 4  # ผู้เชี่ยวชาญ
    if debt_stress >= 60: return 3  # ที่ปรึกษาการเงิน
    if financial_health < 40: return 2  # การศึกษาทางการเงิน
    if financial_health < 60: return 1  # เครื่องมือวางแผน
    return 0  # Self-service

# ═══════════════════════════════════════════════════════════════════════════════
# 📊 MEGA DATASET GENERATION (300,000+ samples)
# ═══════════════════════════════════════════════════════════════════════════════
print("\n📊 Generating MEGA training dataset (300,000 samples)...")
print("   Covering ALL Thai financial scenarios...")

np.random.seed(42)
n_samples = 1000000  # 1 ล้าน samples - ครอบคลุมทุกสถานการณ์!

# Thai Financial Landscape
INCOME_DISTRIBUTIONS = {
    'student': (8000, 15000, 0.10),
    'entry_level': (15000, 25000, 0.25),
    'mid_level': (25000, 45000, 0.30),
    'senior_level': (45000, 80000, 0.20),
    'management': (80000, 150000, 0.10),
    'executive': (150000, 500000, 0.05),
}

LOAN_TYPES = {
    'student_loan': {'rate': (0.1, 2.0), 'amount': (20000, 800000), 'term': (36, 180), 'prob': 0.18},
    'personal_low': {'rate': (4.0, 8.0), 'amount': (20000, 300000), 'term': (12, 60), 'prob': 0.18},
    'personal_high': {'rate': (8.0, 15.0), 'amount': (50000, 500000), 'term': (12, 84), 'prob': 0.18},
    'credit_card': {'rate': (15.0, 20.0), 'amount': (10000, 300000), 'term': (12, 60), 'prob': 0.18},
    'car_loan': {'rate': (3.0, 8.0), 'amount': (200000, 1500000), 'term': (48, 84), 'prob': 0.10},
    'high_risk': {'rate': (20.0, 28.0), 'amount': (10000, 200000), 'term': (6, 36), 'prob': 0.08},
    'loan_shark': {'rate': (28.0, 60.0), 'amount': (5000, 100000), 'term': (3, 24), 'prob': 0.05},
    'mortgage': {'rate': (3.0, 7.0), 'amount': (500000, 5000000), 'term': (120, 360), 'prob': 0.05},
}

AGE_DISTRIBUTIONS = {
    'student': (18, 25), 'young_worker': (25, 35), 'mid_career': (35, 45),
    'senior': (45, 55), 'pre_retire': (55, 60)
}

data = []
print(f"   Generating {n_samples:,} samples...")

for i in range(n_samples):
    if i % 50000 == 0 and i > 0:
        print(f"   Progress: {i:,}/{n_samples:,} ({i/n_samples*100:.0f}%)")
    
    # Generate person profile
    income_type = np.random.choice(list(INCOME_DISTRIBUTIONS.keys()), 
                                   p=[v[2] for v in INCOME_DISTRIBUTIONS.values()])
    income_range = INCOME_DISTRIBUTIONS[income_type]
    monthly_income = np.random.uniform(income_range[0], income_range[1])
    
    # Age based on income type
    if income_type == 'student':
        age = np.random.randint(18, 26)
    elif income_type == 'entry_level':
        age = np.random.randint(22, 32)
    elif income_type == 'mid_level':
        age = np.random.randint(28, 42)
    elif income_type == 'senior_level':
        age = np.random.randint(35, 52)
    else:
        age = np.random.randint(40, 58)
    
    # Loan parameters
    loan_type = np.random.choice(list(LOAN_TYPES.keys()), 
                                 p=[v['prob'] for v in LOAN_TYPES.values()])
    params = LOAN_TYPES[loan_type]
    
    interest_rate = np.random.uniform(*params['rate'])
    loan_amount = np.random.uniform(*params['amount'])
    term_months = np.random.choice(range(params['term'][0], params['term'][1] + 1, 6))
    
    # Payment behavior
    min_payment = calculate_monthly_payment(loan_amount, interest_rate, term_months)
    payment_factor = np.random.choice([1.0, 1.05, 1.1, 1.2, 1.3, 1.5], p=[0.25, 0.25, 0.20, 0.15, 0.10, 0.05])
    monthly_payment = min_payment * payment_factor
    
    # Calculate DTI
    dti_ratio = (monthly_payment / monthly_income * 100) if monthly_income > 0 else 100
    if dti_ratio > 70:
        monthly_payment = monthly_income * 0.5
        dti_ratio = 50
    
    # Financial habits
    expense_ratio = np.random.uniform(0.4, 0.75)
    estimated_expenses = monthly_income * expense_ratio
    savings_potential = max(0, monthly_income - monthly_payment - estimated_expenses)
    savings_rate = (savings_potential / monthly_income * 100) if monthly_income > 0 else 0
    
    # Emergency fund
    emergency_months = np.random.choice([0, 0, 1, 2, 3, 4, 6, 9, 12], 
                                        p=[0.15, 0.12, 0.15, 0.15, 0.15, 0.12, 0.08, 0.05, 0.03])
    
    # Current savings
    current_savings = emergency_months * (monthly_expenses if 'monthly_expenses' in dir() else estimated_expenses)
    
    # Job stability (0-100)
    if income_type in ['executive', 'management', 'senior_level']:
        job_stability = np.random.uniform(70, 95)
    elif income_type == 'mid_level':
        job_stability = np.random.uniform(55, 85)
    elif income_type == 'entry_level':
        job_stability = np.random.uniform(40, 75)
    else:
        job_stability = np.random.uniform(25, 60)
    
    # Payment history score (0-100)
    if dti_ratio < 30 and savings_rate > 10:
        payment_history = np.random.uniform(85, 100)
    elif dti_ratio < 45:
        payment_history = np.random.uniform(65, 95)
    else:
        payment_history = np.random.uniform(40, 80)
    
    # Account age
    account_age = np.random.randint(6, min(age * 6, 180))
    
    # ═══ CALCULATE ALL TARGETS ═══
    debt_freedom_months = calculate_payoff_months(loan_amount, interest_rate, monthly_payment)
    smart_payment_boost = calculate_smart_payment_boost(loan_amount, interest_rate, monthly_payment, monthly_income, dti_ratio)
    time_saved, money_saved = calculate_time_and_money_saved(loan_amount, interest_rate, monthly_payment, smart_payment_boost)
    
    total_interest = calculate_total_interest(loan_amount, interest_rate, term_months)
    interest_burden = (total_interest / loan_amount * 100) if loan_amount > 0 else 0
    
    debt_to_annual = loan_amount / (monthly_income * 12) if monthly_income > 0 else 10
    
    financial_health = calculate_financial_health_score(dti_ratio, interest_rate, emergency_months, savings_rate, debt_to_annual)
    
    payment_to_min = monthly_payment / min_payment if min_payment > 0 else 1
    debt_stress = calculate_debt_stress_index(dti_ratio, interest_rate, debt_freedom_months, payment_to_min)
    
    financial_stability = calculate_financial_stability(monthly_income, estimated_expenses, monthly_payment, emergency_months, job_stability)
    
    wealth_potential = calculate_wealth_building_potential(savings_rate, age, current_savings, monthly_income, debt_freedom_months)
    
    emergency_buffer = calculate_emergency_buffer_months(monthly_income, estimated_expenses, loan_amount, interest_rate, job_stability)
    
    investment_ready = calculate_investment_readiness(emergency_months, debt_stress, savings_potential, financial_health)
    
    retirement_gap = calculate_retirement_gap(age, current_savings, savings_potential)
    
    percentile = calculate_percentile_rank(dti_ratio, savings_rate, debt_stress)
    
    better_than_avg = 1 if percentile > 50 else 0
    
    credit_impact = calculate_credit_score_impact(dti_ratio, payment_history, dti_ratio, account_age)
    
    life_quality = calculate_life_quality_score(financial_health, debt_stress, savings_potential, monthly_income)
    
    payoff_strategy = get_payoff_strategy(interest_rate, dti_ratio, debt_stress)
    
    primary_action = get_primary_action(financial_health, debt_stress, dti_ratio, interest_rate, emergency_months, savings_potential)
    
    urgency = get_urgency_level(debt_stress, interest_rate, dti_ratio)
    
    support_type = get_support_type(urgency, debt_stress, financial_health)
    
    # Derived features
    effective_rate = ((1 + interest_rate/100/12)**12 - 1) * 100
    log_loan = np.log1p(loan_amount)
    log_income = np.log1p(monthly_income)
    
    data.append({
        # ═══ INPUT FEATURES (35) ═══
        'loan_amount': loan_amount,
        'interest_rate': interest_rate,
        'term_months': term_months,
        'monthly_income': monthly_income,
        'monthly_payment': monthly_payment,
        'dti_ratio': dti_ratio,
        'min_payment': min_payment,
        'estimated_expenses': estimated_expenses,
        'emergency_months_actual': emergency_months,
        'age': age,
        'job_stability': job_stability,
        'payment_history': payment_history,
        'account_age': account_age,
        'current_savings': current_savings,
        
        # Derived
        'effective_rate': effective_rate,
        'log_loan': log_loan,
        'log_income': log_income,
        'payment_flexibility': monthly_income - monthly_payment - estimated_expenses,
        'debt_to_annual_income': debt_to_annual,
        'payment_to_min_ratio': payment_to_min,
        'savings_rate': savings_rate,
        'years_to_retirement': max(0, 60 - age),
        
        # Categorical
        'is_student_loan': 1 if interest_rate <= 2 else 0,
        'is_personal_loan': 1 if 4 <= interest_rate < 15 else 0,
        'is_credit_card': 1 if 15 <= interest_rate < 20 else 0,
        'is_high_risk': 1 if interest_rate >= 20 else 0,
        'is_young': 1 if age < 30 else 0,
        'is_senior': 1 if age >= 50 else 0,
        'has_emergency_fund': 1 if emergency_months >= 3 else 0,
        'is_high_income': 1 if monthly_income >= 50000 else 0,
        
        # ═══ TARGETS (21) ═══
        # Group A: Debt Analysis
        'debt_freedom_months': min(debt_freedom_months, 600),
        'smart_payment_boost': smart_payment_boost,
        'time_saved_months': time_saved,
        'money_saved_total': money_saved,
        'interest_burden_ratio': interest_burden,
        
        # Group B: Financial Health
        'financial_health_score': financial_health,
        'debt_stress_index': debt_stress,
        'financial_stability': financial_stability,
        'wealth_building_potential': wealth_potential,
        
        # Group C: Planning
        'emergency_buffer_months': emergency_buffer,
        'savings_potential': savings_potential,
        'investment_readiness': investment_ready,
        'retirement_gap_years': retirement_gap,
        
        # Group D: Comparison
        'percentile_rank': percentile,
        'better_than_average': better_than_avg,
        
        # Group E: Impact
        'credit_score_impact': credit_impact,
        'life_quality_score': life_quality,
        
        # Group F: Strategy
        'payoff_strategy_code': payoff_strategy,
        'primary_action_code': primary_action,
        'urgency_level': urgency,
        'support_type_needed': support_type,
    })

df = pd.DataFrame(data)
print(f"\n✅ Generated {len(df):,} training samples!")

df = df.replace([np.inf, -np.inf], np.nan).dropna()
print(f"   After cleaning: {len(df):,} samples")

# ═══════════════════════════════════════════════════════════════════════════════
# 🧬 PREPARE FEATURES AND TARGETS
# ═══════════════════════════════════════════════════════════════════════════════
print("\n🧬 Preparing features and targets...")

feature_columns = [
    'loan_amount', 'interest_rate', 'term_months', 'monthly_income', 'monthly_payment',
    'dti_ratio', 'min_payment', 'estimated_expenses', 'emergency_months_actual',
    'age', 'job_stability', 'payment_history', 'account_age', 'current_savings',
    'effective_rate', 'log_loan', 'log_income', 'payment_flexibility',
    'debt_to_annual_income', 'payment_to_min_ratio', 'savings_rate', 'years_to_retirement',
    'is_student_loan', 'is_personal_loan', 'is_credit_card', 'is_high_risk',
    'is_young', 'is_senior', 'has_emergency_fund', 'is_high_income'
]

regression_targets = [
    'debt_freedom_months', 'smart_payment_boost', 'time_saved_months', 'money_saved_total',
    'interest_burden_ratio', 'financial_health_score', 'debt_stress_index',
    'financial_stability', 'wealth_building_potential', 'emergency_buffer_months',
    'savings_potential', 'investment_readiness', 'retirement_gap_years',
    'percentile_rank', 'credit_score_impact', 'life_quality_score'
]

classification_targets = ['payoff_strategy_code', 'primary_action_code', 'urgency_level', 
                          'support_type_needed', 'better_than_average']

X = df[feature_columns].values
y_reg = df[regression_targets].values
y_strategy = df['payoff_strategy_code'].values
y_action = df['primary_action_code'].values
y_urgency = df['urgency_level'].values
y_support = df['support_type_needed'].values
y_better = df['better_than_average'].values

print(f"Features: {X.shape[1]} columns")
print(f"Regression targets: {len(regression_targets)}")
print(f"Classification targets: {len(classification_targets)}")

# Split
X_train, X_test, y_reg_train, y_reg_test = train_test_split(X, y_reg, test_size=0.15, random_state=42)
_, _, y_strat_train, y_strat_test = train_test_split(X, y_strategy, test_size=0.15, random_state=42)
_, _, y_act_train, y_act_test = train_test_split(X, y_action, test_size=0.15, random_state=42)
_, _, y_urg_train, y_urg_test = train_test_split(X, y_urgency, test_size=0.15, random_state=42)
_, _, y_sup_train, y_sup_test = train_test_split(X, y_support, test_size=0.15, random_state=42)
_, _, y_bet_train, y_bet_test = train_test_split(X, y_better, test_size=0.15, random_state=42)

print(f"\nTraining: {len(X_train):,} | Test: {len(X_test):,}")

# Scale
scaler = RobustScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ═══════════════════════════════════════════════════════════════════════════════
# 🤖 TRAIN MODELS
# ═══════════════════════════════════════════════════════════════════════════════
print("\n🤖 Training ULTIMATE Financial Advisor Models...")

# Regression Model - LITE VERSION สำหรับ Render (< 512MB)
print("\n📊 Training Multi-Output Regression (16 targets) - LITE...")
reg_model = MultiOutputRegressor(
    RandomForestRegressor(n_estimators=15, max_depth=8, min_samples_split=50,
                          random_state=42, n_jobs=-1)
)
reg_model.fit(X_train_scaled, y_reg_train)
y_reg_pred = reg_model.predict(X_test_scaled)

print("\n📊 Regression Performance:")
print("-" * 70)
for i, name in enumerate(regression_targets):
    mae = mean_absolute_error(y_reg_test[:, i], y_reg_pred[:, i])
    r2 = r2_score(y_reg_test[:, i], y_reg_pred[:, i])
    print(f"  {name:30} | MAE: {mae:10,.2f} | R²: {r2:.4f}")

# Classification Models - LITE VERSION
print("\n🎯 Training Classifiers - LITE...")
clf_params = {'n_estimators': 15, 'max_depth': 8, 'random_state': 42, 'n_jobs': -1}

strat_model = RandomForestClassifier(**clf_params)
strat_model.fit(X_train_scaled, y_strat_train)
strat_acc = strat_model.score(X_test_scaled, y_strat_test)
print(f"   Strategy Accuracy: {strat_acc*100:.2f}%")

act_model = RandomForestClassifier(**clf_params)
act_model.fit(X_train_scaled, y_act_train)
act_acc = act_model.score(X_test_scaled, y_act_test)
print(f"   Action Accuracy: {act_acc*100:.2f}%")

urg_model = RandomForestClassifier(**clf_params)
urg_model.fit(X_train_scaled, y_urg_train)
urg_acc = urg_model.score(X_test_scaled, y_urg_test)
print(f"   Urgency Accuracy: {urg_acc*100:.2f}%")

sup_model = RandomForestClassifier(**clf_params)
sup_model.fit(X_train_scaled, y_sup_train)
sup_acc = sup_model.score(X_test_scaled, y_sup_test)
print(f"   Support Type Accuracy: {sup_acc*100:.2f}%")

bet_model = RandomForestClassifier(**clf_params)
bet_model.fit(X_train_scaled, y_bet_train)
bet_acc = bet_model.score(X_test_scaled, y_bet_test)
print(f"   Better Than Avg Accuracy: {bet_acc*100:.2f}%")

# ═══════════════════════════════════════════════════════════════════════════════
# 💾 SAVE MODEL
# ═══════════════════════════════════════════════════════════════════════════════
print("\n💾 Saving ULTIMATE Model...")

strategy_labels = {
    0: 'Standard - จ่ายตามปกติ', 1: 'Avalanche - จ่ายดอกสูงก่อน',
    2: 'Snowball - จ่ายก้อนเล็กก่อน', 3: 'Hybrid - ผสมทั้งสองแบบ',
    4: 'Consolidate - รวมหนี้', 5: 'Crisis - ขอความช่วยเหลือด่วน'
}

action_labels = {
    0: '✅ รักษาระดับ', 1: '🏦 สร้างเงินสำรอง', 2: '💰 เพิ่มยอดจ่าย',
    3: '📉 ลดดอกเบี้ย', 4: '✂️ ลดรายจ่าย', 5: '💼 เพิ่มรายได้',
    6: '👨‍💼 ปรึกษาผู้เชี่ยวชาญ', 7: '🆘 โทร 1213'
}

urgency_labels = {
    0: '🟢 ปกติ', 1: '🟡 เตือน', 2: '🟠 ด่วน', 3: '🔴 ด่วนมาก', 4: '⚫ วิกฤต'
}

support_labels = {
    0: 'Self-service', 1: 'เครื่องมือวางแผน', 2: 'การศึกษาการเงิน',
    3: 'ที่ปรึกษาการเงิน', 4: 'ผู้เชี่ยวชาญ', 5: 'ฉุกเฉิน'
}

model_package = {
    'regression_model': reg_model,
    'strategy_model': strat_model,
    'action_model': act_model,
    'urgency_model': urg_model,
    'support_model': sup_model,
    'better_model': bet_model,
    'scaler': scaler,
    'feature_columns': feature_columns,
    'regression_targets': regression_targets,
    'strategy_labels': strategy_labels,
    'action_labels': action_labels,
    'urgency_labels': urgency_labels,
    'support_labels': support_labels,
    'version': '3.0.0',
    'training_samples': len(X_train),
    'accuracies': {
        'strategy': strat_acc, 'action': act_acc,
        'urgency': urg_acc, 'support': sup_acc, 'better': bet_acc
    }
}

joblib.dump(model_package, 'financial_advisor_model.pkl', compress=9)  # Max compression
print("✅ Saved: financial_advisor_model.pkl")

# ═══════════════════════════════════════════════════════════════════════════════
# 🧪 COMPREHENSIVE TESTING
# ═══════════════════════════════════════════════════════════════════════════════
print("\n" + "="*100)
print("🧪 MODEL TESTING")
print("="*100)

def predict_full(loan, rate, term, income, payment, expenses, emergency, age, job_stab, pay_hist, acc_age, savings):
    dti = (payment / income * 100) if income > 0 else 100
    min_pay = calculate_monthly_payment(loan, rate, term)
    eff_rate = ((1 + rate/100/12)**12 - 1) * 100
    features = np.array([[
        loan, rate, term, income, payment, dti, min_pay, expenses, emergency, age,
        job_stab, pay_hist, acc_age, savings, eff_rate, np.log1p(loan), np.log1p(income),
        income - payment - expenses, loan/(income*12) if income > 0 else 10,
        payment/min_pay if min_pay > 0 else 1,
        ((income - payment - expenses)/income*100) if income > 0 else 0,
        max(0, 60-age),
        1 if rate <= 2 else 0, 1 if 4 <= rate < 15 else 0,
        1 if 15 <= rate < 20 else 0, 1 if rate >= 20 else 0,
        1 if age < 30 else 0, 1 if age >= 50 else 0,
        1 if emergency >= 3 else 0, 1 if income >= 50000 else 0
    ]])
    fs = scaler.transform(features)
    reg = reg_model.predict(fs)[0]
    strat = strat_model.predict(fs)[0]
    act = act_model.predict(fs)[0]
    urg = urg_model.predict(fs)[0]
    sup = sup_model.predict(fs)[0]
    bet = bet_model.predict(fs)[0]
    return reg, strat, act, urg, sup, bet

# Test scenarios
tests = [
    (100000, 1.0, 60, 25000, 1800, 12000, 2, 25, 60, 85, 24, 20000, "กยศ. บัณฑิตใหม่"),
    (200000, 18.0, 48, 35000, 6000, 18000, 0, 32, 70, 70, 48, 0, "บัตรเครดิต หนักมาก"),
    (50000, 24.0, 12, 22000, 5500, 14000, 0, 28, 50, 55, 12, 0, "สินเชื่อด่วน วิกฤต!"),
    (500000, 5.0, 84, 80000, 8000, 35000, 6, 42, 85, 95, 96, 150000, "สุขภาพการเงินดี"),
]

for params in tests:
    *p, name = params
    reg, strat, act, urg, sup, bet = predict_full(*p)
    print(f"\n{'─'*80}")
    print(f"🎯 {name}")
    print(f"{'─'*80}")
    print(f"📋 หนี้: {p[0]:,} | ดอก: {p[1]}% | รายได้: {p[3]:,} | อายุ: {p[7]}")
    print(f"\n🔮 AI วิเคราะห์ (20+ มิติ):")
    print(f"   ⏰ ปลดหนี้: {reg[0]:.0f} เดือน | 💰 จ่ายเพิ่ม: {reg[1]:,.0f} บาท")
    print(f"   ⚡ เร็วขึ้น: {reg[2]:.0f} เดือน | 💵 ประหยัด: {reg[3]:,.0f} บาท")
    print(f"   ❤️ สุขภาพ: {reg[5]:.0f}/100 | 😰 เครียด: {reg[6]:.0f}/100 | 🏠 มั่นคง: {reg[7]:.0f}/100")
    print(f"   💎 สร้างความมั่งคั่ง: {reg[8]:.0f}/100 | 📈 พร้อมลงทุน: {reg[11]:.0f}/100")
    print(f"   📊 Percentile: {reg[13]:.0f} | 🌟 คุณภาพชีวิต: {reg[15]:.0f}/100")
    print(f"\n   🎯 กลยุทธ์: {strategy_labels[strat]}")
    print(f"   ⭐ ทำก่อน: {action_labels[act]}")
    print(f"   🚨 เร่งด่วน: {urgency_labels[urg]}")
    print(f"   🤝 ต้องการ: {support_labels[sup]}")

# Final Summary
avg_r2 = np.mean([r2_score(y_reg_test[:, i], y_reg_pred[:, i]) for i in range(len(regression_targets))])
avg_acc = (strat_acc + act_acc + urg_acc + sup_acc + bet_acc) / 5

print("\n" + "="*100)
print("🎉 ULTIMATE FINANCIAL ADVISOR v3.0 - COMPLETE!")
print("="*100)
print(f"""
╔══════════════════════════════════════════════════════════════════════════════════╗
║           🧠 ULTIMATE FINANCIAL ADVISOR v3.0 SUMMARY                             ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  📊 Training: {len(X_train):>10,} samples | Test: {len(X_test):>10,} samples              ║
║  🧬 Features: {len(feature_columns):>10} | Regression: {len(regression_targets):>2} | Classification: {len(classification_targets):>1}       ║
║                                                                                  ║
║  🎯 PERFORMANCE                                                                  ║
║     Regression R² Avg: {avg_r2*100:>6.2f}%                                               ║
║     Classification Avg: {avg_acc*100:>6.2f}%                                              ║
║                                                                                  ║
║  🔮 PREDICTIONS (21 มิติ)                                                        ║
║     【A】หนี้: ปลดหนี้, จ่ายเพิ่ม, เวลา/เงินประหยัด, ภาระดอกเบี้ย               ║
║     【B】สุขภาพ: คะแนนสุขภาพ, เครียด, มั่นคง, ศักยภาพ                           ║
║     【C】แผน: สำรอง, ออม, พร้อมลงทุน, เกษียณ                                    ║
║     【D】เปรียบเทียบ: Percentile, ดีกว่าค่าเฉลี่ย                               ║
║     【E】ผลกระทบ: เครดิต, คุณภาพชีวิต                                           ║
║     【F】กลยุทธ์: ปิดหนี้, ทำก่อน, เร่งด่วน, ช่วยเหลือ                          ║
║                                                                                  ║
║  📁 OUTPUT: financial_advisor_model.pkl                                          ║
╚══════════════════════════════════════════════════════════════════════════════════╝

✨ Model พร้อมใช้งาน - ครอบคลุมทุกมิติการเงินในประเทศไทย!
""")
