# Gamma PPT Prompt — Copy & Paste This Into gamma.app

> **Instructions:** Go to [gamma.app](https://gamma.app) → Click "Create New" → Choose "Presentation" → Paste the entire prompt below → Generate.

---

## PROMPT (copy everything below this line):

Create a professional 10-slide academic presentation for a college project review with a modern dark tech theme. The project is titled:

**"AI-Powered Student Performance Tracker — Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)"**

Team: Madhav P, Amruth Badi, Guruprasad Charati (Group A4)

---

**Slide 1 — Title Slide**
Project Title: "AI-Powered Student Performance Tracker"
Subtitle: "Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)"
Team Members: Madhav P, Amruth Badi, Guruprasad Charati
Group: A4

**Slide 2 — Problem Statement**
- Traditional education systems are REACTIVE — they detect student failure only AFTER exams
- No holistic monitoring of lifestyle factors (sleep, mental health, screen time)
- High dropout and burnout rates due to lack of early intervention
- Teachers and parents have zero visibility into student habits until it's too late

**Slide 3 — Our Solution**
An AI-powered full-stack web application that:
- PREDICTS exam scores BEFORE exams happen using 14 lifestyle + academic features
- Classifies students into Low / Medium / High risk categories
- Explains WHY a student is at risk using SHAP (Explainable AI)
- Sends real-time alerts to teachers/admins for early intervention
- Live URL: https://ai-powered-student-performance-tracker.vercel.app

**Slide 4 — AI / ML Capabilities**
1. Random Forest Regressor — predicts continuous exam score (0-100)
2. Random Forest Classifier — predicts risk level (Low/Medium/High)
3. SHAP (SHapley Additive exPlanations) — explains each feature's impact on the prediction (e.g., "-5 points due to low sleep")
4. Trend Analysis — tracks student improvement/decline over multiple submissions
5. Automated Risk Alerts — detects declining patterns and flags mental health concerns
6. Batch CSV Upload — admin can upload hundreds of students at once for instant predictions

**Slide 5 — Dataset & Database**
Dataset:
- Custom-engineered 10,000 records by merging 2 Kaggle datasets
- Dataset 1: 1-Million row Student Performance Dataset (academic metrics)
- Dataset 2: 5,000-entry Ultimate Student Productivity Dataset (lifestyle metrics)
- 14 input features: study_hours, attendance, sleep_hours, mental_health_score, social_media_hours, gaming_hours, caffeine_intake, etc.

Database:
- Supabase PostgreSQL (cloud-hosted)
- Tables: User, StudentRecord, Prediction, PasswordResetOTP, EmailVerificationOTP

**Slide 6 — System Architecture**
Show a 3-tier architecture diagram:
- Frontend: React.js + Vite + Tailwind CSS + Framer Motion → Deployed on Vercel CDN
- Backend: Django REST Framework + JWT Auth + ML Models (Random Forest + SHAP) → Deployed on Render
- Database: Supabase PostgreSQL | Email: Brevo SMTP for OTP verification
- Communication: RESTful JSON API with CORS security

**Slide 7 — User Interface Screenshots**
Describe these pages:
1. Landing Page — modern glassmorphism hero section with animated gradient background
2. Student Dashboard — prediction results, SHAP factor breakdown bars, trend line charts, personalized risk alerts
3. Admin Command Center — all students table, risk distribution doughnut chart, score histogram, CSV upload/export, actual score editing
4. Registration — OTP-verified email registration with Student/Admin role tabs
5. Dark Mode support across entire application

**Slide 8 — Key Features**
- OTP-based Email Verification (Brevo SMTP) for secure registration
- JWT Authentication (access + refresh tokens)
- Role-based Access Control (Student vs Admin)
- Real-time SHAP Explainability for every prediction
- CSV Bulk Upload and Export for admin batch processing
- Responsive design (mobile + desktop)
- Dark mode toggle

**Slide 9 — Results & Impact**
- Students get a real-time view of their predicted performance trajectory
- Teachers can identify at-risk students WEEKS before exams
- SHAP explanations bridge the gap between AI prediction and human understanding
- Admin can process hundreds of students instantly via CSV upload
- Accuracy tracking: predicted vs actual scores after exams

**Slide 10 — Future Scope & Conclusion**
Future Scope:
- Celery + Redis for async email alerts to parents when student enters High Risk
- WebSockets (Django Channels) for live dashboard updates
- Integration of continuous assessment marks (quiz scores, assignments)

Conclusion:
This project proves that ML + Web Tech can create a proactive safety net for students. By using Random Forest and SHAP, we don't just predict — we EXPLAIN, bridging AI and human counseling.

**Research Paper Title:** "Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)"
