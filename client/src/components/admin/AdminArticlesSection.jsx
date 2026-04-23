import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, X, BookOpen, PlayCircle, ExternalLink } from 'lucide-react';
import api from '../../utils/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const AdminArticlesSection = () => {
  const [articles, setArticles] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(null);
  
  const [formData, setFormData] = useState({
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

  const [activeFormTab, setActiveFormTab] = useState('general'); // general | content | summary

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/articles/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      alert('Failed to save article');
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

  if (loading && articles.length === 0) return <div className="text-center py-10">Loading articles...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1a1a1a] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Articles Management
        </h2>
        {!isEditing && (
          <Button variant="primary" onClick={() => { resetForm(); setIsEditing(true); setCurrentArticle(null); }} icon={Plus}>
            Create Article
          </Button>
        )}
      </div>

      {isEditing && (
        <Card className="p-8 border-2 border-blue-100 shadow-xl rounded-[2rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1a1a1a]">
                {currentArticle ? 'Edit Article' : 'New Article'}
              </h3>
              <Button variant="ghost" onClick={() => setIsEditing(false)} icon={X}>Cancel</Button>
            </div>

            {/* Form Tabs */}
            <div className="flex bg-gray-50 p-1 rounded-2xl mb-8 w-fit">
              {[
                { id: 'general', label: 'General Info' },
                { id: 'summary', label: 'Summary & Points' },
                { id: 'content', label: 'Main Content' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeFormTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeFormTab === 'general' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Title</label>
                    <input
                      required
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter article title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Tag</label>
                    <input
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Phishing Protection"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
                      <select
                        className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="phishing">Phishing</option>
                        <option value="standard">Standard</option>
                        <option value="device">Device</option>
                        <option value="social">Social</option>
                        <option value="network">Network</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Language</label>
                      <select
                        className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      >
                        <option value="ru">Russian</option>
                        <option value="kz">Kazakh</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Link Practice Scenario</label>
                    <select
                      className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      value={formData.practiceScenario}
                      onChange={(e) => setFormData({ ...formData, practiceScenario: e.target.value })}
                    >
                      <option value="">No Practice Linked</option>
                      {scenarios.map((sc) => (
                        <option key={sc._id} value={sc._id}>{sc.icon} {sc.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeFormTab === 'summary' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description (Snippet)</label>
                  <textarea
                    required
                    rows={6}
                    className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary for the list view"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Key Takeaways (Points)</label>
                  <div className="space-y-3">
                    {formData.points.map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">{i+1}</div>
                        <input
                          className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          value={p}
                          onChange={(e) => updatePoint(i, e.target.value)}
                          placeholder={`Important point ${i+1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeFormTab === 'content' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Main Content (HTML Support)</label>
                <textarea
                  required
                  rows={12}
                  className="w-full p-6 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-inner transition-all"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<p>Write your article here...</p>"
                />
                <p className="text-[10px] text-gray-400 italic">Pro-tip: Use HTML tags for formatting (p, h2, ul, li, strong).</p>
              </motion.div>
            )}

            <div className="flex gap-4 pt-6">
              <Button type="submit" variant="primary" size="lg" className="flex-1 py-4 rounded-2xl shadow-xl shadow-blue-100" icon={Check}>
                {currentArticle ? 'Update Article' : 'Publish Article'}
              </Button>
            </div>

          </form>
        </Card>
      )}

      <div className="grid gap-6">
        {articles.map((art) => (
          <Card key={art._id} className="p-6 bg-white border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{art.tag}</Badge>
                  <Badge variant="ghost">{art.language?.toUpperCase()}</Badge>
                  {art.practiceScenario && (
                    <Badge variant="success" className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1">
                      <PlayCircle className="w-3 h-3" /> Practice Linked
                    </Badge>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a]">{art.title}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{art.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {art.category}</span>
                  <span>Updated: {new Date(art.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleEdit(art)} icon={Edit2}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(art._id)} icon={Trash2}>Delete</Button>
                <Link to={`/learn/${art._id}`} target="_blank">
                  <Button size="sm" variant="ghost" icon={ExternalLink}>View</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {articles.length === 0 && !loading && (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No articles yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticlesSection;
