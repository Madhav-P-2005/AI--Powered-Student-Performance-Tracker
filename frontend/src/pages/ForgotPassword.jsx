import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { FiMail, FiLock, FiShield, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Steps: 1 = Enter Email, 2 = Enter OTP, 3 = New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      await authService.requestOTP(email);
      toast.success('OTP sent to your email! Check your inbox.');
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return toast.error('Enter a valid 6-digit OTP');

    setLoading(true);
    try {
      const res = await authService.verifyOTP(email, otp);
      if (res.data.verified) {
        toast.success('OTP verified! Set your new password.');
        setStep(3);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      toast.success('Password reset successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to reset password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob -z-10"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s ? 'bg-emerald-500 text-white' :
                step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50' :
                'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
              }`}>
                {step > s ? <FiCheck size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={`w-10 h-0.5 rounded ${step > s ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-700'}`}></div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-sm overflow-hidden mb-10 mt-6 relative">
          <AnimatePresence mode="wait">
          {/* Step 1: Enter Email */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-8 sm:p-10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100 dark:border-indigo-800">
                  <FiMail size={28} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Forgot Password?</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">
                  Enter your registered email and we'll send you a 6-digit OTP.
                </p>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-2xl text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-sm"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 mt-2"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 sm:p-10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100 dark:border-amber-800">
                  <FiShield size={28} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Enter OTP</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">
                  We sent a 6-digit code to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">6-Digit OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all shadow-sm text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-4 rounded-2xl font-bold shadow-lg shadow-amber-500/30 transition-all disabled:opacity-70 mt-2"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </motion.button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); }}
                  className="w-full text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <FiArrowLeft size={16} /> Back to email
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 rounded-xl text-xs font-bold text-blue-800 dark:text-blue-300 text-center border">
                ⏰ OTP expires in 10 minutes. Didn't receive it? Check your spam folder.
              </div>
            </motion.div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 sm:p-10"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 dark:border-emerald-800">
                  <FiLock size={28} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Reset Password</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-3">
                  OTP verified! Set a new password for your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 rounded-2xl text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all shadow-sm"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 rounded-2xl text-slate-800 dark:text-white font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all shadow-sm"
                    required
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-70 mt-2"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Back to Login */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-5 mt-auto border-t border-slate-100 dark:border-slate-700 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block">
              ← Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
