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
