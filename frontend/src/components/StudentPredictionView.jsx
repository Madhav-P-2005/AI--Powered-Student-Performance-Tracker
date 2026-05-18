// components/StudentPredictionView.jsx — Reusable full prediction dashboard view
// Used by: Dashboard.jsx (for student's own view) and AdminStudentView.jsx (admin viewing a student)

import { FiAlertCircle, FiTrendingUp, FiClock, FiArrowUp, FiArrowDown, FiInfo, FiHelpCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FEATURE_META, CATEGORY_INFO, SCALE_LABELS, FEATURE_BENCHMARKS, itemVariants } from '../config/constants';
import RiskBadge from './ui/RiskBadge';
import { useState } from 'react';

// ============================================================
// Get human-readable label for ordinal (1-5) features
// ============================================================
function getScaleLabel(feature, value) {
  const scales = SCALE_LABELS[feature];
  if (!scales) return null;
  const rounded = Math.round(value);
  return scales[rounded] || null;
}

// ============================================================
// Get benchmark verdict for a feature value
// ============================================================
function getBenchmark(feature, value) {
  const bench = FEATURE_BENCHMARKS[feature];
  if (!bench) return null;
  const threshold = bench.thresholds.find(t => value <= t.max);
  return threshold ? { ...threshold, context: bench.context } : { verdict: 'Unknown', reason: '', context: bench.context };
}

// ============================================================
// Generate rich, explanatory insights for each feature
// Explains WHY, not just WHAT
// ============================================================
function getInsight(feature, value, impact) {
  const meta = FEATURE_META[feature];
  if (!meta) return null;

  const isPositive = impact > 0;
  const absImpact = Math.abs(impact);
  if (absImpact < 0.05) return null;

  const scaleLabel = getScaleLabel(feature, value);
  const benchmark = getBenchmark(feature, value);

  // For ordinal scales (1-5), show the label prominently
  if (scaleLabel) {
    const levelText = `${scaleLabel.emoji} ${value}/5 — "${scaleLabel.label}"`;
    if (isPositive) {
      return `${levelText}: ${scaleLabel.description}. ${benchmark ? benchmark.reason : ''} This is positively contributing to the predicted score.`;
    } else {
      return `${levelText}: ${scaleLabel.description}. ${benchmark ? benchmark.reason : ''} This is pulling the predicted score down.`;
    }
  }

  // For continuous features, use benchmark-based explanations
  if (benchmark) {
    const verdictText = `Current value: ${value} ${meta.unit} (${benchmark.verdict})`;
    if (isPositive) {
      return `${verdictText} — ${benchmark.reason} The AI model recognizes this as a strength, contributing positively to the score. Research-backed optimal range: ${meta.goodRange} ${meta.unit}.`;
    } else {
      return `${verdictText} — ${benchmark.reason} The AI model identifies this as an area for improvement. Research-backed optimal range: ${meta.goodRange} ${meta.unit}.`;
    }
  }

  // Fallback
  return isPositive
    ? `Your value of ${value} ${meta.unit} is contributing positively. Optimal range: ${meta.goodRange} ${meta.unit}.`
    : `Your value of ${value} ${meta.unit} is below optimal. Aim for ${meta.goodRange} ${meta.unit} to improve.`;
}

// ============================================================
// Format display value — shows labels for ordinal features
// ============================================================
function formatDisplayValue(feature, value, unit) {
  const scaleLabel = getScaleLabel(feature, value);
  if (scaleLabel) {
    return { text: `${value}/5`, subtext: scaleLabel.label, emoji: scaleLabel.emoji };
  }
  if (feature === 'part_time_job') {
    return { text: value ? 'Yes' : 'No', subtext: value ? 'Working' : 'Not working', emoji: null };
  }
  return { text: `${value}`, subtext: unit, emoji: null };
}

// ============================================================
// Process SHAP data into categories with percentages
// ============================================================
const processShapData = (explanations) => {
  if (!explanations || Object.keys(explanations).length === 0) return null;

  const totalAbsImpact = Object.values(explanations).reduce((sum, d) => sum + Math.abs(d.impact), 0);
  
  const features = Object.entries(explanations).map(([key, data]) => {
    const meta = FEATURE_META[key] || { label: key, category: 'academic', icon: '📊', unit: '', goodRange: '' };
    const percentage = totalAbsImpact > 0 ? (Math.abs(data.impact) / totalAbsImpact) * 100 : 0;
    return {
      key,
      ...data,
      ...meta,
      percentage: Math.round(percentage),
      insight: getInsight(key, data.value, data.impact),
      benchmark: getBenchmark(key, data.value),
      scaleLabel: getScaleLabel(key, data.value),
      displayValue: formatDisplayValue(key, data.value, meta.unit),
    };
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const categories = {};
  for (const f of features) {
    if (!categories[f.category]) categories[f.category] = { positive: 0, negative: 0, total: 0 };
    if (f.impact > 0) categories[f.category].positive += f.impact;
    else categories[f.category].negative += f.impact;
    categories[f.category].total += Math.abs(f.impact);
  }

  const categoryPercentages = {};
  for (const [cat, vals] of Object.entries(categories)) {
    categoryPercentages[cat] = {
      percentage: totalAbsImpact > 0 ? Math.round((vals.total / totalAbsImpact) * 100) : 0,
      net: vals.positive + vals.negative,
    };
  }

  return { features, categoryPercentages, totalAbsImpact };
};

// ============================================================
// FeatureCard — Rich card for strengths/weaknesses
// ============================================================
const FeatureCard = ({ f, type, isAdminView }) => {
  const isPositive = type === 'positive';
  const colors = isPositive
    ? { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/30', text: 'text-emerald-800 dark:text-emerald-300', accent: 'text-emerald-700 dark:text-emerald-400', insightBg: 'bg-emerald-100/50 dark:bg-emerald-900/40', insightText: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }
    : { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-800/30', text: 'text-red-800 dark:text-red-300', accent: 'text-red-700 dark:text-red-400', insightBg: 'bg-red-100/50 dark:bg-red-900/40', insightText: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{f.icon}</span>
          <span className={`font-bold ${colors.text}`}>{f.label}</span>
        </div>
        {f.benchmark && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {f.benchmark.verdict}
          </span>
        )}
      </div>

      {/* Value Display — with scale labels */}
      <div className="flex items-baseline gap-2">
        {f.displayValue.emoji && <span className="text-lg">{f.displayValue.emoji}</span>}
        <span className={`text-2xl font-black ${colors.accent}`}>
          {f.displayValue.text}
        </span>
        {f.displayValue.subtext && (
          <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
            {f.displayValue.subtext}
          </span>
        )}
      </div>

      {/* Optimal Range */}
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Optimal range: <strong>{f.goodRange} {f.unit}</strong>
      </div>

      {/* Rich Insight — explains WHY, not just what */}
      {f.insight && (
        <div className={`text-xs ${colors.insightText} ${colors.insightBg} p-2.5 rounded-lg leading-relaxed`}>
          <strong>💡 Why this matters:</strong> {f.insight}
        </div>
      )}

      {/* Research Context */}
      {f.benchmark?.context && (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed border-t border-gray-200/50 dark:border-gray-700/50 pt-2">
          📊 {f.benchmark.context}
        </div>
      )}
    </div>
  );
};


// ============================================================
// StudentPredictionView — The main reusable component
// Props:
//   prediction  — single prediction object with feature_explanations
//   alerts      — { alerts: [], risk_status: '' } (optional, null if admin)
//   studentName — display name (optional, for admin header)
//   isAdminView — boolean, controls header text
// ============================================================
const StudentPredictionView = ({ prediction, alerts, studentName, isAdminView = false }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  if (!prediction) return null;

  const shapData = processShapData(prediction.feature_explanations);

  return (
    <div className="space-y-8">
      {/* Alerts (only for student view or if admin passes alerts) */}
      {alerts?.alerts?.length > 0 && (
        <div className="space-y-3">
          {alerts.alerts.map((alert, idx) => (
            <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border ${
              alert.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-300' :
              alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-300' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300'
            }`}>
              <FiAlertCircle size={20} className={alert.type === 'danger' ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'} />
              <div>
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-sm mt-1">{alert.message}</p>
                {alert.suggestion && (
                  <p className="text-sm mt-2 font-medium bg-white/50 dark:bg-black/20 inline-block px-3 py-1 rounded-lg">
                    💡 {alert.suggestion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score + Risk + Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Predicted Score */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center relative overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <FiTrendingUp /> Predicted Score
          </p>
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2 drop-shadow-sm">
            {prediction.predicted_score.toFixed(0)}
            <span className="text-3xl text-slate-300 dark:text-slate-600 font-bold">/100</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-center items-center gap-1.5 mt-4 font-medium bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 inline-flex px-3 py-1 rounded-full">
            <FiClock /> {new Date(prediction.created_at).toLocaleDateString()}
          </div>
        </motion.div>

        {/* Risk Level */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className={`absolute top-0 left-0 w-full h-2 ${
            prediction.risk_level === 'high' ? 'bg-red-500' :
            prediction.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
          }`}></div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Risk Assessment</p>
          <div className={`text-4xl font-black uppercase tracking-wider drop-shadow-sm ${
            prediction.risk_level === 'high' ? 'text-red-500 dark:text-red-400' :
            prediction.risk_level === 'medium' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
          }`}>
            {prediction.risk_level}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-medium">
            {prediction.risk_level === 'high' ? 'Immediate intervention recommended' :
             prediction.risk_level === 'medium' ? 'Room for improvement' : 'On track for success'}
          </p>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">Impact by Category</p>
          {shapData ? (
            <div className="space-y-3">
              {Object.entries(shapData.categoryPercentages).map(([cat, data]) => {
                const info = CATEGORY_INFO[cat];
                if (!info) return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 dark:text-slate-300">{info.label}</span>
                      <span className={`font-bold ${data.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {data.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full transition-all ${
                        data.net >= 0 ? 'bg-emerald-500' : 'bg-red-400'
                      }`} style={{ width: `${data.percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data</p>
          )}
        </motion.div>
      </div>

      {/* AI Analysis Report */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-indigo-100/50 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/30 dark:to-purple-900/30">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                🧠 AI Performance Analysis Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Each factor below shows its real-world impact on {isAdminView ? 'this student\'s' : 'your'} predicted score, with research-backed explanations.
              </p>
            </div>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors shrink-0"
            >
              <FiHelpCircle size={14} /> How does this work?
            </button>
          </div>

          {/* How It Works Explainer */}
          {showHowItWorks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 bg-white dark:bg-slate-700/50 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/30 space-y-3"
            >
              <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                <FiInfo size={16} /> Understanding the AI Analysis
              </h4>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                <p>
                  <strong>🔬 What is SHAP?</strong> SHAP (SHapley Additive exPlanations) is a mathematically proven method from game theory that explains AI predictions. It calculates exactly how much each input feature (like study hours, sleep, attendance) pushed {isAdminView ? 'the' : 'your'} predicted score up or down.
                </p>
                <p>
                  <strong>📊 How are the percentages calculated?</strong> The AI model (Random Forest) considers all 14 lifestyle factors together to predict a score. SHAP then isolates each factor's individual contribution. The percentage shows how much of the total prediction change is due to that specific factor. For example, if "Study Hours" shows 25%, it means study hours alone account for 25% of the total factors influencing {isAdminView ? 'the' : 'your'} score.
                </p>
                <p>
                  <strong>🟢 Green = Positive Impact:</strong> This factor is pushing {isAdminView ? 'the' : 'your'} score HIGHER than the average student. The AI learned from training data that students with similar values in this area tend to score better.
                </p>
                <p>
                  <strong>🔴 Red = Negative Impact:</strong> This factor is pulling {isAdminView ? 'the' : 'your'} score LOWER than average. Improving this area would directly raise the predicted score.
                </p>
                <p>
                  <strong>📐 What does "±X points" mean?</strong> It's the exact number of points this factor adds to or subtracts from {isAdminView ? 'the' : 'your'} score. For example, "+5.2 pts" means this factor alone raised the prediction by 5.2 points compared to an average student.
                </p>
                <p>
                  <strong>🎯 Benchmarks:</strong> Each factor is compared against research-backed optimal ranges derived from academic studies on student performance. These benchmarks explain why a value is considered good or needs improvement.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {!shapData ? (
          <div className="p-12 text-center text-gray-400">Explainability data not available.</div>
        ) : (() => {
          const { features } = shapData;
          const topPositive = features.filter(f => f.impact > 0).slice(0, 3);
          const topNegative = features.filter(f => f.impact < 0).slice(0, 3);

          return (
            <div className="p-6 space-y-8">
              {/* Strengths */}
              {topPositive.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiArrowUp className="text-emerald-500" /> Top Strengths — Boosting {isAdminView ? 'the' : 'Your'} Score
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topPositive.map((f) => (
                      <FeatureCard key={f.key} f={f} type="positive" isAdminView={isAdminView} />
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {topNegative.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FiArrowDown className="text-red-500" /> Areas for Improvement — Reducing {isAdminView ? 'the' : 'Your'} Score
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topNegative.map((f) => (
                      <FeatureCard key={f.key} f={f} type="negative" isAdminView={isAdminView} />
                    ))}
                  </div>
                </div>
              )}

              {/* Full Factor Breakdown */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                  Complete Factor Breakdown
                </h4>
                <div className="space-y-3">
                  {features.filter(f => f.percentage > 0).map((f) => (
                    <div key={f.key} className="flex items-center gap-4">
                      <div className="w-6 text-center">{f.icon}</div>
                      <div className="w-36 text-sm font-medium text-gray-700 dark:text-slate-300 truncate">
                        {f.label}
                        {f.scaleLabel && (
                          <span className="text-xs text-gray-400 dark:text-slate-500 block">
                            {f.scaleLabel.emoji} {f.scaleLabel.label}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center h-6 bg-gray-50 dark:bg-slate-700/50 rounded-full overflow-hidden relative">
                          <div className="absolute left-1/2 h-full w-px bg-gray-300 dark:bg-slate-600 z-10"></div>
                          {f.direction === 'positive' ? (
                            <div className="h-full bg-emerald-400 absolute left-1/2 rounded-r-full transition-all"
                              style={{ width: `${Math.min(f.percentage, 50)}%` }}></div>
                          ) : (
                            <div className="h-full bg-red-400 absolute right-1/2 rounded-l-full transition-all"
                              style={{ width: `${Math.min(f.percentage, 50)}%` }}></div>
                          )}
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <div className={`text-sm font-bold ${
                          f.direction === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                        }`}>
                          {f.direction === 'positive' ? '+' : '-'}{f.percentage}%
                        </div>
                        {f.benchmark && (
                          <div className="text-xs text-gray-400 dark:text-slate-500">{f.benchmark.verdict}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </motion.div>

      {/* Actual Score Section (admin view) */}
      {isAdminView && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Accuracy Verification</h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-bold">Predicted:</span> {prediction.predicted_score.toFixed(1)}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <div>
              {prediction.actual_score ? (
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-bold">Actual:</span> {prediction.actual_score}
                  </p>
                  <p className={`text-xs font-bold mt-1 ${
                    Math.abs(prediction.predicted_score - prediction.actual_score) <= 5 ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    Error: ±{Math.abs(prediction.predicted_score - prediction.actual_score).toFixed(1)} points
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">Actual score not yet entered</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentPredictionView;
