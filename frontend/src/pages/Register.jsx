import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiArrowLeft, FiCheckCircle, FiArrowRight, FiCheck, FiX as FiXIcon, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { sendRegistrationOTP } from '../services/authService';

// Password strength calculator
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)) score++;
  const levels = [
    { label: '', color: '' },
    { label: 'Very Weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Strong', color: 'bg-lime-500' },
    { label: 'Excellent', color: 'bg-emerald-500' },
  ];
  return { score, ...levels[score] };
};

// Password rule check component
const PasswordRule = ({ met, text }) => (
  <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
    {met ? <FiCheck size={12} /> : <FiXIcon size={12} />}
    {text}
  </div>
);

const Register = () => {
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [storedData, setStoredData] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRefs = useRef([]);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Resend OTP timer countdown
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleInitialSubmit = async (data) => {
    setIsLoading(true);
    try {
      await sendRegistrationOTP(data.email);
      setStoredData(data);
      setStep(2);
      setResendTimer(60);
      toast.info('Verification code sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    
    setIsLoading(true);
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...submitData } = storedData;
    const result = await register(submitData, otpCode);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/login');
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await sendRegistrationOTP(storedData.email);
      setResendTimer(60);
      toast.success('A new verification code has been sent.');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend code.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Navigate back on backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob -z-10"></div>
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] shadow-sm p-8 sm:p-12 mb-10 mt-10 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-300 tracking-tight">Create an account</h2>
                <p className="text-slate-500 dark:text-slate-300 mt-2 font-medium">Join the AI-powered student tracker to optimize your performance.</p>
              </div>

              <form onSubmit={handleSubmit(handleInitialSubmit)} className="space-y-6">
                {/* Role Selection */}
                <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700 shadow-inner relative">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" value="student" className="peer sr-only" defaultChecked {...registerForm('role')} />
                    <div className="text-center py-2.5 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-300 peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-checked:text-white peer-checked:shadow-md transition-all">
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
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiUser className="text-indigo-400" /></div>
                      <input type="text" className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.username ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="johndoe123" {...registerForm('username', { required: 'Username is required', minLength: { value: 3, message: 'Username must be at least 3 characters' }, maxLength: { value: 20, message: 'Username cannot exceed 20 characters' }, pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers and underscores allowed' } })} />
                    </div>
                    {errors.username && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiMail className="text-indigo-400" /></div>
                      <input type="email" className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.email ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="john@example.com" {...registerForm('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
                    </div>
                    {errors.email && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all" {...registerForm('first_name')} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all" {...registerForm('last_name')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Phone Number <span className="text-slate-400 dark:text-slate-400 font-medium">(Optional)</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiPhone className="text-indigo-400" /></div>
                    <input type="tel" inputMode="numeric" maxLength={10} className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.phone ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="9876543210" onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace','Tab','Delete','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }} {...registerForm('phone', { validate: (value) => { if (!value || value === '') return true; if (!/^\d{10}$/.test(value)) return 'Phone number must be exactly 10 digits'; if (!/^[6-9]/.test(value)) return 'Phone number must start with 6, 7, 8, or 9'; return true; } })} />
                  </div>
                  {errors.phone && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.phone.message}</p>}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className="text-indigo-400" /></div>
                      <input type={showPassword ? 'text' : 'password'} className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.password ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="••••••••" {...registerForm('password', { required: 'Password is required', minLength: { value: 8, message: 'Must be at least 8 characters' }, validate: { hasUppercase: v => /[A-Z]/.test(v) || 'Must contain an uppercase letter', hasLowercase: v => /[a-z]/.test(v) || 'Must contain a lowercase letter', hasNumber: v => /[0-9]/.test(v) || 'Must contain a number', hasSpecial: v => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(v) || 'Must contain a special character' } })} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-2.5 space-y-2">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= getPasswordStrength(password).score ? getPasswordStrength(password).color : 'bg-slate-200 dark:bg-slate-700'}`} />
                          ))}
                        </div>
                        <p className={`text-xs font-bold ${getPasswordStrength(password).score <= 2 ? 'text-red-500' : getPasswordStrength(password).score <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {getPasswordStrength(password).label}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <PasswordRule met={password?.length >= 8} text="8+ characters" />
                          <PasswordRule met={/[A-Z]/.test(password)} text="Uppercase letter" />
                          <PasswordRule met={/[a-z]/.test(password)} text="Lowercase letter" />
                          <PasswordRule met={/[0-9]/.test(password)} text="Number" />
                          <PasswordRule met={/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(password)} text="Special character" />
                        </div>
                      </div>
                    )}
                    {errors.password && <p className="mt-1.5 text-xs font-bold text-red-500 dark:text-red-400">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className="text-indigo-400" /></div>
                      <input type={showConfirmPassword ? 'text' : 'password'} className={`w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-800 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium text-slate-800 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.confirmPassword ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'}`} placeholder="••••••••" {...registerForm('confirmPassword', { validate: value => value === password || "Passwords do not match" })} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
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
                  {isLoading ? 'Sending verification...' : <><FiArrowRight size={18} /> Continue</>}
                </motion.button>
              </form>

              <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiMail size={32} />
                </div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-300 tracking-tight mb-3">Verify your email</h2>
                <p className="text-slate-500 dark:text-slate-300 font-medium">
                  We've sent a 6-digit verification code to <br />
                  <span className="font-bold text-slate-800 dark:text-white block mt-1">{storedData?.email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-8">
                <div className="flex justify-center gap-3 sm:gap-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-extrabold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || otp.join('').length !== 6}
                    className="w-full flex items-center justify-center gap-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-500/30 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 font-bold transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : <><FiCheckCircle size={18} /> Verify & Create Account</>}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full flex items-center justify-center gap-2 py-4 px-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all"
                  >
                    <FiArrowLeft size={18} /> Back to details
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
