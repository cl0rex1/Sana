import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  BookOpen, 
  Send, 
  Layout, 
  Type, 
  Tag, 
  Globe, 
  HelpCircle,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';

import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GlowEffect from '../components/ui/GlowEffect';

const CreateArticlePage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'general',
    tag: '',
    icon: 'BookOpen',
    language: i18n.language || 'ru',
    practiceScenario: '',
    points: ['', '', '']
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchScenarios();
    }
  }, [user, navigate]);

  const fetchScenarios = async () => {
    try {
      const res = await api.get('/scenarios/approved');
      setScenarios(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePoint = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = value;
    setFormData({ ...formData, points: newPoints });
  };

  const addPoint = () => {
    if (formData.points.length < 6) {
      setFormData({ ...formData, points: [...formData.points, ''] });
    }
  };

  const removePoint = (index) => {
    if (formData.points.length > 1) {
      setFormData({ ...formData, points: formData.points.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/articles', formData);
      alert(user?.role === 'admin' ? 'Article published!' : 'Article submitted for moderation!');

      navigate('/learn');
    } catch (err) {
      console.error(err);
      alert('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto pt-8 relative">
        <GlowEffect color="from-blue-500/10 to-indigo-500/10" className="opacity-30" />
        
        <button 
          onClick={() => navigate('/learn')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('articles.backToList', 'Back to Articles')}
        </button>

        <header className="mb-10 animate-fade-in relative z-10">
          <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-4 flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-600" />
            {t('articles.createTitle', 'Create Educational Article')}
          </h1>
          <p className="text-gray-500">
            {t('articles.createDesc', 'Share your cybersecurity knowledge with the community.')}
          </p>
        </header>

        <Card className="p-8 md:p-12 bg-white border-gray-100 shadow-xl rounded-[2.5rem] relative z-10 overflow-visible">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <Type className="w-4 h-4 text-blue-500" />
                    {t('articles.titleLabel', 'Article Title')}
                  </label>
                  <input
                    required
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. How to recognize WhatsApp scams"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <Layout className="w-4 h-4 text-emerald-500" />
                      {t('articles.categoryLabel', 'Category')}
                    </label>
                    <select
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="phishing">Phishing</option>
                      <option value="standard">Passwords</option>
                      <option value="device">Device</option>
                      <option value="social">Social</option>
                      <option value="network">Network</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      {t('articles.languageLabel', 'Language')}
                    </label>
                    <select
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="ru">Русский</option>
                      <option value="kz">Қазақша</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <Tag className="w-4 h-4 text-purple-500" />
                    {t('articles.tagLabel', 'Custom Tag')}
                  </label>
                  <input
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Banking, WhatsApp, 2FA"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <HelpCircle className="w-4 h-4 text-yellow-500" />
                    {t('articles.practiceLinkLabel', 'Link Practice Scenario')}
                  </label>
                  <select
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    value={formData.practiceScenario}
                    onChange={(e) => setFormData({ ...formData, practiceScenario: e.target.value })}
                  >
                    <option value="">No Practice Linked</option>
                    {scenarios.map((sc) => (
                      <option key={sc._id} value={sc._id}>{sc.icon} {sc.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 text-red-500" />
                    {t('articles.keyTakeawaysLabel', 'Key Takeaways (max 6)')}
                  </label>

                  <div className="space-y-3">
                    {formData.points.map((p, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white transition-all outline-none text-sm"
                          value={p}
                          onChange={(e) => updatePoint(i, e.target.value)}
                          placeholder={`Point ${i+1}`}
                        />
                        {formData.points.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removePoint(i)}
                            className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.points.length < 6 && (
                      <button 
                        type="button" 
                        onClick={addPoint}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-1"
                      >
                        <Plus className="w-4 h-4" /> Add Point
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Layout className="w-4 h-4 text-blue-500" />
                {t('articles.descriptionLabel', 'Short Summary')}
              </label>
              <textarea
                required
                rows={2}
                className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief summary for the preview card..."
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Type className="w-4 h-4 text-blue-500" />
                {t('articles.contentLabel', 'Article Content (HTML Supported)')}
              </label>
              <textarea
                required
                rows={12}
                className="w-full p-6 rounded-[2rem] bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-mono text-sm leading-relaxed"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="<h3>Important Rules</h3><p>Always check the sender...</p>"
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                loading={loading}
                className="px-12 py-4 rounded-2xl text-lg shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all" 
                icon={Send}
              >
                {user?.role === 'admin' ? t('articles.publish', 'Publish Article') : t('articles.submit', 'Submit for Moderation')}

              </Button>
            </div>

          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateArticlePage;
