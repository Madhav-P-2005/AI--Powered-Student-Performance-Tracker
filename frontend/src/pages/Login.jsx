import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await login(data.username, data.password);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] relative">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob -z-10"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-sm p-8 sm:p-10 mb-10 mt-10"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="text-indigo-400" />
              </div>
              <input
                id="username"
                type="text"
                className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors.username ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}
                placeholder="Enter your username"
                {...register('username', { required: 'Username is required' })}
              />
            </div>
            {errors.username && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-indigo-400" />
              </div>
              <input
                id="password"
                type="password"
                className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors.password ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700" />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">Forgot password?</Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 font-bold transition-all disabled:opacity-70 mt-4"
          >
            {isLoading ? 'Signing in...' : (
              <>Sign in <FiArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
