import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="p-10 rounded-[2.5rem] border border-gray-100 shadow-sm bg-white">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">{t('auth.forgotTitle')}</h1>
            <p className="text-gray-500 text-sm">{t('auth.forgotSubtitle')}</p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>{t('auth.resetSent')}</span>
              </div>
              <p className="text-xs text-gray-400">{t('auth.forgotDesc')}</p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-gray-400">{t('auth.forgotDesc')}</p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">{t('auth.email')}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-[#1a1a1a] font-medium"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-100"
                icon={ArrowRight}
              >
                {t('auth.sendReset')}
              </Button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                  <ArrowLeft className="w-4 h-4" />
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
