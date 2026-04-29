import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Edit2, Check, X, BookOpen, PlayCircle, ExternalLink, Shield, Search, Filter, UserCheck, Bot, ChevronDown, Send } from 'lucide-react';
import api from '../../utils/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';
import { useNotification } from '../../context/NotificationContext';

const AdminArticlesSection = () => {
  const { t } = useTranslation();
  const { pushNotification } = useNotification();
  const [articles, setArticles] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remoderatingId, setRemoderatingId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [expandedArticles, setExpandedArticles] = useState(new Set());
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    language: 'all',
    search: ''
  });

  const getStatusLabel = (status) => t(`admin.${status}`, status || '');

  useEffect(() => {

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artRes, scRes] = await Promise.all([
        api.get('/articles/admin'),
        api.get('/scenarios/approved')
      ]);
      setArticles(artRes.data || []);
      setScenarios(scRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin articles data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (article) => {
    setCurrentArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      tag: article.tag,
      icon: article.icon,
      language: article.language,
      practiceScenario: article.practiceScenario?._id || '',
      points: article.points?.length > 0 ? article.points : ['', '', '']
    });
    setIsEditing(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/articles/${confirmModal.id}`);
      pushNotification('success', t('admin.successDelete'));
      fetchData();
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
      await api.put(`/articles/${id}/moderate`);
      // Explicitly wait for fresh data
      await fetchData();
      pushNotification('success', t('admin.remoderateSuccess', 'Article re-moderated successfully!'));
    } catch (err) {
      console.error('Failed to remoderate', err);
      pushNotification('error', t('admin.remoderateError', 'Failed to re-moderate article.'));
    } finally {
      // Small delay for UX
      setTimeout(() => setRemoderatingId(null), 500);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/articles/${id}`, { status, moderatedBy: 'human' });
      fetchData();
      pushNotification('success', t('admin.successStatusUpdate', 'Article status updated!'));
    } catch (err) {
      console.error(err);
      pushNotification('error', t('admin.errorStatusUpdate', 'Failed to update article status.'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentArticle) {
        await api.put(`/articles/${currentArticle._id}`, formData);
      } else {
        await api.post('/articles', formData);
      }
      setIsEditing(false);
      setCurrentArticle(null);
      resetForm();
      fetchData();
      pushNotification('success', currentArticle ? t('admin.successSave') : t('admin.successSave'));
    } catch (err) {
      console.error(err);
      pushNotification('error', t('admin.errorSave'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: 'general',
      tag: 'General',
      icon: 'BookOpen',
      language: 'ru',
      practiceScenario: '',
      points: ['', '', '']
    });
  };

  const updatePoint = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = value;
    setFormData({ ...formData, points: newPoints });
  };

  const toggleArticle = (id) => {
    setExpandedArticles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredArticles = articles.filter(art => {
    const matchStatus = filters.status === 'all' || art.status === filters.status;
    const matchLang = filters.language === 'all' || art.language === filters.language;
    const matchCat = filters.category === 'all' || art.category === filters.category;
    const matchSearch = !filters.search || 
      art.title.toLowerCase().includes(filters.search.toLowerCase()) || 
      art.description.toLowerCase().includes(filters.search.toLowerCase());
    return matchStatus && matchLang && matchCat && matchSearch;
  });

  if (loading && articles.length === 0) return <div className="text-center py-10">{t('admin.loading')}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          {t('admin.articleMgmt')}
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

      <div className={`grid gap-6 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {filteredArticles.map((art) => (
          <Card 
            key={art._id} 
            onClick={() => toggleArticle(art._id)}
            className="p-6 bg-white border border-gray-100 hover:border-blue-200 transition-all cursor-pointer group/card"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{art.tag}</Badge>
                  <Badge variant={art.status === 'approved' ? 'success' : art.status === 'rejected' ? 'danger' : 'warning'}>
                    {getStatusLabel(art.status)}
                  </Badge>
                  <Badge variant="ghost">{art.language?.toUpperCase()}</Badge>
                  {art.practiceScenario && (
                    <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> {t('admin.practiceLinked')}
                    </Badge>
                  )}
                  {art.moderatedBy === 'human' ? (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-100 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> {t('admin.humanModerated', 'Human Moderated')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1">
                      <Bot className="w-3 h-3" /> {t('admin.aiModerated', 'AI Moderated')}
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a]">{art.title}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{art.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {art.category}</span>
                  <span>{t('admin.updatedAt')}: {new Date(art.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto relative z-10">
                {art.status !== 'approved' && (
                  <Button size="sm" variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(art._id, 'approved'); }}>
                    <Check className="w-4 h-4 mr-1" /> {t('admin.approve')}
                  </Button>
                )}
                {art.status !== 'rejected' && (
                  <Button size="sm" variant="danger" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(art._id, 'rejected'); }}>
                    <X className="w-4 h-4 mr-1" /> {t('admin.reject')}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteClick(art._id); }} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Link to={`/learn/${art._id}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" className="text-gray-400 group-hover/card:text-blue-500 transition-colors">
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedArticles.has(art._id) ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {expandedArticles.has(art._id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed mb-4">{art.description}</p>
                    
                    <div className="prose prose-sm max-w-none mb-6">
                      <div 
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 max-h-[400px] overflow-y-auto custom-scrollbar article-content-preview"
                        dangerouslySetInnerHTML={{ __html: art.content }}
                      />
                    </div>
                    
                    {art.aiFeedback && (
                      <div className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[1.5rem] border border-blue-100/50 shadow-inner overflow-hidden relative">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-indigo-700 text-[10px] uppercase tracking-widest font-black">{t('admin.aiNotes')}</strong>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              disabled={remoderatingId === art._id}
                              className="text-xs py-2 px-4 h-9 bg-white hover:bg-indigo-600 hover:text-white border-indigo-100 shadow-sm transition-all" 
                              onClick={(e) => { e.stopPropagation(); handleRemoderate(art._id); }}
                            >
                              {remoderatingId === art._id ? <Send className="w-3.5 h-3.5 mr-2 animate-pulse" /> : <Shield className="w-3.5 h-3.5 mr-2" />} 
                              {remoderatingId === art._id ? t('admin.remoderating', 'Moderating...') : t('admin.remoderate')}
                            </Button>
                        </div>

                        {remoderatingId === art._id ? (
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
                          <span className="text-indigo-600 leading-relaxed font-medium">{art.aiFeedback}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center justify-end">
                      <Link to={`/learn/${art._id}`} target="_blank" className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                        {t('admin.fullArticle', 'Read Full Article')} <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}

        {filteredArticles.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('admin.noResults', 'No results found')}</p>
          </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={t('admin.deleteArticleTitle')}
        message={t('admin.deleteArticleMsg')}
        confirmText={t('admin.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default AdminArticlesSection;
