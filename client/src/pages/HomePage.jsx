import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import CyberFact from '../components/facts/CyberFact';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-[75vh] flex flex-col justify-center max-w-5xl mx-auto py-10 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-[#1a1a1a] leading-[1.1]">
              <span className="block">{t('home.title1')}</span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 bg-orange-400 rounded-md"></div>
                </div>
                <span className="block">{t('home.title2')}</span>
              </div>
              <span className="block">{t('home.title3')}</span>
            </h1>
            
            <p className="text-gray-500 max-w-sm text-lg leading-relaxed pt-6 border-b border-gray-200 pb-8">
              {t('home.subtitle')}
            </p>

            <Link to="/login" className="inline-flex items-center gap-2 font-medium text-[#1a1a1a] hover:opacity-70 transition-opacity">
              <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs">→</span> 
              {t('home.cta')}
            </Link>
          </div>

          <div className="relative h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden flex items-center justify-center group perspective-[1000px]">
            {/* Visual element representing layers of security like in the screenshot */}
            <div className="relative w-[300px] h-[300px] drop-shadow-2xl transition-all duration-700 transform-style-3d group-hover:rotate-x-12 group-hover:-rotate-y-12">
              <div className="absolute inset-0 bg-white shadow-lg rounded-[2rem] border border-gray-100 transition-all duration-700 transform group-hover:translate-x-12 group-hover:-translate-y-12 group-hover:rotate-[-10deg] group-hover:scale-110 -rotate-6 scale-105"></div>
              <div className="absolute inset-0 bg-yellow-400 shadow-md rounded-[2rem] border border-yellow-300 transition-all duration-700 transform group-hover:-translate-x-12 group-hover:-translate-y-4 group-hover:rotate-[15deg] rotate-[4deg]"></div>
              <div className="absolute inset-0 bg-gray-100 shadow-xl rounded-[2rem] flex items-center justify-center border border-white transition-all duration-700 transform group-hover:translate-x-4 group-hover:translate-y-12 group-hover:scale-[1.15] z-10">
                <div className="w-24 h-24 bg-white rounded-full shadow-inner border-8 border-gray-200 flex items-center justify-center transition-all duration-700 transform group-hover:rotate-90">
                  <div className="w-12 h-12 bg-[#1a1a1a] rounded-full border-4 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <div className="cyber-line opacity-50" />

      {/* Cyber Facts integrated below */}
      <section className="py-10 max-w-3xl mx-auto">
        <CyberFact />
      </section>
      
    </div>
  );
};

export default HomePage;
