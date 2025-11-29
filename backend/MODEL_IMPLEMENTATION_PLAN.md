# 🤖 AI Model Implementation Plan
## FinLand - Enterprise Debt Profile Predictor

**Version**: 4.1.0  
**Date**: November 26, 2025  
**Status**: ✅ Production Deployed  
**Repository**: [GitHub - FinLand](https://github.com/paripatrod/FinLand)  
**Model**: [Hugging Face](https://huggingface.co/Pottersk/financial-calculator-ai-model)  

---

## 📋 Executive Summary

This document outlines the complete AI model implementation for the Financial Calculator App, including architecture design, feature engineering strategy, training methodology, evaluation metrics, and deployment plan.

**Model Goal**: Predict debt profile category (100 unique profiles) with real-time DTI (Debt-to-Income) analysis for accurate risk assessment.

---

## 🎯 1. Business Objectives

### Primary Objectives:
1. **Profile Classification**: Classify loans into 50 distinct debt profiles based on amount, interest rate, and term
2. **Risk Assessment**: Provide accurate risk scores (0-100) with severity levels
3. **Real-time DTI Analysis**: Integrate monthly income for practical debt burden assessment
4. **Actionable Recommendations**: Generate personalized financial advice for each profile

### Success Metrics:
- **Accuracy Target**: ≥85% on 100-class classification
- **Inference Speed**: <500ms per prediction
- **Model Size**: <5MB for fast deployment
- **Coverage**: All Thai debt types (กยศ., Personal, Credit Card, High-Risk, Crisis)

---

## 🏗️ 2. Model Architecture

### 2.1 Algorithm Selection

**Selected Algorithm**: **Random Forest Classifier**

**Rationale**:
- ✅ Handles non-linear relationships between features
- ✅ Robust to outliers (important for crisis loans)
- ✅ Provides feature importance rankings
- ✅ Fast inference with parallel tree evaluation
- ✅ No need for feature scaling
- ✅ Handles imbalanced classes well

**Hyperparameters** (Optimized):
```python
RandomForestClassifier(
    n_estimators=40,        # Reduced from 100 for speed/memory
    max_depth=12,           # Prevents overfitting on 50 classes
    min_samples_split=5,    # Minimum samples to split node
    min_samples_leaf=2,     # Minimum samples per leaf
    max_features='sqrt',    # Feature sampling strategy
    random_state=42,        # Reproducibility
    class_weight='balanced' # Handle class imbalance
)
```

### 2.2 Alternative Algorithms Considered

| Algorithm | Pros | Cons | Decision |
|-----------|------|------|----------|
| **Logistic Regression** | Fast, interpretable | Poor for 50 classes | ❌ Rejected |
| **SVM** | High accuracy | Slow inference, large model | ❌ Rejected |
| **XGBoost** | Best accuracy | Large model size (10+ MB) | ❌ Rejected |
| **Neural Network** | Flexible | Needs more data, slow training | ❌ Rejected |
| **Random Forest** | Balanced speed/accuracy | Medium memory | ✅ **Selected** |

---

## 🔧 3. Feature Engineering

### 3.1 Input Features (3 Base Features)

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| `loan_amnt` | Numeric | 10,000 - 1,000,000 THB | Principal loan amount |
| `int_rate` | Numeric | 0.5% - 40% | Annual interest rate |
| `term` | Numeric | 12 - 96 months | Loan term in months |
| `monthly_income` | Numeric (Optional) | >0 THB | Borrower's monthly income (for DTI) |

### 3.2 Engineered Features (29 Total Features)

**Category 1: Polynomial Features** (6 features)
```python
- loan_amnt²
- int_rate²
- term²
- loan_amnt × int_rate
- loan_amnt × term
- int_rate × term
```

**Category 2: Financial Metrics** (10 features)
```python
- total_interest = loan_amnt × (int_rate/100) × (term/12)
- total_paid = loan_amnt + total_interest
- monthly_payment = total_paid / term
- interest_ratio = total_interest / loan_amnt
- debt_burden = loan_amnt / term  # Average monthly burden
- yearly_rate = int_rate / 12
- loan_per_year = loan_amnt / (term / 12)
- payment_to_principal_ratio = monthly_payment / loan_amnt
- total_cost_ratio = total_paid / loan_amnt
- effective_rate = (total_paid - loan_amnt) / loan_amnt
```

**Category 3: Logarithmic Features** (3 features)
```python
- log_loan = log(loan_amnt)
- log_rate = log(int_rate + 1)  # +1 to handle low rates
- log_term = log(term)
```

**Category 4: Categorical Bins** (4 features)
```python
- loan_size_bin: [Small, Medium, Large, Jumbo]
- rate_level_bin: [Ultra-Low, Low, Medium, High, Crisis]
- term_category_bin: [Short, Medium, Long, Very Long]
- risk_tier_bin: [Safe, Moderate, Risky, Dangerous]
```

**Category 5: Interaction Terms** (3 features)
```python
- rate_term_interaction = int_rate × term
- loan_rate_power = loan_amnt^0.5 × int_rate
- compound_factor = (1 + int_rate/1200)^term
```

**Category 6: DTI Features** (3 features - Optional)
```python
- dti_ratio = (monthly_payment / monthly_income) × 100  # Percentage
- income_coverage = monthly_income / monthly_payment    # How many times income covers payment
- disposable_income = monthly_income - monthly_payment  # Leftover after payment
```

**Total**: **29 engineered features** from 3 base inputs

### 3.3 Feature Importance (Top 10)

Based on training results:

1. **int_rate** (0.32) - Interest rate is the strongest predictor
2. **total_interest** (0.18) - Total cost burden
3. **loan_amnt** (0.12) - Principal amount
4. **interest_ratio** (0.09) - Interest to principal ratio
5. **term** (0.07) - Loan duration
6. **monthly_payment** (0.06) - Monthly burden
7. **rate_term_interaction** (0.05) - Combined effect
8. **dti_ratio** (0.04) - Debt-to-income (when available)
9. **total_paid** (0.03) - Total repayment amount
10. **log_rate** (0.02) - Log-scaled interest rate

---

## 📊 4. Training Strategy

### 4.1 Dataset Generation

**Synthetic Data Generation**:
- **100 Profiles** × **1,000 samples each** = **100,000 training samples**
- Stratified sampling ensures balanced representation
- Noise injection for robustness (±10% variance on features)

**Profile Categories** (5 main groups):

| Category | Profiles | Interest Range | Risk Level |
|----------|----------|----------------|------------|
| กยศ./กู้การศึกษา | 0-24 (25 profiles) | 0.1% - 2% | Low-Medium |
| สินเชื่อส่วนบุคคล | 25-54 (30 profiles) | 4% - 15% | Low-High |
| บัตรเครดิต | 55-74 (20 profiles) | 15% - 20% | High-Critical |
| หนี้ดอกสูงมาก | 75-89 (15 profiles) | 20% - 28% | Critical |
| นอกระบบ/วิกฤต | 90-99 (10 profiles) | > 28% | Critical |

### 4.2 Train/Test Split

```python
train_size = 90,000 samples (90%)
test_size = 10,000 samples (10%)
stratified_split = True  # Maintain class distribution
random_state = 42
```

### 4.3 Training Pipeline

```python
1. Load 50 debt profiles
2. Generate 2,000 synthetic samples per profile
3. Engineer 29 features from 3 base inputs
4. Split: 90% train, 10% test (stratified)
5. Train Random Forest (40 estimators, depth 12)
6. Evaluate on test set
7. Save model as model.pkl (compressed with joblib)
8. Upload to Hugging Face for deployment
```

### 4.4 Optimization Techniques

- **Class Weighting**: `class_weight='balanced'` to handle imbalance
- **Feature Selection**: Keep all 29 features (all contribute)
- **Hyperparameter Tuning**: Grid search on n_estimators, max_depth
- **Memory Optimization**: Reduced from 100 to 40 trees (-70% size)
- **Speed Optimization**: max_depth=12 limits tree growth

---

## 📈 5. Evaluation Metrics

### 5.1 Primary Metrics

**1. Test Accuracy**: **89.96%** ✅
- Target: ≥85% for 100-class problem
- Achieved: 89.96% (4.96% above target)

**2. Per-Class Metrics**:
```
Precision: 0.81 (avg)
Recall: 0.80 (avg)
F1-Score: 0.80 (avg)
```

**3. Confusion Matrix Analysis**:
- Main diagonal strong (correct predictions)
- Minor confusion between similar profiles (e.g., กยศ. 1.0% vs 1.1%)
- Crisis loans perfectly classified (critical for safety)

### 5.2 Business Metrics

**1. Risk Score Accuracy**:
- MAE (Mean Absolute Error): ±5 points
- RMSE: 7.2 points
- Correlation: 0.92 with true risk scores

**2. Severity Level Accuracy**: **95%**
- Low → Medium misclassification: 3%
- Medium → High misclassification: 2%
- Critical always correct: 100%

**3. DTI Integration Success**:
- DTI > 50%: Risk +25 points (accurate detection)
- DTI < 10%: Risk -10 points (accurate reduction)
- Income-aware recommendations: 90% relevance

### 5.3 Production Metrics

**1. Inference Speed**:
- Average: 120ms per prediction
- P95: 180ms
- Target: <500ms ✅

**2. Model Size**:
- Compressed: 3.23 MB
- Uncompressed: ~13 MB in memory
- Target: <5 MB ✅

**3. Error Rate**:
- Total errors: 1,980 / 10,000 = 19.8%
- Critical errors (Crisis misclassified as Safe): 0% ✅

---

## 🚀 6. Deployment Plan

### 6.1 Deployment Architecture

```
┌─────────────────┐
│  Frontend       │
│  (React/Vite)   │
│  Vercel         │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Backend API    │
│  (Flask 3.0)    │
│  Render         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Model       │
│  (model.pkl)    │
│  Hugging Face   │
└─────────────────┘
```

### 6.2 Model Hosting Strategy

**Primary**: Hugging Face Model Hub
- Repository: `Pottersk/financial-calculator-ai-model`
- URL: `https://huggingface.co/Pottersk/financial-calculator-ai-model/resolve/main/model.pkl`
- Access: Public (no API key required)
- Bandwidth: Unlimited

**Fallback**: Backend Server Cache
- Auto-download on first prediction
- Cache in backend/model.pkl
- Reload on server restart

### 6.3 Deployment Steps

**Step 1: Train Model**
```bash
cd backend
python train_model.py  # Generates model.pkl
```

**Step 2: Upload to Hugging Face**
```bash
python upload_to_huggingface.py
# Requires: HUGGING_FACE_TOKEN environment variable
```

**Step 3: Deploy Backend (Render)**
```bash
# Environment Variables:
FLASK_ENV=production
MODEL_URL=https://huggingface.co/Pottersk/financial-calculator-ai-model/resolve/main/model.pkl
SECRET_KEY=your-production-key
```

**Step 4: Deploy Frontend (Vercel)**
```bash
# Build command: cd frontend && npm install && npm run build
# Output: frontend/dist
```

### 6.4 API Integration

**Endpoint**: `POST /api/predict`

**Request Body**:
```json
{
  "loan_amnt": 100000,
  "int_rate": 16.0,
  "term": 36,
  "monthly_payment": 3000,      // Optional
  "monthly_income": 25000       // Optional (enables DTI)
}
```

**Response**:
```json
{
  "profile_id": 28,
  "name": "💳 หนี้บัตรเครดิต | ดอก 16% (3 ปี)",
  "tip": "บัตรเครดิต 16% ผ่อน 3 ปี...",
  "severity": "high",
  "action": "จ่ายเกินขั้นต่ำ | ปิดดอกสูงก่อน",
  "risk_score": 70,
  "dti_ratio": 12.0,            // If monthly_income provided
  "confidence": 0.85
}
```

### 6.5 Monitoring & Maintenance

**1. Performance Monitoring**:
- Track prediction latency (P50, P95, P99)
- Monitor error rates
- Log misclassifications for retraining

**2. Model Retraining Schedule**:
- **Quarterly**: Retrain with new data
- **On-demand**: If accuracy drops below 75%
- **Version Control**: Tag models (v3.1.0, v3.2.0, etc.)

**3. A/B Testing**:
- Test new models with 10% traffic
- Compare accuracy and user feedback
- Gradual rollout if successful

---

## 🔒 7. Security & Privacy

### 7.1 Data Privacy

- **No PII Storage**: Model never stores personal data
- **Client-side Processing**: Calculations happen in browser
- **Optional Income**: Users control DTI feature usage
- **No Logging**: Predictions not logged in production

### 7.2 Model Security

- **Model Integrity**: SHA-256 hash verification
- **HTTPS Only**: All API calls encrypted
- **Rate Limiting**: 60 requests/minute per IP
- **CORS Policy**: Whitelist production domains only

### 7.3 Ethical AI

- **Transparency**: Show how risk scores are calculated
- **No Discrimination**: Model trained on synthetic data (no bias)
- **User Control**: Users can disable AI recommendations
- **Disclaimers**: Clear warnings that AI is advisory only

---

## 📚 8. Technical Dependencies

### 8.1 Backend Requirements

```txt
Flask==3.0.0
flask-cors==4.0.0
joblib==1.3.2
scikit-learn==1.5.2
numpy==1.26.4
python-dotenv==1.0.0
waitress==3.0.0
requests==2.31.0
```

### 8.2 Model Training Requirements

```txt
pandas==2.2.0
matplotlib==3.8.0
seaborn==0.13.0
```

### 8.3 System Requirements

- **Python**: 3.11+
- **Memory**: 512 MB minimum (model loading)
- **CPU**: 1 core (multi-core for parallel inference)
- **Storage**: 10 MB (model + dependencies)

---

## 🎯 9. Future Enhancements

### Phase 1: Q1 2026
- [ ] Add XGBoost model for comparison
- [ ] Implement ensemble voting (RF + XGBoost)
- [ ] Support for compound interest calculations

### Phase 2: Q2 2026
- [ ] Multi-loan portfolio analysis
- [ ] Debt consolidation recommendations
- [ ] Credit score integration

### Phase 3: Q3 2026
- [ ] Real user data integration (with consent)
- [ ] Personalized payment schedules
- [ ] Predictive alerts for payment difficulties

### Phase 4: Q4 2026
- [ ] Mobile app deployment
- [ ] Offline model (TensorFlow Lite)
- [ ] Voice-based loan queries

---

## 📊 10. Success Criteria Checklist

### Model Performance ✅
- [x] Accuracy ≥75% (Achieved: 80.2%)
- [x] Inference <500ms (Achieved: 120ms avg)
- [x] Model size <5MB (Achieved: 3.08 MB)
- [x] Zero critical misclassifications

### Business Impact ✅
- [x] 50 profiles covered
- [x] DTI analysis integrated
- [x] Real-time predictions
- [x] Actionable recommendations

### Technical Excellence ✅
- [x] Production deployed (Render + Vercel)
- [x] Model versioned (v3.1.0)
- [x] API documented
- [x] Error handling robust

### User Experience ✅
- [x] Fast response times
- [x] Clear explanations
- [x] Privacy-respecting
- [x] Multi-language support

---

## 📞 Support & Contact

**Model Version**: v4.1.0  
**Last Updated**: November 26, 2025  
**Model Repository**: https://huggingface.co/Pottersk/financial-calculator-ai-model  
**GitHub**: https://github.com/paripatrod/FinLand  
**Live Demo**: https://financial-calculator-app.vercel.app  

**Maintainer**: YDP Eduvice Fellowship Team  
**License**: MIT  

---

## 📝 Changelog

### v4.1.0 (November 26, 2025)
- 🔒 **Security Features** - Rate limiting, input sanitization, XSS protection
- 🛡️ **Error Boundary** - Global error handling with retry and bilingual UI
- 📴 **Offline Mode** - PWA v3.0 with client-side calculations
- 🖨️ **PDF Export** - Print-friendly payment schedules
- 🎬 **Animated Tutorial** - 4-step onboarding guide
- 🎯 **Model Accuracy** - 89.96% (slight improvement from 89.93%)

### v4.0.0 (November 25, 2025)
- 🚀 **100-Profile System** - Expanded from 50 to 100 profiles
- 🎯 **89.93% Accuracy** - Major improvement from 80.2%
- 🤖 **Model Comparison** - XGBoost vs RandomForest selection
- 📊 **Organized Categories** - 5 clear groups by interest rate
- 🔧 **Automated Training** - 100K samples with noise injection
- 🆕 **HuggingFace Update** - New repository with v4.0.0

### v3.1.0 (November 24, 2025)
- ✨ Added DTI (Debt-to-Income) analysis
- 🎯 Improved accuracy: 78.5% → 80.2%
- ⚡ Reduced model size: 12 MB → 3.08 MB
- 🔧 Optimized hyperparameters (40 trees, depth 12)
- 📊 Enhanced feature engineering (29 features)

### v3.0.0 (November 2025)
- 🚀 Initial production release
- 🤖 Random Forest with 100 estimators
- 📊 50 debt profiles supported
- 🎯 78.5% test accuracy

---

**© 2025 FinLand - AI Model Implementation Plan**
