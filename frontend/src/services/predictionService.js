// services/predictionService.js — Prediction API calls

import api from '../config/api';

/**
 * Run ML prediction on a student record.
 */
export const runPrediction = (studentRecordId) => {
  return api.post('/predictions/run/', { student_record_id: studentRecordId });
};

/**
 * Get prediction history (students see own, admins see all).
 */
export const getHistory = () => {
  return api.get('/predictions/history/');
};

/**
 * Get smart alerts for the current student.
 */
export const getAlerts = () => {
  return api.get('/predictions/alerts/');
};

/**
 * Delete a specific prediction record (Admin only).
 */
export const deletePrediction = (id) => {
  return api.delete(`/predictions/${id}/`);
};

/**
 * Get trend analysis data for the current student.
 */
export const getTrends = () => {
  return api.get('/predictions/trends/');
};

/**
 * Update a prediction with the actual exam score.
 */
export const updateActualScore = (predictionId, actualScore) => {
  return api.patch(`/predictions/${predictionId}/actual/`, {
    actual_score: actualScore,
  });
};

/**
 * Admin: Upload CSV for batch predictions.
 */
export const uploadCSV = (formData) => {
  return api.post('/predictions/csv-upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Get model accuracy analytics (admin).
 */
export const getAccuracy = () => {
  return api.get('/predictions/accuracy/');
};
