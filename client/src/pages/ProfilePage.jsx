import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../utils/api';
import { User, LogOut, History, Award, Calendar, ChevronRight, Trash2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/history');
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    if (!window.confirm('Remove this record from history?')) return;
    try {
      await api.delete(`/history/${id}`);
      setHistory(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTestTypeLabel = (type) => {
    const map = {
      phishing: 'Фишинг',
      standard: 'Стандарт',
      social: 'Соц. инженерия',
      device: 'Устройство',
      mixed: 'Смешанный',
      ai: 'AI тест',
      learning: 'Обучение',
      specific: 'Сценарий'
    };
    return map[type] || type;
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{t('nav.profile')}</h1>
        <Button onClick={handleLogout} variant="danger" icon={LogOut} size="sm">
          Logout
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card padding="p-8" className="bg-white rounded-[2rem] border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">{user.username}</h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              
              <div className="w-full pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Роль</span>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">В Sana с</span>
                  <span className="text-[#1a1a1a] font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-600 p-6 text-white rounded-[2rem] border-none">
            <Award className="w-8 h-8 mb-4 text-blue-200" />
            <h3 className="text-lg font-bold mb-1">Статистика</h3>
            <p className="text-blue-100 text-xs mb-4">Ваши достижения на платформе</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200">Тестов</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0}%
                </div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200">Ср. балл</div>
              </div>
            </div>
          </Card>
        </div>

        {/* History Main Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-[#1a1a1a]">История тестов</h2>
          </div>

          {loading ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">Загрузка истории...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Вы еще не проходили тесты.</p>
              <Button variant="ghost" onClick={() => navigate('/simulation')} className="mt-4 text-blue-600">Начать первый тест</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item._id} className="group relative bg-white p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      item.score >= 80 ? 'bg-emerald-50 text-emerald-600' : 
                      item.score >= 50 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className="font-bold text-sm">{item.score}%</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#1a1a1a] flex items-center gap-2">
                        {getTestTypeLabel(item.testType)}
                        <span className="text-[10px] font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          {item.correctAnswers}/{item.totalQuestions}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.completedAt).toLocaleDateString()} в {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteHistoryItem(item._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
