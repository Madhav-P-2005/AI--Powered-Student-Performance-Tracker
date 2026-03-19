import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiActivity, FiUser, FiLogOut, FiPieChart, FiTrendingUp, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto mb-6">
      <nav className="w-full bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 shadow-lg shadow-indigo-900/5 dark:shadow-slate-900/50 rounded-[2rem] px-5 lg:px-8 h-16 flex items-center justify-between transition-all">
        
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30"
          >
            <FiActivity size={22} />
          </motion.div>
          <span className="font-black text-slate-800 dark:text-white text-xl tracking-tight transition-all">
            AI Student Tracker
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {user ? (
            <>
              {/* Common Links */}
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 font-semibold transition-all ${location.pathname === '/dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
              >
                <FiPieChart size={18} /> Dashboard
              </Link>
              
              {user.role !== 'admin' && (
                <Link 
                  to="/submit" 
                  className={`flex items-center gap-2 font-semibold transition-all ${location.pathname === '/submit' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                  <FiTrendingUp size={18} /> Predict Risk
                </Link>
              )}
              
                <div className="flex items-center gap-5 ml-4 pl-6 border-l border-slate-200/60 dark:border-slate-700/60">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center"
                  title="Toggle Theme"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isDarkMode ? 'dark' : 'light'}
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm px-4 py-2 rounded-2xl border border-slate-100/50 dark:border-slate-700/50"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FiUser size={14} />
                  </div>
                  {user.username} 
                  <span className="text-[10px] text-white bg-indigo-500 px-2 py-0.5 rounded-full uppercase tracking-wider ml-1 font-bold">
                    {user.role}
                  </span>
                </motion.div>
                
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="p-2.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-white dark:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                  title="Logout"
                >
                  <FiLogOut size={18} />
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors border border-slate-100 dark:border-slate-700 shadow-sm mr-2 flex items-center justify-center"
                title="Toggle Theme"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDarkMode ? 'dark' : 'light'}
                    initial={{ y: -20, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              <Link to="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors">
                Log in
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                Start Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-300 p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white dark:border-slate-700"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)} 
            className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none p-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-white dark:border-slate-700"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="md:hidden absolute top-24 left-4 right-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-[2rem] overflow-hidden z-50"
          >
            <div className="px-4 py-6 flex flex-col gap-5">
              {user ? (
                <>
                  <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-white dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 dark:from-indigo-900/50 to-purple-100 dark:to-purple-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <FiUser size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{user.username}</p>
                      <span className="text-[10px] text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm font-bold block w-max mt-0.5">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    onClick={closeMenu}
                    className={`flex items-center gap-3 font-bold p-3 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                  >
                    <FiPieChart size={20} /> Dashboard
                  </Link>
                  
                  {user.role !== 'admin' && (
                    <Link 
                      to="/submit" 
                      onClick={closeMenu}
                      className={`flex items-center gap-3 font-bold p-3 rounded-xl transition-all ${location.pathname === '/submit' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                      <FiTrendingUp size={20} /> Predict Risk
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 font-bold p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left w-full mt-2"
                  >
                    <FiLogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={closeMenu} className="text-center bg-white/60 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold px-6 py-3 rounded-xl shadow-sm border border-white dark:border-slate-700 transition-all">
                    Log in
                  </Link>
                  <Link to="/register" onClick={closeMenu} className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/30 transition-all">
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
