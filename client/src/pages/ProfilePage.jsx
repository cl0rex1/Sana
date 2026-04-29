import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../utils/api';
import ConfirmModal from '../components/ui/ConfirmModal';
import Pagination from '../components/ui/Pagination';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  RotateCcw, 
  Target, 
  Zap, 
  BookOpen, 
  User, 
  LogOut, 
  History, 
  Award, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  X, 
  AlertTriangle, 
  Plus, 
  Edit2 
} from 'lucide-react';

const ICON_MAP = {
  phishing: <Shield className="w-5 h-5 text-red-500" />,
  social: <Zap className="w-5 h-5 text-amber-500" />,
  standard: <Target className="w-5 h-5 text-blue-500" />,
  device: <RotateCcw className="w-5 h-5 text-purple-500" />,
  network: <RotateCcw className="w-5 h-5 text-indigo-500" />,
  general: <BookOpen className="w-5 h-5 text-indigo-500" />
};

const ProfilePage = () => {
  const { pushNotification } = useNotification();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [myScenarios, setMyScenarios] = useState([]);
  const [myArticles, setMyArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [selectedResult, setSelectedResult] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Pagination states
  const PAGE_SIZE = 5;
  const [pageHistory, setPageHistory] = useState(1);
  const [pageScenarios, setPageScenarios] = useState(1);
  const [pageArticles, setPageArticles] = useState(1);

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchScenarios();
      fetchArticles();
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

  const fetchScenarios = async () => {
    try {
      setScenariosLoading(true);
      const res = await api.get('/scenarios/my');
      setMyScenarios(res.data || []);
    } catch (err) {
      console.error('Failed to fetch scenarios', err);
    } finally {
      setScenariosLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      const res = await api.get('/articles/my');
      setMyArticles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch articles', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/history/${confirmModal.id}`);
      setHistory(prev => prev.filter(item => item._id !== confirmModal.id));
      pushNotification('success', t('profile.notifications.historyRemoved'));
    } catch (err) {
      console.error(err);
      pushNotification('error', t('profile.notifications.removeFailed'));
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const formatElapsedTime = (seconds) => {
    const total = Math.max(0, seconds || 0);
    const minutes = Math.floor(total / 60);
    const remainingSeconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    // Check file size (limit to 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      pushNotification('error', t('profile.notifications.imageTooLarge'));
      return;
    }

    try {
      setAvatarLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result;
        try {
          const res = await api.put('/auth/profile', { avatar: base64 });
          setAvatar(base64);
          updateUser({ avatar: base64 });
          pushNotification('success', t('profile.notifications.avatarUpdated'));
        } catch (err) {
          console.error(err);
          pushNotification('error', t('profile.notifications.avatarSaveFailed'));
        } finally {
          setAvatarLoading(false);
        }
      };
    } catch (err) {
      console.error(err);
      setAvatarLoading(false);
      pushNotification('error', t('profile.notifications.imageProcessFailed'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTestTypeLabel = (type) => {
    const map = {
      phishing: t('simulation.type.phishing'),
      standard: t('simulation.type.standard'),
      social: t('simulation.type.social'),
      device: t('simulation.type.device'),
      mixed: t('simulation.type.mixed'),
      ai: t('profile.testType.ai'),
      learning: t('simulation.type.learning'),
      specific: t('profile.testType.specific')
    };
    return map[type] || type;
  };

  const getStatusLabel = (status) => t(`admin.${status}`, status || '');

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">{t('profile.loginPrompt')}</p>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a1a1a]">{t('nav.profile')}</h1>
        <Button onClick={handleLogout} variant="danger" icon={LogOut} size="sm">
          {t('profile.logout')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card padding="p-8" className="bg-white rounded-[2rem] border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-blue-100 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-xl shadow-md border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Edit2 className="w-4 h-4 text-blue-600" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => handleAvatarUpload(e.target.files[0])}
                    disabled={avatarLoading}
                  />
                </label>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a]">{user.username}</h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              
              <div className="w-full pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('profile.role')}</span>
                  <Badge variant={user.role === 'admin' ? 'purple' : 'info'} className="capitalize">{t(`auth.role.${user.role}`, user.role)}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('profile.since')}</span>
                  <span className="text-[#1a1a1a] font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-600 p-6 text-white rounded-[2rem] border-none">
            <Award className="w-8 h-8 mb-4 text-blue-200" />
            <h3 className="text-lg font-bold mb-1">{t('profile.stats')}</h3>
            <p className="text-blue-100 text-xs mb-4">{t('profile.achievements')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200">{t('profile.tests')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                   {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0}%
                </div>
                <div className="text-[10px] uppercase tracking-wider text-blue-200">{t('profile.avgScore')}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-[#1a1a1a]">{t('profile.history')}</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-50 animate-pulse" />)}
            </div>
          ) : history.length > 0 ? (
            <>
              <div className="space-y-3">
                {history.slice((pageHistory - 1) * PAGE_SIZE, pageHistory * PAGE_SIZE).map((item) => (
                  <div 
                    key={item._id} 
                    className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedResult(item)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${item.score >= 80 ? 'bg-emerald-50 text-emerald-600' : item.score >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        {item.score >= 80 ? <CheckCircle className="w-5 h-5" /> : item.score >= 50 ? <AlertTriangle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a1a] text-sm leading-tight">{getTestTypeLabel(item.testType)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{formatElapsedTime(item.timeSpent)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-mono font-bold text-sm ${item.score >= 80 ? 'text-emerald-600' : item.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{item.score}%</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(item._id); }}
                        icon={Trash2}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 rounded-lg h-8 w-8 p-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Pagination 
                currentPage={pageHistory} 
                totalPages={Math.ceil(history.length / PAGE_SIZE)} 
                onPageChange={setPageHistory} 
                className="mt-6"
              />
            </>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('profile.noHistory')}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-2 pt-6">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-[#1a1a1a]">{t('profile.myScenarios', 'My Scenarios')}</h2>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/simulation')} 
              icon={Plus} 
              className="rounded-xl px-4 h-9 shadow-sm"
            >
              {t('profile.create', 'Create')}
            </Button>
          </div>

          {scenariosLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : myScenarios.length > 0 ? (
            <>
              {(() => {
                const groupedScenarios = [];
                const batches = new Map();

                myScenarios.forEach((scenario) => {
                  if (scenario.batchId) {
                    if (!batches.has(scenario.batchId)) {
                      const group = {
                        isBatch: true,
                        id: scenario.batchId,
                        items: [],
                      };
                      batches.set(scenario.batchId, group);
                      groupedScenarios.push(group);
                    }
                    batches.get(scenario.batchId).items.push(scenario);
                  } else {
                    groupedScenarios.push({ isBatch: false, id: scenario._id, items: [scenario] });
                  }
                });

                const pageItems = groupedScenarios.slice((pageScenarios - 1) * PAGE_SIZE, pageScenarios * PAGE_SIZE);

                return (
                  <>
              <div className="space-y-4">
                {pageItems.map((group) => {
                  const first = group.items[0];
                  const scenarioId = group.isBatch ? first._id : first._id;
                  return (
                    <div 
                      key={group.id} 
                      className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all group cursor-pointer"
                      onClick={() => navigate(`/simulation?mode=specific&id=${scenarioId}`)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                            {first.icon || '🛡️'}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#1a1a1a]">{first.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{first.category}</span>
                              {group.isBatch && (
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                  {t('simulation.questionsCount', { count: group.items.length })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={first.status === 'approved' ? 'success' : first.status === 'pending' ? 'warning' : 'critical'}>
                            {getStatusLabel(first.status)}
                          </Badge>
                          {!group.isBatch && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              icon={Edit2} 
                              className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-blue-600"
                              onClick={(e) => { e.stopPropagation(); navigate(`/simulation?edit=${first._id}`); }}
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{first.description}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(first.createdAt).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="text-purple-600 h-8">
                          {t('simulation.playTest', 'Play')}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination 
                currentPage={pageScenarios} 
                totalPages={Math.ceil(groupedScenarios.length / PAGE_SIZE)} 
                onPageChange={setPageScenarios} 
                className="mt-6"
              />
                  </>
                );
              })()}
            </>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Plus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('profile.noScenarios')}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-2 pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-[#1a1a1a]">{t('profile.myArticles', 'My Articles')}</h2>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/learn/create')} 
              icon={Plus} 
              className="rounded-xl px-4 h-9 shadow-sm"
            >
              {t('profile.create', 'Create')}
            </Button>
          </div>

          {articlesLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : myArticles.length > 0 ? (
            <>
              <div className="space-y-4">
                {myArticles.slice((pageArticles - 1) * PAGE_SIZE, pageArticles * PAGE_SIZE).map((art) => (
                  <div 
                    key={art._id} 
                    className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 transition-all group cursor-pointer"
                    onClick={() => navigate(`/learn/${art._id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                          {ICON_MAP[art.category] || ICON_MAP.general}
                        </div>
                        <div>
                          <h4 className="font-bold text-[#1a1a1a]">{art.title}</h4>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{art.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={art.status === 'approved' ? 'success' : art.status === 'pending' ? 'warning' : 'critical'}>
                          {getStatusLabel(art.status)}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          icon={Edit2} 
                          className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-blue-600"
                          onClick={(e) => { e.stopPropagation(); navigate(`/learn/create?edit=${art._id}`); }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{art.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                          <Clock className="w-3 h-3" /> {new Date(art.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => navigate(`/learn/${art._id}`)}>
                        {t('articles.read')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination 
                currentPage={pageArticles} 
                totalPages={Math.ceil(myArticles.length / PAGE_SIZE)} 
                onPageChange={setPageArticles} 
                className="mt-6"
              />
            </>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">{t('profile.noArticles')}</p>
            </div>
          )}
        </div>
      </div>
    </div>

    <AnimatePresence>
      {selectedResult && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1a1a1a]/60 backdrop-blur-sm"
          onClick={() => setSelectedResult(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div>
                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-1">{getTestTypeLabel(selectedResult.testType)}</h3>
                  <p className="text-gray-400 text-sm">{new Date(selectedResult.createdAt).toLocaleString()}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedResult(null)} icon={X} className="rounded-full w-10 h-10 p-0" />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 shrink-0">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('simulation.score')}</p>
                  <p className={`text-2xl font-mono font-bold ${selectedResult.score >= 80 ? 'text-emerald-600' : selectedResult.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {selectedResult.score}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('simulation.time')}</p>
                  <p className="text-2xl font-mono font-bold text-[#1a1a1a]">
                    {formatElapsedTime(selectedResult.timeSpent)}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('profile.breakdown') || 'Breakdown'}</h4>
                {selectedResult.details && selectedResult.details.length > 0 ? (
                  selectedResult.details.map((detail, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {detail.isCorrect >= 0.8 ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : detail.isCorrect >= 0.5 ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1a1a1a] line-clamp-2">{detail.scenarioTitle}</p>
                          <p className="text-xs text-gray-500 mt-1">{detail.choiceText}</p>
                          <div className="mt-2">
                             <Badge variant={detail.isCorrect >= 0.8 ? 'success' : detail.isCorrect >= 0.5 ? 'warning' : 'danger'}>
                               {detail.isCorrect >= 1 ? t('simulation.safe') : 
                                detail.isCorrect > 0 ? `${Math.round(detail.isCorrect * 100)}%` : 
                                t('simulation.risky')}
                             </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 italic">
                    {t('profile.noDetails')}
                  </div>
                )}
              </div>

              <Button variant="primary" className="w-full mt-8 py-4 rounded-2xl shadow-xl shadow-blue-100 shrink-0" onClick={() => setSelectedResult(null)}>
                {t('common.close')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <ConfirmModal 
      isOpen={confirmModal.isOpen}
      onClose={() => setConfirmModal({ isOpen: false, id: null })}
      onConfirm={handleConfirmDelete}
      title={t('profile.deleteConfirmTitle')}
      message={t('profile.deleteConfirmMsg')}
    />
    </>
  );
};

export default ProfilePage;
