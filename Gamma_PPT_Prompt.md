# Gamma PPT Prompt — Phase-2 Demo Presentation

> **Instructions:** Go to [gamma.app](https://gamma.app) → Click "Create New" → Choose "Presentation" → Paste the entire prompt below → Generate.

---

## PROMPT (copy everything below this line):

Create a professional 10-slide academic project presentation for a Phase-2 Demo / IA review with a modern dark tech theme. The project is titled:

**"AI-Powered Student Performance Tracker"**

Subtitle: "Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)"

Team: Madhav P (223204), Amruth Badi (223183), Guruprasad Charati (223196) — Group A4
Guide: Prof. Soniya G.
Institution: K.L.E. Society's P.C. Jabin Science College (Autonomous), Hubballi
Program: Bachelor of Computer Application (BCA), 2025-2026

---

**Slide 1 — Title Slide**
Project Title: "AI-Powered Student Performance Tracker"
Subtitle: "Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)"
Team Members: Madhav P (223204), Amruth Badi (223183), Guruprasad Charati (223196)
Group: A4 | Guide: Prof. Soniya G.
Institution: K.L.E. Society's P.C. Jabin Science College (Autonomous), Hubballi
Program: BCA, Academic Year 2025-2026

---

**Slide 2 — Problem Statement**
Project Title: AI-Powered Student Performance Tracker

What is this project about?
- Traditional education systems are REACTIVE — they detect student failure only AFTER exams are over
- There is no holistic monitoring of daily lifestyle factors like sleep, mental health, screen time, gaming, caffeine intake, or exercise
- High dropout rates and academic burnout go undetected until it is too late
- Teachers and parents have zero visibility into student habits during the semester

Our Solution:
A full-stack AI-powered web application that PREDICTS exam scores BEFORE exams using 14 lifestyle and academic features, classifies students into Low / Medium / High risk categories, and EXPLAINS why using Explainable AI (SHAP values) — enabling early intervention weeks before exams.

Live Deployed URL: https://ai-powered-student-performance-tracker.vercel.app

---

**Slide 3 — Hardware Requirements**
Development Machine:
- Processor: Intel Core i7 / AMD Ryzen 7 or equivalent
- RAM: 16 GB DDR4
- Storage: 512 GB SSD
- Network: Wi-Fi / Ethernet for cloud database connectivity

Production / Cloud Servers:
- Backend Server: Render (Free Tier) — Shared CPU, 512 MB RAM, Ubuntu Linux container
- Frontend Hosting: Vercel CDN — Global edge network with automatic SSL/TLS
- Database Server: Supabase Cloud — PostgreSQL 15 with PgBouncer connection pooling
- Email Gateway: Brevo SMTP Server — TLS encrypted OTP delivery on Port 587

---

**Slide 4 — Software Requirements**
Languages & Runtimes:
- Python 3.11 (Backend API + Machine Learning)
- JavaScript ES6+ / Node.js v20 LTS (Frontend)

Frameworks & Libraries:
- Django 5.0 + Django REST Framework (Backend REST API)
- React 18 + Vite (Frontend Single Page Application)
- Tailwind CSS v4 (UI Styling)
- Scikit-Learn (Random Forest ML Models)
- SHAP (Explainable AI — SHapley Additive exPlanations)
- Pandas, NumPy (Data Processing)
- Recharts (Interactive Data Visualization Charts)

Database & Tools:
- PostgreSQL on Supabase (Cloud Relational Database)
- JWT Authentication (SimpleJWT — Access + Refresh Tokens)
- Brevo SMTP (Email OTP Verification)
- Git + GitHub (Version Control)
- VS Code, Postman (Development & API Testing)

---

**Slide 5 — Project Description: Module 1 — Authentication & Security**
Module 1: User Authentication & Role-Based Access Control

- Two user roles: Student and Admin with separate dashboards
- Registration requires email verification via 6-digit OTP sent through Brevo SMTP
- Passwords are securely hashed using PBKDF2 + SHA-256 algorithm
- Login issues JWT tokens: Access Token (30 min) + Refresh Token (7 days) for stateless sessions
- Password Reset flow with OTP-based verification
- CORS security restricts API access to whitelisted frontend domains only
- Students can only access their own records; Admins can view all students

---

**Slide 6 — Project Description: Module 2 — ML Prediction Engine**
Module 2: Machine Learning Prediction & Explainable AI Pipeline

Student submits 14 lifestyle features through a form:
study_hours, self_study_hours, online_class_hours, attendance_percentage, class_participation, social_media_hours, gaming_hours, total_screen_time, sleep_hours, exercise_minutes, caffeine_intake, mental_health_score, part_time_job, upcoming_deadlines

ML Pipeline:
1. Random Forest Regressor predicts exam score (0-100)
2. Random Forest Classifier predicts risk level (Low / Medium / High)
3. SHAP TreeExplainer calculates Shapley Values for each feature — shows exactly WHY a student scored high or low (e.g., "-5.2 points due to low sleep", "+8.1 points due to high study hours")
4. Lazy Loading optimization: SHAP explainer initializes on first request, not on server boot — prevents Render 512MB RAM server crashes
5. Gini Importance Fallback: If SHAP fails due to memory limits, a mathematical fallback using Random Forest feature importances provides instant approximate attributions

---

**Slide 7 — Project Description: Module 3 — Dashboards & Admin**
Module 3: Student Dashboard + Admin Command Center

Student Dashboard:
- Predicted score displayed in animated circular gauge
- SHAP feature attribution horizontal bar chart (green = positive impact, red = negative impact)
- Historical trend line chart showing score trajectory over time
- Personalized risk alerts (High Risk warning, Low Sleep alert, High Screen Time alert, Declining Performance alert)
- Improvement tracking: "Your score improved by +7.0 points since first submission"

Admin Command Center:
- View all registered students with their latest predictions and risk levels
- Searchable, paginated student table
- Risk distribution doughnut chart and score histogram
- Bulk CSV Upload: Admin uploads a .csv file with multiple student records → instant batch predictions
- Accuracy audit: Admin enters actual exam scores to compare predicted vs actual (MAE tracking)

---

**Slide 8 — System Design: Architecture Diagram**
Show a 3-Tier System Architecture Diagram:

Tier 1 — Frontend (Client Layer):
React.js SPA + Vite Build + Tailwind CSS + Recharts → Deployed on Vercel Global CDN

Tier 2 — Backend (Application Layer):
Django REST Framework + JWT Auth + Scikit-Learn Random Forest + SHAP Explainer → Deployed on Render

Tier 3 — Data Layer:
Supabase Cloud PostgreSQL Database (5 tables: User, StudentRecord, Prediction, EmailVerificationOTP, PasswordResetOTP) + Brevo SMTP Email Gateway

Communication: HTTPS RESTful JSON API with CORS whitelisting

Also show ER Diagram relationships:
- User (1) → (many) StudentRecord
- StudentRecord (1) → (1) Prediction (OneToOne)
- User (1) → (many) PasswordResetOTP

---

**Slide 9 — System Design: UML Diagrams**
Show the following diagrams for the project:

Use Case Diagram:
- Student Actor: Register → Verify OTP → Login → Submit Lifestyle Data → View Prediction → View SHAP Explanations → View Trend History → Receive Alerts
- Admin Actor: Login → View All Students → Search Students → Upload CSV → Run Batch Predictions → Enter Actual Scores → View Accuracy Analytics

Class Diagram (5 Django ORM Models):
- User class (extends AbstractUser): id, username, email, password, role, phone, is_email_verified
- StudentRecord class: id, user(FK), study_hours, self_study_hours, ... 14 features, created_at
- Prediction class: id, student_record(OneToOne), predicted_score, risk_level, actual_score, feature_explanations(JSON), created_at
- EmailVerificationOTP class: id, email, otp, created_at, is_used
- PasswordResetOTP class: id, user(FK), otp, created_at, is_used

---

**Slide 10 — Conclusion**
- Successfully built and deployed a full-stack AI-powered web application that predicts student exam performance using Random Forest and explains predictions using SHAP Explainable AI
- The system shifts education from REACTIVE grading to PROACTIVE early intervention
- Students get personalized, mathematically justified recommendations to improve their lifestyle habits
- Admins can identify at-risk students weeks before exams and process hundreds of students via CSV upload
- The project demonstrates real-world deployment on cloud infrastructure (Vercel + Render + Supabase) at zero cost
- SHAP explanations bridge the gap between black-box AI predictions and human understanding, building trust in AI-assisted academic counseling

Future Scope:
- Integration with LMS platforms (Canvas, Moodle) for automatic attendance data
- Wearable device APIs (Fitbit, Apple Health) for real-time sleep and exercise tracking
- SHAP Interaction Values to show combined feature effects

Research Paper: "Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)"
