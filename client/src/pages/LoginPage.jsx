import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowEffect from '../components/ui/GlowEffect';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-[#1a1a1a] tracking-tight">{t('auth.loginTitle')}</h2>
          <p className="text-gray-500 mt-2">{t('auth.loginSubtitle', 'Secure access to your Sana account')}</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem] overflow-visible" padding="p-8 md:p-10">
          <GlowEffect color="from-blue-500/5 to-indigo-500/5" className="opacity-50" />
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[#1a1a1a] font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  {t('auth.forgotPassword', 'Forgot?')}
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[#1a1a1a] font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              loading={isLoading}
              className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-100 mt-2"
              icon={ArrowRight}
            >
              {t('auth.loginBtn', 'Log In')}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t('auth.noAccount', "Don't have an account?")} 
              <Link to="/register" className="ml-2 text-blue-600 font-bold hover:text-blue-700 transition-colors inline-flex items-center gap-1">
                {t('auth.registerLink', 'Register')}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
