// hooks/usePredictions.js — Data-fetching hook for Student Dashboard

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as predictionService from '../services/predictionService';

/**
 * Fetches prediction history and alerts for the current student.
 * Extracted from Dashboard.jsx to keep the page component lean.
 */
const usePredictions = (user) => {
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState({ alerts: [], risk_status: 'no_data' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const historyRes = await predictionService.getHistory();
        const historyData = historyRes.data.results || historyRes.data;
        setPredictions(Array.isArray(historyData) ? historyData : []);

        try {
          const alertsRes = await predictionService.getAlerts();
          setAlerts(alertsRes.data);
        } catch (e) {
          console.error("Alerts not ready or empty", e);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  return { predictions, alerts, loading, latestPrediction };
};

export default usePredictions;
