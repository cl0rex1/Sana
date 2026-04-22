import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Menu, X, User, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LanguageOverlay from '../ui/LanguageOverlay';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const triggerRef = React.useRef(null);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/simulation', label: t('nav.simulation') },
    { path: '/learn', label: t('nav.features') || 'Learn' },
    { path: '/dashboard', label: t('nav.dashboard') },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className={`fixed top-4 md:top-6 left-0 right-0 z-50 w-full transition-all duration-500 px-4`}>
      <div className={`mx-auto transition-all duration-500 rounded-full ${
        isScrolled 
          ? 'max-w-[1000px] bg-white/80 backdrop-blur-xl shadow-lg border border-gray-200/50 px-6' 
          : 'max-w-[1400px] bg-transparent sm:px-6 lg:px-8 px-4'
      }`}>
        <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
              <div className="w-3 h-3 bg-[#fdfaf5] rounded-sm"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">SANA</span>
          </Link>

          {/* Desktop Navigation (Center Pill) */}
          <div className={`hidden md:flex items-center rounded-full transition-all duration-300 ${isScrolled ? 'bg-transparent px-0 shadow-none border-none' : 'bg-white border border-gray-200 px-2 py-1 shadow-sm'}`}>
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-gray-100 text-[#1a1a1a]'
                    : 'text-gray-500 hover:text-[#1a1a1a]'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions (Lang + Profile/CTA) */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              ref={triggerRef}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 outline-none"
              onClick={() => setIsLangOpen(true)}
            >
              <Globe className="w-4 h-4" />
              {i18n.language.toUpperCase()}
            </button>

            {user ? (
               <Link to="/profile" className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors">
                 <User className="w-4 h-4" />
                 {t('nav.profile')}
               </Link>
            ) : (
               <Link to="/login" className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#333333] transition-colors">
                 {t('nav.login')} <span className="ml-1">→</span>
               </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border border-gray-200 absolute top-[4.5rem] left-4 right-4 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive(path) ? 'bg-gray-100 text-[#1a1a1a]' : 'text-gray-600'
                }`}
              >
                {label}
              </Link>
            ))}
            
            <button 
              className="px-4 py-3 bg-gray-50 rounded-xl outline-none text-left flex items-center justify-between"
              onClick={() => { setIsOpen(false); setIsLangOpen(true); }}
            >
              <span>{t('nav.language') || 'Language'}</span>
              <span className="font-bold">{i18n.language.toUpperCase()}</span>
            </button>
            
            {user ? (
               <Link to="/profile" onClick={() => setIsOpen(false)} className="px-4 py-3 text-center border border-gray-300 rounded-xl">
                 {t('nav.profile')}
               </Link>
            ) : (
               <Link to="/login" onClick={() => setIsOpen(false)} className="px-4 py-3 text-center bg-[#1a1a1a] text-white rounded-xl">
                 {t('nav.login')}
               </Link>
            )}
          </div>
        </div>
      )}
      
      {/* Dynamic Fullscreen Language Overlay */}
      <LanguageOverlay 
        isOpen={isLangOpen} 
        onClose={() => setIsLangOpen(false)} 
        triggerElement={triggerRef.current}
      />
    </nav>
  );
};

export default Navbar;
