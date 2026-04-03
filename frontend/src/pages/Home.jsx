import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiActivity, FiShield, FiTrendingUp, FiZap, FiCpu, FiBarChart2, FiLayers, FiTarget, FiStar } from 'react-icons/fi';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// ── Animated Counter ──────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ── Floating Particle Grid ────────────────────────────────────────────
const ParticleGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    {[...Array(40)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-indigo-500/20 dark:bg-indigo-400/15"
        initial={{
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: Math.random() * 900,
          scale: Math.random() * 0.5 + 0.5,
        }}
        animate={{
          y: [null, Math.random() * -200 - 50],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: Math.random() * 6 + 4,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

// ── Animated Gradient Orb ─────────────────────────────────────────────
const GradientOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl ${className}`}
    animate={{
      scale: [1, 1.2, 0.95, 1.1, 1],
      x: [0, 30, -20, 15, 0],
      y: [0, -40, 20, -10, 0],
    }}
    transition={{
      duration: 12,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

// ── Interactive Tilt Card ─────────────────────────────────────────────
const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Feature Data ──────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FiCpu,
    title: 'AI Score Forecasting',
    description: 'Random Forest ML models trained on 14+ features predict your exam scores with surgical precision.',
    gradient: 'from-violet-600 to-indigo-600',
    glow: 'group-hover:shadow-violet-500/25',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400',
    tag: 'ML-Powered',
  },
  {
    icon: FiShield,
    title: 'Burnout Risk Detection',
    description: 'Gets ahead of academic failure by flagging high-risk students before performance drops — not after.',
    gradient: 'from-rose-600 to-pink-600',
    glow: 'group-hover:shadow-rose-500/25',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
    tag: 'Early Warning',
  },
  {
    icon: FiBarChart2,
    title: 'SHAP Explainability',
    description: 'Don\'t just get a number — see exactly which habits boost or hurt your score, feature by feature.',
    gradient: 'from-emerald-600 to-teal-600',
    glow: 'group-hover:shadow-emerald-500/25',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    tag: 'Transparent AI',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Input Your Data', description: 'Enter your study hours, sleep, exercise, screen time, and 10+ other lifestyle metrics.', icon: FiLayers },
  { step: '02', title: 'AI Crunches Numbers', description: 'Our Random Forest model analyzes patterns across all your features in under a second.', icon: FiZap },
  { step: '03', title: 'Get Actionable Insights', description: 'Receive your predicted score, risk level, and a full SHAP breakdown of what matters most.', icon: FiTarget },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden isolate -mt-6">

      {/* ═══════════ AURORA BACKGROUND ═══════════ */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <GradientOrb className="w-[40rem] h-[40rem] bg-indigo-400/25 dark:bg-indigo-600/15 top-[8%] left-[-10%]" delay={0} />
        <GradientOrb className="w-[35rem] h-[35rem] bg-purple-400/20 dark:bg-purple-600/10 top-[15%] right-[-5%]" delay={2} />
        <GradientOrb className="w-[30rem] h-[30rem] bg-emerald-400/15 dark:bg-emerald-600/10 bottom-[20%] left-[15%]" delay={4} />
        <GradientOrb className="w-[25rem] h-[25rem] bg-pink-400/15 dark:bg-pink-600/10 bottom-[-5%] right-[20%]" delay={6} />

        {/* Mesh grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      <ParticleGrid />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 pt-20 pb-32">
        <motion.div 
          className="relative z-10 max-w-5xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >

          {/* Live Badge */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-lg shadow-indigo-500/10 mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wide">AI Model Active</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white uppercase tracking-widest">v2.0</span>
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 dark:text-white tracking-[-0.04em] leading-[1.05] mb-8"
          >
            Predict Your Grades{' '}
            <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Before the Exam
              </span>
              {/* Underline decoration */}
              <motion.svg
                viewBox="0 0 300 12"
                fill="none"
                className="absolute -bottom-2 left-0 w-full"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
              >
                <motion.path
                  d="M2 8C50 3 100 3 150 6C200 9 250 4 298 7"
                  stroke="url(#underline-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366f1" />
                    <stop offset="0.5" stopColor="#a855f7" />
                    <stop offset="1" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium mb-12"
          >
            Our ML models analyze <span className="text-slate-800 dark:text-slate-200 font-semibold">14+ study & lifestyle factors</span> to 
            forecast your performance and flag burnout risks — 
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold"> before they become problems</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link 
                to="/dashboard"
                className="group relative overflow-hidden w-full sm:w-auto px-10 py-4.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-white/20 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
              >
                <span className="relative z-10">Enter Dashboard</span>
                <FiArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group relative overflow-hidden w-full sm:w-auto px-10 py-4.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-right text-white font-bold rounded-2xl shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                >
                  <FiZap size={18} className="relative z-10" />
                  <span className="relative z-10">Start Predicting — Free</span>
                  <FiArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-10 py-4.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center hover:-translate-y-1 border border-slate-200/80 dark:border-slate-700/80 shadow-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest"
          >
            <span className="flex items-center gap-1.5"><FiShield size={14} className="text-emerald-500" /> JWT Secured</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="flex items-center gap-1.5"><FiCpu size={14} className="text-indigo-500" /> Random Forest</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="flex items-center gap-1.5"><FiBarChart2 size={14} className="text-purple-500" /> SHAP Analysis</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-start justify-center p-1.5"
          >
            <motion.div className="w-1.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 -mt-16 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/60 dark:border-slate-700/50 rounded-3xl shadow-2xl shadow-slate-900/5 dark:shadow-black/20 p-6 md:p-0 md:divide-x md:divide-slate-200/50 dark:divide-slate-700/50"
        >
          {[
            { value: 14, suffix: '+', label: 'Input Features', color: 'text-indigo-600 dark:text-indigo-400' },
            { value: 95, suffix: '%', label: 'Model Accuracy', color: 'text-emerald-600 dark:text-emerald-400' },
            { value: 3, suffix: '', label: 'Risk Levels', color: 'text-rose-600 dark:text-rose-400' },
            { value: 100, suffix: '%', label: 'Explainability', color: 'text-purple-600 dark:text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="text-center py-4 md:py-8 px-4">
              <p className={`text-3xl md:text-4xl font-black ${stat.color} tracking-tight`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mb-4 border border-indigo-100 dark:border-indigo-800/50">Core Capabilities</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Intelligence Meets
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"> Academics</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <TiltCard className={`group relative h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-8 shadow-lg shadow-slate-900/5 dark:shadow-black/20 hover:shadow-2xl ${feature.glow} transition-all duration-500 cursor-default overflow-hidden`}>
                {/* Hover gradient glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${feature.gradient} transition-opacity duration-500 rounded-3xl`} style={{ opacity: 0 }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-white to-transparent rounded-3xl" />

                <div className="relative z-10">
                  {/* Tag */}
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-1 rounded-lg mb-5 border border-indigo-100/50 dark:border-indigo-800/30">
                    {feature.tag}
                  </span>

                  {/* Icon */}
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={26} />
                  </div>

                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[15px]">{feature.description}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full mb-4 border border-emerald-100 dark:border-emerald-800/50">Simple Process</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Three Steps to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Clarity</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />

          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="text-center relative"
            >
              {/* Step number circle */}
              <div className="relative inline-flex mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-lg relative z-10"
                >
                  <item.icon size={28} className="text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md z-20">{item.step}</span>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 tracking-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-800 dark:via-indigo-900/50 dark:to-slate-800 rounded-[2.5rem] p-12 md:p-16 text-center shadow-2xl"
        >
          {/* CTA Background decorations */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          
          <div className="relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-indigo-300 font-bold text-sm mb-6">
              <FiStar size={14} className="text-amber-400" /> Built for Students, by Students
            </motion.div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
              Ready to See Your Future Score?
            </h2>
            <p className="text-lg text-indigo-200/80 max-w-2xl mx-auto mb-10 font-medium">
              It takes under 60 seconds to enter your data. The AI does the rest.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="group px-10 py-4.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-2xl transition-all flex items-center gap-3 hover:-translate-y-1">
                  Go to Dashboard <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="group px-10 py-4.5 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-2xl transition-all flex items-center gap-3 hover:-translate-y-1">
                    <FiZap size={18} /> Create Free Account <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="px-10 py-4.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl transition-all border border-white/20 hover:-translate-y-1">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 border-t border-slate-200/50 dark:border-slate-800 py-10">
        <div className="flex flex-col items-center gap-6">
          {/* Team Members */}
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Built by Team</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Madhav P */}
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Madhav P</span>
              <div className="flex items-center gap-2">
                <a href="https://github.com/Madhav-P-2005/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" aria-label="Madhav GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                </a>
                <a href="https://www.instagram.com/madhavp_14/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" aria-label="Madhav Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            {/* Amruth Badi */}
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Amruth Badi</span>
              <a href="https://www.instagram.com/madhavp_14/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" aria-label="Amruth Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
            {/* Guruprasad Charati */}
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Guruprasad Charati</span>
              <a href="https://www.instagram.com/guru_charati/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" aria-label="Guruprasad Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Built with <span className="text-rose-500">♥</span> · AI-Powered Student Performance Tracker
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
