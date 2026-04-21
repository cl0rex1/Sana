import React, { useState, useCallback } from 'react';
import { Shield, RotateCcw, Trophy, Target, Zap, CheckCircle, XCircle, AlertTriangle, AlertOctagon, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';
import scenarios from '../../data/scenarios';
import ScenarioCard from './ScenarioCard';
import FeedbackModal from './FeedbackModal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';

/**
 * Main Life Scenario simulation component with AI Generation.
 * Manages the full game flow: intro → loading → playing → feedback → results.
 */
const TOTAL_SCENARIOS_PER_RUN = 5;

const LifeScenario = () => {
  const { t, i18n } = useTranslation();
  const [gameState, setGameState] = useState('intro'); // intro | loading | playing | feedback | results
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [results, setResults] = useState([]);

  const correctCount = results.filter((r) => r.isCorrect).length;

  /** Fetch an AI-generated scenario or fallback to local */
  const fetchNextScenario = async (attemptIndex) => {
    setGameState('loading');
    try {
      const response = await api.get(`/ai/scenario?lang=${i18n.language}`);
      if (response.data && response.data.choices) {
        setCurrentScenario(response.data);
      } else {
        throw new Error("Invalid format");
      }
    } catch (err) {
      console.warn("Using local fallback for scenario...");
      // Fallback to static scenario (looping if array is short)
      setCurrentScenario(scenarios[attemptIndex % scenarios.length]);
    } finally {
      setGameState('playing');
    }
  };

  /** Start the simulation */
  const startGame = useCallback(async () => {
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
    await fetchNextScenario(0);
  }, [i18n.language]);

  /** Handle user choosing an answer */
  const handleChoice = useCallback(
    (choice) => {
      setSelectedChoice(choice);
      setResults((prev) => [
        ...prev,
        {
          scenarioId: currentScenario.id,
          scenarioTitle: currentScenario.title,
          choiceId: choice.id,
          choiceText: choice.text,
          isCorrect: choice.isCorrect,
        },
      ]);
      setGameState('feedback');
    },
    [currentScenario]
  );

  /** Move to next scenario or show results */
  const handleNext = useCallback(async () => {
    setSelectedChoice(null);
    if (currentIndex < TOTAL_SCENARIOS_PER_RUN - 1) {
      setCurrentIndex((prev) => prev + 1);
      await fetchNextScenario(currentIndex + 1);
    } else {
      setGameState('results');
    }
  }, [currentIndex, i18n.language]);

  /** Restart the entire simulation */
  const restartGame = useCallback(() => {
    setGameState('intro');
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
  }, []);

  // Calculate score percentage
  const scorePercentage = Math.round((correctCount / TOTAL_SCENARIOS_PER_RUN) * 100);

  // ==================== INTRO SCREEN ====================
  if (gameState === 'intro') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        {/* Main Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-[3rem] border border-gray-200 p-10 md:p-16 mb-8 text-center shadow-sm">
          {/* Decorative background graphics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-8 rounded-[2rem] bg-[#1a1a1a] shadow-[0_10px_30px_rgba(26,26,26,0.2)] flex items-center justify-center border border-gray-800"
            >
              <BrainCircuit className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight mb-4">
              {t('simulation.title')}
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              {t('home.subtitle')}
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button variant="primary" size="lg" onClick={startGame} icon={Target} className="px-10 py-4 text-lg shadow-lg hover:shadow-xl transition-all">
                {t('simulation.start')}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Info cards staggered fade-in */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Target, title: `${TOTAL_SCENARIOS_PER_RUN} ${t('simulation.scenarios')}`, desc: t('simulation.realThreats'), color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Zap, title: t('simulation.feedback'), desc: t('simulation.learnChoice'), color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { icon: Trophy, title: t('simulation.tracking'), desc: t('simulation.awarenessLevel'), color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card padding="p-6" className="bg-white hover:bg-gray-50 flex flex-col items-center justify-center text-center h-full border border-gray-100 shadow-sm rounded-3xl">
                <div className={`w-14 h-14 mb-4 rounded-2xl ${item.bg} flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <p className="text-base font-bold text-[#1a1a1a] mb-2">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ==================== RESULTS SCREEN ====================
  if (gameState === 'results') {
    const getGrade = () => {
      if (scorePercentage >= 90) return { label: 'Cyber Expert', color: 'text-emerald-500', icon: <Shield className="w-12 h-12 text-emerald-500 mx-auto" /> };
      if (scorePercentage >= 70) return { label: 'Aware Citizen', color: 'text-blue-500', icon: <CheckCircle className="w-12 h-12 text-blue-500 mx-auto" /> };
      if (scorePercentage >= 50) return { label: 'Needs Training', color: 'text-yellow-500', icon: <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" /> };
      return { label: 'High Risk', color: 'text-red-500', icon: <AlertOctagon className="w-12 h-12 text-red-500 mx-auto" /> };
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
          <ProgressBar value={correctCount} max={TOTAL_SCENARIOS_PER_RUN} showPercentage={false} />
          <p className="text-sm text-gray-600 mt-3">
            {correctCount} correct out of {TOTAL_SCENARIOS_PER_RUN} scenarios
          </p>
        </Card>

        {/* Results breakdown */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Breakdown</h3>
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
                {result.isCorrect ? 'Safe' : 'Risky'}
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
          max={TOTAL_SCENARIOS_PER_RUN}
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
             <p className="text-lg font-bold text-[#1a1a1a] mb-2">AI is Generating a Scenario...</p>
             <p className="text-sm text-gray-500 max-w-sm">Crafting a real-world cybersecurity dilemma specifically for you.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Current scenario */}
          {currentScenario && (
            <ScenarioCard
              scenario={currentScenario}
              currentIndex={currentIndex}
              total={TOTAL_SCENARIOS_PER_RUN}
              onChoose={handleChoice}
              disabled={gameState === 'feedback'}
            />
          )}

          {/* Feedback overlay (shown after choosing) */}
          {gameState === 'feedback' && (
            <FeedbackModal
              choice={selectedChoice}
              onNext={handleNext}
              isLastScenario={currentIndex === TOTAL_SCENARIOS_PER_RUN - 1}
            />
          )}
        </>
      )}
    </div>
  );
};

export default LifeScenario;
