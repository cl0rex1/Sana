import React, { useState, useCallback } from 'react';
import { Shield, RotateCcw, Trophy, Target, Zap, CheckCircle, XCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import scenarios from '../../data/scenarios';
import ScenarioCard from './ScenarioCard';
import FeedbackModal from './FeedbackModal';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';

/**
 * Main Life Scenario simulation component.
 * Manages the full game flow: intro → scenarios → feedback → results.
 */
const LifeScenario = () => {
  const { t } = useTranslation();
  const [gameState, setGameState] = useState('intro'); // intro | playing | feedback | results
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [results, setResults] = useState([]);

  const currentScenario = scenarios[currentIndex];
  const totalScenarios = scenarios.length;
  const correctCount = results.filter((r) => r.isCorrect).length;

  /** Start the simulation */
  const startGame = useCallback(() => {
    setGameState('playing');
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
  }, []);

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
  const handleNext = useCallback(() => {
    setSelectedChoice(null);
    if (currentIndex < totalScenarios - 1) {
      setCurrentIndex((prev) => prev + 1);
      setGameState('playing');
    } else {
      setGameState('results');
    }
  }, [currentIndex, totalScenarios]);

  /** Restart the entire simulation */
  const restartGame = useCallback(() => {
    setGameState('intro');
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
  }, []);

  // Calculate score percentage
  const scorePercentage = totalScenarios > 0 ? Math.round((correctCount / totalScenarios) * 100) : 0;

  // ==================== INTRO SCREEN ====================
  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
            <Shield className="w-10 h-10 text-accent-cyan" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">
            {t('simulation.title')}
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
            {t('home.subtitle')}
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <Card padding="p-4" className="bg-white hover:bg-gray-50 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 mb-2 rounded-full bg-blue-50 flex items-center justify-center text-[#1a1a1a]">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{totalScenarios} {t('simulation.scenarios')}</p>
            <p className="text-xs text-gray-500">{t('simulation.realThreats')}</p>
          </Card>
          <Card padding="p-4" className="bg-white hover:bg-gray-50 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 mb-2 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Zap className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{t('simulation.feedback')}</p>
            <p className="text-xs text-gray-500">{t('simulation.learnChoice')}</p>
          </Card>
          <Card padding="p-4" className="bg-white hover:bg-gray-50 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 mb-2 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Trophy className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{t('simulation.tracking')}</p>
            <p className="text-xs text-gray-500">{t('simulation.awarenessLevel')}</p>
          </Card>
        </div>

        <Button variant="primary" size="lg" onClick={startGame} icon={Target}>
          {t('simulation.start')}
        </Button>
      </div>
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
          <ProgressBar value={correctCount} max={totalScenarios} showPercentage={false} />
          <p className="text-sm text-gray-600 mt-3">
            {correctCount} correct out of {totalScenarios} scenarios
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

  // ==================== PLAYING / FEEDBACK SCREEN ====================
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <ProgressBar
          value={gameState === 'feedback' ? currentIndex + 1 : currentIndex}
          max={totalScenarios}
          label="Progress"
        />
      </div>

      {/* Current scenario */}
      <ScenarioCard
        scenario={currentScenario}
        currentIndex={currentIndex}
        total={totalScenarios}
        onChoose={handleChoice}
        disabled={gameState === 'feedback'}
      />

      {/* Feedback overlay (shown after choosing) */}
      {gameState === 'feedback' && (
        <FeedbackModal
          choice={selectedChoice}
          onNext={handleNext}
          isLastScenario={currentIndex === totalScenarios - 1}
        />
      )}
    </div>
  );
};

export default LifeScenario;
