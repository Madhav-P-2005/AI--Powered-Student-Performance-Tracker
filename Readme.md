# AI-Powered Student Performance Tracker

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Brevo](https://img.shields.io/badge/brevo-%230092FF.svg?style=for-the-badge&logo=brevo&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

An advanced full-stack web application designed to proactively predict student academic performance and burnout risk using Machine Learning (Random Forest) and Explainable AI (SHAP). 

This project aims to move away from reactive grading (finding out a student failed *after* the midterm) to proactive intervention (detecting poor lifestyle/study habits weeks beforehand).

## 🚀 Features

### Student Portal
- **Intelligent Dashboard**: View your predicted exam scores and current Risk Level (Low/Medium/High).
- **Explainable AI (SHAP)**: See exactly *why* you got your score. The AI breaks down the positive and negative impacts of your habits (e.g., "-5% due to low sleep", "+12% due to high study hours").
- **Automated Alerts**: Receive dynamic warnings for high screen time, low mental health, or declining performance trends.
- **Secure Authentication**: JWT-based login and Email OTP-verified registration.

### Admin Command Center
- **System-Wide Analytics**: Track total students, average predicted scores, and risk distributions.
- **Individual Monitoring**: View personalized student habits and SHAP breakdowns to provide actionable counseling.
- **Batch CSV Predictions**: Upload an entire classroom's data in CSV format to run predictions on hundreds of students instantly.

## 💻 Tech Stack

- **Frontend Core**: React.js (Vite), React Router DOM
- **Backend Core**: Python, Django, Django REST Framework (DRF)
- **Machine Learning**: Scikit-Learn (Random Forest), Pandas, SHAP, Joblib
- **Database**: PostgreSQL (Supabase)
- **Email/Auth Service**: Brevo SMTP
- **Styling & UI**: Tailwind CSS (v4), Framer Motion (Animations)
- **Deployment**: Vercel (Frontend Hosting) & Render (Backend API Hosting)

---

## 🛠️ Project Setup & Installation Guide

As an aspiring Django/React developer, follow these steps to securely set up the environment from scratch.

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### 2. Backend Setup (Django & ML)
Navigate to the `backend` directory and set up your virtual environment. Virtual environments prevent package conflicts between different Python projects.

```bash
cd backend
python -m venv MyEnvironment

# Activate the environment (Windows PowerShell)
.\MyEnvironment\Scripts\Activate.ps1

# Activate the environment (Mac/Linux)
source MyEnvironment/bin/activate
```

Install the required Python dependencies:
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv psycopg2-binary
pip install pandas scikit-learn joblib shap
```

Run database migrations to build your tables, and create an admin account:
```bash
python manage.py makemigrations core students predictions
python manage.py migrate
python manage.py createsuperuser
```

Start the Django development server:
```bash
python manage.py runserver
```

### 3. Frontend Setup (React & Tailwind)
Open a new terminal, navigate to the `frontend` directory, and install the Node modules.

```bash
cd frontend
npm install
```
*(Note: If setting up from absolute scratch in the future, the base UI packages were: `npm install react-router-dom framer-motion react-hook-form axios react-icons react-toastify`)*

Start the Vite development server:
```bash
npm run dev
```

---

## 🧠 Machine Learning Architecture

The AI engine runs natively within the Django backend, requiring no external paid APIs (like OpenAI).

1. **The Model**: 
   We trained two models: a `RandomForestRegressor` (predicts the exact score 0-100) and a `RandomForestClassifier` (predicts Risk Level). The models were trained by combining two major Kaggle datasets:
   - [**Student Performance Dataset**](https://www.kaggle.com/datasets/nabeelqureshitiii/student-performance-dataset) (Academic Metrics: study hours, attendance, etc.)
   - [**Ultimate Student Productivity Dataset**](https://www.kaggle.com/datasets/sampathvinayakbablu/ultimate-student-productivity-dataset) (Lifestyle Metrics: sleep, social media, mental health)
2. **Inference**:
   The `.pkl` model files limit memory footprint. The `predict_student()` function handles scaling and prediction instantly via `joblib`.
3. **SHAP (SHapley Additive exPlanations)**:
   This cooperative game theory algorithm prevents the AI from being a "Black Box". It mathematically computes the marginal contribution of every single feature to the final prediction, passing that data to the frontend for UI rendering.

---

## 📁 Core Folder Structure

```text
Project Root/
├── backend/
│   ├── manage.py
│   ├── config/           ← Main Django settings & URL routing
│   ├── core/             ← Custom User model & Auth Logic (JWT/OTP)
│   ├── students/         ← Student profiles & habit records
│   ├── predictions/      ← ML inference views, SHAP logic, and alert triggers
│   ├── ml_models/        ← Serialized .pkl models and prediction helpers
│   └── scripts/          ← Dataset CSVs and model training scripts (train_model.py)
│
├── frontend/
│   ├── index.html        ← Vite entry point
│   ├── src/
│   │   ├── components/   ← UI components (Navbar, RiskBadge, Spinners)
│   │   ├── context/      ← React Context (AuthContext, ThemeContext)
│   │   ├── pages/        ← Route views (Dashboard, Submit Form, Login)
│   │   ├── services/     ← Axios endpoints (authService, predictionService)
│   │   └── index.css     ← Tailwind directives
```

## 🤝 Next Steps for Future Development
- Integrate email notifications using Celery/Redis for background task processing.
- Deploy the Django backend to Render/Railway and the React frontend to Vercel/Netlify.
- Integrate real-time websockets (Django Channels) for instant Admin Dashboard updates.