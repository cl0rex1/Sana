import React, { useState, useCallback, useEffect } from 'react';
import { Shield, RotateCcw, Trophy, Target, Zap, CheckCircle, XCircle, AlertTriangle, AlertOctagon, BrainCircuit, Plus, Sparkles, Shuffle, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import scenariosFallback from '../../data/scenarios';
import ScenarioCard from './ScenarioCard';
import FeedbackModal from './FeedbackModal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

/**
 * Main Simulation Hub & Runner.
 * Manages intro menu (lists, AI/Random buttons), playing logic, results, and test creation.
 */
const LifeScenario = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth() || { user: null };
  const AI_TEST_COUNT = 5;
  const [gameState, setGameState] = useState('hub'); // hub | creating | loading | playing | feedback | results
  const [testMode, setTestMode] = useState(null); // 'ai', 'random', 'specific'
  const [approvedTests, setApprovedTests] = useState([]);
  const [scenarioError, setScenarioError] = useState('');
  
  // Game running state
  const [runPipeline, setRunPipeline] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [results, setResults] = useState([]);
  
  // Create Test Form state
  const [createForm, setCreateForm] = useState({
    title: '', description: '',
    choices: [
      { text: '', isCorrect: true, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' }
    ]
  });

  const correctCount = results.filter((r) => r.isCorrect).length;

  useEffect(() => {
    if (gameState === 'hub') {
      fetchApprovedTests();
    }
  }, [gameState, i18n.language]);

  const fetchApprovedTests = async () => {
    try {
      const res = await api.get(`/scenarios/approved?lang=${i18n.language}`);
      setApprovedTests(res.data || []);
    } catch (err) {
      console.error('Failed to load approved scenarios', err);
    }
  };

  /** Start a specific set of tests or dynamic flow */
  const fetchNextScenario = useCallback(async (idx, mode, pipeline) => {
    setGameState('loading');
    try {
      let scenarioData = null;
      if (pipeline && pipeline.length > idx) {
        scenarioData = pipeline[idx];
      } else if (mode === 'ai' || (mode === 'random' && approvedTests.length === 0)) {
        // AI Generation or fallback if DB empty
        const response = await api.get(`/ai/scenario?lang=${i18n.language}`);
        scenarioData = response?.choices ? response : response?.data;
        if (!scenarioData?.choices) throw new Error("Invalid format");
      } else if (mode === 'random') {
        const randomItem = approvedTests[Math.floor(Math.random() * approvedTests.length)];
        scenarioData = randomItem;
      }
      
      setCurrentScenario(scenarioData || scenariosFallback[idx % scenariosFallback.length]);
      setGameState('playing');
    } catch (err) {
      console.warn('Scenario load failed:', err);
      if (mode === 'ai' || (mode === 'random' && approvedTests.length === 0)) {
        setScenarioError(t('simulation.aiError'));
        setGameState('error');
        return;
      }

      setCurrentScenario(scenariosFallback[idx % scenariosFallback.length]);
      setGameState('playing');
    }
  }, [approvedTests, i18n.language, t]);

  const startTest = useCallback(async (mode, targetScenarios = null) => {
    setTestMode(mode);
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
    setScenarioError('');
    setRunPipeline(targetScenarios || []);
    setGameState('loading');

    if (mode === 'ai') {
      try {
        const batch = await api.get(`/ai/test?lang=${i18n.language}&count=${AI_TEST_COUNT}`, {
          timeout: 70000,
        });
        if (!Array.isArray(batch) || batch.length === 0) {
          throw new Error('Invalid AI test batch');
        }

        setRunPipeline(batch);
        await fetchNextScenario(0, 'specific', batch);
        return;
      } catch (err) {
        console.warn('AI test batch load failed:', err);
        setScenarioError(t('simulation.aiError'));
        setGameState('error');
        return;
      }
    }

    await fetchNextScenario(0, mode, targetScenarios);
  }, [AI_TEST_COUNT, fetchNextScenario, i18n.language, t]);

  const handleChoice = useCallback((choice) => {
    setSelectedChoice(choice);
    setResults((prev) => [
      ...prev,
      {
        scenarioId: currentScenario._id || currentScenario.id,
        scenarioTitle: currentScenario.title,
        choiceId: choice.id || choice._id,
        choiceText: choice.text,
        isCorrect: choice.isCorrect,
      },
    ]);
    setGameState('feedback');
  }, [currentScenario]);

  const handleNext = useCallback(async () => {
    setSelectedChoice(null);
    const totalCount = runPipeline.length > 0 ? runPipeline.length : 5; // default to 5 for AI/Random
    
    if (currentIndex < totalCount - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      await fetchNextScenario(nextIdx, testMode, runPipeline);
    } else {
      setGameState('results');
    }
  }, [currentIndex, fetchNextScenario, runPipeline, testMode]);

  const restartGame = useCallback(() => {
    setGameState('hub');
    setTestMode(null);
    setCurrentIndex(0);
    setCurrentScenario(null);
    setSelectedChoice(null);
    setResults([]);
    setRunPipeline([]);
    setScenarioError('');
  }, []);

  const submitNewTest = async (e) => {
    e.preventDefault();
    try {
      setGameState('loading');
      await api.post('/scenarios/submit', {
        title: createForm.title,
        description: createForm.description,
        category: 'General',
        choices: createForm.choices.map((c, i) => ({ ...c, id: String.fromCharCode(65 + i) })),
        language: i18n.language
      });
      alert(t('simulation.testSubmitted') || 'Test submitted for AI moderation successfully!');
      setGameState('hub');
    } catch (err) {
      console.error(err);
      alert(t('simulation.submitFailed') || 'Failed to submit test');
      setGameState('creating');
    }
  };

  // ==================== HUB SCREEN ====================
  if (gameState === 'hub') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-[3rem] border border-gray-200 p-10 md:p-12 text-center shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-4">
              {t('simulation.title')}
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              {t('simulation.hubSubtitle')}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="primary" size="lg" onClick={() => startTest('ai')} icon={Sparkles} className="shadow-lg">
                  {t('simulation.aiTest')}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" size="lg" onClick={() => startTest('random')} icon={Shuffle} className="shadow-sm bg-white hover:bg-gray-50 border-gray-200">
                  {t('simulation.randomTest')}
                </Button>
              </motion.div>
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" onClick={() => setGameState('creating')} icon={Plus} className="border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600">
                    {t('simulation.createNewTest')}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 flex items-center"><Target className="w-6 h-6 mr-2 text-blue-500" /> {t('simulation.communityScenarios')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedTests.length === 0 ? (
              <p className="text-gray-400 col-span-3 text-center py-10 bg-gray-50 rounded-3xl border border-gray-100">{t('simulation.noCommunityScenarios')}</p>
            ) : (
              approvedTests.map((test, i) => (
                <motion.div key={test._id || i} whileHover={{ y: -5 }}>
                  <Card padding="p-6" className="h-full flex flex-col hover:shadow-lg transition-shadow bg-white rounded-[2rem] border border-gray-100 cursor-pointer" onClick={() => startTest('specific', [test])}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex justify-center items-center text-xl">{test.icon || '🛡️'}</div>
                      <Badge variant="primary">{test.category || 'General'}</Badge>
                    </div>
                    <h3 className="font-bold text-lg text-[#1a1a1a] mb-2">{test.title}</h3>
                    <p className="text-gray-500 text-sm flex-1 line-clamp-3 mb-6">{test.description}</p>
                    <Button variant="ghost" className="w-full justify-center text-blue-600 hover:bg-blue-50 rounded-xl" icon={Play}>{t('simulation.playTest')}</Button>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // ==================== CREATING SCREEN ====================
  if (gameState === 'creating') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-8 bg-white rounded-[3rem] border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a]">{t('simulation.createScenario')}</h2>
          <Button variant="ghost" onClick={() => setGameState('hub')} icon={XCircle}>{t('simulation.cancel')}</Button>
        </div>
        <p className="text-gray-500 mb-8 border-l-4 border-yellow-400 pl-4 py-1 bg-yellow-50/50 rounded-r-lg">
          {t('simulation.reviewNotice')}
        </p>
        <form onSubmit={submitNewTest} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('simulation.titleLabel')}</label>
            <input required type="text" className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} placeholder={t('simulation.titlePlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('simulation.descriptionLabel')}</label>
            <textarea required rows={3} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder={t('simulation.descriptionPlaceholder')} />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">{t('simulation.choicesLabel')}</label>
            {createForm.choices.map((choice, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${i===0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'} space-y-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-sm ${i===0 ? 'text-emerald-700' : 'text-red-700'}`}>{t('simulation.choice')} {i+1} ({i===0 ? t('simulation.correct') : t('simulation.incorrect')})</span>
                </div>
                <input required type="text" placeholder={t('simulation.choiceTextPlaceholder')} className="w-full p-3 rounded-xl border border-gray-200" value={choice.text} onChange={e => { const newC = [...createForm.choices]; newC[i].text = e.target.value; setCreateForm({...createForm, choices: newC}) }} />
                <input required type="text" placeholder={t('simulation.feedbackPlaceholder')} className="w-full p-3 rounded-xl border border-gray-200" value={choice.feedback} onChange={e => { const newC = [...createForm.choices]; newC[i].feedback = e.target.value; setCreateForm({...createForm, choices: newC}) }} />
              </div>
            ))}
          </div>
          <Button variant="primary" size="lg" className="w-full pt-4 mt-6 rounded-[1.5rem]" type="submit" icon={CheckCircle}>{t('simulation.submitForModeration')}</Button>
        </form>
      </motion.div>
    );
  }

  const totalCount = runPipeline.length > 0 ? runPipeline.length : 5;
  const scorePercentage = Math.round((correctCount / totalCount) * 100);

  // ==================== LOADING SCREEN ====================
  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">{t('simulation.processing')}</p>
      </div>
    );
  }

  if (gameState === 'error') {
    return (
      <Card className="max-w-2xl mx-auto text-center p-8 rounded-[3rem] border border-red-200 bg-white shadow-sm">
        <AlertOctagon className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{t('simulation.aiErrorTitle')}</h2>
        <p className="text-gray-600 mb-6">{scenarioError || t('simulation.aiError')}</p>
        <div className="flex justify-center">
          <Button variant="primary" onClick={restartGame} icon={RotateCcw}>
            {t('simulation.backToHub')}
          </Button>
        </div>
      </Card>
    );
  }

  // ==================== RESULTS SCREEN ====================
  if (gameState === 'results') {
    const getGrade = () => {
      if (scorePercentage >= 90) return { label: t('simulation.grade.expert', 'Cyber Expert'), color: 'text-emerald-500', icon: <Shield className="w-12 h-12 text-emerald-500 mx-auto" /> };
      if (scorePercentage >= 70) return { label: t('simulation.grade.aware', 'Aware Citizen'), color: 'text-blue-500', icon: <CheckCircle className="w-12 h-12 text-blue-500 mx-auto" /> };
      if (scorePercentage >= 50) return { label: t('simulation.grade.needsTraining', 'Needs Training'), color: 'text-yellow-500', icon: <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" /> };
      return { label: t('simulation.grade.risk', 'High Risk'), color: 'text-red-500', icon: <AlertOctagon className="w-12 h-12 text-red-500 mx-auto" /> };
    };

    const grade = getGrade();

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="mb-4">{grade.icon}</div>
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">{t('simulation.results')}</h2>
          <p className={`text-xl font-semibold ${grade.color}`}>{grade.label}</p>
        </div>

        {/* Score card */}
        <Card className="mb-6" glow>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-bold text-[#1a1a1a]">{t('simulation.score')}</span>
            </div>
            <span className="text-3xl font-mono font-bold text-[#1a1a1a]">{scorePercentage}%</span>
          </div>
          <ProgressBar value={correctCount} max={totalCount} showPercentage={false} />
          <p className="text-sm text-gray-600 mt-3">
            {t('simulation.correctOut', { correct: correctCount, total: totalCount, defaultValue: `${correctCount} correct out of ${totalCount} scenarios` })}
          </p>
        </Card>

        {/* Results breakdown */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('simulation.breakdown', 'Breakdown')}</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                result.isCorrect
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              {result.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{result.scenarioTitle}</p>
              </div>
              <Badge variant={result.isCorrect ? 'low' : 'critical'}>
                {result.isCorrect ? t('simulation.safe', 'Safe') : t('simulation.risky', 'Risky')}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" onClick={restartGame} icon={RotateCcw} className="flex-1">
            {t('simulation.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  // ==================== LOADING / PLAYING / FEEDBACK SCREEN ====================
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <ProgressBar
          value={gameState === 'feedback' ? currentIndex + 1 : currentIndex}
          max={totalCount}
          label={t('simulation.progress')}
        />
      </div>

      {gameState === 'loading' ? (
        <Card className="animate-rainbow border-2 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden" glow>
          <div className="absolute inset-0 bg-white/40 pointer-events-none" />
          <div className="relative z-10 w-full px-8 flex flex-col items-center text-center">
             <div className="flex gap-2 justify-center mb-6">
               <div className="w-3 h-3 bg-[#1a1a1a] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="w-3 h-3 bg-[#1a1a1a] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="w-3 h-3 bg-[#1a1a1a] rounded-full animate-bounce"></div>
             </div>
             <p className="text-lg font-bold text-[#1a1a1a] mb-2">{t('simulation.generatingTitle', 'AI is Generating a Scenario...')}</p>
             <p className="text-sm text-gray-500 max-w-sm">{t('simulation.generatingDesc', 'Crafting a real-world dilemma...')}</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Current scenario */}
          {currentScenario && (
            <ScenarioCard
              scenario={currentScenario}
              currentIndex={currentIndex}
              total={totalCount}
              onChoose={handleChoice}
              disabled={gameState === 'feedback'}
            />
          )}

          {/* Feedback overlay (shown after choosing) */}
          {gameState === 'feedback' && (
            <FeedbackModal
              choice={selectedChoice}
              onNext={handleNext}
              isLastScenario={currentIndex === totalCount - 1}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LifeScenario;
