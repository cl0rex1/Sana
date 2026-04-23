import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languageCards = [
  { code: 'en', gradient: 'from-blue-50 to-indigo-100' },
  { code: 'ru', gradient: 'from-red-50 to-orange-100' },
  { code: 'kz', gradient: 'from-cyan-50 to-blue-100' }
];

const LanguageOverlay = ({ isOpen, onClose, triggerElement }) => {
  const { t, i18n } = useTranslation();
  const [hoveredLang, setHoveredLang] = useState(null);
  const [origin, setOrigin] = useState({ x: '100%', y: '0%' });
  const [cycleIndex, setCycleIndex] = useState(0);

  const titleCycle = languageCards.map((lang) => t(`languageOverlay.title.${lang.code}`));

  useEffect(() => {
    if (!isOpen || hoveredLang) return;
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % titleCycle.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen, hoveredLang, titleCycle.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        setOrigin({
          x: `${rect.left + rect.width / 2}px`,
          y: `${rect.top + rect.height / 2}px`
        });
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, triggerElement]);

  const expandedStyle = { clipPath: `circle(150% at ${origin.x} ${origin.y})` };
  const closedStyle = { clipPath: `circle(0% at ${origin.x} ${origin.y})` };

  return (
    <div className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className="absolute inset-0 bg-blue-100 transition-all duration-[600ms] ease-in-out" style={isOpen ? expandedStyle : closedStyle} />
      <div className="absolute inset-0 bg-orange-50 transition-all duration-[700ms] ease-in-out delay-[50ms]" style={isOpen ? expandedStyle : closedStyle} />

      <div
        className="absolute inset-0 bg-[#fdfaf5] transition-all duration-[800ms] ease-in-out delay-[100ms] pointer-events-auto flex flex-col"
        style={isOpen ? expandedStyle : closedStyle}
      >
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 h-full flex flex-col relative">
          <div className="h-20 flex justify-end items-center relative z-20">
            <button
              onClick={onClose}
              className={`w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all duration-300 ${
                isOpen ? 'opacity-100 scale-100 delay-[600ms]' : 'opacity-0 scale-50'
              }`}
            >
              <X className="w-5 h-5 text-[#1a1a1a]" />
            </button>
          </div>

          <div className={`flex-1 flex flex-col justify-center items-center transition-all duration-700 ${isOpen ? 'opacity-100 translate-y-0 delay-[500ms]' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a] mb-12 h-[1.2em] transition-all duration-300">
              {hoveredLang ? t(`languageOverlay.title.${hoveredLang}`) : titleCycle[cycleIndex]}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {languageCards.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onMouseEnter={() => setHoveredLang(lang.code)}
                    onMouseLeave={() => setHoveredLang(null)}
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      onClose();
                    }}
                    className={`group relative flex flex-col p-8 rounded-[2rem] border-2 transition-all duration-300 text-left overflow-hidden ${
                      isSelected
                        ? 'border-[#1a1a1a] bg-white shadow-xl scale-[1.02]'
                        : 'border-transparent bg-white hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative z-10 flex flex-col gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white border border-transparent group-hover:border-gray-200'
                      }`}>
                        {isSelected ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm tracking-wider uppercase">{lang.code}</span>}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-[#1a1a1a] mb-1">{t(`common.language.${lang.code}`)}</h3>
                        <p className="text-gray-500 font-medium">{t(`languageOverlay.englishName.${lang.code}`)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageOverlay;
