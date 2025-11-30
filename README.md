# FinLand

**AI-Powered Financial Calculator & Debt Management Platform**

![Version](https://img.shields.io/badge/version-5.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.13-blue)
![React](https://img.shields.io/badge/react-18-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![AI Accuracy](https://img.shields.io/badge/AI%20R²-98.80%25-brightgreen)
![Status](https://img.shields.io/badge/status-Production-success)

A comprehensive financial planning application with AI-powered analysis. Calculate credit card payoff, student loans, and receive personalized financial advice based on 21-dimensional analysis trained on 1 million samples.

**Live Demo**: [finland.vercel.app](https://finland.vercel.app)

---

## Problem Statement

Thailand faces a growing debt crisis:
- **91.4%** of Thai population has debt (Bank of Thailand, 2024)
- **3.9 million** student loan borrowers (กยศ.)
- Average household debt: **฿500,000+**
- Lack of accessible financial planning tools in Thai language

Most financial tools are complex, English-only, or require paid subscriptions.

---

## Solution

**FinLand** provides free, AI-powered financial planning:
- Simple debt payoff calculators in Thai
- AI analysis trained on 1 million Thai financial scenarios
- Personalized recommendations based on local context
- Accessible on any device (PWA support)

---

## Target Users

| Segment | Description | Pain Point |
|---------|-------------|------------|
| **Working Professionals** | Age 25-45, credit card debt | High interest, unclear payoff timeline |
| **Student Loan Borrowers** | กยศ./กรอ. graduates | Complex repayment terms |
| **First-time Investors** | Want to start investing | Don't know if they're debt-free ready |
| **Financial Advisors** | Need quick analysis tools | Time-consuming manual calculations |

---

## Features

### Financial Calculators
- **Credit Card Calculator** - Calculate payoff timeline with detailed interest breakdown
- **Student Loan Calculator** - Monthly payment calculation for all loan types (including Thai Student Loan Fund)
- **What-If Analysis** - Interactive slider to simulate different payment scenarios
- **Visualization** - Charts showing balance and interest over time
- **Export** - Download payment schedules as CSV

### AI Financial Advisor v4.0
- **21-Dimension Analysis** - Comprehensive financial health assessment
- **Health Score** - Financial wellness rating (0-100)
- **Smart Payment Recommendations** - Optimal payment suggestions
- **Risk Assessment** - DTI ratio and stress index analysis
- **Strategy Recommendations** - Personalized debt payoff strategies
- **AI Chat** - Real-time financial Q&A powered by Gemini

### Platform
- **Multi-language** - Thai, English, Chinese, Japanese
- **Dark Mode** - Multiple theme options
- **PWA** - Installable as mobile app
- **Responsive** - Works on all devices
- **Offline Support** - Basic calculations work offline
- **Accessibility** - ARIA labels and screen reader support

---

## AI Model Performance

| Metric | Value |
|--------|-------|
| Algorithm | RandomForest + MultiOutputRegressor |
| Regression R² | 98.80% |
| Classification Accuracy | 96.54% |
| Training Samples | 1,000,000 |
| Model Size | 3.46 MB |
| Predictions | 21 dimensions |

### Analysis Categories

| Category | Predictions |
|----------|-------------|
| Debt Analysis | Payoff timeline, smart payment boost, savings potential |
| Financial Health | Health score, stress index, stability score |
| Planning | Emergency fund needs, savings rate, investment readiness |
| Strategy | Payoff method, priority actions, urgency level |

### Strategy Types

| Strategy | Description |
|----------|-------------|
| Standard | Regular payments |
| Accelerated | Fast-track debt payoff |
| Avalanche | Pay highest interest first |
| Snowball | Pay smallest balance first |
| Consolidate | Combine debts |
| Crisis | Seek immediate assistance |

---

## Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm 9+

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend runs at `http://127.0.0.1:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/calculate/credit-card` | Credit card payoff calculation |
| POST | `/api/calculate/student-loan` | Student loan calculation |
| POST | `/api/ai-analyze` | AI financial analysis (21 dimensions) |
| POST | `/api/ai-chat` | AI chatbot with financial insights |
| GET | `/api/health` | Service health check |

### Example Request

```json
POST /api/ai-analyze
{
  "loan_amount": 100000,
  "interest_rate": 18,
  "term_months": 48,
  "monthly_income": 35000,
  "monthly_payment": 6000,
  "age": 30
}
```

### Example Response

```json
{
  "success": true,
  "version": "4.0.0",
  "financial_health": {
    "health_score": 65,
    "debt_stress_index": 44,
    "stability_score": 68
  },
  "debt_analysis": {
    "debt_freedom_months": 49,
    "smart_payment_boost": 9200,
    "time_saved_months": 30,
    "money_saved_total": 38000
  },
  "strategy": {
    "payoff_strategy": "Avalanche",
    "primary_action": "Reduce interest rate",
    "urgency_level": "High"
  }
}
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Flask 3.0 | Web framework |
| scikit-learn 1.5 | AI model (RandomForest) |
| Flask-CORS | Cross-origin support |
| Flask-Limiter | Rate limiting |
| Google Generative AI | Chatbot (Gemini) |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript 5.0 | Type safety |
| Vite 5.0 | Build tool |
| Tailwind CSS 3.4 | Styling |
| Recharts | Data visualization |
| React Router 6 | Navigation |

---

## Project Structure

```
FinLand/
├── backend/
│   ├── app.py                    # Flask API server
│   ├── train_model.py            # Model training script
│   ├── requirements.txt          # Python dependencies
│   └── runtime.txt               # Python version
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── contexts/             # Theme & Language providers
│   │   ├── types/                # TypeScript definitions
│   │   ├── utils/                # API & storage utilities
│   │   └── test/                 # Test setup
│   ├── public/                   # Static assets & PWA
│   └── package.json
│
├── vercel.json                   # Deployment config
└── README.md
```

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [finland.vercel.app](https://finland.vercel.app) |
| Backend | Render | finland-ilb5.onrender.com |
| AI Model | Hugging Face | [Pottersk/finland-ai-model](https://huggingface.co/Pottersk/finland-ai-model) |

---

## Environment Variables

### Backend
```bash
MODEL_URL=https://huggingface.co/Pottersk/finland-ai-model/resolve/main/financial_advisor_model.pkl
GEMINI_API_KEY=your-api-key  # Optional: for AI chat
```

### Frontend
```bash
VITE_API_URL=https://finland-ilb5.onrender.com
```

---

## Testing

```bash
cd frontend
npm test           # Run tests
npm run test:ui    # Run with UI
npm run coverage   # Generate coverage report
```

Current coverage: 32 tests passing

---

## Changelog

### v5.1.0 (November 2025)
- Complete i18n support (TH/EN/ZH/JA)
- Security improvements (CORS, CSP headers)
- Accessibility enhancements (ARIA labels)
- TypeScript strict typing
- Test coverage improvements
- PWA icon updates
- SEO optimization (sitemap, robots.txt)

### v5.0.0
- AI Financial Advisor v4.0 with 21-dimension analysis
- 1M training samples
- What-If analysis integration
- AI chatbot with Gemini

---

## Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| **v5.2** | Dec 2025 | Bank connection API, expense tracking |
| **v5.3** | Q1 2026 | Investment portfolio analysis |
| **v6.0** | Q2 2026 | Mobile app (React Native) |
| **Future** | 2026+ | Multi-debt management, family finance |

---

## Security

- CORS restricted to specific origins
- Content Security Policy headers
- Rate limiting on API endpoints
- Input sanitization
- No sensitive data stored

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## Acknowledgments

- **YDP Eduvice Fellowship** - Project sponsorship
- **Bank of Thailand** - Financial literacy resources
- **Thai Student Loan Fund (กยศ.)** - Loan calculation references

---

**© 2025 YDP Eduvice Fellowship**
