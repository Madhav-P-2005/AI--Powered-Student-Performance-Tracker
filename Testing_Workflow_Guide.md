# End-to-End Testing Guide: Student & Admin Workflows

This guide walks you through the exact steps to fully test and demonstrate the AI-Powered Student Performance Tracker during your project presentation.

---

## 1. Student Workflow Testing
Use this account to show how a student interacts with the system, gets AI predictions, and receives personalized feedback.
**Account:** `madhavpstudent1@2026` (Username: `Test1`)

### Step 1: Submit the First Prediction (The Failing Student)
1. From the Student Dashboard, click the purple **"Start First Prediction"** button (or "Predict Risk" in the navbar).
2. You will see the "New Performance Prediction" form. Fill in the exact numbers below to trigger the AI's **High Risk** warning system.

**Test Scenario A: High Risk / Burnout Student**
*Academic Activity:*
- Total Study Hours/wk: `5`
- Self Study Hours/wk: `2`
- Online Class Hours/wk: `10`
- Attendance %: `60`
- Class Participation (1-5): `1`
- Upcoming Deadlines: `4`

*Digital Behavior:*
- Social Media Hours/day: `6`
- Gaming Hours/day: `5`
- Total Screen Time/day: `12`

*Lifestyle & Health:*
- Sleep Hours/night: `4`
- Exercise Minutes/day: `0`
- Caffeine Intake (cups/day): `5`
- Mental Health (1-5): `2`
- Part-Time Job?: **Toggled ON** (Yes, working currently)

3. Click **Predict Performance**.

### Step 2: Analyze the AI Results
1. You will be redirected back to the Dashboard.
2. Observe the predicted percentage and the **High Risk (Red)** badge.
3. Look at the **SHAP Insights** breakdown. It will tell you exactly *why* the AI generated that score (e.g., heavily negative impact from sleep and gaming).
4. Check the **AI Alerts** section on the right. You should see automated warnings like "Low Sleep Warning" or "Mental Health Concern".

### Step 3: Trend Tracking & Improvement
1. Click **"+ New Prediction"** again.
2. Now, fill in the exact numbers below to simulate the student taking the AI's advice and improving their habits.

**Test Scenario B: Low Risk / Improved Student**
*Academic Activity:*
- Total Study Hours/wk: `25`
- Self Study Hours/wk: `15`
- Online Class Hours/wk: `4`
- Attendance %: `95`
- Class Participation (1-5): `5`
- Upcoming Deadlines: `1`

*Digital Behavior:*
- Social Media Hours/day: `1`
- Gaming Hours/day: `0`
- Total Screen Time/day: `3`

*Lifestyle & Health:*
- Sleep Hours/night: `8`
- Exercise Minutes/day: `45`
- Caffeine Intake (cups/day): `1`
- Mental Health (1-5): `5`
- Part-Time Job?: **Toggled OFF** (No)

3. Click **Predict Performance**.
4. Returning to the Dashboard, the **Performance Trend Graph** will now trace an upward line charting the massive improvement from the first submission to the second!

---

## 2. Admin / Teacher Workflow Testing
Use this account to show how staff members monitor students, track system-wide analytics, and intervene using AI insights.
**Account:** `madhavpadmin@2026` (Username: `Madhav_P`)

### Step 1: The Command Center Overview
1. Log out of the student account and sign in with the Admin credentials.
2. You will land on the **Admin Command Center**.
3. Notice the top stat cards: `Total Students`, `Avg Score`, and the `Risk Distribution` (Low/Medium/High counts) will automatically reflect the submissions you just made as `Test1`.

### Step 2: Individual Student Analysis
1. In the student table at the bottom, find the row for `Test1`.
2. See their latest predicted score and current Risk Level at a glance.
3. Click the **View/Edit** icon to open their detailed profile.
4. **Teacher Intervention:** As an admin, you can see their exact habits *and* the AI's SHAP breakdown. This allows you to say, *"I see the AI flagged you for low mental health and high screen time—let's work on that,"* giving teachers actionable data rather than just a failing grade.

### Step 3: Batch CSV Upload (Optional for wow factor)
1. On the Admin Dashboard, locate the drag-and-drop upload zone.
2. This allows an admin to upload an entire classroom's data at once using a CSV file, and the AI will predict over the entire batch in seconds!
3. *(If you want to test this, you can copy a few rows from the `backend/scripts/ultimate_student_productivity_dataset_5000.csv` into a new file and upload it).*
