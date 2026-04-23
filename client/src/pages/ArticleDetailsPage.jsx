import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Tag, 
  PlayCircle, 
  ChevronRight,
  Shield,
  Lock,
  Wifi,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowEffect from '../components/ui/GlowEffect';

const ICON_MAP = {
  Shield: <Shield className="w-6 h-6" />,
  Lock: <Lock className="w-6 h-6" />,
  Wifi: <Wifi className="w-6 h-6" />,
  AlertTriangle: <AlertTriangle className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
};

const ArticleDetailsPage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [id, i18n.language]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/articles/${id}`);
      setArticle(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch article:', err);
      setError(t('articles.fetchError', 'Failed to load article content.'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('common.error', 'Error')}</h2>
        <p className="text-gray-500 mb-6">{error || t('articles.notFound', 'Article not found')}</p>
        <Button onClick={() => navigate('/learn')} icon={ArrowLeft}>
          {t('articles.backToList', 'Back to Articles')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto pt-8 relative">
        <GlowEffect color="from-blue-500/10 to-indigo-500/10" className="opacity-30" />

        <Link 
          to="/learn" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('articles.backToList', 'Back to Articles')}
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 relative z-10"
        >
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider">
                {article.tag || 'General'}
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1a1a] leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {article.author?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">{article.author?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{t('articles.authorLabel', 'Content Expert')}</p>
              </div>
            </div>
          </header>

          <Card className="p-8 md:p-12 overflow-hidden bg-white border-gray-100 shadow-sm rounded-[2.5rem]">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 font-medium leading-relaxed mb-8 border-l-4 border-blue-500 pl-6">
                {article.description}
              </p>
              
              <div 
                className="article-content text-gray-700 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {article.points && article.points.length > 0 && (
              <div className="mt-12 p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  {t('articles.keyTakeaways', 'Key Takeaways')}
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {article.practiceScenario && (
            <motion.div
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <Card className="relative p-8 md:p-10 bg-gradient-to-r from-[#1a1a1a] to-[#333] text-white border-none rounded-[2.5rem] overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 text-center md:text-left">
                    <h3 className="text-2xl font-bold">{t('articles.readyToTest', 'Ready to test your knowledge?')}</h3>
                    <p className="text-gray-400 max-w-md">
                      {t('articles.practicePrompt', 'Launch a focused simulation based on this article and earn points.')}
                    </p>
                  </div>
                  <Link 
                    to={`/simulation?mode=specific&id=${article.practiceScenario._id}`}
                    className="flex items-center gap-3 px-8 py-4 bg-white text-[#1a1a1a] font-bold rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl group"
                  >
                    <PlayCircle className="w-6 h-6 text-blue-600" />
                    {t('articles.startPractice', 'Start Practice')}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ArticleDetailsPage;
