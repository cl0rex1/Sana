import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import GlowEffect from '../components/ui/GlowEffect';
import api from '../utils/api';
import { 
  BookOpen, 
  Shield, 
  Lock, 
  Wifi, 
  AlertTriangle, 
  ChevronDown, 
  PlayCircle, 
  Search, 
  Filter,
  ArrowRight,
  Plus,
  Sparkles,
  Shuffle,
  BrainCircuit,
  Target,
  Globe,
  CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { useAuth } from '../context/AuthContext';


const ICON_MAP = {
  phishing: <Shield className="w-8 h-8 text-blue-500" />,
  standard: <Lock className="w-8 h-8 text-emerald-500" />,
  device: <Wifi className="w-8 h-8 text-purple-500" />,
  social: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
  network: <Wifi className="w-8 h-8 text-indigo-500" />,
  general: <BookOpen className="w-8 h-8 text-gray-500" />,
};

const CATEGORIES = [
  { id: 'all', labelKey: 'articles.cat.all', defaultValue: 'All Topics' },
  { id: 'phishing', labelKey: 'articles.cat.phishing', defaultValue: 'Phishing' },
  { id: 'standard', labelKey: 'articles.cat.passwords', defaultValue: 'Passwords' },
  { id: 'device', labelKey: 'articles.cat.device', defaultValue: 'Device Security' },
  { id: 'social', labelKey: 'articles.cat.social', defaultValue: 'Social Engineering' },
];

const ArticlesPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth() || { user: null };
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [openedId, setOpenedId] = useState(null);
  const [readHistory, setReadHistory] = useState([]);
  const [communityFilters, setCommunityFilters] = useState({
    search: '',
    category: 'all',
    language: i18n.language || 'ru'
  });
  
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [activeCategory, communityFilters]);

  useEffect(() => {
    fetchArticles();
    fetchReadHistory();
  }, [i18n.language, activeCategory]);

  const fetchReadHistory = async () => {
    try {
      const res = await api.get('/articles/history/read');
      setReadHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch read history', err);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/articles?lang=${i18n.language}&category=${activeCategory}`);
      setArticles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch articles', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(communityFilters.search.toLowerCase()) ||
                        art.description.toLowerCase().includes(communityFilters.search.toLowerCase());
    const matchesCategory = communityFilters.category === 'all' || art.category === communityFilters.category;
    const matchesLanguage = communityFilters.language === 'all' || art.language === communityFilters.language;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const handleRandomArticle = () => {
    if (articles.length > 0) {
      const random = articles[Math.floor(Math.random() * articles.length)];
      navigate(`/learn/${random._id}`);
    }
  };



  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-12 pt-8 relative">
        <GlowEffect color="from-blue-500/20 to-purple-500/20" className="opacity-50" />
        
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-[3rem] border border-gray-200 p-10 md:p-12 text-center shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

          <div className="relative z-10">
            <header className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-4">
                {t('nav.features', 'Learning')}
              </h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                {t('articles.subtitle', 'Expand your cybersecurity knowledge with short, impactful articles.')}
              </p>

              <div className="mb-8">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">{t('articles.contentType')}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                        activeCategory === cat.id 
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg shadow-black/10' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t(cat.labelKey, cat.defaultValue)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                {user && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/learn/create">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        icon={Plus} 
                        className="shadow-lg h-16 px-10 rounded-2xl text-lg"
                      >
                        {t('articles.createBtn', 'Create Article')}
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </header>
          </div>
        </div>

        {/* Community Section Header */}
        <div id="community-articles" className="pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <h2 className="text-3xl font-black text-[#1a1a1a] flex items-center shrink-0">
              <Target className="w-8 h-8 mr-3 text-blue-500" /> {t('articles.communityArticles')}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder={t('articles.searchPlaceholder', 'Search articles...')}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm shadow-sm"
                  value={communityFilters.search}
                  onChange={(e) => setCommunityFilters({...communityFilters, search: e.target.value})}
                />
              </div>
              <select 
                className="py-3 px-4 rounded-2xl bg-white border border-gray-100 text-xs font-bold text-gray-600 outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/5"
                value={communityFilters.category}
                onChange={(e) => setCommunityFilters({...communityFilters, category: e.target.value})}
              >
                <option value="all">{t('admin.allCategories', 'All Categories')}</option>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{t(c.labelKey, c.defaultValue)}</option>
                ))}
              </select>
              <select 
                className="py-3 px-4 rounded-2xl bg-white border border-gray-100 text-xs font-bold text-gray-600 outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/5"
                value={communityFilters.language}
                onChange={(e) => setCommunityFilters({...communityFilters, language: e.target.value})}
              >
                <option value="all">{t('admin.allLangs', 'All')}</option>
                <option value="ru">{t('common.langCode.ru')}</option>
                <option value="kz">{t('common.langCode.kz')}</option>
                <option value="en">{t('common.langCode.en')}</option>
              </select>
            </div>
          </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-100 animate-pulse border border-gray-200" />
            ))
          ) : filteredArticles.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('articles.noResults', 'No articles found matching your criteria.')}</p>
            </div>
          ) : (
            <>
              {filteredArticles
                .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                .map((art, i) => (
                  <motion.div
                    key={art._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card 
                      hoverable 
                      className="h-full flex flex-col transition-all duration-300 border border-gray-100/50 overflow-hidden group cursor-pointer"
                      onClick={() => navigate(`/learn/${art._id}`)}
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            {ICON_MAP[art.category] || ICON_MAP.general}
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {readHistory.includes(art._id) && (
                              <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                <CheckCircle className="w-3 h-3" />
                                {t('common.completed', 'Completed')}
                              </span>
                            )}
                            <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {art.tag || t('articles.categoryOptions.general')}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 group-hover:text-blue-600 transition-colors">
                          {art.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                          {art.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <Link
                            to={`/learn/${art._id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {t('articles.readMore', 'Read more')}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          
                          {art.practiceScenario && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                              <PlayCircle className="w-3 h-3" />
                              {t('articles.hasPractice', 'Practice Available')}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              <div className="col-span-full">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={Math.ceil(filteredArticles.length / PAGE_SIZE)} 
                  onPageChange={setCurrentPage} 
                  className="mt-12"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default ArticlesPage;

