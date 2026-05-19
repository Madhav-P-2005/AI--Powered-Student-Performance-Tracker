import { useNavigate } from 'react-router-dom';
import { FiUsers, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiSearch, FiEdit3, FiSave, FiX, FiTrash2, FiUploadCloud, FiDownload, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Shared imports
import useAdminDashboard from '../hooks/useAdminDashboard';
import { containerVariants, itemVariants } from '../config/constants';
import Spinner from '../components/ui/Spinner';
import RiskBadge from '../components/ui/RiskBadge';
import ConfirmModal from '../components/ui/ConfirmModal';
import EmptyState from '../components/ui/EmptyState';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    predictions, filteredPredictions, loading,
    selectedStudent, setSelectedStudent,
    deleteModalConfig, setDeleteModalConfig,
    searchQuery, setSearchQuery,
    filterRisk, setFilterRisk,
    editingId, setEditingId,
    actualScoreInput, setActualScoreInput,
    handleSaveActualScore,
    handleDeleteStudent, confirmDeleteStudent,
    isUploading, fileInputRef, handleFileUpload, exportTableToCSV,
    stats,
    showCreateAdmin, setShowCreateAdmin,
    adminFormData, setAdminFormData,
    showDeleteAdmin, setShowDeleteAdmin,
    handleCreateAdminSubmit, handleSelfDeleteSubmit,
  } = useAdminDashboard();

  const { totalStudents, highRiskCount, mediumRiskCount, lowRiskCount, avgScore, verifiedCount } = stats;

  // Chart Data
  const riskDoughnutData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [{
      data: [highRiskCount, mediumRiskCount, lowRiskCount],
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
      borderWidth: 0,
      hoverOffset: 4
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 24, usePointStyle: true, pointStyle: 'circle', font: { weight: 'bold', size: 12, family: "'Inter', sans-serif" } }
      }
    },
    layout: { padding: 10 }
  };

  const scoreRanges = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0
  };

  predictions.forEach(p => {
    const score = p.predicted_score;
    if (score <= 10) scoreRanges['0-10']++;
    else if (score <= 20) scoreRanges['11-20']++;
    else if (score <= 30) scoreRanges['21-30']++;
    else if (score <= 40) scoreRanges['31-40']++;
    else if (score <= 50) scoreRanges['41-50']++;
    else if (score <= 60) scoreRanges['51-60']++;
    else if (score <= 70) scoreRanges['61-70']++;
    else if (score <= 80) scoreRanges['71-80']++;
    else if (score <= 90) scoreRanges['81-90']++;
    else scoreRanges['91-100']++;
  });

  const scoreBarData = {
    labels: Object.keys(scoreRanges),
    datasets: [{
      label: 'Number of Students',
      data: Object.values(scoreRanges),
      backgroundColor: Object.keys(scoreRanges).map(label => {
        const maxVal = parseInt(label.split('-')[1]);
        if (maxVal <= 40) return '#ef4444';
        if (maxVal <= 70) return '#f59e0b';
        return '#10b981';
      }),
      borderRadius: 4,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    layout: { padding: { top: 10, bottom: 10 } }
  };

  if (loading) return <Spinner />;

  return (
    <motion.div 
      className="max-w-7xl mx-auto pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">Admin Command Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            System-wide overview of all student predictions and performance analytics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowCreateAdmin(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <FiUsers /> Transfer Admin
          </button>
          <button 
            onClick={() => setShowDeleteAdmin(true)}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <FiTrash2 /> Delete My Account
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center mx-auto mb-3">
            <FiUsers className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <p className="text-4xl font-black text-slate-800 dark:text-white">{totalStudents}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Students</p>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center mx-auto mb-3">
            <FiTrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <p className="text-4xl font-black text-slate-800 dark:text-white">{avgScore}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">Avg Score</p>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center mx-auto mb-3 mt-1">
            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
          <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400">{lowRiskCount}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1">Low Risk</p>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center mx-auto mb-3 mt-1">
            <FiAlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
          </div>
          <p className="text-4xl font-black text-amber-700 dark:text-amber-400">{mediumRiskCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mt-1">Medium Risk</p>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-3xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 flex items-center justify-center mx-auto mb-3 mt-1">
            <FiAlertTriangle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <p className="text-4xl font-black text-red-700 dark:text-red-400">{highRiskCount}</p>
          <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mt-1">High Risk</p>
        </motion.div>
      </div>

      {/* Analytics Charts */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 w-full text-left">Risk Distribution</h3>
            <div className="flex-1 w-full relative min-h-[250px] lg:min-h-[300px]">
              <div className="absolute inset-0 pb-4">
                <Doughnut data={riskDoughnutData} options={doughnutOptions} />
              </div>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Score Distribution</h3>
            <div className="flex-1 w-full relative min-h-[250px] lg:min-h-[300px]">
              <div className="absolute inset-0">
                <Bar data={scoreBarData} options={barOptions} />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Admin Actions Bar */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex-1 w-full relative">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="csv-upload" />
          <label 
            htmlFor="csv-upload"
            className={`flex flex-col items-center justify-center w-full h-32 md:h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              isUploading ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 leading-loose' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {isUploading ? (
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 font-bold">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                Processing CSV...
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-slate-400">
                <FiUploadCloud className="w-8 h-8 mb-2 text-indigo-500 dark:text-indigo-400" />
                <p className="text-sm font-semibold">
                  <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Batch Predict from CSV with Student Metrics</p>
              </div>
            )}
          </label>
        </div>
        <div className="flex flex-col justify-center h-full w-full md:w-auto">
          <button 
            onClick={exportTableToCSV}
            className="flex items-center justify-center gap-2 bg-slate-900 border border-transparent dark:bg-slate-700 dark:border-slate-600 hover:bg-black dark:hover:bg-slate-600 text-white px-6 py-4 md:py-8 rounded-2xl font-bold transition-all shadow-md hover:shadow-xl w-full h-full"
          >
            <FiDownload size={20} />
            Export to CSV
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 glass-panel rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800/80 dark:border-slate-700 dark:text-white transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'high', 'medium', 'low'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
                filterRisk === risk
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30 border-transparent'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {risk === 'all' ? 'All' : risk.charAt(0).toUpperCase() + risk.slice(1) + ' Risk'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Student Predictions Table */}
      <motion.div variants={itemVariants}>
        {filteredPredictions.length === 0 ? (
          <EmptyState icon={FiSearch} title="No predictions found matching your filters." />
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200/50 dark:border-slate-700">
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">#</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Student</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Date</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Predicted</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Risk</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Actual Score</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs">Accuracy</th>
                    <th className="px-6 py-5 font-bold uppercase tracking-wider text-xs text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {filteredPredictions.map((pred, idx) => (
                    <tr key={pred.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => navigate(`/admin/student/${pred.id}`)}
                            className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-all text-left inline-flex items-center gap-1.5"
                          >
                            {pred.user_name || 'Unknown'}
                            <FiExternalLink size={12} className="opacity-50" />
                          </button>
                          {pred.is_guest && (
                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-slate-200 dark:border-slate-600">
                              CSV
                            </span>
                          )}
                        </div>
                        {pred.user_email && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {pred.user_email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(pred.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {pred.predicted_score.toFixed(1)}
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={pred.risk_level} />
                      </td>
                      <td className="px-6 py-4">
                        {editingId === pred.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number" min="0" max="100"
                              value={actualScoreInput}
                              onChange={(e) => setActualScoreInput(e.target.value)}
                              className="w-20 px-2 py-1 border border-indigo-300 dark:border-indigo-600 bg-transparent dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="0-100" autoFocus
                            />
                            <button onClick={() => handleSaveActualScore(pred.id)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                              <FiSave size={16} />
                            </button>
                            <button onClick={() => { setEditingId(null); setActualScoreInput(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <FiX size={16} />
                            </button>
                          </div>
                        ) : pred.actual_score ? (
                          <span className="font-medium text-gray-900 dark:text-white">{pred.actual_score}</span>
                        ) : (
                          <button
                            onClick={() => { setEditingId(pred.id); setActualScoreInput(''); }}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                          >
                            <FiEdit3 size={14} /> Enter Score
                          </button>
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
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteStudent(pred.id, pred.user_id, pred.user_name || 'Unknown', pred.is_guest)}
                          className="text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800/50 shadow-sm"
                          title="Delete Student"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Accuracy Summary */}
      {verifiedCount > 0 && (
        <motion.div variants={itemVariants} className="mt-8 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100/50 dark:border-indigo-800/30 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 drop-shadow-sm flex items-center gap-2">
            📊 Model Accuracy Summary
          </h3>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Out of <strong>{verifiedCount}</strong> verified predictions, the AI model's average error is{' '}
            <strong className="text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg inline-block">
              ±{(predictions.filter(p => p.actual_score).reduce((sum, p) => sum + Math.abs(p.predicted_score - p.actual_score), 0) / verifiedCount).toFixed(1)} points
            </strong>.
          </p>
        </motion.div>
      )}



      {/* Custom Delete Options Modal */}
      <AnimatePresence>
        {deleteModalConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteModalConfig({ ...deleteModalConfig, isOpen: false })} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center mx-auto mb-4">
                <FiTrash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete {deleteModalConfig.studentName}?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose how you want to handle this deletion.</p>
              
              <div className="space-y-3">
                {deleteModalConfig.isGuest ? (
                  <button 
                    onClick={confirmDeleteRecordsOnly}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex flex-col items-center justify-center gap-1"
                  >
                    <span>Delete CSV Student</span>
                    <span className="text-[10px] font-normal opacity-80">Removes this student from the batch</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={confirmDeleteRecordsOnly}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold py-3 px-4 rounded-xl transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <span>Delete Prediction Records Only</span>
                      <span className="text-[10px] font-normal opacity-80">Allows student to submit form again</span>
                    </button>
                    
                    <button 
                      onClick={confirmDeleteAccount}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md flex flex-col items-center justify-center gap-1"
                    >
                      <span>Delete Entire Account</span>
                      <span className="text-[10px] font-normal opacity-80">Permanently wipes user from database</span>
                    </button>
                  </>
                )}
              </div>
              <button onClick={() => setDeleteModalConfig({ ...deleteModalConfig, isOpen: false })} className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {showCreateAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateAdmin(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Transfer Admin Rights</h3>
                <button onClick={() => setShowCreateAdmin(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full"><FiX /></button>
              </div>
              <p className="text-sm text-slate-500 mb-6">Create a new Universal Admin account. Once created, you can safely log out and delete your original account.</p>
              <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input type="email" required className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white" value={adminFormData.email} onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input type="text" required className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white" value={adminFormData.username} onChange={(e) => setAdminFormData({...adminFormData, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input type="password" required minLength={8} className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 dark:text-white" value={adminFormData.password} onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all">Create Admin</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Self Modal */}
      <ConfirmModal
        isOpen={showDeleteAdmin}
        onClose={() => setShowDeleteAdmin(false)}
        onConfirm={handleSelfDeleteSubmit}
        title="Delete Universal Admin?"
        message={<><span className="text-red-500 font-bold">WARNING:</span> You are about to permanently delete your own Universal Admin account. This action cannot be undone. Please ensure you have created a replacement Admin first, otherwise the system will be orphaned.</>}
        confirmLabel="Wipe My Account"
      />
    </motion.div>
  );
};

export default AdminDashboard;
