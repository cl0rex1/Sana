import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * Individual scenario card displayed during the simulation.
 * Shows scenario description and choices.
 */
const ScenarioCard = ({ scenario, currentIndex, total, onChoose, disabled }) => {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = React.useState([]);

  const isMultiple = scenario.selectionType === 'multiple';

  // Shuffle choices once when the scenario changes
  const shuffledChoices = React.useMemo(() => {
    if (!scenario?.choices) return [];
    setSelectedIds([]); // Reset selection when scenario changes
    return [...scenario.choices].sort(() => Math.random() - 0.5);
  }, [scenario]);

  const handleChoiceClick = (choice) => {
    if (disabled) return;

    if (isMultiple) {
      setSelectedIds(prev => 
        prev.includes(choice.id || choice._id)
          ? prev.filter(id => id !== (choice.id || choice._id))
          : [...prev, (choice.id || choice._id)]
      );
    } else {
      onChoose(choice);
    }
  };

  const handleSubmitMultiple = () => {
    if (selectedIds.length === 0) return;

    // Calculate score: (matches) / total choices
    // matches = (correct choice AND selected) OR (incorrect choice AND NOT selected)
    const choices = scenario.choices;
    let matches = 0;
    
    choices.forEach(c => {
      const isSelected = selectedIds.includes(c.id || c._id);
      if (c.isCorrect === isSelected) {
        matches++;
      }
    });

    const score = matches / choices.length;
    const isSelectionCorrect = score === 1;

    // Find feedback
    const selectedChoices = scenario.choices.filter(c => selectedIds.includes(c.id || c._id));
    const mainChoice = selectedChoices.find(c => !c.isCorrect) || selectedChoices.find(c => c.isCorrect) || choices[0];

    onChoose({
      ...mainChoice,
      isCorrect: score, // Store as number 0-1
      isPerfect: isSelectionCorrect,
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Scenario header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{scenario.icon}</span>
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a]">{scenario.title}</h2>
            <div className="flex gap-2">
              <Badge variant="info">{scenario.category}</Badge>
              {isMultiple && <Badge variant="purple">{t('simulation.multipleChoice')}</Badge>}
            </div>
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
          {isMultiple ? t('simulation.selectMultiple', 'Select one or more options:') : t('simulation.whatToDo')}
        </p>
        {shuffledChoices.map((choice, index) => {
          const isSelected = selectedIds.includes(choice.id || choice._id);
          return (
            <button
              key={choice.id || choice._id || index}
              onClick={() => handleChoiceClick(choice)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group
                ${disabled
                  ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                  : isSelected
                    ? 'border-blue-500 bg-blue-50/30 shadow-md scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-[#1a1a1a] hover:shadow-lg cursor-pointer'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors duration-300
                  ${isMultiple ? 'rounded-lg' : 'rounded-full'}
                  ${disabled
                    ? 'bg-gray-200 text-gray-400'
                    : isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-[#1a1a1a] group-hover:text-white'
                  }`}>
                  {isMultiple ? (
                    isSelected ? <CheckCircle className="w-5 h-5" /> : String.fromCharCode(65 + index)
                  ) : String.fromCharCode(65 + index)}
                </div>
                <span className={`text-sm md:text-base font-medium transition-colors ${
                  isSelected ? 'text-blue-900' : 'text-gray-700 group-hover:text-[#1a1a1a]'
                }`}>
                  {choice.text}
                </span>
              </div>
            </button>
          );
        })}

        {isMultiple && !disabled && (
          <Button
            variant="primary"
            onClick={handleSubmitMultiple}
            disabled={selectedIds.length === 0}
            className="w-full mt-6 py-4 rounded-2xl shadow-lg shadow-blue-100 font-bold"
          >
            {t('simulation.submitAnswer', 'Confirm Selection')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ScenarioCard;
