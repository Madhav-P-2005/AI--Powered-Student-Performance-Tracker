import { useState, useEffect, useRef } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiTrendingDown, FiSearch, FiEdit3, FiSave, FiX, FiTrash2, FiUploadCloud, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [actualScoreInput, setActualScoreInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, userId: null, studentName: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAllPredictions();
  }, []);

  const fetchAllPredictions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/predictions/history/');
      const data = res.data.results || res.data;
      setPredictions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  // Submit actual score for a prediction
  const handleSaveActualScore = async (predictionId) => {
    const score = parseFloat(actualScoreInput);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Enter a valid score between 0 and 100');
      return;
    }

    try {
      await api.patch(`/predictions/${predictionId}/actual/`, {
        actual_score: score,
      });
      toast.success('Actual score updated!');
      setEditingId(null);
      setActualScoreInput('');
      fetchAllPredictions(); // Refresh data
    } catch (error) {
      toast.error('Failed to update score');
      console.error(error);
    }
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteStudent = (predictionId, userId, studentName) => {
    if (!userId) {
      toast.error('Cannot delete: Missing user ID. Note: Old predictions may not have a user_id attached.');
      return;
    }
    setDeleteModalConfig({ isOpen: true, userId, studentName });
  };

  // Actual Delete API Call
  const confirmDeleteStudent = async () => {
    const { userId, studentName } = deleteModalConfig;
    try {
      await api.delete(`/auth/users/${userId}/`);
      toast.success(`Student ${studentName} successfully deleted.`);
      setDeleteModalConfig({ isOpen: false, userId: null, studentName: '' });
      fetchAllPredictions(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete student');
      console.error('Delete error:', error);
    }
  };

  // Filter predictions
  const filteredPredictions = predictions.filter((pred) => {
    const studentName = pred.user_name || '';
    const matchesSearch = studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || pred.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  // Handle CSV Bulk Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await api.post('/predictions/csv-upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Successfully processed ${res.data.processed} rows!`);
      if (res.data.errors > 0) {
        toast.warning(`${res.data.errors} rows had formatting errors.`);
      }
      fetchAllPredictions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload CSV');
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Export current table to CSV
  const exportTableToCSV = () => {
    if (filteredPredictions.length === 0) {
      toast.warning('No data to export.');
      return;
    }

    const headers = ['Student ID', 'Student Name', 'Date', 'Predicted Score', 'Risk Level', 'Actual Score'];
    const rows = filteredPredictions.map(p => [
      p.user_id || 'N/A',
      p.user_name || 'Unknown',
      new Date(p.created_at).toLocaleDateString(),
      p.predicted_score.toFixed(1),
      p.risk_level,
      p.actual_score || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `predictions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalStudents = new Set(predictions.map(p => p.user_name)).size;
  const highRiskCount = predictions.filter(p => p.risk_level === 'high').length;
  const mediumRiskCount = predictions.filter(p => p.risk_level === 'medium').length;
  const lowRiskCount = predictions.filter(p => p.risk_level === 'low').length;
  const avgScore = predictions.length > 0
    ? (predictions.reduce((sum, p) => sum + p.predicted_score, 0) / predictions.length).toFixed(1)
    : 0;
  const verifiedCount = predictions.filter(p => p.actual_score).length;

  // Chart Data Preparation
  const riskDoughnutData = {
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    datasets: [
      {
        data: [highRiskCount, mediumRiskCount, lowRiskCount],
        backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 24,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { weight: 'bold', size: 12, family: "'Inter', sans-serif" }
        }
      }
    },
    layout: { padding: 10 }
  };

  // Granular Score Intervals (10-point buckets)
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
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(scoreRanges),
        backgroundColor: Object.keys(scoreRanges).map(label => {
          const maxVal = parseInt(label.split('-')[1]);
          if (maxVal <= 40) return '#ef4444'; // Red for failing
          if (maxVal <= 70) return '#f59e0b'; // Amber for medium
          return '#10b981'; // Green for passing
        }),
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    layout: { padding: { top: 10, bottom: 10 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">Admin Command Center</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          System-wide overview of all student predictions and performance analytics.
        </p>
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
        
        {/* CSV Upload Area */}
        <div className="flex-1 w-full relative">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            className="hidden" 
            id="csv-upload"
          />
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

        {/* Export Button */}
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
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-slate-400 dark:text-slate-500" size={20} />
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
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-600">
              <FiSearch size={28} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No predictions found matching your filters.</p>
          </div>
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
                      <button 
                        onClick={() => setSelectedStudent(pred)}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-all text-left"
                      >
                        {pred.user_name || 'Unknown'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(pred.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      {pred.predicted_score.toFixed(1)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                        pred.risk_level === 'high' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        pred.risk_level === 'medium' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                        'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {pred.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === pred.id ? (
                        <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={actualScoreInput}
                              onChange={(e) => setActualScoreInput(e.target.value)}
                              className="w-20 px-2 py-1 border border-indigo-300 dark:border-indigo-600 bg-transparent dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="0-100"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveActualScore(pred.id)}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                            >
                              <FiSave size={16} />
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setActualScoreInput(''); }}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
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
                          onClick={() => handleDeleteStudent(pred.id, pred.user_id, pred.user_name || 'Unknown')}
                          className="text-slate-400 hover:text-red-600 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-xl transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800/50 shadow-sm"
                          title="Delete Student completely"
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

      {/* Student Insights Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{selectedStudent.user_name || 'Unknown'}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Predicted Score: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedStudent.predicted_score.toFixed(1)}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body: SHAP Insights */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">AI Factor Breakdown</h4>
                
                {selectedStudent.feature_explanations && Object.keys(selectedStudent.feature_explanations).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(selectedStudent.feature_explanations).map(([featureName, expl], i) => (
                      <div key={i} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span className="text-slate-700 dark:text-slate-200">{featureName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          <span className={expl.impact > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                            {expl.impact > 0 ? '+' : ''}{expl.impact} pts
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                          {expl.impact < 0 && (
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.abs(expl.impact) * 3)}%` }}
                              className="h-full bg-rose-500 ml-auto"
                            />
                          )}
                          {expl.impact > 0 && (
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, expl.impact * 3)}%` }}
                              className="h-full bg-emerald-500"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 border-dashed animate-pulse">
                    No detailed factor breakdown available. Please ensure the backend is running with SHAP installed (`pip install shap`).
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalConfig.isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalConfig({ ...deleteModalConfig, isOpen: false })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-20 p-8 text-center"
            >
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100 dark:border-rose-800/50">
                <FiTrash2 size={32} className="text-rose-600 dark:text-rose-400" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Are you sure?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                You are about to delete <span className="font-bold text-slate-800 dark:text-slate-200">{deleteModalConfig.studentName}</span>'s account. This will permanently remove all their performance data and predictions.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteModalConfig({ ...deleteModalConfig, isOpen: false })}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteStudent}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-0.5 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
