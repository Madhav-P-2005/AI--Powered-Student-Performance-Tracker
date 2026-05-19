import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as studentService from '../services/studentService';
import * as predictionService from '../services/predictionService';
import { toast } from 'react-toastify';
import { FiSave, FiAlertCircle, FiArrowLeft, FiBook, FiMonitor, FiHeart, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../config/constants';

const StudentForm = () => {
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm({
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

  // ============================================================
  // Innovative StepperField with smart active guide
  // ============================================================
  const InputField = ({ label, name, type = "number", min, max, step = 1, description, guide, icon }) => {
    const currentValue = watch(name);
    // Find which guide range the current value falls into
    const activeGuide = guide?.find(g => currentValue >= g.min && currentValue <= g.max);
    
    // Determine the color theme for the active guide
    const themeColor = activeGuide?.color === 'green' ? 'emerald' :
                       activeGuide?.color === 'yellow' ? 'amber' :
                       activeGuide?.color === 'red' ? 'red' : 'indigo';

    const handleDecrement = (e) => {
      e.preventDefault();
      const val = Number(currentValue) || 0;
      if (min === undefined || val - step >= min) {
        setValue(name, Number((val - step).toFixed(2)), { shouldValidate: true, shouldDirty: true });
      } else if (val > min) {
        setValue(name, min, { shouldValidate: true, shouldDirty: true });
      }
    };

    const handleIncrement = (e) => {
      e.preventDefault();
      const val = Number(currentValue) || 0;
      if (max === undefined || val + step <= max) {
        setValue(name, Number((val + step).toFixed(2)), { shouldValidate: true, shouldDirty: true });
      } else if (val < max) {
        setValue(name, max, { shouldValidate: true, shouldDirty: true });
      }
    };

    return (
      <motion.div whileHover={{ scale: 1.01 }} className="relative group flex flex-col h-full justify-between">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            {icon && <span className="text-base">{icon}</span>}
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-relaxed">{description}</p>
          )}
        </div>
        
        <div>
          {/* Custom Stepper Input */}
          <div className={`flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border rounded-2xl overflow-hidden transition-all shadow-sm group-hover:shadow focus-within:ring-2 focus-within:ring-${themeColor}-500/30 focus-within:border-${themeColor}-400 ${errors[name] ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}>
            <button 
              type="button"
              onClick={handleDecrement}
              className={`px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-${themeColor}-600 dark:text-slate-400 dark:hover:text-${themeColor}-400 font-black text-lg transition-colors border-r border-slate-200 dark:border-slate-600 flex-shrink-0 active:bg-slate-200 dark:active:bg-slate-500 select-none`}
            >
              −
            </button>
            <input
              type={type}
              step={step}
              {...register(name, { 
                required: 'Required',
                min: { value: min, message: `Minimum is ${min}` },
                max: { value: max, message: `Maximum is ${max}` },
                valueAsNumber: type === 'number'
              })}
              className="flex-1 w-full text-center py-3 bg-transparent outline-none font-black text-slate-800 dark:text-white text-lg"
              placeholder={min !== undefined ? `${min} – ${max}` : ''}
            />
            <button 
              type="button"
              onClick={handleIncrement}
              className={`px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 hover:text-${themeColor}-600 dark:text-slate-400 dark:hover:text-${themeColor}-400 font-black text-lg transition-colors border-l border-slate-200 dark:border-slate-600 flex-shrink-0 active:bg-slate-200 dark:active:bg-slate-500 select-none`}
            >
              +
            </button>
          </div>

          {/* Context Bar (Visual Indicator) */}
          {min !== undefined && max !== undefined && (
            <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
              <div 
                className={`absolute top-0 left-0 h-full bg-${themeColor}-500 transition-all duration-300 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, ((currentValue - min) / (max - min)) * 100))}%` }}
              ></div>
            </div>
          )}

          {/* Smart Active Guide (Only shows the relevant message) */}
          <div className="mt-2 h-12 flex items-start"> 
            {activeGuide ? (
              <motion.div 
                key={activeGuide.label} // forces re-animation on change
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`flex items-start gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-lg bg-${themeColor}-50/50 dark:bg-${themeColor}-900/20 text-${themeColor}-700 dark:text-${themeColor}-400 border border-${themeColor}-200/50 dark:border-${themeColor}-800/50`}
              >
                <span className={`w-2 h-2 mt-1 rounded-full shrink-0 bg-${themeColor}-500`}></span>
                <span>{activeGuide.label}</span>
              </motion.div>
            ) : (
               <div className="text-xs text-slate-400 dark:text-slate-500 italic px-2 py-1.5">Enter a valid value for insights...</div>
            )}
          </div>
          {errors[name] && <p className="absolute -bottom-5 left-1 mt-1 text-xs font-bold text-red-500 dark:text-red-400">{errors[name].message}</p>}
        </div>
      </motion.div>
    );
  };

  // ============================================================
  // Scale Selector for ordinal (1-5) features
  // ============================================================
  const ScaleSelector = ({ name, label, options, activeColor = 'indigo' }) => (
    <motion.div whileHover={{ scale: 1.01 }} className="relative group md:col-span-1">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <Controller
        name={name}
        control={control}
        rules={{ required: 'Required' }}
        render={({ field }) => (
          <div className="space-y-1.5">
            {options.map(opt => (
              <label key={opt.value}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                  Number(field.value) === opt.value
                    ? `bg-${activeColor}-50 dark:bg-${activeColor}-900/30 border-${activeColor}-300 dark:border-${activeColor}-600 shadow-sm`
                    : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-700'
                }`}
                style={Number(field.value) === opt.value ? { backgroundColor: activeColor === 'emerald' ? 'rgb(236 253 245)' : 'rgb(238 242 255)', borderColor: activeColor === 'emerald' ? 'rgb(110 231 183)' : 'rgb(165 180 252)' } : {}}
              >
                <input type="radio" className="sr-only" {...field} value={opt.value} checked={Number(field.value) === opt.value} onChange={() => field.onChange(opt.value)} />
                <span className="text-base">{opt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{opt.value} — {opt.label}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">{opt.desc}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      />
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

      {/* How to fill guide */}
      <motion.div variants={sectionVariants} className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 flex items-start gap-3">
        <FiInfo className="text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>How to fill this form:</strong> Enter your typical weekly/daily habits honestly. Each field shows a <span className="font-bold text-emerald-600">●&nbsp;green</span> (optimal), <span className="font-bold text-amber-600">●&nbsp;yellow</span> (moderate), or <span className="font-bold text-red-500">●&nbsp;red</span> (needs attention) indicator based on your value. The AI uses these to predict your academic performance.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <InputField
              label="Total Study Hours per Week"
              name="study_hours"
              icon="📚"
              min={0} max={100}
              description="Include all study time: classroom, tuition, library, and home study combined."
              guide={[
                { min: 0, max: 5, label: 'Very Low — Barely studying, high risk of poor performance', color: 'red' },
                { min: 6, max: 10, label: 'Below Average — Not enough for most courses', color: 'red' },
                { min: 11, max: 14, label: 'Average — Meeting minimum requirements', color: 'yellow' },
                { min: 15, max: 25, label: 'Optimal — Sweet spot for best results', color: 'green' },
                { min: 26, max: 100, label: 'High — Great dedication, ensure you take breaks', color: 'green' },
              ]}
            />
            <InputField
              label="Self Study Hours per Week"
              name="self_study_hours"
              icon="📖"
              min={0} max={80}
              description="Hours you study independently — at home, library, or on your own (excluding classes)."
              guide={[
                { min: 0, max: 3, label: 'Very Low — Relying entirely on classes, not enough', color: 'red' },
                { min: 4, max: 8, label: 'Below Average — Some effort but needs improvement', color: 'yellow' },
                { min: 9, max: 15, label: 'Good — Solid independent learning habit', color: 'green' },
                { min: 16, max: 80, label: 'Excellent — Strong self-learner', color: 'green' },
              ]}
            />
            <InputField
              label="Online Class Hours per Week"
              name="online_class_hours"
              icon="💻"
              min={0} max={50}
              description="Hours spent in online lectures, recorded classes, MOOCs, or video lessons."
              guide={[
                { min: 0, max: 2, label: 'Minimal online learning', color: 'yellow' },
                { min: 3, max: 10, label: 'Moderate — Good supplement to in-person classes', color: 'green' },
                { min: 11, max: 50, label: 'Heavy — Ensure active engagement, not passive watching', color: 'yellow' },
              ]}
            />
            <InputField
              label="Attendance Percentage"
              name="attendance_percentage"
              icon="📋"
              min={0} max={100}
              description="Your overall class attendance rate. Check your student portal or count missed days."
              guide={[
                { min: 0, max: 50, label: 'Critical — Missing most classes, very high risk', color: 'red' },
                { min: 51, max: 70, label: 'Low — Important lessons and explanations are being missed', color: 'red' },
                { min: 71, max: 84, label: 'Average — Meets minimum but leaves no safety margin', color: 'yellow' },
                { min: 85, max: 95, label: 'Good — Consistent attendance with room for emergencies', color: 'green' },
                { min: 96, max: 100, label: 'Excellent — Near perfect, no gaps in learning', color: 'green' },
              ]}
            />

            {/* Class Participation — Scale Selector */}
            <ScaleSelector
              name="class_participation"
              label="Class Participation"
              activeColor="indigo"
              options={[
                { value: 1, emoji: '🤫', label: 'Rarely', desc: 'Seldom speaks up, doesn\'t engage in discussions' },
                { value: 2, emoji: '🙂', label: 'Occasionally', desc: 'Only participates when directly asked by teacher' },
                { value: 3, emoji: '🙋', label: 'Moderate', desc: 'Sometimes asks questions and joins group work' },
                { value: 4, emoji: '✋', label: 'Active', desc: 'Regularly raises hand, asks doubts, joins discussions' },
                { value: 5, emoji: '🌟', label: 'Very Active', desc: 'Leads discussions, helps classmates, always engaged' },
              ]}
            />

            <InputField
              label="Upcoming Deadlines"
              name="upcoming_deadlines"
              icon="📅"
              min={0} max={20}
              description="Number of assignments, projects, or exams due in the coming week."
              guide={[
                { min: 0, max: 2, label: 'Manageable — Comfortable workload', color: 'green' },
                { min: 3, max: 4, label: 'Moderate — Needs good time management', color: 'yellow' },
                { min: 5, max: 6, label: 'Heavy — High pressure, risk of rushed work', color: 'red' },
                { min: 7, max: 20, label: 'Overwhelming — Too many concurrent tasks', color: 'red' },
              ]}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
            <InputField
              label="Social Media (hrs/day)"
              name="social_media_hours"
              icon="📱"
              min={0} max={24}
              description="Daily time on Instagram, YouTube, Twitter, Snapchat, TikTok etc."
              guide={[
                { min: 0, max: 1, label: 'Low — Minimal distraction, great for focus', color: 'green' },
                { min: 1.1, max: 2, label: 'Healthy — Social connection without academic impact', color: 'green' },
                { min: 2.1, max: 4, label: 'Moderate Risk — Starting to eat into study time', color: 'yellow' },
                { min: 4.1, max: 24, label: 'High Risk — Significantly reducing productive hours', color: 'red' },
              ]}
            />
            <InputField
              label="Gaming (hrs/day)"
              name="gaming_hours"
              icon="🎮"
              min={0} max={24}
              description="Daily time spent on mobile games, PC games, console gaming."
              guide={[
                { min: 0, max: 1, label: 'Healthy — Good stress relief without impact', color: 'green' },
                { min: 1.1, max: 2, label: 'Moderate — At the upper limit, watch your time', color: 'yellow' },
                { min: 2.1, max: 4, label: 'Concerning — Consuming significant study time', color: 'red' },
                { min: 4.1, max: 24, label: 'Excessive — Major time sink, strongly affects grades', color: 'red' },
              ]}
            />
            <InputField
              label="Total Screen Time (hrs/day)"
              name="total_screen_time"
              icon="🖥️"
              min={0} max={24}
              description="All screen time combined: phone, laptop, TV, tablet (including study-related)."
              guide={[
                { min: 0, max: 3, label: 'Low — Eyes and mind get adequate rest', color: 'green' },
                { min: 3.1, max: 6, label: 'Moderate — Acceptable if mostly study-related', color: 'green' },
                { min: 6.1, max: 10, label: 'High — Eye strain and fatigue likely', color: 'yellow' },
                { min: 10.1, max: 24, label: 'Excessive — Disrupts focus and sleep quality', color: 'red' },
              ]}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <InputField
              label="Sleep Hours per Night"
              name="sleep_hours"
              icon="😴"
              min={0} max={24}
              description="Average hours of sleep you get each night. Be honest — this strongly affects your score."
              guide={[
                { min: 0, max: 4, label: 'Severe — Dangerous for health and cognitive function', color: 'red' },
                { min: 4.1, max: 6, label: 'Insufficient — Brain recovery and memory consolidation impaired', color: 'red' },
                { min: 6.1, max: 7, label: 'Borderline — Just barely enough, aim higher', color: 'yellow' },
                { min: 7.1, max: 9, label: 'Optimal — Best range for memory, focus, and mood', color: 'green' },
                { min: 9.1, max: 24, label: 'Oversleeping — May reduce productive hours', color: 'yellow' },
              ]}
            />
            <InputField
              label="Exercise (minutes/day)"
              name="exercise_minutes"
              icon="🏃"
              min={0} max={300}
              description="Daily physical activity: walking, gym, sports, yoga, cycling, etc."
              guide={[
                { min: 0, max: 10, label: 'Sedentary — Almost no activity, impacts brain sharpness', color: 'red' },
                { min: 11, max: 20, label: 'Low — Below minimum for cognitive benefits', color: 'yellow' },
                { min: 21, max: 30, label: 'Adequate — Meets daily minimum recommendations', color: 'green' },
                { min: 31, max: 60, label: 'Good — Optimal for focus, mood, and academic performance', color: 'green' },
                { min: 61, max: 300, label: 'Very Active — Great fitness, ensure study time isn\'t affected', color: 'green' },
              ]}
            />
            <InputField
              label="Caffeine Intake (cups/day)"
              name="caffeine_intake"
              icon="☕"
              min={0} max={15}
              description="Daily cups of tea, coffee, or energy drinks consumed."
              guide={[
                { min: 0, max: 1, label: 'Low — No negative impact on sleep or anxiety', color: 'green' },
                { min: 1.1, max: 2, label: 'Moderate — May provide a mild alertness boost', color: 'green' },
                { min: 2.1, max: 4, label: 'Elevated — May be disrupting your sleep quality', color: 'yellow' },
                { min: 4.1, max: 15, label: 'Excessive — Indicates stress/sleep issues, hurts performance', color: 'red' },
              ]}
            />

            {/* Mental Health — Rich Scale Selector */}
            <ScaleSelector
              name="mental_health_score"
              label="Mental Health & Wellbeing"
              activeColor="emerald"
              options={[
                { value: 1, emoji: '😟', label: 'Poor', desc: 'Feeling overwhelmed, stressed, or anxious most of the time' },
                { value: 2, emoji: '😕', label: 'Below Average', desc: 'Occasional stress and low motivation, struggling to cope' },
                { value: 3, emoji: '😐', label: 'Moderate', desc: 'Managing okay — some good days and some bad days' },
                { value: 4, emoji: '😊', label: 'Good', desc: 'Feeling positive, motivated, and in control of stress' },
                { value: 5, emoji: '😄', label: 'Excellent', desc: 'Thriving — confident, happy, focused, and energetic' },
              ]}
            />
            
            <div className="relative group">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                💼 Part-Time Job?
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 leading-relaxed">
                Are you currently working a part-time job alongside studies? This reduces available study hours by 10-20 hrs/week on average.
              </p>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" {...register("part_time_job")} />
                  <div className="w-14 h-7 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-slate-200 after:border-slate-300 dark:after:border-slate-400 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500 shadow-inner"></div>
                  <span className="ml-4 text-sm font-bold text-slate-700 dark:text-slate-300">Yes, I'm working currently</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your data will be securely processed by the AI model. All predictions use SHAP for transparent explainability.</p>
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
