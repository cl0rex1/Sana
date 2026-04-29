import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Check, X, BookOpen, PlayCircle, ExternalLink, Shield, Search, Filter, UserCheck, Bot, ChevronDown, Send, Layers, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ConfirmModal from '../components/ui/ConfirmModal';
import AdminArticlesSection from '../components/admin/AdminArticlesSection';
import { useNotification } from '../context/NotificationContext';

const AdminPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pushNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remoderatingId, setRemoderatingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    language: 'all',
    search: ''
  });

  const getStatusLabel = (status) => t(`admin.${status}`, status || '');

  useEffect(() => {
    if (user?.role === 'admin' && activeTab === 'scenarios') {
      fetchScenarios();
    }
  }, [user, activeTab]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scenarios');
      setScenarios(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/scenarios/${id}`, { status });
      fetchScenarios();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/scenarios/${confirmModal.id}`);
      pushNotification('success', t('admin.successDelete'));
      fetchScenarios();
    } catch (err) {
      console.error(err);
      pushNotification('error', t('admin.errorDelete'));
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const handleRemoderate = async (id) => {
    try {
      setRemoderatingId(id);
      await api.put(`/scenarios/${id}/moderate`);
      // Explicitly wait for fresh data
      await fetchScenarios();
      pushNotification('success', t('admin.remoderateSuccess'));
    } catch (err) {
      console.error('Failed to remoderate', err);
      pushNotification('error', t('admin.remoderateError'));
    } finally {
      // Small delay so the user sees the 'approved' state change clearly
      setTimeout(() => setRemoderatingId(null), 500);
    }
  };

  const toggleGroup = (id) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };


  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="text-red-600 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#1a1a1a]">{t('admin.title')}</h1>
            <p className="text-gray-500">{t('admin.subtitle')}</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl self-start md:self-center">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'scenarios' 
                ? 'bg-white text-[#1a1a1a] shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            {t('admin.scenarios')}
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'articles' 
                ? 'bg-white text-[#1a1a1a] shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {t('admin.articles')}
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'scenarios' ? (
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
                <Layers className="w-6 h-6 text-indigo-500" />
                {t('admin.scenarioMgmt', 'Scenario Management')}
              </h2>
            </div>
            <Card className="p-6 bg-white border-gray-100 shadow-sm rounded-3xl">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder={t('admin.searchPlaceholder', 'Search by title or description...')}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select 
                    className="flex-1 md:w-40 p-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none text-sm"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">{t('admin.allStatus', 'All Status')}</option>
                    <option value="pending">{t('admin.pending', 'Pending')}</option>
                    <option value="approved">{t('admin.approved', 'Approved')}</option>
                    <option value="rejected">{t('admin.rejected', 'Rejected')}</option>
                  </select>
                  <select 
                    className="flex-1 md:w-40 p-3 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none text-sm"
                    value={filters.language}
                    onChange={(e) => setFilters({...filters, language: e.target.value})}
                  >
                    <option value="all">{t('admin.allLangs', 'All Languages')}</option>
                    <option value="ru">{t('common.langCode.ru')}</option>
                    <option value="kz">{t('common.langCode.kz')}</option>
                    <option value="en">{t('common.langCode.en')}</option>
                  </select>
                </div>
              </div>
            </Card>

            {loading && scenarios.length === 0 ? (
              <div className="text-center py-20 text-[#1a1a1a]">{t('admin.loading')}</div>
            ) : (
              (() => {
                const filtered = scenarios.filter(s => {
                  const matchStatus = filters.status === 'all' || s.status === filters.status;
                  const matchLang = filters.language === 'all' || s.language === filters.language;
                  const matchSearch = !filters.search || 
                    s.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                    s.description.toLowerCase().includes(filters.search.toLowerCase());
                  return matchStatus && matchLang && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-16 bg-white border border-gray-200 rounded-3xl shadow-sm">
                      {t('admin.noResults', 'No results found with current filters')}
                    </div>
                  );
                }

                const groups = [];
                const batches = {};
                
                filtered.forEach(s => {
                  if (s.batchId) {
                    if (!batches[s.batchId]) {
                      batches[s.batchId] = { isBatch: true, items: [], id: s.batchId };
                      groups.push(batches[s.batchId]);
                    }
                    batches[s.batchId].items.push(s);
                  } else {
                    groups.push({ isBatch: false, items: [s], id: s._id });
                  }
                });

                return (
                  <div className={`space-y-6 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    {groups.map((group) => {
                      const first = group.items[0];
                      const isHuman = group.items.some(item => item.moderatedBy === 'human');
                      
                      return (
                        <Card 
                          key={group.id} 
                          variant="glass" 
                          onClick={() => toggleGroup(group.id)}
                          className="space-y-4 p-6 border-gray-100 hover:border-blue-200 transition-all cursor-pointer group/card"
                        >
                          <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge variant="outline">{first.category}</Badge>
                                <Badge variant={first.status === 'approved' ? 'success' : first.status === 'rejected' ? 'danger' : 'warning'}>
                                  {getStatusLabel(first.status)}
                                </Badge>
                                <Badge variant="ghost">{t('admin.langShort')}: {first.language}</Badge>
                                {group.isBatch && <Badge variant="info" className="bg-indigo-50 text-indigo-600">{group.items.length} {t('admin.questions')}</Badge>}
                                {isHuman ? (
                                  <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" /> {t('admin.humanModerated', 'Human Moderated')}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1">
                                    <Bot className="w-3 h-3" /> {t('admin.aiModerated', 'AI Moderated')}
                                  </Badge>
                                )}
                              </div>
                              <h2 className="text-2xl font-bold text-[#1a1a1a]">
                                {first.icon} {group.isBatch ? `${first.title} (${t('admin.batch')})` : first.title}
                              </h2>
                              {!group.isBatch && <p className="text-gray-600 mt-2 max-w-3xl">{first.description}</p>}
                              <div className="mt-4">
                                <span className="text-xs text-gray-400 font-medium">{t('admin.author')}: {first.creator?.username || t('admin.unknownAuthor')} • {new Date(first.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto relative z-10">
                              {first.status !== 'approved' && (
                                <Button size="sm" variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(first.batchId || first._id, 'approved'); }}>
                                  <Check className="w-4 h-4 mr-1" /> {t('admin.approve')}
                                </Button>
                              )}
                              {first.status !== 'rejected' && (
                                <Button size="sm" variant="danger" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(first.batchId || first._id, 'rejected'); }}>
                                  <X className="w-4 h-4 mr-1" /> {t('admin.reject')}
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteClick(first.batchId || first._id); }} className="text-gray-400 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-gray-400 hover:text-blue-500 ml-2"
                                onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                              >
                                {expandedGroups.has(group.id) ? <ChevronDown className="w-5 h-5 rotate-180 transition-transform" /> : <ChevronDown className="w-5 h-5 transition-transform" />}
                              </Button>
                            </div>
                          </div>

                      <AnimatePresence>
                        {expandedGroups.has(group.id) && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-6 mt-4 pt-4 border-t border-gray-100">
                              {group.items.map((item, qIdx) => (
                                <div key={item._id} className={`${group.isBatch ? 'p-6 bg-white/50 rounded-[2rem] border border-gray-100' : ''}`}>
                                  {group.isBatch && (
                                    <div className="flex items-center justify-between mb-4">
                                      <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">{t('admin.questionN', { number: qIdx + 1 })}</h4>
                                      <Badge variant="ghost" className="text-[10px]">
                                        {item.selectionType === 'multiple' ? t('simulation.multipleChoice') : t('simulation.singleChoice')}
                                      </Badge>
                                    </div>
                                  )}
                                  {group.isBatch && <h3 className="font-bold text-lg mb-2">{item.title}</h3>}
                                  {group.isBatch && <p className="text-sm text-gray-600 mb-4">{item.description}</p>}
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {item.choices.map((c, i) => (
                                      <div key={i} className={`p-4 rounded-xl border ${c.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}>
                                        <div className="flex items-start gap-2 mb-2">
                                          <span className={`font-bold ${c.isCorrect ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {c.isCorrect ? t('admin.correct') : t('admin.option') + ' ' + (i+1)}
                                          </span> 
                                        </div>
                                        <p className="text-[#1a1a1a] font-medium mb-2">{c.text}</p>
                                        {c.feedback && <div className="text-gray-500 italic text-xs border-t border-gray-100 pt-2">{t('admin.feedback')}: {c.feedback}</div>}
                                      </div>
                                    ))}
                                  </div>

                                  {item.aiFeedback && (
                                    <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[1.5rem] border border-blue-100/50 shadow-inner overflow-hidden relative">
                                      <div className="flex items-center justify-between mb-2">
                                        <strong className="text-indigo-700 text-[10px] uppercase tracking-widest font-black">{t('admin.aiNotes')}</strong>
                                        <Button 
                                          size="sm" 
                                          variant="secondary" 
                                          disabled={remoderatingId === item._id}
                                          className="text-xs py-2 px-4 h-9 bg-white hover:bg-indigo-600 hover:text-white border-indigo-100 shadow-sm transition-all" 
                                          onClick={(e) => { e.stopPropagation(); handleRemoderate(item._id); }}
                                        >
                                          {remoderatingId === item._id ? <Send className="w-3.5 h-3.5 mr-2 animate-pulse" /> : <Shield className="w-3.5 h-3.5 mr-2" />} 
                                          {remoderatingId === item._id ? t('admin.remoderating', 'Moderating...') : t('admin.remoderate')}
                                        </Button>
                                      </div>
                                      
                                      {remoderatingId === item._id ? (
                                        <div className="flex flex-col items-center justify-center py-6 gap-3">
                                          <div className="flex gap-2">
                                            {[0, 1, 2].map((i) => (
                                              <motion.div
                                                key={i}
                                                className="w-2.5 h-2.5 bg-indigo-400 rounded-full"
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                                              />
                                            ))}
                                          </div>
                                          <p className="text-xs font-bold text-indigo-400/70 animate-pulse uppercase tracking-tighter">
                                            {t('admin.analyzing', 'Analyzing content...')}
                                          </p>
                                        </div>
                                      ) : (
                                        <span className="text-indigo-600 leading-relaxed font-medium">{item.aiFeedback}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                    );
                  })}
                </div>
              );
            })()
          )}
          </div>
        ) : (
          <AdminArticlesSection />
        )}
      </div>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={t('admin.deleteScenarioTitle')}
        message={t('admin.deleteScenarioMsg')}
        confirmText={t('admin.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default AdminPage;
