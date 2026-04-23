import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldOff, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <ShieldOff className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h1 className="text-6xl font-mono font-bold text-gradient mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-300 mb-3">{t('notFound.title')}</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">{t('notFound.description')}</p>
        <Link to="/">
          <Button variant="primary" icon={Home}>
            {t('notFound.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
