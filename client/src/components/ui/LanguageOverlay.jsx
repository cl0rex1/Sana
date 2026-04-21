import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English', native: 'English', gradient: 'from-blue-50 to-indigo-100' },
  { code: 'ru', name: 'Russian', native: 'Русский', gradient: 'from-red-50 to-orange-100' },
  { code: 'kz', name: 'Kazakh', native: 'Қазақша', gradient: 'from-cyan-50 to-blue-100' }
];

const LanguageOverlay = ({ isOpen, onClose, triggerRect }) => {
  const { t, i18n } = useTranslation();
  const [hoveredLang, setHoveredLang] = useState(null);

  const titles = {
    en: 'Select Language',
    ru: 'Выберите язык',
    kz: 'Тілді таңдаңыз'
  };
  
  // Calculate center of trigger if provided, else fallback to top-right
  const originX = triggerRect ? `${triggerRect.left + triggerRect.width / 2}px` : 'calc(100% - 120px)';
  const originY = triggerRect ? `${triggerRect.top + triggerRect.height / 2}px` : '40px';

  // Mount/unmount effect for smooth entrance/exit
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Clip path origin using dynamic button location
  const expandedStyle = { clipPath: `circle(150% at ${originX} ${originY})` };
  const closedStyle = { clipPath: `circle(0% at ${originX} ${originY})` };

  return (
    <div className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      
      {/* Layer 1: Soft Cyan/Blue slide */}
      <div 
        className="absolute inset-0 bg-blue-100 transition-all duration-[600ms] ease-in-out"
        style={isOpen ? expandedStyle : closedStyle}
      />
      
      {/* Layer 2: Soft Orange/Pink slide */}
      <div 
        className="absolute inset-0 bg-orange-50 transition-all duration-[700ms] ease-in-out delay-[50ms]"
        style={isOpen ? expandedStyle : closedStyle}
      />

      {/* Layer 3: Main Light Content Container */}
      <div 
        className="absolute inset-0 bg-[#fdfaf5] transition-all duration-[800ms] ease-in-out delay-[100ms] pointer-events-auto flex flex-col"
        style={isOpen ? expandedStyle : closedStyle}
      >
        <div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 h-full flex flex-col relative">
          
          {/* Header Area to align with the close button */}
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

          <div className={`flex-1 flex flex-col justify-center items-center transition-all duration-700 ${
            isOpen ? 'opacity-100 translate-y-0 delay-[500ms]' : 'opacity-0 translate-y-10'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a1a1a] mb-12 h-[1.2em] transition-all duration-300">
              {hoveredLang ? titles[hoveredLang] : (titles[i18n.language] || titles.en)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              {languages.map((lang) => {
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
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${lang.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-white border border-transparent group-hover:border-gray-200'
                      }`}>
                        {isSelected ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm tracking-wider uppercase">{lang.code}</span>}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-[#1a1a1a] mb-1">{lang.native}</h3>
                        <p className="text-gray-500 font-medium">{lang.name}</p>
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
