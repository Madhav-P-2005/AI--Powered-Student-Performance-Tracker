import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../services/studentService';
import * as predictionService from '../services/predictionService';
import { toast } from 'react-toastify';
import { FiSave, FiAlertCircle, FiArrowLeft, FiBook, FiMonitor, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../config/constants';

const StudentForm = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      study_hours: 15,
      self_study_hours: 10,
      online_class_hours: 5,
      attendance_percentage: 85,
      class_participation: 3,
      social_media_hours: 2,
      gaming_hours: 1,
      total_screen_time: 6,
      sleep_hours: 7,
      exercise_minutes: 30,
      caffeine_intake: 2,
      mental_health_score: 4,
      part_time_job: false,
      upcoming_deadlines: 2
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // 1. Create the Student Record
      const recordRes = await studentService.createRecord(data);
      
      // 2. Run the Prediction using the newly created record ID
      await predictionService.runPrediction(recordRes.data.id);
      
      toast.success("Prediction generated successfully!");
      navigate('/dashboard');
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate prediction. Check if all fields are correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, name, type = "number", min, max, step = "any", tooltip }) => (
    <motion.div whileHover={{ scale: 1.02 }} className="relative group">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
        {label}
        {tooltip && (
          <span className="text-indigo-400 group-hover:text-indigo-600 transition-colors tooltip" title={tooltip}>
            <FiAlertCircle size={15} />
          </span>
        )}
      </label>
      <input
        type={type}
        step={step}
        {...register(name, { 
          required: 'Required',
          min: { value: min, message: `Min is ${min}` },
          max: { value: max, message: `Max is ${max}` }
        })}
        className={`w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors[name] ? 'border-red-400 bg-red-50/50 dark:bg-red-900/30' : 'border-white/40 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}
        placeholder={min !== undefined ? `${min} - ${max}` : ''}
      />
      {errors[name] && <p className="absolute -bottom-5 left-1 mt-1 text-xs font-bold text-red-500 dark:text-red-400">{errors[name].message}</p>}
    </motion.div>
  );

  const formContainerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto pt-4 relative"
      variants={formContainerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 animate-blob" style={{ animationDelay: '2s' }}></div>

      <motion.div variants={sectionVariants} className="mb-8 flex items-center gap-5">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md rounded-2xl text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all hover:-translate-x-1 border border-white dark:border-slate-600"
        >
          <FiArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400">New Performance Prediction</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your current habits to generate an AI forecast</p>
        </div>
      </motion.div>

      <motion.form variants={sectionVariants} onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-sm overflow-hidden mb-12">
        
        {/* Section 1: Academic Data */}
        <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-50/80 dark:from-indigo-900/20 to-transparent -z-10"></div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FiBook size={20} />
            </div>
            Academic Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
            <InputField label="Total Study Hours/wk" name="study_hours" min={0} max={100} tooltip="Total hours studying (including classes)" />
            <InputField label="Self Study Hours/wk" name="self_study_hours" min={0} max={80} tooltip="Independent study hours" />
            <InputField label="Online Class Hours/wk" name="online_class_hours" min={0} max={50} />
            <InputField label="Attendance %" name="attendance_percentage" min={0} max={100} />
            <InputField label="Class Participation (1-5)" name="class_participation" min={1} max={5} tooltip="1 = Rarely, 5 = Very Active" />
            <InputField label="Upcoming Deadlines" name="upcoming_deadlines" min={0} max={20} tooltip="Number of assignments due this week" />
          </div>
        </div>

        {/* Section 2: Digital Behavior */}
        <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-purple-50/80 dark:from-purple-900/20 to-transparent -z-10"></div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-sm">
              <FiMonitor size={20} />
            </div>
            Digital Behavior
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
            <InputField label="Social Media Hours/day" name="social_media_hours" min={0} max={24} />
            <InputField label="Gaming Hours/day" name="gaming_hours" min={0} max={24} />
            <InputField label="Total Screen Time/day" name="total_screen_time" min={0} max={24} tooltip="Total hours spent looking at screens" />
          </div>
        </div>

        {/* Section 3: Lifestyle & Health */}
        <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-emerald-50/80 dark:from-emerald-900/20 to-transparent -z-10"></div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
              <FiHeart size={20} />
            </div>
            Lifestyle & Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-10">
            <InputField label="Sleep Hours/night" name="sleep_hours" min={0} max={24} />
            <InputField label="Exercise Minutes/day" name="exercise_minutes" min={0} max={300} />
            <InputField label="Caffeine Intake (cups/day)" name="caffeine_intake" min={0} max={15} />
            <InputField label="Mental Health (1-5)" name="mental_health_score" min={1} max={5} tooltip="1 = Poor, 5 = Excellent" />
            
            <div className="relative group">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center h-5">
                Part-Time Job?
              </label>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" {...register("part_time_job")} />
                  <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-200 after:border-slate-300 dark:after:border-slate-400 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 shadow-inner"></div>
                  <span className="ml-4 text-sm font-bold text-slate-700 dark:text-slate-300">Yes, working currently</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your data will be securely processed by the AI model.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70"
          >
            {isLoading ? 'Running ML Model...' : <><FiSave size={20} /> Predict Performance</>}
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default StudentForm;
