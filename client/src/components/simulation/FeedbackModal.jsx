import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="mt-8 relative z-20"
    >
      <div
        className={`rounded-[2rem] border-2 p-8 transition-all duration-500 overflow-hidden relative ${
          isCorrect
            ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-50'
            : 'bg-white border-red-100 shadow-xl shadow-red-50'
        }`}
      >
        {/* Decorative background glow */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${isCorrect ? 'bg-emerald-400' : 'bg-red-400'}`} />
        
        <div className="relative z-10">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {isCorrect ? (
                <CheckCircle className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                {isCorrect ? t('simulation.correctDecision') : t('simulation.riskyDecision')}
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                {isCorrect ? t('simulation.wellDone', 'Excellent thinking!') : t('simulation.oops', 'Be more cautious.')}
              </p>
            </div>
          </div>

          {/* Feedback explanation */}
          <div className="bg-gray-50/80 rounded-2xl p-6 mb-6 border border-gray-100">
            <p className="text-gray-700 leading-relaxed font-medium">
              {choice.feedback || t('simulation.noFeedback', 'No additional explanation was provided.')}
            </p>
          </div>

          {/* Educational note */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-bold block mb-1 uppercase tracking-wider">{t('simulation.remember')}</span>
              {isCorrect
                ? t('simulation.alwaysVigilant')
                : t('simulation.realSituationConsequence')}
            </p>
          </div>

          {/* Next button */}
          <Button
            variant="primary"
            onClick={onNext}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border-none text-white ${
              isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'
            }`}
          >

            {isLastScenario ? t('simulation.viewResults') : t('simulation.nextScenario')}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackModal;
