# 💰 FinLand
## AI-Powered Debt Management & Financial Planning Platform

![Version](https://img.shields.io/badge/version-5.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.14-blue)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![AI R²](https://img.shields.io/badge/AI%20R²-98.80%25-brightgreen)
![Training](https://img.shields.io/badge/Training-1M%20samples-orange)
![Status](https://img.shields.io/badge/status-Production-success)

**แอปคำนวณหนี้ออนไลน์ฟรี 100%** พร้อม AI Financial Advisor วิเคราะห์การเงิน 21 มิติ  
Train ด้วย 1 ล้าน samples ครอบคลุมทุกสถานการณ์การเงินในประเทศไทย

🌐 **Live Demo**: [financial-calculator-app.vercel.app](https://financial-calculator-app.vercel.app)  
📦 **GitHub**: [github.com/paripatrod/FinLand](https://github.com/paripatrod/FinLand)  
🤖 **AI Model**: [Hugging Face - Pottersk/finland-ai-model](https://huggingface.co/Pottersk/finland-ai-model)

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

### 🤖 AI Financial Advisor v3.0 (NEW!)

| Feature | Description |
|---------|-------------|
| **21 มิติการวิเคราะห์** | ครอบคลุมทุกแง่มุมสถานะการเงิน |
| **AI Chatbot** | ถามคำถามและรับคำแนะนำแบบ Real-time |
| **Health Score** | คะแนนสุขภาพการเงิน 0-100 |
| **Stress Index** | ดัชนีความเครียดจากหนี้ |
| **Smart Payment** | แนะนำจำนวนเงินที่ควรจ่ายเพิ่ม |
| **Payoff Strategy** | กลยุทธ์ปิดหนี้ที่เหมาะสม |

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

## 🧠 AI Financial Advisor v3.0

### Model Performance

| Metric | Value | Status |
|--------|-------|--------|
| **Algorithm** | RandomForest + MultiOutputRegressor | ✅ |
| **Regression R²** | 98.80% | ✅ Exceeds 95% target |
| **Classification Accuracy** | 96.54% | ✅ Exceeds 90% target |
| **Model Size** | 3.46 MB | ✅ Under 5MB target |
| **Training Samples** | 1,000,000 | ✅ Comprehensive coverage |
| **Predictions** | 21 dimensions | ✅ Full financial analysis |

### 🔮 21 Predictions (AI วิเคราะห์)

| กลุ่ม | Predictions | รายละเอียด |
|-------|-------------|------------|
| **【A】หนี้** | 5 | ปลดหนี้กี่เดือน, จ่ายเพิ่มเท่าไร, เวลา/เงินประหยัด, ภาระดอกเบี้ย |
| **【B】สุขภาพ** | 4 | คะแนนสุขภาพ, เครียด, มั่นคง, ศักยภาพสร้างความมั่งคั่ง |
| **【C】แผน** | 4 | เงินสำรอง, ออมเงิน, พร้อมลงทุน, เกษียณ |
| **【D】เปรียบเทียบ** | 2 | Percentile, ดีกว่าค่าเฉลี่ย |
| **【E】ผลกระทบ** | 2 | เครดิตสกอร์, คุณภาพชีวิต |
| **【F】กลยุทธ์** | 4 | วิธีปิดหนี้, ทำก่อน, ความเร่งด่วน, ต้องการช่วยเหลือ |

### Strategy Labels

| Code | กลยุทธ์ | คำอธิบาย |
|------|---------|----------|
| 0 | Standard | จ่ายตามปกติ |
| 1 | Accelerated | เร่งปิดหนี้ |
| 2 | Avalanche | จ่ายดอกสูงก่อน |
| 3 | Snowball | จ่ายยอดน้อยก่อน |
| 4 | Consolidate | รวมหนี้ |
| 5 | Crisis | ขอความช่วยเหลือด่วน |

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

> Frontend runs at `http://localhost:5173`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/calculate/credit-card` | Credit card calculation |
| `POST` | `/api/calculate/student-loan` | Student loan calculation |
| `POST` | `/api/predict` | Legacy AI prediction |
| `POST` | `/api/ai-analyze` | 🆕 AI Financial Advisor (21 predictions) |
| `POST` | `/api/ai-chat` | 🆕 AI Chatbot with insights |
| `GET` | `/api/health` | Health check with model status |

### AI Analyze Request

```json
{
  "loan_amount": 100000,
  "interest_rate": 18,
  "term_months": 48,
  "monthly_income": 35000,
  "monthly_payment": 6000,
  "age": 30
}
```

### AI Analyze Response

```json
{
  "success": true,
  "version": "3.0.0",
  "training_samples": 850000,
  "debt_analysis": {
    "debt_freedom_months": 49,
    "smart_payment_boost": 9200,
    "time_saved_months": 30,
    "money_saved_total": 38000,
    "interest_burden_ratio": 45
  },
  "financial_health": {
    "health_score": 65,
    "debt_stress_index": 44,
    "stability_score": 68,
    "wealth_potential": 61
  },
  "strategy": {
    "payoff_strategy": "Avalanche - จ่ายดอกสูงก่อน",
    "primary_action": "📉 ลดดอกเบี้ย",
    "urgency_level": "🔴 ด่วนมาก"
  }
}
```

---

## 🤖 AI Model Setup

### Auto-Download from Hugging Face ⭐ Recommended

Set environment variable:

```bash
MODEL_URL=https://huggingface.co/Pottersk/finland-ai-model/resolve/main/financial_advisor_model.pkl
```

> Model auto-downloads on first request (3.46 MB)

### Train Your Own Model

```powershell
cd backend
python train_financial_advisor.py
```

> Generates `financial_advisor_model.pkl` (3.46 MB, 98.80% R², 1M samples)

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Flask | 3.0 | Python web framework |
| Flask-CORS | 4.0 | Cross-origin support |
| Flask-Limiter | 3.5 | API rate limiting |
| scikit-learn | 1.5 | AI model (RandomForest + MultiOutput) |
| NumPy | 1.26 | Numerical computing |
| joblib | 1.3 | Model serialization |
| google-generativeai | 0.8 | AI Chatbot (Gemini) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.0 | Type safety |
| Vite | 5.0 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| Framer Motion | 12 | Animations |
| Recharts | 3.5 | Charts |
| React Router | 6 | Navigation |

---

## 📁 Project Structure

```
FinLand/
├── 📂 backend/
│   ├── app.py                         # Flask API + AI Advisor
│   ├── profile_details.py             # Profile descriptions
│   ├── train_financial_advisor.py     # 🆕 Model training (1M samples)
│   ├── requirements.txt               # Python dependencies
│   └── runtime.txt                    # Python version
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── CreditCardCalculator.tsx  # + AI Analysis
│   │   │   ├── StudentLoanCalculator.tsx # + AI Analysis
│   │   │   ├── AIAdvisor.tsx             # AI chatbot
│   │   │   ├── Dashboard.tsx             # Analytics
│   │   │   └── 📂 ui/                    # UI components
│   │   ├── 📂 contexts/
│   │   │   ├── ThemeContext.tsx          # 4 themes
│   │   │   └── LanguageContext.tsx       # 4 languages
│   │   └── 📂 utils/
│   │       ├── api.ts                    # API client
│   │       └── storage.ts                # Local storage
│   └── package.json
│
├── vercel.json                           # Vercel config
└── README.md
```

---

## 📊 Deployment Status

| Service | Platform | Status | URL |
|---------|----------|--------|-----|
| **Frontend** | Vercel | 🟢 Live | [financial-calculator-app.vercel.app](https://financial-calculator-app.vercel.app) |
| **Backend API** | Render | 🟢 Live | [finland-backend.onrender.com](https://finland-backend.onrender.com) |
| **AI Model** | Hugging Face | 🟢 Live | [Pottersk/finland-ai-model](https://huggingface.co/Pottersk/finland-ai-model) |

---

## 🚀 Latest Updates (v5.0.0) - November 2025

### 🧠 AI Financial Advisor v3.0

| Update | Before | After |
|--------|--------|-------|
| **Training Samples** | 100K | **1,000,000** |
| **Predictions** | 1 (profile) | **21 dimensions** |
| **Regression R²** | N/A | **98.80%** |
| **Classification** | 89.96% | **96.54%** |
| **Model Size** | 3.23 MB | **3.46 MB** |
| **Features** | 29 | **30** |

### 🔮 New AI Capabilities

- ✅ Debt freedom timeline prediction
- ✅ Smart payment boost recommendation  
- ✅ Financial health score (0-100)
- ✅ Debt stress index
- ✅ Investment readiness score
- ✅ Retirement gap analysis
- ✅ Percentile ranking
- ✅ Payoff strategy recommendation
- ✅ Urgency level assessment
- ✅ AI-powered chatbot with insights

---

## ⚙️ Environment Variables

### Backend (.env)

```bash
# Required
MODEL_URL=https://huggingface.co/Pottersk/finland-ai-model/resolve/main/financial_advisor_model.pkl

# Optional
FLASK_ENV=production
GEMINI_API_KEY=your-gemini-api-key  # For AI Chat
```

---

## 📋 Model Summary

| Specification | Value |
|---------------|-------|
| **Version** | 3.0.0 |
| **Regression R²** | 98.80% |
| **Classification** | 96.54% |
| **Model Size** | 3.46 MB |
| **Training Samples** | 1,000,000 |
| **Algorithm** | RandomForest + MultiOutputRegressor |
| **Predictions** | 21 dimensions |
| **Download** | [huggingface.co/Pottersk/finland-ai-model](https://huggingface.co/Pottersk/finland-ai-model) |

---

<div align="center">

**© 2025 YDP Eduvice Fellowship — FinLand**

Made with ❤️ for Thai Financial Literacy

</div>
