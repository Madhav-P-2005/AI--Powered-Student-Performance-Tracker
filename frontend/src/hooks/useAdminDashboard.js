// hooks/useAdminDashboard.js — Data-fetching + business logic for Admin Dashboard

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import * as predictionService from '../services/predictionService';
import * as authService from '../services/authService';

/**
 * Manages all Admin Dashboard state: predictions, filtering, CRUD, CSV upload/export.
 * Extracted from AdminDashboard.jsx to keep the page component lean.
 */
const useAdminDashboard = () => {
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

  // Auth Context for Admin Management
  const { user, logout } = useAuth();
  
  // Admin Transfer State
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ email: '', username: '', password: '' });
  const [showDeleteAdmin, setShowDeleteAdmin] = useState(false);

  // Fetch all predictions on mount
  useEffect(() => {
    fetchAllPredictions();
  }, []);

  const fetchAllPredictions = async () => {
    try {
      setLoading(true);
      const res = await predictionService.getHistory();
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
      await predictionService.updateActualScore(predictionId, score);
      toast.success('Actual score updated!');
      setEditingId(null);
      setActualScoreInput('');
      fetchAllPredictions();
    } catch (error) {
      toast.error('Failed to update score');
      console.error(error);
    }
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteStudent = (predictionId, userId, studentName, isGuest) => {
    setDeleteModalConfig({ isOpen: true, predictionId, userId, studentName, isGuest });
  };

  // Delete ONLY the records (keep account)
  const confirmDeleteRecordsOnly = async () => {
    const { predictionId, studentName } = deleteModalConfig;
    try {
      await predictionService.deletePrediction(predictionId);
      toast.success(`Records for ${studentName} successfully deleted.`);
      setDeleteModalConfig({ isOpen: false, predictionId: null, userId: null, studentName: '', isGuest: false });
      fetchAllPredictions();
    } catch (error) {
      toast.error('Failed to delete records');
      console.error('Delete error:', error);
    }
  };

  // Delete the ENTIRE account
  const confirmDeleteAccount = async () => {
    const { userId, studentName } = deleteModalConfig;
    if (!userId) {
      toast.error('Cannot delete account: Missing user ID.');
      return;
    }
    try {
      await authService.deleteUser(userId);
      toast.success(`Account for ${studentName} completely deleted.`);
      setDeleteModalConfig({ isOpen: false, predictionId: null, userId: null, studentName: '', isGuest: false });
      fetchAllPredictions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete account');
      console.error('Delete error:', error);
    }
  };

  // Admin Transfer Handlers
  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.createAdmin(adminFormData);
      toast.success(`New Admin ${adminFormData.username} created! You may now safely delete yourself if you are transferring.`);
      setShowCreateAdmin(false);
      setAdminFormData({ email: '', username: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create admin');
    }
  };

  const handleSelfDeleteSubmit = async () => {
    try {
      await authService.deleteUser(user.id);
      toast.success('Your admin account has been completely wiped.');
      logout();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete your account. Are you sure you are the only Admin?');
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
      const res = await predictionService.uploadCSV(formData);
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

  return {
    // Data
    predictions,
    filteredPredictions,
    loading,
    selectedStudent,
    setSelectedStudent,
    deleteModalConfig,
    setDeleteModalConfig,

    // Search & Filter
    searchQuery,
    setSearchQuery,
    filterRisk,
    setFilterRisk,

    // Actual Score Editing
    editingId,
    setEditingId,
    actualScoreInput,
    setActualScoreInput,
    handleSaveActualScore,

    // CRUD
    handleDeleteStudent,
    confirmDeleteRecordsOnly,
    confirmDeleteAccount,

    // CSV
    isUploading,
    fileInputRef,
    handleFileUpload,
    exportTableToCSV,

    // Stats
    stats: { totalStudents, highRiskCount, mediumRiskCount, lowRiskCount, avgScore, verifiedCount },

    // Admin Transfer
    showCreateAdmin, setShowCreateAdmin,
    adminFormData, setAdminFormData,
    showDeleteAdmin, setShowDeleteAdmin,
    handleCreateAdminSubmit, handleSelfDeleteSubmit,
  };
};

export default useAdminDashboard;
