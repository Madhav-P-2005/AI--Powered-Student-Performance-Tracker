# Proactive Detection of Student Burnout and Academic Performance using Random Forest and Explainable AI (SHAP)

**A Full Stack Web Application Approach**

---

## Abstract
Traditional educational tracking systems predominantly rely on reactive metrics, identifying student failure only *after* major examinations have occurred. This paper introduces an AI-powered Student Performance Tracker, a full-stack web application designed to proactively predict both academic scores and burnout risk levels before exams take place. By engineering a custom 10,000-record dataset merging core academic metrics with critical lifestyle factors (e.g., sleep patterns, mental health scores, screen time), we trained robust Random Forest models to predict outcomes with high reliability. To solve the "Black Box" problem inherent in modern Machine Learning, SHapley Additive exPlanations (SHAP) were integrated, allowing educators and administrators to view mathematically exact explanations of each feature's contribution to a student's prediction. The system is deployed via a decoupled architecture using React via Vite for the frontend and Django REST Framework for the backend, ensuring a secure, scalable, and highly interactive user experience.

---

## 1. Introduction
Academic success is the intersection of cognitive effort and lifestyle wellbeing. However, modern university environments often lack the infrastructure to monitor holistic student health, leading to high dropout and burnout rates. Conventional academic portals act as mere data repositories, providing historical grades rather than actionable, forward-looking insights. 

The primary objective of this project is to shift the educational paradigm from *reactive* to *proactive*. We developed an end-to-end web application that leverages Machine Learning to act as an early-warning radar for struggling students. By analyzing 14 distinct features ranging from attendance to daily caffeine intake, the system alerts counselors weeks before a student fails, providing an Explainable AI (XAI) breakdown of precisely why the student is at risk.

## 2. Methodology

### 2.1 Data Collection and Engineering
The foundation of the predictive engine is a custom-engineered, robust dataset comprising 10,000 records. This was achieved by merging two highly-rated, distinct datasets:
1. **Academic Metrics**: Sampled from a 1-Million row Student Performance Dataset, providing variables such as `weekly_self_study_hours` and `attendance_percentage`.
2. **Lifestyle Metrics**: Merged with a 5,000-entry Ultimate Student Productivity dataset, supplying crucial physiological and psychological data, including sleep patterns, mental health scores, and gaming hours.

Cross-correlations were algorithmically established to prevent data imbalance, resulting in a holistic training set representing realistic student behavior.

### 2.2 Machine Learning Pipeline
Given the tabular nature of the data, decision-tree-based ensemble learning was selected over deep learning approaches due to its resistance to overfitting and interpretability. We utilized the `scikit-learn` library to train two models:
- **`RandomForestRegressor`**: An ensemble of 100 decision trees tasked with outputting a continuous predicted exam score (0-100%).
- **`RandomForestClassifier`**: Categorizes the 14 input features to predict an actionable Risk Level (Low, Medium, High).

The models were serialized via `joblib` into `.pkl` files and embedded natively within the web backend, allowing for instant, offline inference without reliance on external paid APIs.

### 2.3 Explainable AI (SHAP) Integration
Real-world adoption of AI in education requires administrative trust. To prevent the model from acting as a "Black Box", we integrated SHAP (SHapley Additive exPlanations), a framework based on cooperative game theory. Rather than outputting a raw prediction, the SHAP `TreeExplainer` calculates the marginal contribution of every feature. The backend translates these Shapley values into a JSON response, which the frontend renders as a human-readable breakdown (e.g., "-5% score penalty due to < 5 hours of sleep").

### 2.4 System Architecture
The application employs a modern, decoupled Full-Stack architecture:
*   **Frontend**: Built with React.js using Vite for optimized bundling. Tailwind CSS handles responsive styling, while Framer Motion provides dynamic alert animations. Deployed globally via the Vercel Edge Network.
*   **Backend**: Managed by Python and the Django REST Framework (DRF), handling robust routing, JWT-based secure authentication, and complex matrix transformations for the ML model. Deployed on Render.
*   **Database & Services**: PostgreSQL hosted on Supabase serves as the primary data store, with Brevo SMTP handling automated Email OTP verification for secure user registration. 

## 3. Results and Impact
The dual-model approach yielded high accuracy on the testing subset, validated via Mean Absolute Error (MAE) and F1-scores. 

Upon deployment, the system successfully provided:
1.  **Student Portals**: Empowering students with a real-time view of their performance trajectory and personalized AI-driven habit feedback.
2.  **Admin Command Center**: Allowing educators to view system-wide risk distributions and perform Batch CSV predictions, instantly processing hundreds of students to flag at-risk individuals.
3.  **Automated Trigger Alerts**: A cron-style monitoring system that detects declining trends over a 3-week period and immediately notifies administrative staff.

## 4. Conclusion and Future Scope
The AI-Powered Student Performance Tracker proves that machine learning can be effectively paired with web technologies to create a proactive safety net for students. By utilizing Random Forest and SHAP, the system not only predicts outcomes but explains them, bridging the gap between artificial intelligence and human counseling.

**Future Scope**:
*   Integration of Celery and Redis to handle asynchronous email warnings to parents or counselors when a student enters 'High Risk'.
*   Implementation of WebSockets (Django Channels) to push live status updates to the Admin Dashboard without requiring manual page refreshes.
*   Expansion of the dataset to include granular continuous assessment marks (quiz scores, assignment grades) over an entire semester.

---
*Prepared for the Bachelor of Computer Applications (Fifth Semester) Full Stack Development Project at P C Jabin Science College, Autonomous, Hubballi.*
