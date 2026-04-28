# ZenPayroll AI - Production-Ready Payroll System

ZenPayroll AI is an intelligent payroll management system built for HR professionals. It leverages the Google Gemini API to provide smart insights, natural language queries, and automated salary processing.

## 🚀 Features
- **Smart Assistant**: Chat with your payroll data using natural language.
- **Dynamic Dashboard**: Real-time stats on payroll costs and employee distributions.
- **Employee Management**: Comprehensive directory with detailed salary structures.
- **Automated Engine**: Monthly salary computation with tax and deduction logic.
- **AI Insights**: Automated anomaly detection and cost optimization suggestions.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express, Firebase (Auth & Firestore).
- **AI**: Google AI Studio (Gemini-3-Flash).
- **Deployment**: Docker, GitHub Actions.

## 📦 Setup & Installation
1. **Clone the repository.**
2. **Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   JWT_SECRET="your_jwt_secret"
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Development Mode**:
   ```bash
   npm run dev
   ```

## 🐳 Docker Setup
```bash
docker-compose up --build
```

## 🔐 Security
- Secure JWT-based authentication.
- Server-side Gemini API integration to protect secrets.
- Firestore security rules for role-based access.

