// pages/AdminStudentView.jsx — Full-page student dashboard view for admin
// Route: /admin/student/:predictionId
// Shows the exact same prediction dashboard that the student sees.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import * as predictionService from '../services/predictionService';
import StudentPredictionView from '../components/StudentPredictionView';
import Spinner from '../components/ui/Spinner';
import { containerVariants, itemVariants } from '../config/constants';

const AdminStudentView = () => {
  const { predictionId } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        // Fetch all predictions and find the one matching the ID
        const res = await predictionService.getHistory();
        const data = res.data.results || res.data;
        const allPredictions = Array.isArray(data) ? data : [];
        const found = allPredictions.find(p => p.id === parseInt(predictionId));

        if (found) {
          setPrediction(found);
        } else {
          toast.error('Prediction not found.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching prediction:', error);
        toast.error('Failed to load student prediction.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [predictionId, navigate]);

  if (loading) return <Spinner />;
  if (!prediction) return null;

  return (
    <motion.div
      className="max-w-6xl mx-auto pt-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header with back button */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center w-11 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                {(prediction.user_name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                  {prediction.user_name || 'Unknown Student'}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold mt-1 mb-1">
                  {prediction.user_email && <a href={`mailto:${prediction.user_email}`} className="mr-4 hover:text-indigo-500 transition-colors">📧 {prediction.user_email}</a>}
                  {prediction.user_phone && <a href={`tel:${prediction.user_phone}`} className="hover:text-indigo-500 transition-colors">📱 {prediction.user_phone}</a>}
                  {!prediction.user_email && !prediction.user_phone && <span className="italic text-slate-400">No contact info</span>}
                </p>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-medium">
                  Prediction #{prediction.id} · {new Date(prediction.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
        >
          <FiArrowLeft size={16} /> Back to Admin Panel
        </button>
      </motion.div>

      {/* Full Student Dashboard View — reused from shared component */}
      <StudentPredictionView
        prediction={prediction}
        alerts={null}
        studentName={prediction.user_name}
        isAdminView={true}
      />
    </motion.div>
  );
};

export default AdminStudentView;
