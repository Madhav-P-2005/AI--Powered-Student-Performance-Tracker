# Machine Learning Integration: Technical Details & Presentation Guide

This document provides a comprehensive breakdown of the Machine Learning architecture used in the AI-Powered Student Performance Tracker, along with a Q&A guide tailored for project presentations and vivas.

---

## Part 1: Architecture & Technical Pipeline

### 1. Data Sources & Preprocessing (`backend/scripts/train_model.py`)
- **Primary Datasets**: We engineered a custom 10,000-row dataset by merging two highly-rated Kaggle datasets:
  1. [**Student Performance Dataset (Synthetic, Realistic)**](https://www.kaggle.com/datasets/nabeelqureshitiii/student-performance-dataset): A massive 1 Million record dataset from which we sampled academic metrics like `weekly_self_study_hours`, `attendance_percentage`, and `class_participation`.
  2. [**Ultimate Student Productivity Dataset**](https://www.kaggle.com/datasets/sampathvinayakbablu/ultimate-student-productivity-dataset): A 5,000-entry real-world dataset providing critical lifestyle metrics such as sleep patterns, social media usage, gaming hours, and mental health scores.
- **Engineering**: We sub-sampled the 1M record academic dataset to match the 5,000 productivity records, establishing cross-correlations to prevent data imbalance. This resulted in a robust, balanced training dataset capturing holistic student behavior.
- **Features Used**: The model trains on **14 distinct features**, including `study_hours`, `gaming_hours`, `caffeine_intake`, `mental_health_score`, and `attendance_percentage`.

### 2. The Machine Learning Models (`backend/ml_models`)
We utilized the **Random Forest** algorithm via `scikit-learn`, chosen for its high accuracy on tabular data and resistance to overfitting.
- **`score_regressor.pkl`**: A `RandomForestRegressor` utilizing 100 decision trees (max depth 15). It outputs a continuous predicted exam score (0-100%).
- **`risk_classifier.pkl`**: A `RandomForestClassifier` that categorizes the 14 features into an actionable Risk Level (`Low`, `Medium`, `High`).
- *Deployment*: Models are serialized using `joblib` into `.pkl` files and loaded natively into the Django backend for instant, offline inference.

### 3. Inference & Explainable AI (`backend/ml_models/predict.py`)
- **Prediction Execution**: The `predict_student()` function converts a `StudentRecord` into a numpy array and feeds it into the `.pkl` models.
- **SHAP Integration (The "Why")**: We use **SHAP** (`shap.TreeExplainer`) based on cooperative game theory. Instead of acting as a "Black Box", SHAP calculates the exact mathematical impact of every single feature on a specific prediction. For example, it explains a 65% score as: *"-8% due to high screen time, -3% due to low sleep, +5% due to strong attendance"*.

### 4. REST API & Analytics (`backend/predictions`)
- **`RunPredictionView`**: API endpoint triggered upon student form submission. It executes the ML models and saves the score, risk level, and SHAP JSON data to the secure Postgres database.
- **`AlertCheckView`**: An automated monitoring system that triggers UI alerts if a student hits 'High Risk', shows a declining trend over 3 weeks, or crosses danger thresholds (e.g., `< 5 hours sleep`).
- **`AccuracyAnalyticsView`**: Allows administrators to input *actual* exam scores later in the semester and calculates the Mean Absolute Error (MAE) to mathematically prove the model's reliability over time.

---

## Part 2: Presentation & Viva Q&A Guide

**1. Where did you get the datasets and are they valid?**
*Answer:* "We utilized two highly-rated datasets from Kaggle: the 1-Million row *Student Performance Dataset* by Nabeel Qureshi for core academic metrics, and the *Ultimate Student Productivity Dataset* by Sampath Vinayak for crucial lifestyle metrics like mental health and sleep. Because one was strictly academic and the other strictly lifestyle, we engineered a Python script to merge them into a single 10,000-row custom dataset. This makes our data highly valid and holistic, as it proves that a student's cognitive performance is an intersection of both academic effort and lifestyle wellbeing."

**2. Is the model pre-trained (e.g., an OpenAI API) or did you train it yourself?**
*Answer:* "It is 100% custom-trained by us. We wrote the data pipeline in Python using `scikit-learn`, hand-selected the 14 most impactful student features, and trained two separate Random Forest algorithms locally. We are running the actual AI natively on our own backend."

**3. How accurate is it?**
*Answer:* "During training, we performed an 80/20 train-test split to ensure the model isn't just memorizing data (overfitting). Because we use an ensemble method of 100 decision trees per prediction, it achieves high reliability on structured tabular data, which we evaluated using Mean Absolute Error (MAE) and accuracy F1-scores."

**4. How does this work in the real world? Is it actually useful?**
*Answer:* "Traditional college tracking systems are reactive—they report failure *after* midterms. Our system is proactive. By analyzing leading indicators like a drop in sleep or an increase in gaming, our ML model flags the student on the Admin Dashboard weeks before the exams, allowing counselors to intervene early."

**5. How does the Admin trust the model's 'weightage' or predictions?**
*Answer:* "Most AI is a 'Black Box'. To solve this and build real-world admin trust, we integrated **SHAP (SHapley Additive exPlanations)**. When an admin views a student, they don't just see a raw score—the dashboard breaks down exactly *why* the AI chose that score (e.g., '-5% due to low mental health'). It gives the admin X-Ray vision into the AI's logic."

**6. Did you only use a standard Random Forest and nothing else?**
*Answer:* "No, our pipeline is much more advanced than a basic Random Forest call. We implemented a dual-model ensemble architecture: a `RandomForestRegressor` to predict the continuous exam percentage, and a `RandomForestClassifier` to map habits to an actionable 'Risk Level'. Most importantly, we integrated **SHAP**, a game-theory-based mathematical framework, which runs alongside the models to actively explain the machine's decisions in real-time."

**7. Why did you choose Random Forest over Deep Learning (Neural Networks / TensorFlow)?**
*Answer:* "Neural Networks are optimized for complex, unstructured data like images, audio, or natural language. However, for structured tabular data (like our student rows of Excel-style habit data), research proves that tree-based ensemble methods like Random Forest consistently outperform deep neural networks. Furthermore, Random Forest prevents extreme overfitting on our 10,000-row dataset, requires vastly less computational power (no GPUs needed for inference), and integrates seamlessly with SHAP for total interpretability."
