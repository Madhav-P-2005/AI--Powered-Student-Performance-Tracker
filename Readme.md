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

---

## 🚀 Deployment Guide (Render + Vercel)

This project is configured to run the Django backend on **Render**, the Vite/React frontend on **Vercel**, and host the PostgreSQL database on **Supabase**.

### Phase 1: Deploy Backend on Render

1. Go to [Render](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Language**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `sh build.sh` *(This script runs `pip install`, `collectstatic`, and `migrate`)*
   - **Start Command**: `gunicorn config.wsgi:application`
4. Add the following **Environment Variables**:
   - `PYTHON_VERSION`: `3.13.0`
   - `DEBUG`: `False` *(Crucial for production security)*
   - `ALLOWED_HOSTS`: `your-service-name.onrender.com` *(Must perfectly match the exact URL Render assigns your service!)*
   - `SECRET_KEY`: *(Your Django secret key)*
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: *(Your Supabase credentials)*
   - `BREVO_SMTP_KEY`, `BREVO_SMTP_LOGIN`, `BREVO_SENDER_EMAIL`: *(Your Brevo credentials)*
5. Click **Deploy**. Once live, copy your backend URL (e.g., `https://my-backend.onrender.com`).

### Phase 2: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com) and click **Import Project**.
2. Connect your GitHub repository and configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click Edit next to Root Directory)
3. Add the following **Environment Variable**:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api/v1` *(Point this perfectly to your newly created Render API)*
4. Click **Deploy**. Once built, copy your live frontend URL (e.g., `https://my-frontend.vercel.app`).

### Phase 3: Final CORS Wiring (Critical)

1. Go back to your Render Dashboard → Environment Variables.
2. Add one final variable to tell Django it's allowed to talk to Vercel:
   - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-url.vercel.app`
3. Save changes. Render will automatically restart. Your full-stack app is now securely communicating!

### 📝 Final Steps to reach 100 Pages in MS Word:

1. Copy the entire markdown file and paste it into MS Word.
2. Set the font to  **Times New Roman** , size  **12** , with  **1.5 or Double Spacing** .
3. **CRITICAL** : The text I wrote gives you a massive foundation, but to hit 100 pages, you *must* do what all college reports do:

* **Insert all your diagrams** (UML, Use Case) taking up a full page each.
* **Insert screenshots** of every single page of your website (Home, Login, Student Dashboard, Admin Dashboard, CSV Upload) in Section 7.
* **Paste your raw code** : Under Section 6, paste the full code of your `views.py`, `models.py`, `Home.jsx`, and `App.jsx`. Code takes up dozens of pages very quickly!
