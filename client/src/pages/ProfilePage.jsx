import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, LogOut } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-[#1a1a1a]">{t('nav.profile')}</h1>
      
      <Card padding="p-8" className="mb-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Account Information</h3>
          <p className="text-sm text-gray-600 mb-2"><span className="font-medium mr-2">User ID:</span> {user._id || user.id}</p>
          <p className="text-sm text-gray-600"><span className="font-medium mr-2">Member Since:</span> {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleLogout} variant="danger" icon={LogOut}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
