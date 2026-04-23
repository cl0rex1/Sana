import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import Button from '../components/ui/Button';


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
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openedId, setOpenedId] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, [i18n.language, activeCategory]);

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

  const filteredArticles = articles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleModule = (id) => {
    setOpenedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8 pt-8 relative">
        <GlowEffect color="from-blue-500/20 to-purple-500/20" className="opacity-50" />
        
        <header className="mb-10 animate-fade-in relative z-10 text-center">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-4">
            {t('nav.features', 'Learn')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('articles.subtitle', 'Expand your cybersecurity knowledge with short, impactful articles.')}
          </p>
        </header>

        {/* Filters & Search */}
        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                {t(cat.labelKey, cat.defaultValue)}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder={t('articles.searchPlaceholder', 'Search articles...')}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link to="/learn/create">
              <Button variant="primary" icon={Plus} className="rounded-full px-6 whitespace-nowrap">
                {t('articles.createBtn', 'Create Article')}
              </Button>
            </Link>
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
            filteredArticles.map((art, i) => (
              <motion.div
                key={art._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hoverable className="h-full flex flex-col transition-all duration-300 border border-gray-100/50 overflow-hidden group">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        {ICON_MAP[art.category] || ICON_MAP.general}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {art.tag || 'General'}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
