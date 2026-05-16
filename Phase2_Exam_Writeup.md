# Phase-2 Demo Writeup — Exam Ready Answers ✍️

> **Project:** AI-Powered Student Performance Tracker  
> **Team:** Madhav P, Amruth Badi, Guruprasad Charati (Group A4)  
> **Guide:** Prof. Soniya Madam

---

## 1. Problem Statement

**Project Title:** AI-Powered Student Performance Tracker

**Explanation:**

Our project is a full-stack web application that uses Artificial Intelligence to **proactively predict** a student's exam score and burnout risk level **before** the exam happens.

Currently, colleges follow a **reactive approach** — teachers and parents find out a student is struggling only **after** the exam results are declared. By that time, it is too late to help the student.

Our system solves this by collecting **14 daily lifestyle and academic habits** from students (like study hours, sleep hours, attendance, screen time, mental health score, caffeine intake, gaming hours, etc.) and feeding them into a **Random Forest Machine Learning model**. The model instantly predicts:

1. **Predicted Exam Score** (0 to 100%)
2. **Risk Level** — Low, Medium, or High

But prediction alone is not enough. Students and teachers need to know **WHY** the AI gave that result. So we integrated **SHAP (SHapley Additive exPlanations)**, an Explainable AI technique. It shows exactly which habit is helping or hurting the score (e.g., "−5% due to low sleep", "+12% due to high study hours").

The system has two portals:
- **Student Portal** → Students log habits, view their AI prediction, and see SHAP explanations.
- **Admin Portal** → Teachers view all students, filter by risk level, upload CSV files for batch predictions, and prepare for counseling.

**In short:** Our project shifts education from *"finding out a student failed after the exam"* to *"detecting the student is at risk weeks before the exam and helping them fix their habits."*

---

## 2. Requirements

### Hardware Requirements

| Component | Specification |
|---|---|
| Processor | Intel Core i3 or higher |
| RAM | 8 GB minimum (16 GB recommended for ML training) |
| Storage | 500 MB for code + 2 GB for dependencies |
| Network | Stable Internet (for cloud database & deployment) |
| Display | 1366×768 minimum resolution |

### Software Requirements

| Software | Version / Details |
|---|---|
| Operating System | Windows 10/11, macOS, or Linux |
| Programming Language (Backend) | Python 3.11+ |
| Programming Language (Frontend) | JavaScript (ES6+) |
| Backend Framework | Django 5.0, Django REST Framework |
| Frontend Framework | React.js 18 (via Vite 5) |
| ML Libraries | Scikit-Learn, Pandas, SHAP, Joblib |
| Database | PostgreSQL (hosted on Supabase) |
| Styling | Tailwind CSS v4, Framer Motion |
| Email Service | Brevo SMTP (for OTP verification) |
| Version Control | Git + GitHub |
| IDE | VS Code |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 3. Project Description — Module-wise Working

Our project has **5 main modules**:

### Module 1: Authentication & Security Module
- Users register by entering their email. The system sends a **6-digit OTP** to their email via Brevo SMTP.
- User must enter correct OTP to verify their account.
- After verification, user can login. The system generates a **JWT (JSON Web Token)** for secure session management.
- Two roles exist: **Student** and **Admin**. Each role sees a different dashboard.
- Password reset is also done via Email OTP.

### Module 2: Student Data Entry Module
- After login, the student fills out a form with **14 habit metrics**:
  - Study Hours, Self-Study Hours, Online Class Hours
  - Attendance Percentage, Class Participation
  - Sleep Hours, Exercise Minutes
  - Social Media Hours, Gaming Hours, Total Screen Time
  - Caffeine Intake, Mental Health Score (1-10)
  - Part-Time Job (Yes/No), Upcoming Deadlines count
- The form has **validation** — for example, sleep hours cannot be negative or more than 24.

### Module 3: Machine Learning Prediction Module (Core AI Engine)
- When the student submits the form, the backend loads two pre-trained **Random Forest** models:
  1. **RandomForestRegressor** → Predicts the exact exam score (0-100%).
  2. **RandomForestClassifier** → Predicts Risk Level (Low / Medium / High).
- The models were trained on a **custom 10,000-record dataset** created by merging two Kaggle datasets.
- The models are stored as `.pkl` files using **Joblib** and loaded instantly — no external API calls needed.

### Module 4: Explainable AI (SHAP) Module
- After prediction, the system runs **SHAP TreeExplainer** on the same input.
- SHAP calculates the **marginal contribution** of every single feature to the final score.
- The result is a list showing: which habit helped the score (+ve impact) and which hurt it (−ve impact).
- Example output: `"sleep_hours: +8.5"` means good sleep added 8.5% to the score. `"gaming_hours: −6.2"` means excessive gaming reduced the score by 6.2%.
- This is displayed on the dashboard as **color-coded bar charts** (green = positive, red = negative).

### Module 5: Admin Command Center Module
- Admins can see a **table of all students** with their predicted scores and risk levels.
- They can **filter by risk level** (e.g., show only "High Risk" students for counseling).
- **Batch CSV Upload**: Admin uploads a `.csv` file with data of 100+ students → the system runs predictions on all of them **instantly** and saves results to the database.
- Admin can also enter the **actual exam score** later to compare with the AI prediction (accuracy tracking).

---

## 4. System Design

### 4.1 Architecture Diagram (3-Tier Decoupled Architecture)

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT TIER                         │
│           (React.js + Vite + Tailwind)               │
│              Deployed on: VERCEL                     │
│                                                     │
│  Pages: Home, Login, Register, Student Dashboard,   │
│         Admin Dashboard, Prediction Form             │
└──────────────────────┬──────────────────────────────┘
                       │  JSON REST API (Axios)
                       │  (JWT Token in Header)
                       ▼
┌─────────────────────────────────────────────────────┐
│                APPLICATION TIER                      │
│        (Django + DRF + ML Models + SHAP)             │
│              Deployed on: RENDER                     │
│                                                     │
│  Apps: core/ (Auth), students/ (Records),            │
│        predictions/ (ML Inference + SHAP)            │
│        ml_models/ (.pkl files)                       │
└──────────────────────┬──────────────────────────────┘
                       │  Django ORM (SQL)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  DATA TIER                           │
│             PostgreSQL Database                      │
│             Hosted on: SUPABASE                      │
│                                                     │
│  Tables: User, StudentRecord, Prediction,            │
│          EmailVerificationOTP, PasswordResetOTP      │
└─────────────────────────────────────────────────────┘
```

### 4.2 Use Case Diagram (Actors & Actions)

```
                    ┌──────────────┐
                    │   Student    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐   ┌──────────────┐  ┌─────────────┐
    │ Register │   │ Submit Habits│  │View Dashboard│
    │ (OTP)    │   │ (14 features)│  │(Score+SHAP) │
    └──────────┘   └──────┬───────┘  └─────────────┘
                          ▼
                   ┌──────────────┐
                   │  ML Engine   │
                   │(RandomForest │
                   │  + SHAP)     │
                   └──────┬───────┘
                          ▼
                   ┌──────────────┐
                   │  Prediction  │
                   │ Score + Risk │
                   │ + SHAP JSON  │
                   └──────────────┘

                    ┌──────────────┐
                    │    Admin     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌──────────┐   ┌──────────────┐  ┌─────────────┐
    │View All  │   │ Upload CSV   │  │ Filter by   │
    │Students  │   │ (Batch AI)   │  │ Risk Level  │
    └──────────┘   └──────────────┘  └─────────────┘
```

### 4.3 ER Diagram (Entity Relationship)

```
┌──────────────┐
│    ADMIN     │
├──────────────┤
│ id (PK)      │
│ username     │
│ email        │
│ password     │
└──────┬───────┘
       │ 1
       │
       │ Manages
       │
       ▼ M
┌──────────────┐        ┌─────────────────┐        ┌──────────────────┐
│   STUDENT    │  1───M │ STUDENT_RECORD  │ 1───1  │   PREDICTION     │
├──────────────┤        ├─────────────────┤        ├──────────────────┤
│ id (PK)      │        │ id (PK)         │        │ id (PK)          │
│ username     │        │ student_id (FK) │        │ record_id (FK)   │
│ email        │        │ study_hours     │        │ predicted_score  │
│ password     │        │ sleep_hours     │        │ risk_level       │
│ is_verified  │        │ attendance_%    │        │ feature_impacts  │
└──────────────┘        │ mental_health   │        │  (JSONB/SHAP)    │
                        │ screen_time     │        │ actual_score     │
                        │ gaming_hours    │        │ created_at       │
                        │ ...14 fields    │        └──────────────────┘
                        │ created_at      │
                        └─────────────────┘

┌────────────────────┐
│  EMAIL_VERIFY_OTP  │
├────────────────────┤
│ id (PK)            │
│ email              │
│ otp (6 digits)     │
│ is_used            │
│ created_at         │
└────────────────────┘
```

### 4.4 Data Flow Diagram (Level 1)

```
Student ──→ [Submit 14 Habits] ──→ Django API ──→ [Random Forest .pkl]
                                                        │
                                                        ▼
                                                  Predicted Score
                                                  Risk Level
                                                        │
                                                        ▼
                                                  [SHAP Explainer]
                                                        │
                                                        ▼
                                                  Feature Impacts JSON
                                                        │
                                                        ▼
                                                  Save to PostgreSQL
                                                        │
                                                        ▼
                                              Return Response to Frontend
                                                        │
                                                        ▼
                                              Dashboard shows Score +
                                              Risk Badge + SHAP Chart
```

---

## 5. Conclusion

The **AI-Powered Student Performance Tracker** successfully demonstrates that Machine Learning can be integrated into education to create a **proactive early-warning system** for struggling students.

Key achievements of this project:

1. We trained **Random Forest ML models** on a custom 10,000-record dataset to predict exam scores and risk levels with high accuracy.
2. We integrated **SHAP Explainable AI** so the system doesn't just predict — it **explains** exactly which habits are helping or hurting the student.
3. We built a **full-stack web application** using React.js (frontend) and Django REST Framework (backend), deployed live on Vercel and Render.
4. The **Admin batch CSV feature** allows teachers to process an entire classroom of students in seconds.
5. The system is **secure** with JWT authentication and Email OTP verification.

**In simple terms:** Instead of finding out a student failed *after* the exam, our system detects the student is at risk *weeks before* the exam and tells them exactly what habits to fix.

**Future Scope:**
- Real-time email/SMS alerts to parents when a student enters "High Risk"
- Mobile app version using React Native
- Integration with college LMS (like Moodle) for automatic data collection

---

> **Live Demo URL:** https://ai-powered-student-performance-tracker.vercel.app  
> **GitHub:** https://github.com/Madhav-P-2005/AI--Powered-Student-Performance-Tracker
