import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import GlowEffect from '../components/ui/GlowEffect';
import { BookOpen, Shield, Lock, Wifi, AlertTriangle } from 'lucide-react';

const ARTICLES_DATA = [
  {
    id: 1,
    icon: <Shield className="w-8 h-8 text-blue-500" />,
    titleKey: 'articles.art1.title',
    descKey: 'articles.art1.desc',
    tag: 'articles.tag.phishing'
  },
  {
    id: 2,
    icon: <Lock className="w-8 h-8 text-emerald-500" />,
    titleKey: 'articles.art2.title',
    descKey: 'articles.art2.desc',
    tag: 'articles.tag.passwords'
  },
  {
    id: 3,
    icon: <Wifi className="w-8 h-8 text-purple-500" />,
    titleKey: 'articles.art3.title',
    descKey: 'articles.art3.desc',
    tag: 'articles.tag.network'
  },
  {
    id: 4,
    icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
    titleKey: 'articles.art4.title',
    descKey: 'articles.art4.desc',
    tag: 'articles.tag.socialEng'
  }
];

const ArticlesPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8 pt-8 relative">
        <GlowEffect color="from-blue-500/20 to-purple-500/20" className="opacity-50" />
        
        <header className="mb-10 animate-fade-in relative z-10 text-center">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4">
            {t('nav.features', 'Learn')}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t('articles.subtitle', 'Expand your cybersecurity knowledge with short, impactful articles.')}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {ARTICLES_DATA.map((art, i) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hoverable className="h-full flex flex-col cursor-pointer transition-all duration-300 border border-gray-100/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    {art.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {t(art.tag, 'General')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{t(art.titleKey, 'Article Title')}</h3>
                <p className="text-gray-500 flex-1">{t(art.descKey, 'Article Description snippet...')}</p>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-medium text-blue-600">
                  {t('articles.readMore', 'Read more')} &rarr;
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
