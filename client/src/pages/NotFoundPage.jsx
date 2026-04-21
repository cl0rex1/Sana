import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, Home } from 'lucide-react';
import Button from '../components/ui/Button';

/**
 * 404 Not Found page.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <ShieldOff className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h1 className="text-6xl font-mono font-bold text-gradient mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-300 mb-3">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Don't worry — no data was breached.
        </p>
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
