# 💰 FinLand
## AI-Powered Debt Management & Financial Planning Platform

![Version](https://img.shields.io/badge/version-4.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.13-blue)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![AI Accuracy](https://img.shields.io/badge/AI%20Accuracy-98.80%25-brightgreen)
![Status](https://img.shields.io/badge/status-Production-success)

**แอปคำนวณหนี้ออนไลน์ฟรี 100%** พร้อม AI วิเคราะห์โปรไฟล์หนี้แบบเรียลไทม์  
ระบบ 100 โปรไฟล์ครอบคลุมหนี้ทุกประเภทในประเทศไทย

🌐 **Live Demo**: [financial-calculator-app.vercel.app](https://financial-calculator-app.vercel.app)  
📦 **GitHub**: [github.com/paripatrod/FinLand](https://github.com/paripatrod/FinLand)  
🤖 **AI Model**: [Hugging Face](https://huggingface.co/Pottersk/finland-ai-model)

---

## ✨ Key Features

### 🧮 Financial Calculators

| Feature | Description |
|---------|-------------|
| **บัตรเครดิต** | คำนวณระยะเวลาปิดหนี้พร้อมดอกเบี้ยแบบละเอียด |
| **กยศ./Student Loan** | คำนวณค่างวดรายเดือนทุกประเภทสินเชื่อ |
| **What-If Analysis** | ทดสอบสถานการณ์ "ถ้าจ่ายเพิ่ม" ด้วย Interactive Slider |
| **กราฟ Interactive** | แสดงยอดคงเหลือและดอกเบี้ยแต่ละเดือน |
| **ดาวน์โหลด CSV** | ส่งออกตารางการผ่อนชำระ |

### 🤖 AI-Powered Features

| Feature | Description |
|---------|-------------|
| **AI Profile Detection** | วิเคราะห์โปรไฟล์หนี้ด้วย AI (100 profiles) |
| **AI Chatbot Advisor** | ถามคำถามและเปรียบเทียบสถานการณ์แบบ Real-time |
| **DTI Analysis** | วิเคราะห์ Debt-to-Income Ratio เพื่อประเมินความเสี่ยง |
| **Risk Scoring** | คะแนนความเสี่ยง 0-100 พร้อมคำแนะนำ |

### 📱 Platform Features

| Feature | Description |
|---------|-------------|
| **Multi-language** | รองรับ ไทย, English, 中文, 日本語 |
| **Advanced Theming** | 4 ธีม + Dark Mode |
| **PWA Support** | ติดตั้งเป็นแอพบนมือถือ |
| **Calculation History** | บันทึกประวัติพร้อม Dashboard Analytics |
| **Export/Import** | ส่งออก/นำเข้าข้อมูล JSON |
| **Responsive Design** | ใช้งานได้ทุกอุปกรณ์ |

---

## 🤖 AI Model Specifications (v3.0.0 - Financial Advisor)

### Model Performance

| Metric | Value | Status |
|--------|-------|--------|
| **Algorithm** | RandomForest + MultiOutputRegressor | ✅ |
| **Regression R²** | 98.80% | ✅ Exceeds 95% target |
| **Classification Accuracy** | 96.54% | ✅ Exceeds 90% target |
| **Model Size** | 3.46 MB | ✅ Under 5MB target |
| **Training Samples** | 1,000,000 | ✅ Comprehensive coverage |
| **Predictions** | 21 dimensions | ✅ Full financial analysis |

### Profile Categories (100 Profiles)

| Category | ID Range | Count | Interest Rate | Risk Level |
|----------|----------|-------|---------------|------------|
| **กยศ./กู้การศึกษา** | 0-24 | 25 | 0.1% - 2% | 🟢 Low |
| **สินเชื่อส่วนบุคคล** | 25-54 | 30 | 4% - 15% | 🟡 Medium |
| **บัตรเครดิต** | 55-74 | 20 | 15% - 20% | 🟠 High |
| **หนี้ดอกสูงมาก** | 75-89 | 15 | 20% - 28% | 🔴 Critical |
| **นอกระบบ/วิกฤต** | 90-99 | 10 | >28% | 🔴 Critical |

### Technical Details

- **Features**: 29 engineered features from 3 base inputs
- **Training Data**: 100,000 samples (1,000 per profile)
- **DTI Integration**: Real-time Debt-to-Income analysis
- **Hosting**: 🤗 Hugging Face Public Repository

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.13+ |
| Node.js | 18+ |
| npm | 9+ |

### Backend Setup (Flask + Python)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

> Backend runs at `http://127.0.0.1:5000`

### Frontend Setup (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

> Frontend runs at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/calculate/credit-card` | `{ balance, apr, monthly_payment }` | Credit card calculation |
| `POST` | `/api/calculate/student-loan` | `{ loan_amount, interest_rate, term_months }` | Student loan calculation |
| `POST` | `/api/predict` | `{ loan_amnt, int_rate, term, monthly_payment?, monthly_income? }` | AI prediction with DTI |
| `GET` | `/api/health` | - | Health check with model status |

---

## 🤖 AI Model Setup (Optional)

The AI prediction endpoint (`/api/predict`) is optional. Choose one setup method:

### Option 1: Auto-Download from Hugging Face ⭐ Recommended

Set environment variable in `.env`:

```bash
MODEL_URL=https://huggingface.co/Pottersk/financial-calculator-ai-model/resolve/main/model.pkl
```

> Model auto-downloads on first request (3.23 MB)

### Option 2: Manual Installation

1. Download from [Hugging Face](https://huggingface.co/Pottersk/financial-calculator-ai-model)
2. Place `model.pkl` in `backend/` directory

### Train Your Own Model

```powershell
cd backend
python train_model.py
```

> Generates `model.pkl` (3.23 MB, 89.93% accuracy, 100K samples)

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Flask | 3.0 | Python web framework |
| Flask-CORS | 4.0 | Cross-origin support |
| Flask-Limiter | 3.5 | API rate limiting |
| bleach | 6.1 | Input sanitization (XSS) |
| NumPy | 1.26 | Numerical computing |
| scikit-learn | 1.5 | AI model (RandomForest) |
| joblib | 1.4 | Model serialization |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.0 | Type safety |
| Vite | 5.0 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 11 | Animations |
| Recharts | 2.12 | Charts |
| React Router | 6 | Navigation |

---

## 📁 Project Structure

```
financial-calculator-app/
├── 📂 backend/
│   ├── app.py                        # Flask API with AI + Rate Limiting
│   ├── train_model.py                # Model training script
│   ├── profile_params.py             # 100 profile parameters
│   ├── profile_details.py            # Profile descriptions
│   ├── EDA_Analysis.ipynb            # 📊 Data Analysis Notebook
│   ├── MODEL_IMPLEMENTATION_PLAN.md  # 🤖 AI Architecture Doc
│   ├── requirements.txt              # Python dependencies
│   └── model.pkl                     # AI model (auto-download)
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── CreditCardCalculator.tsx  # Credit card + PDF export
│   │   │   ├── StudentLoanCalculator.tsx # Student loan + PDF export
│   │   │   ├── AIAdvisor.tsx             # AI chatbot
│   │   │   ├── Dashboard.tsx             # Analytics dashboard
│   │   │   ├── ErrorBoundary.tsx         # 🆕 Global error handler
│   │   │   ├── OnboardingTutorial.tsx    # 🆕 Animated tutorial
│   │   │   └── 📂 ui/                    # Reusable components
│   │   ├── 📂 contexts/
│   │   │   ├── ThemeContext.tsx          # 4 themes + Dark mode
│   │   │   └── LanguageContext.tsx       # Multi-language (4 languages)
│   │   ├── 📂 utils/
│   │   │   ├── pdfExport.ts              # 🆕 PDF/Print export
│   │   │   ├── sanitize.ts               # 🆕 XSS protection
│   │   │   └── analytics.ts              # Usage analytics
│   │   ├── App.tsx                       # Router setup
│   │   └── main.tsx                      # Entry point
│   ├── 📂 public/
│   │   └── sw.js                         # 🆕 Service Worker v3.0 (offline)
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── vercel.json                           # Vercel deployment config
└── README.md                             # This file
```

---

## 📊 Deployment Status

| Service | Platform | Status | URL |
|---------|----------|--------|-----|
| **Frontend** | Vercel | 🟢 Live | [financial-calculator-app.vercel.app](https://financial-calculator-app.vercel.app) |
| **Backend API** | Render | 🟢 Live | [finland-backend.onrender.com](https://finland-backend.onrender.com) |
| **AI Model** | Hugging Face | 🟢 Live | [Pottersk/financial-calculator-ai-model](https://huggingface.co/Pottersk/financial-calculator-ai-model) |
| **Repository** | GitHub | 🟢 Active | [paripatrod/FinLand](https://github.com/paripatrod/FinLand) |

---

## 🚀 Recent Updates (v4.1.0) - November 2025

### ✨ Major AI System Redesign

| Update | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Profile System** | 50 profiles | 100 profiles | +100% coverage |
| **Model Accuracy** | 80.2% | 89.96% | +9.76% |
| **Model Size** | ~4 MB | 3.23 MB | -19% smaller |
| **Training Data** | 50K samples | 100K samples | +100% data |
| **Hosting** | Local only | Hugging Face | Cloud deployment |

### 📊 Profile Category System

| Category | ID Range | Interest Rate | Risk Level | Description |
|----------|----------|---------------|------------|-------------|
| **กยศ./กู้การศึกษา** | 0-24 | 0.1-2% | 🟢 Low | Government-subsidized student loans |
| **สินเชื่อส่วนบุคคล** | 25-54 | 4-15% | 🟡 Medium | Bank personal loans |
| **บัตรเครดิต** | 55-74 | 15-20% | 🟠 High | Credit cards with monthly compounding |
| **หนี้ดอกสูงมาก** | 75-89 | 20-28% | 🔴 Critical | High-risk, potentially predatory loans |
| **นอกระบบ/วิกฤต** | 90-99 | >28% | 🔴 Critical | Illegal loan sharks, crisis situations |

### 🔧 Technical Improvements

- ✅ Model training with 100K samples (1,000 per profile)
- ✅ Advanced feature engineering (29 features)
- ✅ Automated model selection (XGBoost vs RandomForest)
- ✅ Compression optimization (level 3)
- ✅ Version tracking in model file
- ✅ Auto-download from Hugging Face

### 🔒 Security & UX (v4.1.0 - November 26, 2025)

| Feature | Description |
|---------|-------------|
| **Error Boundary** | Global error handling with retry + copy error + bilingual UI |
| **Rate Limiting** | Flask-Limiter (30-60 req/min per endpoint) |
| **Input Sanitization** | XSS protection frontend + backend (bleach) |
| **Offline Mode** | PWA v3.0 with client-side calculations |
| **PDF Export** | Print-friendly payment schedules |
| **Animated Tutorial** | 4-step onboarding at `/tutorial` |

---

## ⚙️ Environment Variables

Create `.env` file in `backend/`:

```bash
# Production (Recommended)
MODEL_URL=https://huggingface.co/Pottersk/financial-calculator-ai-model/resolve/main/model.pkl

# Optional
FLASK_ENV=production
PORT=5000
```

---

## 📚 Documentation

### Phase 02: UX/UI Design & EDA ✅

| Document | Location | Description |
|----------|----------|-------------|
| **EDA Analysis** | [`backend/EDA_Analysis.ipynb`](backend/EDA_Analysis.ipynb) | Comprehensive 100-profile data analysis |
| **Model Plan** | [`backend/MODEL_IMPLEMENTATION_PLAN.md`](backend/MODEL_IMPLEMENTATION_PLAN.md) | AI architecture & implementation |

### Phase 03: Implementation ✅

| Component | Technology | Status |
|-----------|------------|--------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + Vite | ✅ Complete |
| **Backend** | Flask 3.0 + Python 3.13 + AI Integration | ✅ Complete |
| **AI Model** | RandomForest (89.93% accuracy, 100 profiles) | ✅ Complete |
| **Deployment** | Vercel + Render + Hugging Face | ✅ Live |

---

## 🗺️ Roadmap

| Priority | Feature | Status |
|----------|---------|--------|
| 🔜 | User authentication (Firebase/Supabase) | Planned |
| 🔜 | Persistent cloud storage | Planned |
| 📋 | Car Loan Calculator | Backlog |
| 📋 | Mortgage Calculator | Backlog |
| 📋 | Mobile app (React Native) | Backlog |
| 📋 | A/B testing for recommendations | Backlog |

---

## 📋 Model Summary

| Specification | Value |
|---------------|-------|
| **Version** | 4.1.0 |
| **Accuracy** | 89.96% |
| **Profiles** | 100 |
| **Model Size** | 3.23 MB |
| **Training Samples** | 100,000 |
| **Algorithm** | RandomForest Classifier |
| **Download** | [huggingface.co/Pottersk/financial-calculator-ai-model](https://huggingface.co/Pottersk/financial-calculator-ai-model) |

---

<div align="center">

**© 2025 YDP Eduvice Fellowship — FinLand**

Made with ❤️ for Thai Financial Literacy

</div>
