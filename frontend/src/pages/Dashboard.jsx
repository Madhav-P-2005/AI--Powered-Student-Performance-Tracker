import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

// Shared imports
import usePredictions from '../hooks/usePredictions';
import { containerVariants, itemVariants } from '../config/constants';
import Spinner from '../components/ui/Spinner';
import RiskBadge from '../components/ui/RiskBadge';
import EmptyState from '../components/ui/EmptyState';
import StudentPredictionView from '../components/StudentPredictionView';

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
          {/* Reusable Student Prediction View — shows score, risk, SHAP, insights */}
          <StudentPredictionView
            prediction={latestPrediction}
            alerts={alerts}
            isAdminView={false}
          />

          {/* History Table */}
          <motion.div variants={itemVariants} className="mt-8">
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
