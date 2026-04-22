import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';

/**
 * Feedback modal shown after the user makes a choice.
 * Displays whether the choice was correct and educational explanation.
 */
const FeedbackModal = ({ choice, onNext, isLastScenario }) => {
  const { t } = useTranslation();
  if (!choice) return null;

  const isCorrect = choice.isCorrect;

  return (
    <div className="animate-fade-in mt-6">
      <div
        className={`rounded-2xl border p-6 transition-all duration-500 ${
          isCorrect
            ? 'bg-emerald-500/10 border-emerald-500/30 shadow-glow-success'
            : 'bg-red-500/10 border-red-500/30 shadow-glow-danger'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {isCorrect ? (
            <CheckCircle className="w-7 h-7 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
          )}
          <h3 className={`text-lg font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? t('simulation.correctDecision') : t('simulation.riskyDecision')}
          </h3>
        </div>

        {/* Feedback explanation */}
        <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-6">
          {choice.feedback}
        </p>

        {/* Educational note */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-800/50 border border-primary-600/20 mb-6">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-400">
            <span className="text-warning font-semibold">{t('simulation.remember')}</span>{' '}
            {isCorrect
              ? t('simulation.alwaysVigilant')
              : t('simulation.realSituationConsequence')}
          </p>
        </div>

        {/* Next button */}
        <Button
          variant={isCorrect ? 'primary' : 'danger'}
          onClick={onNext}
          className="w-full sm:w-auto"
        >
          {isLastScenario ? t('simulation.viewResults') : t('simulation.nextScenario')}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackModal;
