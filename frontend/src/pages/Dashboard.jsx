import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiAlertCircle, FiTrendingUp, FiActivity, FiClock, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Shared imports
import usePredictions from '../hooks/usePredictions';
import { FEATURE_META, CATEGORY_INFO, containerVariants, itemVariants } from '../config/constants';
import Spinner from '../components/ui/Spinner';
import RiskBadge from '../components/ui/RiskBadge';
import EmptyState from '../components/ui/EmptyState';

// Generate a natural language insight for a feature
function getInsight(feature, value, impact) {
  const meta = FEATURE_META[feature];
  if (!meta) return null;

  const isPositive = impact > 0;
  const absImpact = Math.abs(impact);

  // Only generate insights for features with meaningful impact
  if (absImpact < 0.05) return null;

  const insights = {
    study_hours: isPositive
      ? `Your ${value} hrs/wk of study is boosting your score. Top performers study 20+ hrs/wk.`
      : `Only ${value} hrs/wk of study is holding you back. Aim for at least 15 hrs/wk.`,
    self_study_hours: isPositive
      ? `Strong self-study habit (${value} hrs/wk) is a key predictor of success.`
      : `More independent study time would significantly improve your forecast.`,
    attendance_percentage: isPositive
      ? `${value}% attendance is contributing positively. Students above 85% score 12% higher.`
      : `Low attendance (${value}%) is dragging your score down. Each 10% increase adds ~4 points.`,
    social_media_hours: isPositive
      ? `Your social media usage is within healthy limits.`
      : `${value} hrs/day on social media is reducing focus. Students under 2 hrs score 8% higher.`,
    gaming_hours: isPositive
      ? `Gaming time is controlled and not impacting performance.`
      : `${value} hrs/day gaming is cutting into study time. Try limiting to 1 hr/day.`,
    sleep_hours: isPositive
      ? `Getting ${value} hours of sleep supports cognitive function and memory retention.`
      : `Only ${value} hrs of sleep is impairing performance. 7-8 hours is optimal for exam readiness.`,
    exercise_minutes: isPositive
      ? `Regular exercise (${value} min/day) improves focus and reduces stress — great for scores.`
      : `Very little exercise detected. Even 20 minutes of daily activity boosts cognitive performance by 15%.`,
    mental_health_score: isPositive
      ? `Good mental health (${value}/5) is strongly correlated with academic success.`
      : `Low mental health score (${value}/5) is a significant risk factor. Consider talking to a counselor.`,
    caffeine_intake: isPositive
      ? `Moderate caffeine intake is fine.`
      : `High caffeine (${value} cups/day) may indicate stress or poor sleep patterns.`,
    part_time_job: isPositive
      ? `Employment status is not negatively affecting your performance.`
      : `Having a part-time job is reducing available study time and energy.`,
    total_screen_time: isPositive
      ? `Screen time is within manageable limits.`
      : `${value} hrs/day of screen time is excessive. Non-academic screen time should stay under 4 hrs.`,
    class_participation: isPositive
      ? `Active class participation (${value}/5) shows engagement, a strong success predictor.`
      : `Low class participation (${value}/5) correlates with lower understanding and scores.`,
    upcoming_deadlines: isPositive
      ? `Deadline load is manageable.`
      : `${value} active deadlines may be causing performance pressure and stress.`,
    online_class_hours: isPositive
      ? `Online class engagement is contributing positively.`
      : `Online class time could be improved for better results.`,
  };

  return insights[feature] || null;
}

// Process SHAP data into categories with percentages
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
    };
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Category-level aggregation
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

const Dashboard = () => {
  const { user } = useAuth();
  const { predictions, alerts, loading, latestPrediction } = usePredictions(user);

  if (loading) return <Spinner />;

  return (
    <motion.div 
      className="max-w-6xl mx-auto pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back, {user?.first_name || user?.username}. Here's your performance overview.</p>
        </div>
        <Link to="/submit" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
          <FiPlus size={20} /> New Prediction
        </Link>
      </motion.div>

      {/* Alerts */}
      {alerts.alerts && alerts.alerts.length > 0 && (
        <div className="mb-8 space-y-3">
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

      {predictions.length === 0 ? (
        <EmptyState
          icon={FiActivity}
          title="No Predictions Yet"
          subtitle="Submit your study habits and lifestyle data to get your first AI-powered forecast."
          ctaLabel="Start First Prediction"
          ctaLink="/submit"
        />
      ) : (
        <>
          {/* Score + Risk Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Predicted Score */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center relative overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
                <FiTrendingUp /> Predicted Score
              </p>
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2 drop-shadow-sm">
                {latestPrediction.predicted_score.toFixed(0)}
                <span className="text-3xl text-slate-300 dark:text-slate-600 font-bold">/100</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-center items-center gap-1.5 mt-4 font-medium bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 inline-flex px-3 py-1 rounded-full">
                <FiClock /> {new Date(latestPrediction.created_at).toLocaleDateString()}
              </div>
            </motion.div>

            {/* Risk Level */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center flex flex-col justify-center relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className={`absolute top-0 left-0 w-full h-2 ${
                latestPrediction.risk_level === 'high' ? 'bg-red-500' :
                latestPrediction.risk_level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Risk Assessment</p>
              <div className={`text-4xl font-black uppercase tracking-wider drop-shadow-sm ${
                latestPrediction.risk_level === 'high' ? 'text-red-500 dark:text-red-400' :
                latestPrediction.risk_level === 'medium' ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'
              }`}>
                {latestPrediction.risk_level}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-medium">
                {latestPrediction.risk_level === 'high' ? 'Immediate intervention recommended' :
                 latestPrediction.risk_level === 'medium' ? 'Room for improvement' : 'On track for success'}
              </p>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">Impact by Category</p>
              {(() => {
                const shapData = processShapData(latestPrediction.feature_explanations);
                if (!shapData) return <p className="text-gray-400 text-sm">No data</p>;
                return (
                  <div className="space-y-3">
                    {Object.entries(shapData.categoryPercentages).map(([cat, data]) => {
                      const info = CATEGORY_INFO[cat];
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
                );
              })()}
            </motion.div>
          </div>

          {/* AI Analysis Report */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden mb-8 shadow-sm">
            <div className="p-8 border-b border-indigo-100/50 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/30 dark:to-purple-900/30">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                🧠 AI Performance Analysis Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Powered by SHAP (SHapley Additive exPlanations) — showing how each factor influenced your predicted score.
              </p>
            </div>

            {(() => {
              const shapData = processShapData(latestPrediction.feature_explanations);
              if (!shapData) return (
                <div className="p-12 text-center text-gray-400">Explainability data not available.</div>
              );

              const { features } = shapData;
              const topPositive = features.filter(f => f.impact > 0).slice(0, 3);
              const topNegative = features.filter(f => f.impact < 0).slice(0, 3);

              return (
                <div className="p-6 space-y-8">
                  {/* Strengths */}
                  {topPositive.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FiArrowUp className="text-emerald-500" /> Factors Boosting Your Score
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topPositive.map((f) => (
                          <div key={f.key} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{f.icon}</span>
                              <span className="font-bold text-emerald-800 dark:text-emerald-300">{f.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{f.percentage}%</span>
                              <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">positive contribution</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Your value: <strong>{f.value} {f.unit}</strong> · Ideal: <strong>{f.goodRange} {f.unit}</strong>
                            </div>
                            {f.insight && (
                              <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/40 p-2 rounded-lg mt-2">
                                {f.insight}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {topNegative.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FiArrowDown className="text-red-500" /> Factors Reducing Your Score
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {topNegative.map((f) => (
                          <div key={f.key} className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{f.icon}</span>
                              <span className="font-bold text-red-800 dark:text-red-300">{f.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-2xl font-black text-red-700 dark:text-red-400">{f.percentage}%</span>
                              <span className="text-xs text-red-600 dark:text-red-500 font-medium">negative impact</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              Your value: <strong>{f.value} {f.unit}</strong> · Ideal: <strong>{f.goodRange} {f.unit}</strong>
                            </div>
                            {f.insight && (
                              <p className="text-xs text-red-700 dark:text-red-300 bg-red-100/50 dark:bg-red-900/40 p-2 rounded-lg mt-2">
                                {f.insight}
                              </p>
                            )}
                          </div>
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
                          <div className="w-36 text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{f.label}</div>
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
                          <div className={`w-14 text-right text-sm font-bold ${
                            f.direction === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                          }`}>
                            {f.direction === 'positive' ? '+' : '-'}{f.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>

          {/* History Table */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-6 drop-shadow-sm">Prediction History</h3>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Predicted Score</th>
                    <th className="px-6 py-4 font-medium">Risk Level</th>
                    <th className="px-6 py-4 font-medium">Actual Score</th>
                    <th className="px-6 py-4 font-medium">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {predictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(pred.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {pred.predicted_score.toFixed(1)}
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={pred.risk_level} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {pred.actual_score ? (
                          <span className="font-medium text-gray-900 dark:text-white">{pred.actual_score}</span>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-500 text-xs">Awaiting exam results</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {pred.actual_score ? (
                          <span className={`font-bold ${
                            Math.abs(pred.predicted_score - pred.actual_score) <= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            ±{Math.abs(pred.predicted_score - pred.actual_score).toFixed(1)} pts
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-slate-500 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
