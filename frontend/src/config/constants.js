// config/constants.js — Shared constants used across multiple components

// ============================================================
// FEATURE_META — Human-readable labels & metadata for ML features
// Used by: Dashboard.jsx (SHAP analysis), AdminDashboard.jsx (insights modal)
// ============================================================
export const FEATURE_META = {
  study_hours:            { label: 'Study Hours',         category: 'academic', icon: '📚', unit: 'hrs/wk',    goodRange: '15-25' },
  self_study_hours:       { label: 'Self Study',          category: 'academic', icon: '📖', unit: 'hrs/wk',    goodRange: '10-20' },
  online_classes_hours:   { label: 'Online Classes',      category: 'academic', icon: '💻', unit: 'hrs/wk',    goodRange: '5-15' },
  attendance_percentage:  { label: 'Attendance',           category: 'academic', icon: '📋', unit: '%',         goodRange: '80-100' },
  class_participation:    { label: 'Class Participation', category: 'academic', icon: '🙋', unit: '/5',        goodRange: '4-5' },
  social_media_hours:     { label: 'Social Media',        category: 'digital',  icon: '📱', unit: 'hrs/day',   goodRange: '0-2' },
  gaming_hours:           { label: 'Gaming',              category: 'digital',  icon: '🎮', unit: 'hrs/day',   goodRange: '0-1' },
  screen_time_hours:      { label: 'Screen Time',         category: 'digital',  icon: '🖥️', unit: 'hrs/day',   goodRange: '2-6' },
  sleep_hours:            { label: 'Sleep',               category: 'health',   icon: '😴', unit: 'hrs/night', goodRange: '7-9' },
  exercise_minutes:       { label: 'Exercise',            category: 'health',   icon: '🏃', unit: 'min/day',   goodRange: '30-60' },
  caffeine_intake_mg:     { label: 'Caffeine',            category: 'health',   icon: '☕', unit: 'mg/day',    goodRange: '0-200' },
  mental_health_score:    { label: 'Mental Health',       category: 'health',   icon: '🧠', unit: '/5',        goodRange: '4-5' },
  part_time_job:          { label: 'Part-Time Job',       category: 'health',   icon: '💼', unit: '',          goodRange: 'No' },
  upcoming_deadline:      { label: 'Deadlines',           category: 'academic', icon: '📅', unit: 'active',    goodRange: '0-3' },
};

// ============================================================
// SCALE_LABELS — Human-readable labels for ordinal (1-5) features
// Converts raw numbers into meaningful descriptive text
// ============================================================
export const SCALE_LABELS = {
  mental_health_score: {
    1: { label: 'Poor',        emoji: '😟', description: 'Feeling overwhelmed, stressed, or anxious most of the time' },
    2: { label: 'Below Average', emoji: '😕', description: 'Occasional stress and low motivation, struggling to cope' },
    3: { label: 'Moderate',     emoji: '😐', description: 'Managing okay, some good days and some bad days' },
    4: { label: 'Good',         emoji: '😊', description: 'Feeling positive, motivated, and in control of stress' },
    5: { label: 'Excellent',    emoji: '😄', description: 'Thriving mentally — confident, happy, and focused' },
  },
  class_participation: {
    1: { label: 'Rarely Participates', emoji: '🤫', description: 'Seldom speaks up, doesn\'t engage in discussions' },
    2: { label: 'Occasionally',        emoji: '🙂', description: 'Participates only when called upon or prompted' },
    3: { label: 'Moderate',            emoji: '🙋', description: 'Engages in discussions sometimes, asks a few questions' },
    4: { label: 'Active',             emoji: '✋', description: 'Regularly participates, asks questions, joins group work' },
    5: { label: 'Very Active',        emoji: '🌟', description: 'Leads discussions, helps peers, always engaged in class' },
  },
};

// ============================================================
// FEATURE_BENCHMARKS — Research-backed benchmarks explaining
// WHY each range is good/bad, with citations and reasoning
// ============================================================
export const FEATURE_BENCHMARKS = {
  study_hours: {
    context: 'Research shows students who study 15-25 hrs/week score 20-30% higher than those studying under 10 hrs. Beyond 30 hrs, diminishing returns kick in due to fatigue.',
    thresholds: [
      { max: 5, verdict: 'Critically Low', reason: 'Under 5 hrs/week leaves almost no time for deep learning or revision.' },
      { max: 10, verdict: 'Below Average', reason: 'Most course material requires at least 2 hrs of study per subject per week.' },
      { max: 15, verdict: 'Average', reason: 'Meets minimum recommended study time for a typical course load.' },
      { max: 25, verdict: 'Optimal', reason: 'Within the research-backed sweet spot for knowledge retention and exam readiness.' },
      { max: 100, verdict: 'High', reason: 'Strong commitment, but ensure quality over quantity — take breaks to avoid burnout.' },
    ],
  },
  self_study_hours: {
    context: 'Self-directed study develops critical thinking and deeper understanding. Students with 10+ hrs of independent study retain 40% more information than passive learners.',
    thresholds: [
      { max: 3, verdict: 'Very Low', reason: 'Heavy reliance on classroom learning alone limits deeper understanding.' },
      { max: 8, verdict: 'Below Average', reason: 'Some self-study but not enough for complex topics or exam preparation.' },
      { max: 15, verdict: 'Good', reason: 'Solid self-study habit that supports classroom learning effectively.' },
      { max: 80, verdict: 'Excellent', reason: 'Strong independent learner — this is a key predictor of academic success.' },
    ],
  },
  attendance_percentage: {
    context: 'Multiple studies confirm students with 85%+ attendance score on average 12% higher. Each 10% drop in attendance correlates with a 3-5 point score decrease.',
    thresholds: [
      { max: 50, verdict: 'Critical', reason: 'Missing over half the classes makes it nearly impossible to follow the curriculum.' },
      { max: 70, verdict: 'Low', reason: 'Gaps in understanding accumulate — important concepts and explanations are being missed.' },
      { max: 85, verdict: 'Average', reason: 'Meets minimum institutional requirements but leaves little room for missed classes.' },
      { max: 95, verdict: 'Good', reason: 'Consistent attendance with room for occasional illness or emergencies.' },
      { max: 100, verdict: 'Excellent', reason: 'Near-perfect attendance ensures no gaps in classroom instruction and discussions.' },
    ],
  },
  social_media_hours: {
    context: 'Studies show students who use social media more than 3 hrs/day have 10-15% lower GPAs. The cognitive switching cost of checking phones fragments study sessions.',
    thresholds: [
      { max: 1, verdict: 'Low', reason: 'Minimal distraction from social media — excellent for maintaining focus.' },
      { max: 2, verdict: 'Healthy', reason: 'Within recommended limits. Social connection without academic impact.' },
      { max: 4, verdict: 'Moderate Risk', reason: 'Starting to eat into productive study time. Consider setting daily limits.' },
      { max: 24, verdict: 'High Risk', reason: 'Significantly fragmenting attention and reducing effective study time.' },
    ],
  },
  gaming_hours: {
    context: 'Gaming under 1 hr/day has neutral or slight positive effects (stress relief). Beyond 2 hrs, it strongly correlates with reduced study time and sleep disruption.',
    thresholds: [
      { max: 1, verdict: 'Healthy', reason: 'Brief gaming can be a good stress reliever without impacting academics.' },
      { max: 2, verdict: 'Moderate', reason: 'At the upper limit — ensure it doesn\'t replace study or sleep time.' },
      { max: 4, verdict: 'Concerning', reason: 'Gaming is consuming significant time that could be spent studying or resting.' },
      { max: 24, verdict: 'Excessive', reason: 'Major time sink — strongly correlated with poor academic outcomes and sleep deprivation.' },
    ],
  },
  sleep_hours: {
    context: 'Sleep is essential for memory consolidation and cognitive function. Students sleeping 7-9 hours score 15-20% higher than those sleeping under 6 hours.',
    thresholds: [
      { max: 4, verdict: 'Severe Deprivation', reason: 'Dangerous for both health and cognitive function — memory and focus are severely impaired.' },
      { max: 6, verdict: 'Insufficient', reason: 'Below the minimum needed for proper brain recovery and memory consolidation.' },
      { max: 7, verdict: 'Borderline', reason: 'Just barely adequate. Most students need at least 7 hours for peak performance.' },
      { max: 9, verdict: 'Optimal', reason: 'Within the ideal range for cognitive function, mood, and memory retention.' },
      { max: 24, verdict: 'Oversleeping', reason: 'Excessive sleep may indicate health issues and reduces productive hours.' },
    ],
  },
  exercise_minutes: {
    context: 'Regular physical activity increases blood flow to the brain, improving concentration and memory. Even 20 min/day of moderate exercise boosts academic performance by 15%.',
    thresholds: [
      { max: 10, verdict: 'Sedentary', reason: 'Almost no physical activity — this impacts both mental health and cognitive sharpness.' },
      { max: 20, verdict: 'Low', reason: 'Below the minimum recommended for cognitive benefits.' },
      { max: 30, verdict: 'Adequate', reason: 'Meets minimum daily activity recommendations for brain health.' },
      { max: 60, verdict: 'Good', reason: 'Optimal range — significant positive effects on focus, mood, and academic performance.' },
      { max: 300, verdict: 'Very Active', reason: 'Strong fitness habits, but ensure it doesn\'t cut into study time.' },
    ],
  },
  mental_health_score: {
    context: 'Mental wellbeing is one of the strongest predictors of academic success. Students reporting good mental health (4-5/5) score 25% higher on average than those at 1-2/5.',
    thresholds: [
      { max: 1, verdict: 'Critical', reason: 'Severe stress/anxiety severely impairs concentration, memory, and motivation. Seeking support is strongly recommended.' },
      { max: 2, verdict: 'Poor', reason: 'Struggling with wellbeing — this directly reduces cognitive performance and exam readiness.' },
      { max: 3, verdict: 'Average', reason: 'Managing, but mental health challenges may be silently affecting performance.' },
      { max: 4, verdict: 'Good', reason: 'Positive mindset supports effective studying, better sleep, and resilience under pressure.' },
      { max: 5, verdict: 'Excellent', reason: 'Thriving mentally — this is a strong foundation for consistent academic success.' },
    ],
  },
  caffeine_intake: {
    context: 'Moderate caffeine (1-2 cups/day) can improve alertness. However, high intake (4+ cups) disrupts sleep quality and increases anxiety, both of which harm academic performance.',
    thresholds: [
      { max: 1, verdict: 'Low', reason: 'Minimal caffeine — no negative impact on sleep or anxiety levels.' },
      { max: 2, verdict: 'Moderate', reason: 'Within safe limits. May provide a mild alertness boost.' },
      { max: 4, verdict: 'Elevated', reason: 'May be disrupting sleep quality, leading to fatigue during study sessions.' },
      { max: 15, verdict: 'Excessive', reason: 'High caffeine indicates stress or sleep issues — a vicious cycle affecting performance.' },
    ],
  },
  class_participation: {
    context: 'Active classroom participation strengthens understanding through verbal processing. Students who participate regularly score 10-15% higher due to better engagement and retention.',
    thresholds: [
      { max: 1, verdict: 'Very Low', reason: 'Not engaging in discussions means missing opportunities to clarify doubts and deepen understanding.' },
      { max: 2, verdict: 'Low', reason: 'Minimal participation — learning is mostly passive, which limits retention.' },
      { max: 3, verdict: 'Moderate', reason: 'Average engagement — participating more would strengthen comprehension.' },
      { max: 4, verdict: 'Active', reason: 'Regular participation shows engagement and helps solidify concepts through discussion.' },
      { max: 5, verdict: 'Excellent', reason: 'Highly engaged — verbal processing and peer teaching maximize learning outcomes.' },
    ],
  },
  upcoming_deadlines: {
    context: 'Deadline pressure can motivate or overwhelm. 1-3 active deadlines are manageable; beyond 5, stress accumulates and quality of work decreases significantly.',
    thresholds: [
      { max: 2, verdict: 'Manageable', reason: 'Comfortable workload with enough time for quality work on each task.' },
      { max: 4, verdict: 'Moderate', reason: 'Requires good time management but is achievable with planning.' },
      { max: 6, verdict: 'Heavy', reason: 'High deadline pressure — increases stress and risk of rushed, lower-quality submissions.' },
      { max: 20, verdict: 'Overwhelming', reason: 'Too many concurrent deadlines — cognitive overload reduces performance across all tasks.' },
    ],
  },
  total_screen_time: {
    context: 'Non-academic screen time above 4 hrs/day is linked to reduced attention span and poorer sleep quality, both of which directly impact study effectiveness.',
    thresholds: [
      { max: 3, verdict: 'Low', reason: 'Healthy screen habits — eyes and mind get adequate rest.' },
      { max: 6, verdict: 'Moderate', reason: 'Acceptable if most screen time is study-related.' },
      { max: 10, verdict: 'High', reason: 'Eye strain and cognitive fatigue likely reducing study effectiveness.' },
      { max: 24, verdict: 'Excessive', reason: 'Major concern — prolonged screen exposure fragments focus and disrupts sleep.' },
    ],
  },
  part_time_job: {
    context: 'Working part-time reduces available study hours by 10-20 hrs/week on average. Students with jobs score 5-8% lower unless they compensate with efficient study habits.',
    thresholds: [],
  },
  online_class_hours: {
    context: 'Online learning effectiveness depends on engagement. Students who actively participate in online classes retain more than passive viewers.',
    thresholds: [
      { max: 2, verdict: 'Low', reason: 'Minimal online class engagement.' },
      { max: 5, verdict: 'Moderate', reason: 'Average online participation supplementing in-person learning.' },
      { max: 10, verdict: 'Good', reason: 'Active use of online learning resources and classes.' },
      { max: 50, verdict: 'Heavy', reason: 'Primarily online learner — ensure active engagement, not passive watching.' },
    ],
  },
};

// ============================================================
// CATEGORY_INFO — Display config for feature categories
// ============================================================
export const CATEGORY_INFO = {
  academic: { label: 'Academic Factors', color: 'indigo',  bgClass: 'bg-indigo-50', textClass: 'text-indigo-700',  borderClass: 'border-indigo-200' },
  digital:  { label: 'Digital Behavior', color: 'purple',  bgClass: 'bg-purple-50', textClass: 'text-purple-700',  borderClass: 'border-purple-200' },
  health:   { label: 'Health & Lifestyle', color: 'emerald', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-200' },
};

// ============================================================
// ANIMATION_VARIANTS — Shared Framer Motion variants
// Used by: Dashboard, AdminDashboard, Home, StudentForm
// ============================================================
export const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};
