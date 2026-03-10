import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiActivity, FiShield, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Home = () => {
  const { user } = useAuth();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 py-20">
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Hero Section */}
      <motion.div 
        className="relative z-10 max-w-4xl text-center space-y-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-indigo-700 font-semibold text-sm mb-4 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
          </span>
          Next-Gen AI Predictions
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1]">
          Unlock Your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 drop-shadow-sm">True Academic Potential</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
          Our machine learning models analyze your study habits and lifestyle to forecast scores and neutralize burnout risks before they happen.
        </p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {user ? (
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
            >
              Enter Dashboard <FiArrowRight size={20} />
            </Link>
          ) : (
            <>
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                Get Started Free <FiArrowRight size={20} />
              </Link>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 glass-panel hover:bg-white/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl transition-all flex items-center justify-center hover:-translate-y-1 shadow-sm"
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        className="grid md:grid-cols-3 gap-8 mt-32 text-left max-w-6xl w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
          <div className="w-14 h-14 bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <FiActivity size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Predictive Analytics</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Get a hyper-accurate forecast of your exam scores based on 14+ distinct academic and lifestyle data points.</p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
          <div className="w-14 h-14 bg-purple-100/80 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <FiShield size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Early Risk Detection</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Our model flags "High Risk" students early, allowing for proactive intervention before academic failure occurs.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
          <div className="w-14 h-14 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <FiTrendingUp size={28} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">SHAP Explainability</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Don't just get a sterile score. Understand exactly *why* the AI predicted it, feature by feature.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
