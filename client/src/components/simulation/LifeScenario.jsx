import React, { useState, useCallback, useEffect } from 'react';
import { Shield, RotateCcw, Trophy, Target, Zap, CheckCircle, XCircle, AlertTriangle, AlertOctagon, BrainCircuit, Plus, Sparkles, Shuffle, Play, Clock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import scenariosFallback from '../../data/scenarios';
import ScenarioCard from './ScenarioCard';
import FeedbackModal from './FeedbackModal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const TEST_TYPES = [
  { value: 'mixed' },
  { value: 'standard' },
  { value: 'phishing' },
  { value: 'social' },
  { value: 'device' },
  { value: 'learning' },
];

const createBlankQuestion = () => ({
  title: '',
  description: '',
  sharedFeedback: '',
  feedbackMode: 'detailed',
  selectionType: 'single',
  icon: '🛡️',
  category: 'General',
  choices: [
    { text: '', isCorrect: true, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
  ],
});

const sampleRandom = (list, count) => {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const SIMULATION_SESSION_KEY = 'sana_simulation_session_v1';

const loadSimulationSession = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(SIMULATION_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed?.version === 1 ? parsed : null;
  } catch (error) {
    return null;
  }
};

const formatElapsedTime = (seconds) => {
  const total = Math.max(0, seconds || 0);
  const minutes = Math.floor(total / 60);
  const remainingSeconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * Main Simulation Hub & Runner.
 * Manages intro menu (lists, AI/Random buttons), playing logic, results, and test creation.
 */
const LifeScenario = () => {
  const initialSession = loadSimulationSession();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuth() || { user: null };
  const AI_TEST_COUNT = 5;
  const [gameState, setGameState] = useState(initialSession?.gameState || 'hub'); // hub | creating | loading | playing | feedback | results
  const [testMode, setTestMode] = useState(initialSession?.testMode || null); // 'ai', 'random', 'learning', 'specific'
  const [selectedTestType, setSelectedTestType] = useState(initialSession?.selectedTestType || 'mixed');
  const [approvedTests, setApprovedTests] = useState([]);
  const [communityFilters, setCommunityFilters] = useState({
    search: '',
    category: 'all',
    language: i18n.language || 'ru'
  });
  const [communityPage, setCommunityPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [scenarioError, setScenarioError] = useState(initialSession?.scenarioError || '');
  
  // Game running state
  const [runPipeline, setRunPipeline] = useState(initialSession?.runPipeline || []);
  const [hasAutoStartedFromQuery, setHasAutoStartedFromQuery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialSession?.currentIndex || 0);
  const [currentScenario, setCurrentScenario] = useState(initialSession?.currentScenario || null);
  const [selectedChoice, setSelectedChoice] = useState(initialSession?.selectedChoice || null);
  const [results, setResults] = useState(initialSession?.results || []);
  const [timerStartedAt, setTimerStartedAt] = useState(initialSession?.timerStartedAt || null);
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSession?.elapsedSeconds || 0);
  
  // Create Test Form state
  const [createForm, setCreateForm] = useState({
    testType: 'mixed',
    questions: [createBlankQuestion()],
  });
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const { pushNotification } = useNotification();

  useEffect(() => {
    const isLastQuestion = currentIndex === (runPipeline.length > 0 ? runPipeline.length : 5) - 1;
    const isFeedbackOnLast = gameState === 'feedback' && isLastQuestion;

    if (!timerStartedAt || !['playing', 'feedback'].includes(gameState) || isFeedbackOnLast) {
      return undefined;
    }

    const tick = () => setElapsedSeconds(Math.floor((Date.now() - timerStartedAt) / 1000));
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [gameState, timerStartedAt, currentIndex, runPipeline.length]);

  useEffect(() => {
    if (gameState === 'hub' || (!currentScenario && runPipeline.length === 0 && results.length === 0)) {
      localStorage.removeItem(SIMULATION_SESSION_KEY);
      return;
    }

    if (!['playing', 'feedback', 'results'].includes(gameState)) {
      return;
    }

    const sessionPayload = {
      version: 1,
      gameState,
      testMode,
      selectedTestType,
      currentIndex,
      currentScenario,
      runPipeline,
      selectedChoice,
      results,
      scenarioError,
      timerStartedAt,
      elapsedSeconds,
    };

    localStorage.setItem(SIMULATION_SESSION_KEY, JSON.stringify(sessionPayload));
  }, [currentIndex, currentScenario, elapsedSeconds, gameState, results, runPipeline, scenarioError, selectedChoice, selectedTestType, testMode, timerStartedAt]);


  const correctCount = results.filter((r) => r.isCorrect).length;

  const groupedTests = [];
  const batchesSeen = new Set();
  
  approvedTests.forEach(test => {
    if (test.batchId) {
      if (!batchesSeen.has(test.batchId)) {
        const batch = approvedTests.filter(t => t.batchId === test.batchId);
        groupedTests.push({
          ...test,
          isBatch: true,
          count: batch.length,
          allTests: batch
        });
        batchesSeen.add(test.batchId);
      }
    } else {
      groupedTests.push({ ...test, isBatch: false, count: 1, allTests: [test] });
    }
  });

  const filteredCommunityScenarios = groupedTests.filter(test => {
    const matchSearch = !communityFilters.search || 
      test.title.toLowerCase().includes(communityFilters.search.toLowerCase()) ||
      test.description?.toLowerCase().includes(communityFilters.search.toLowerCase());
    const matchCat = communityFilters.category === 'all' || test.category === communityFilters.category;
    const matchLang = communityFilters.language === 'all' || test.language === communityFilters.language;
    return matchSearch && matchCat && matchLang;
  });


  useEffect(() => {
    fetchApprovedTests();
    if (user) {
      fetchTestHistory();
    }
  }, [user]);

  const fetchTestHistory = async () => {
    try {
      const res = await api.get('/history');
      setTestHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch test history', err);
    }
  };

  const completedScenarioIds = new Set();
  testHistory.forEach(h => {
    if (h.details) {
      h.details.forEach(d => {
        if (d.scenarioId) completedScenarioIds.add(d.scenarioId);
      });
    }
  });

  useEffect(() => {
    if (gameState === 'hub') {
      fetchApprovedTests();
    }
  }, [gameState, i18n.language, selectedTestType]);

  const fetchApprovedTests = async () => {
    try {
      const res = await api.get(`/scenarios/approved?lang=${i18n.language}&type=${selectedTestType}`);
      setApprovedTests(res.data || []);
    } catch (err) {
      console.error('Failed to load approved scenarios', err);
    }
  };

  /** Start a specific set of tests or dynamic flow */
  const fetchNextScenario = useCallback(async (idx, mode, pipeline, testType = selectedTestType) => {
    setGameState('loading');
    try {
      let scenarioData = null;
      if (pipeline && pipeline.length > idx) {
        scenarioData = pipeline[idx];
      } else if (mode === 'ai' || (mode === 'random' && approvedTests.length === 0)) {
        // AI Generation or fallback if DB empty
        const response = await api.get(`/ai/scenario?lang=${i18n.language}&type=${testType}`);
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
  }, [approvedTests, i18n.language, selectedTestType, t]);

  const startTest = useCallback(async (mode, targetScenarios = null, forcedType = null, scenarioId = null) => {
    const activeType = forcedType || selectedTestType;
    setTestMode(mode);
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
    setScenarioError('');
    setTimerStartedAt(Date.now());
    setElapsedSeconds(0);
    setRunPipeline(targetScenarios || []);
    setGameState('loading');

    if (mode === 'specific' && scenarioId) {
      try {
        const res = await api.get(`/scenarios/${scenarioId}`);
        const scenario = res.data;
        if (!scenario) throw new Error("Scenario not found");
        
        if (scenario.batchId) {
          const batchRes = await api.get(`/scenarios/approved?batchId=${scenario.batchId}`);
          if (batchRes.data && batchRes.data.length > 0) {
            setRunPipeline(batchRes.data);
            await fetchNextScenario(0, 'specific', batchRes.data, batchRes.data[0].testType);
            return;
          }
        }

        setRunPipeline([scenario]);
        await fetchNextScenario(0, 'specific', [scenario], scenario.testType);
        return;
      } catch (err) {
        console.warn('Failed to load specific scenario:', err);
        setScenarioError(t('simulation.loadError', 'Failed to load scenario.'));
        setGameState('error');
        return;
      }
    }


    const handleBatchPlay = async (test) => {
      if (test.batchId) {
        try {
          const res = await api.get(`/scenarios/approved?batchId=${test.batchId}`);
          if (res.data && res.data.length > 0) {
            setRunPipeline(res.data);
            await fetchNextScenario(0, 'specific', res.data, res.data[0].testType);
            return true;
          }
        } catch (err) {
          console.error('Failed to load batch', err);
        }
      }
      return false;
    }

    if (mode === 'specific' && targetScenarios && targetScenarios.length === 1) {
      const wasBatch = await handleBatchPlay(targetScenarios[0]);
      if (wasBatch) return;
    }


    if (mode === 'ai') {
      try {
        const batch = await api.get(`/ai/test?lang=${i18n.language}&count=${AI_TEST_COUNT}&type=${activeType}`, {
          timeout: 70000,
        });
        if (!Array.isArray(batch) || batch.length === 0) {
          throw new Error('Invalid AI test batch');
        }

        setRunPipeline(batch);
        await fetchNextScenario(0, 'specific', batch, activeType);
        return;
      } catch (err) {
        console.warn('AI test batch load failed:', err);
        setScenarioError(t('simulation.aiError'));
        setGameState('error');
        return;
      }
    }

    if ((mode === 'random' || mode === 'learning') && (!targetScenarios || targetScenarios.length === 0)) {
      let pool = approvedTests;
      if (forcedType) {
        const fetched = await api.get(`/scenarios/approved?lang=${i18n.language}&type=${activeType}`);
        pool = fetched?.data || [];
      }
      if (pool.length > 0) {
        const picked = sampleRandom(pool, Math.min(5, pool.length));
        setRunPipeline(picked);
        await fetchNextScenario(0, 'specific', picked, activeType);
        return;
      }

      if (mode === 'learning') {
        const fallbackPipeline = sampleRandom(scenariosFallback, Math.min(5, scenariosFallback.length));
        setRunPipeline(fallbackPipeline);
        await fetchNextScenario(0, 'specific', fallbackPipeline, activeType);
        return;
      }
    }

    await fetchNextScenario(0, mode, targetScenarios, activeType);
  }, [AI_TEST_COUNT, approvedTests, fetchNextScenario, i18n.language, selectedTestType, t]);

  useEffect(() => {
    if (gameState !== 'hub' || hasAutoStartedFromQuery) return;

    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const type = params.get('type');
    const id = params.get('id');
    if (!mode) return;

    const allowedModes = new Set(['learning', 'ai', 'random', 'specific']);
    if (!allowedModes.has(mode)) return;

    setHasAutoStartedFromQuery(true);
    if (type) {
      setSelectedTestType(type);
    }
    startTest(mode, null, type || null, id);
  }, [gameState, hasAutoStartedFromQuery, location.search, startTest]);


  const getTypeLabel = useCallback((type) => {
    const value = (type || 'mixed').toLowerCase();
    const map = {
      mixed: t('simulation.type.mixed', 'Mixed'),
      standard: t('simulation.type.standard', 'Standard'),
      phishing: t('simulation.type.phishing', 'Phishing'),
      social: t('simulation.type.social', 'Social Engineering'),
      device: t('simulation.type.device', 'Device Security'),
      learning: t('simulation.type.learning', 'Learning'),
    };
    return map[value] || map.mixed;
  }, [t]);

  const handleChoice = useCallback((choice) => {
    setSelectedChoice(choice);
    // isCorrect can be boolean (single) or number 0-1 (multiple)
    const score = typeof choice.isCorrect === 'number' ? choice.isCorrect : (choice.isCorrect ? 1 : 0);
    
    setResults((prev) => [
      ...prev,
      {
        scenarioId: currentScenario._id || currentScenario.id,
        scenarioTitle: currentScenario.title,
        choiceId: choice.id || choice._id,
        choiceText: choice.text,
        isCorrect: score, // Store as number 0-1
        selectionType: currentScenario.selectionType || 'single',
      },
    ]);
    setGameState('feedback');
  }, [currentScenario]);

  const handleNext = useCallback(async () => {
    setSelectedChoice(null);
    const totalCount = runPipeline.length > 0 ? runPipeline.length : 5;
    
    if (currentIndex < totalCount - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      await fetchNextScenario(nextIdx, testMode, runPipeline);
    } else {
      setGameState('results');
      
      // Save to history if user is logged in
      if (user) {
        try {
          const allowedHistoryTypes = new Set(['phishing', 'standard', 'social', 'device', 'mixed', 'ai', 'learning', 'specific']);
          const normalizeHistoryType = (candidate, fallback = 'mixed') => (
            candidate && allowedHistoryTypes.has(candidate) ? candidate : fallback
          );

          const historyType = (() => {
            if (testMode === 'random') {
              return normalizeHistoryType(selectedTestType, 'mixed');
            }
            if (testMode === 'specific') {
              return normalizeHistoryType(runPipeline[0]?.testType, 'specific');
            }
            return normalizeHistoryType(testMode, 'mixed');
          })();

          // sum of all scores (each question is 0 to 1)
          const totalPoints = results.reduce((acc, r) => acc + (typeof r.isCorrect === 'number' ? r.isCorrect : (r.isCorrect ? 1 : 0)), 0);
          const scorePercentage = Math.round((totalPoints / totalCount) * 100);
          
          await api.post('/history', {
            testType: historyType,
            score: scorePercentage,
            totalQuestions: totalCount,
            correctAnswers: Math.round(totalPoints),
            timeSpent: elapsedSeconds,
            details: results
          });
          console.log('Test history saved');
        } catch (err) {
          console.error('Failed to save test history:', err);
        }
      }
    }
  }, [currentIndex, fetchNextScenario, runPipeline, selectedTestType, testMode, user, results, elapsedSeconds]);

  const restartGame = useCallback(() => {
    localStorage.removeItem(SIMULATION_SESSION_KEY);
    setGameState('hub');
    setTestMode(null);
    setCurrentIndex(0);
    setCurrentScenario(null);
    setSelectedChoice(null);
    setResults([]);
    setRunPipeline([]);
    setScenarioError('');
    setTimerStartedAt(null);
    setElapsedSeconds(0);
  }, []);

  const updateQuestionFeedbackMode = (questionIndex, mode) => {
    setCreateForm((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex] = { ...questions[questionIndex], feedbackMode: mode };
      return { ...prev, questions };
    });
  };

  const updateQuestion = (questionIndex, field, value) => {
    setCreateForm((prev) => {
      const questions = [...prev.questions];
      questions[questionIndex] = { ...questions[questionIndex], [field]: value };
      return { ...prev, questions };
    });
  };

  const updateQuestionChoice = (questionIndex, choiceIndex, field, value) => {
    setCreateForm((prev) => {
      const questions = [...prev.questions];
      const choices = [...questions[questionIndex].choices];
      choices[choiceIndex] = { ...choices[choiceIndex], [field]: value };
      questions[questionIndex] = { ...questions[questionIndex], choices };
      return { ...prev, questions };
    });
  };

  const toggleQuestionChoiceCorrect = (questionIndex, choiceIndex) => {
    setCreateForm((prev) => {
      const questions = [...prev.questions];
      const choices = [...questions[questionIndex].choices];
      choices[choiceIndex] = {
        ...choices[choiceIndex],
        isCorrect: !choices[choiceIndex].isCorrect,
      };
      questions[questionIndex] = { ...questions[questionIndex], choices };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setCreateForm((prev) => {
      if (prev.questions.length >= 20) return prev;
      return { ...prev, questions: [...prev.questions, createBlankQuestion()] };
    });
  };

  const removeQuestion = (index) => {
    setCreateForm((prev) => {
      if (prev.questions.length <= 1) return prev;
      return {
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      };
    });
  };

  const submitNewTest = async (e) => {
    e.preventDefault();
    try {
      if (createForm.questions.length > 20) {
        pushNotification('error', t('simulation.questionsTooMany', 'You can submit up to 20 questions in one test.'));
        return;
      }

      const invalidQuestion = createForm.questions.find((question) => {
        const hasSharedFeedback = question.sharedFeedback?.trim().length > 0;
        const allChoiceFeedbackFilled = question.choices.every((choice) => choice.feedback?.trim().length > 0);

        if (!question.choices.some((choice) => choice.isCorrect)) {
          return true;
        }

        if (question.feedbackMode === 'shared') {
          return !hasSharedFeedback;
        }

        return !hasSharedFeedback && !allChoiceFeedbackFilled;
      });
      if (invalidQuestion) {
        pushNotification('error', t('simulation.needFeedback', 'Either shared feedback or feedback for each option is required.'));
        return;
      }

      setGameState('loading');
      const payload = {
        testType: createForm.testType,
        language: i18n.language,
        questions: createForm.questions.slice(0, 20).map((question) => ({
          ...question,
          testType: createForm.testType,
          choices: question.choices.map((choice, i) => ({
            ...choice,
            id: String.fromCharCode(65 + i),
            feedback: choice.feedback?.trim() || question.sharedFeedback?.trim() || '',
          })),
        })),
      };

      const result = await api.post('/scenarios/submit-batch', payload);
      const inserted = result.data || [];
      const rejected = inserted.find(s => s.status === 'rejected');

      if (rejected) {
        pushNotification('error', `${t('admin.rejected', 'Rejected')}: ${rejected.aiFeedback}`);
        setGameState('creating');
        return;
      }

      const created = result?.meta?.created || inserted.length;
      pushNotification('success', `${t('simulation.testPublished') || 'Test published!'} (${created})`);
      setCreateForm({
        testType: 'mixed',
        questions: [createBlankQuestion()],
      });
      setGameState('hub');
    } catch (err) {
      console.error(err);
      pushNotification('error', err.response?.data?.message || t('simulation.submitFailed') || 'Failed to submit test');
      setGameState('creating');
    }
  };

  // ==================== HUB SCREEN ====================
  if (gameState === 'hub') {
    return (
      <>
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

            <div className="mb-8">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-3">{t('simulation.testTypeLabel')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {TEST_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedTestType(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedTestType === type.value ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                  >
                    {getTypeLabel(type.value)}
                  </button>
                ))}
              </div>
            </div>
            
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
                  <Button variant="outline" size="lg" onClick={() => { setGameState('creating'); setActiveQuestionIndex(0); }} icon={Plus} className="border-dashed border-gray-300 hover:border-blue-400 hover:text-blue-600">

                    {t('simulation.createNewTest')}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>


        </div>

        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[#1a1a1a] flex items-center shrink-0">
              <Target className="w-6 h-6 mr-2 text-blue-500" /> {t('simulation.communityScenarios')}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder={t('admin.searchPlaceholder', 'Search...')}
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
                <option value="phishing">{t('simulation.type.phishing')}</option>
                <option value="social">{t('simulation.type.social')}</option>
                <option value="standard">{t('simulation.type.standard')}</option>
                <option value="device">{t('simulation.type.device')}</option>
                <option value="network">{t('simulation.type.network') || 'Network'}</option>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCommunityScenarios.length === 0 ? (
              <p className="text-gray-400 col-span-3 text-center py-10 bg-gray-50 rounded-3xl border border-gray-100">{t('simulation.noCommunityScenarios')}</p>
            ) : (
              <>
                {filteredCommunityScenarios
                  .slice((communityPage - 1) * 6, communityPage * 6)
                  .map((test, i) => (
                    <motion.div key={test._id || i} whileHover={{ y: -5 }}>
                      <Card padding="p-6" className="h-full flex flex-col hover:shadow-lg transition-shadow bg-white rounded-[2rem] border border-gray-100 cursor-pointer" onClick={() => startTest('specific', test.allTests)}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex justify-center items-center text-xl">{test.icon || '🛡️'}</div>
                          <div className="flex flex-col items-end gap-1">
                            {test.isBatch ? (
                               test.allTests.some(t => completedScenarioIds.has(t._id)) && (
                                 <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                   <CheckCircle className="w-3 h-3" />
                                   {t('common.passed', 'Passed')}
                                 </span>
                               )
                            ) : (
                               completedScenarioIds.has(test._id) && (
                                 <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                   <CheckCircle className="w-3 h-3" />
                                   {t('common.passed', 'Passed')}
                                 </span>
                               )
                            )}
                            <Badge variant="primary">{test.category || 'General'}</Badge>
                            {test.isBatch && (
                              <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                {test.count} Questions
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg text-[#1a1a1a] mb-2">{test.title}</h3>
                        <p className="text-gray-500 text-sm flex-1 line-clamp-3 mb-6">{test.description}</p>
                        <Button variant="ghost" className="w-full justify-center text-blue-600 hover:bg-blue-50 rounded-xl" icon={Play}>{t('simulation.playTest')}</Button>
                      </Card>
                    </motion.div>
                  ))}
                <div className="col-span-full">
                  <Pagination 
                    currentPage={communityPage} 
                    totalPages={Math.ceil(filteredCommunityScenarios.length / 6)} 
                    onPageChange={setCommunityPage} 
                    className="mt-8"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
      </>
    );
  }

  // ==================== CREATING SCREEN ====================
  if (gameState === 'creating') {
    return (
      <>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('simulation.testTypeLabel', 'Test Type')}</label>
            <select
              className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={createForm.testType}
              onChange={(e) => setCreateForm({ ...createForm, testType: e.target.value })}
            >
              {TEST_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{getTypeLabel(type.value)}</option>
              ))}
            </select>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{t('simulation.questionsCounter', { count: createForm.questions.length })}</span>
              <span>{t('simulation.questionsLimitHint')}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            {/* Numeric Navigation Bar */}
            <div className="flex flex-wrap gap-2 mb-4">
              {createForm.questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-xl font-bold transition-all border ${activeQuestionIndex === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-500'}`}
                >
                  {idx + 1}
                </button>
              ))}
              {createForm.questions.length < 20 && (
                <button
                  type="button"
                  onClick={() => {
                    addQuestion();
                    setActiveQuestionIndex(createForm.questions.length);
                  }}
                  className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 border border-dashed border-gray-300 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Active Question Form */}
            <div className="p-6 rounded-3xl border-2 border-blue-50 bg-blue-50/20 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl text-blue-900">{t('simulation.questionN', { number: activeQuestionIndex + 1, defaultValue: `Question ${activeQuestionIndex + 1}` })}</h3>
                {createForm.questions.length > 1 && (
                  <Button type="button" size="sm" variant="danger" onClick={() => { 
                    removeQuestion(activeQuestionIndex);
                    setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1));
                  }}>
                    {t('simulation.removeQuestion', 'Remove')}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('simulation.titleLabel', 'Scenario Title')}</label>
                    <input
                      required
                      className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                      value={createForm.questions[activeQuestionIndex].title}
                      onChange={(e) => updateQuestion(activeQuestionIndex, 'title', e.target.value)}
                      placeholder={t('simulation.titlePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('simulation.selectionTypeLabel', 'Question Type')}</label>
                    <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200 shadow-inner h-[58px]">
                      <button
                        type="button"
                        onClick={() => updateQuestion(activeQuestionIndex, 'selectionType', 'single')}
                        className={`flex-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          createForm.questions[activeQuestionIndex].selectionType === 'single'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t('simulation.singleChoice', 'Single Choice')}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuestion(activeQuestionIndex, 'selectionType', 'multiple')}
                        className={`flex-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          createForm.questions[activeQuestionIndex].selectionType === 'multiple'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t('simulation.multipleChoice', 'Multiple Choice')}
                      </button>
                    </div>
                  </div>
                </div>             

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t('simulation.descriptionLabel', 'Scenario Description')}</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    value={createForm.questions[activeQuestionIndex].description}
                    onChange={(e) => updateQuestion(activeQuestionIndex, 'description', e.target.value)}
                    placeholder={t('simulation.descriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                    {t('simulation.sharedFeedbackLabel', 'Shared feedback')}
                    <span className={createForm.questions[activeQuestionIndex].feedbackMode === 'shared' ? 'text-red-500 ml-1' : 'text-gray-400 ml-1'}>
                      ({createForm.questions[activeQuestionIndex].feedbackMode === 'shared' ? t('simulation.required', 'required') : t('simulation.optional', 'optional')})
                    </span>
                  </label>
                  <textarea
                    required={createForm.questions[activeQuestionIndex].feedbackMode === 'shared'}
                    rows={2}
                    className="w-full p-4 rounded-2xl bg-white border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    value={createForm.questions[activeQuestionIndex].sharedFeedback}
                    onChange={(e) => updateQuestion(activeQuestionIndex, 'sharedFeedback', e.target.value)}
                    placeholder={t('simulation.sharedFeedbackPlaceholder', 'Optional explanation shown when a specific choice does not have its own feedback.')}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase">{t('simulation.choicesLabel', 'Choices & Feedback')}</label>
                    <div className="flex bg-gray-100/80 p-1 rounded-2xl border border-gray-200 shadow-inner">
                      <button
                        type="button"
                        onClick={() => updateQuestionFeedbackMode(activeQuestionIndex, 'detailed')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          createForm.questions[activeQuestionIndex].feedbackMode === 'detailed'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t('simulation.feedbackModeDetailed', 'Per-option')}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQuestionFeedbackMode(activeQuestionIndex, 'shared')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          createForm.questions[activeQuestionIndex].feedbackMode === 'shared'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {t('simulation.feedbackModeShared', 'Shared')}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 -mt-1">
                    {createForm.questions[activeQuestionIndex].feedbackMode === 'shared'
                      ? t('simulation.sharedModeHint', 'Per-option explanations are hidden in this mode.')
                      : t('simulation.detailedModeHint', 'Fill shared feedback or explain each option below.')}
                  </p>
                  {createForm.questions[activeQuestionIndex].choices.map((choice, i) => (
                    <div key={i} className={`p-5 rounded-2xl border space-y-3 shadow-sm ${choice.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-100 bg-white/50'}`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${choice.isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleQuestionChoiceCorrect(activeQuestionIndex, i)}
                          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${choice.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          {choice.isCorrect ? t('simulation.markedCorrect', 'Correct answer') : t('simulation.markCorrect', 'Mark as correct')}
                        </button>
                      </div>
                      <input
                        required
                        type="text"
                        placeholder={t('simulation.choiceTextPlaceholder')}
                        className="w-full p-3 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                        value={choice.text}
                        onChange={(e) => updateQuestionChoice(activeQuestionIndex, i, 'text', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder={t('simulation.feedbackPlaceholder')}
                        className={`w-full p-3 rounded-xl border border-gray-100 bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm italic ${createForm.questions[activeQuestionIndex].feedbackMode === 'shared' ? 'hidden' : ''}`}
                        value={choice.feedback}
                        onChange={(e) => updateQuestionChoice(activeQuestionIndex, i, 'feedback', e.target.value)}
                      />
                      {createForm.questions[activeQuestionIndex].feedbackMode !== 'shared' && (
                        <p className="text-[11px] text-gray-400">
                          {t('simulation.feedbackOptionalHint', 'Optional. Leave blank to use the shared feedback above.')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full pt-4 mt-6 rounded-[1.5rem] py-4 text-xl shadow-xl shadow-blue-100" type="submit" icon={CheckCircle}>{t('simulation.submitForModeration')}</Button>

        </form>
      </motion.div>
      </>
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
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{t('simulation.errorTitle', 'Simulation Error')}</h2>

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
    const weakPoints = results.filter((item) => !item.isCorrect).slice(0, 3);

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="mb-4">{grade.icon}</div>
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">{t('simulation.results')}</h2>
          <p className={`text-xl font-semibold ${grade.color}`}>{grade.label}</p>
        </div>

        {/* Score card */}
        <Card className="mb-6" glow>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                <Trophy className="w-3 h-3 text-yellow-500" /> {t('simulation.score')}
              </div>
              <div className="text-2xl font-mono font-bold text-[#1a1a1a]">{scorePercentage}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                <Clock className="w-3 h-3 text-blue-500" /> {t('simulation.timeSpent', 'Time Spent')}
              </div>
              <div className="text-2xl font-mono font-bold text-[#1a1a1a]">{formatElapsedTime(elapsedSeconds)}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
              <span>{t('simulation.accuracy', 'Accuracy')}</span>
              <span>{correctCount} / {totalCount}</span>
            </div>
            <ProgressBar value={correctCount} max={totalCount} showPercentage={false} />
            <p className="text-[11px] text-gray-500 text-center mt-2 italic">
              {t('simulation.avgTimePerQuestion', 'Average time per question')}: {Math.round(elapsedSeconds / totalCount)} {t('simulation.seconds', 's')}
            </p>
          </div>
        </Card>

        {/* Results breakdown */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{t('simulation.breakdown', 'Breakdown')}</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                result.isCorrect >= 0.8
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : result.isCorrect >= 0.5
                    ? 'border-yellow-500/30 bg-yellow-500/10'
                    : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              {result.isCorrect >= 0.8 ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : result.isCorrect >= 0.5 ? (
                <CheckCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a1a] truncate">{result.scenarioTitle}</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">
                    {result.selectionType === 'multiple' ? t('simulation.multipleChoice') : t('simulation.singleChoice')}
                  </span>
                </div>
              </div>
              <Badge variant={result.isCorrect >= 0.8 ? 'low' : result.isCorrect >= 0.5 ? 'medium' : 'critical'}>
                {result.isCorrect >= 1 ? t('simulation.safe', 'Safe') : 
                 result.isCorrect > 0 ? `${Math.round(result.isCorrect * 100)}%` : 
                 t('simulation.risky', 'Risky')}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" onClick={restartGame} icon={RotateCcw} className="flex-1">
            {t('simulation.tryAgain')}
          </Button>
        </div>

        {testMode === 'learning' && (
          <Card className="mt-6">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-3">{t('simulation.learningCoachTitle', 'Learning Coach')}</h3>
            {weakPoints.length === 0 ? (
              <p className="text-sm text-gray-600">{t('simulation.learningCoachExcellent', 'Excellent work. You handled all scenarios safely.')}</p>
            ) : (
              <ul className="text-sm text-gray-700 space-y-2">
                {weakPoints.map((item, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    {t('simulation.learningCoachReview', 'Review scenario:')} <strong>{item.scenarioTitle}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </div>
    );
  }

  // ==================== LOADING / PLAYING / FEEDBACK SCREEN ====================
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between gap-4 mb-3">
          <ProgressBar
            value={gameState === 'feedback' ? currentIndex + 1 : currentIndex}
            max={totalCount}
            label={t('simulation.progress')}
            className="flex-1"
          />
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white shadow-sm text-sm font-mono text-gray-700">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{formatElapsedTime(elapsedSeconds)}</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {gameState === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          >
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
          </motion.div>
        ) : (
          <motion.div
            key={currentScenario?._id || currentScenario?.id || 'scenario'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
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
                scenario={currentScenario}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* High score celebration effect (simple CSS confetti) */}
      {gameState === 'results' && scorePercentage >= 90 && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth - window.innerWidth / 2, 
                y: -100, 
                rotate: 0,
                opacity: 1 
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: 360,
                x: (Math.random() - 0.5) * 500,
                opacity: 0
              }}
              transition={{ 
                duration: Math.random() * 2 + 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{ 
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)] 
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default LifeScenario;
