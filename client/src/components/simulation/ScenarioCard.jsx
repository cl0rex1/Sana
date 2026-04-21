import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * Individual scenario card displayed during the simulation.
 * Shows scenario description and choices.
 */
const ScenarioCard = ({ scenario, currentIndex, total, onChoose, disabled }) => {
  const { t } = useTranslation();
  return (
    <div className="animate-fade-in">
      {/* Scenario header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{scenario.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a]">{scenario.title}</h2>
            <Badge variant="info">{scenario.category}</Badge>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono text-gray-500">
            {t('simulation.scenarios')} {currentIndex + 1}/{total}
          </span>
        </div>
      </div>

      {/* Scenario description — the "story" */}
      <Card className="mb-6 border-l-4 border-l-[#1a1a1a]" padding="p-5">
        <p className="text-gray-800 font-medium leading-relaxed text-sm md:text-base">
          {scenario.description}
        </p>
      </Card>

      {/* Choices */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {t('simulation.whatToDo')}
        </p>
        {scenario.choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => onChoose(choice)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group
              ${disabled
                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-[#1a1a1a] hover:shadow-lg cursor-pointer'
              }`}
          >
            <div className="flex items-start gap-3">
              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors duration-300
                ${disabled
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-[#1a1a1a] group-hover:text-white'
                }`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm md:text-base text-gray-700 group-hover:text-[#1a1a1a] font-medium transition-colors">
                {choice.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScenarioCard;
