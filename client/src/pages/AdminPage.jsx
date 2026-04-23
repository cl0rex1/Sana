import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Shield, Check, X, Trash2, ShieldAlert, BookOpen, Layers } from 'lucide-react';
import api from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AdminArticlesSection from '../components/admin/AdminArticlesSection';

const AdminPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scenario?')) return;
    try {
      await api.delete(`/scenarios/${id}`);
      fetchScenarios();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoderate = async (id) => {
    try {
      setLoading(true);
      await api.put(`/scenarios/${id}/moderate`);
      fetchScenarios();
    } catch (err) {
      console.error('Failed to remoderate', err);
      alert('Moderation failed. Check AI quota.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-4xl font-bold text-[#1a1a1a]">Admin Governance</h1>
            <p className="text-gray-500">Manage platform content and moderate submissions.</p>
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
            Scenarios
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
            Articles
          </button>
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'scenarios' ? (
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-20 text-[#1a1a1a]">Loading scenarios...</div>
            ) : scenarios.length === 0 ? (
              <div className="text-center text-gray-500 py-16 bg-white border border-gray-200 rounded-3xl shadow-sm">
                No scenarios found in the database.
              </div>
            ) : (
              scenarios.map((scenario) => (
                <Card key={scenario._id} variant="glass" className="space-y-4 p-6 border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{scenario.category}</Badge>
                        <Badge variant={scenario.status === 'approved' ? 'success' : scenario.status === 'rejected' ? 'danger' : 'warning'}>
                          {scenario.status}
                        </Badge>
                        <Badge variant="ghost">Lang: {scenario.language}</Badge>
                      </div>
                      <h2 className="text-2xl font-bold text-[#1a1a1a]">{scenario.icon} {scenario.title}</h2>
                      <p className="text-gray-600 mt-2 max-w-3xl">{scenario.description}</p>
                      <div className="mt-4">
                        <span className="text-xs text-gray-400 font-medium">Author: {scenario.creator?.username || 'Unknown'} • {new Date(scenario.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {scenario.status !== 'approved' && (
                        <Button size="sm" variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" onClick={() => handleUpdateStatus(scenario._id, 'approved')}>
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {scenario.status !== 'rejected' && (
                        <Button size="sm" variant="danger" className="bg-red-50 text-red-700 border-red-100 hover:bg-red-100" onClick={() => handleUpdateStatus(scenario._id, 'rejected')}>
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(scenario._id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl space-y-4 text-sm mt-4">
                    <h3 className="font-bold text-[#1a1a1a] flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500"/> Choice Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {scenario.choices.map((c, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${c.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-start gap-2 mb-2">
                            <span className={`font-bold ${c.isCorrect ? 'text-emerald-600' : 'text-gray-400'}`}>
                              {c.isCorrect ? 'Correct' : 'Option ' + (i+1)}
                            </span> 
                          </div>
                          <p className="text-[#1a1a1a] font-medium mb-2">{c.text}</p>
                          {c.feedback && <div className="text-gray-500 italic text-xs border-t border-gray-100 pt-2">Feedback: {c.feedback}</div>}
                        </div>
                      ))}
                    </div>
                    
                    {scenario.aiFeedback && (
                      <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[1.5rem] border border-blue-100/50 shadow-inner">
                        <div className="flex items-center justify-between mb-2">
                          <strong className="text-indigo-700 text-xs uppercase tracking-widest font-black">AI MODERATOR NOTES</strong>
                          <Button 
                            size="xs" 
                            variant="secondary" 
                            className="text-[10px] py-1 h-7 bg-white/80 hover:bg-white border-indigo-100" 
                            onClick={() => handleRemoderate(scenario._id)}
                          >
                            <Shield className="w-3 h-3 mr-1" /> Re-moderate
                          </Button>
                        </div>
                        <span className="text-indigo-600 leading-relaxed font-medium">{scenario.aiFeedback}</span>
                      </div>
                    )}

                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <AdminArticlesSection />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
