import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Register = () => {
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...submitData } = data;
    const result = await register(submitData);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob -z-10"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm p-8 sm:p-12 mb-10 mt-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 tracking-tight">Create an account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Join the AI-powered student tracker to optimize your performance.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700 shadow-inner relative">
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="student" className="peer sr-only" defaultChecked {...registerForm('role')} />
              <div className="text-center py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-checked:text-white peer-checked:shadow-md transition-all">
                Student
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="admin" className="peer sr-only" {...registerForm('role')} />
              <div className="text-center py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-checked:text-white peer-checked:shadow-md transition-all">
                Admin / Teacher
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiUser className="text-indigo-400" /></div>
                <input type="text" className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors.username ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="johndoe123" {...registerForm('username', { required: 'Username is required' })} />
              </div>
              {errors.username && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiMail className="text-indigo-400" /></div>
                <input type="email" className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors.email ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="john@example.com" {...registerForm('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">First Name</label>
              <input type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 font-medium text-slate-800 dark:text-white shadow-sm transition-all" {...registerForm('first_name')} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
              <input type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 font-medium text-slate-800 dark:text-white shadow-sm transition-all" {...registerForm('last_name')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number <span className="text-slate-400 dark:text-slate-500 font-medium">(Optional)</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiPhone className="text-indigo-400" /></div>
              <input type="text" className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 font-medium text-slate-800 dark:text-white shadow-sm transition-all" placeholder="+1234567890" {...registerForm('phone')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className="text-indigo-400" /></div>
                <input type="password" className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors.password ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="••••••••" {...registerForm('password', { required: 'Password is required', minLength: { value: 6, message: 'Must be at least 6 characters' } })} />
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className="text-indigo-400" /></div>
                <input type="password" className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800/80 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm ${errors.confirmPassword ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="••••••••" {...registerForm('confirmPassword', { validate: value => value === password || "Passwords do not match" })} />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 mt-6 border border-transparent rounded-2xl shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 font-bold transition-all disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : <><FiUser size={18} /> Create Account</>}
          </motion.button>
        </form>

        <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
