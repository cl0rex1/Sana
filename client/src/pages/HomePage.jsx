import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Shield, Zap, Target, Bug, Activity, Server, Smartphone, User, ShieldAlert, AlertTriangle, Fingerprint, Eye, Database } from 'lucide-react';
import CyberFact from '../components/facts/CyberFact';
import Badge from '../components/ui/Badge';

const HomePage = () => {
  const { t } = useTranslation();
  
  // 0: Malware, 1: Sana, 2: Security
  const [activeCard, setActiveCard] = useState(1); // Start with Sana
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle cards every 10 seconds, pausing on hover
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 3);
    }, 10000);
    return () => clearInterval(timer);
  }, [isHovered]);

  // Card 0 Internal Phase: 'typing' -> 'bug'
  const [c0Phase, setC0Phase] = useState('typing');
  useEffect(() => {
    const timer = setInterval(() => {
      setC0Phase(p => p === 'typing' ? 'bug' : 'typing');
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Card 2 Internal Phase: 'logo_only' -> 'logo_secured' -> 'final_message'
  const [c2Phase, setC2Phase] = useState('logo_only');
  useEffect(() => {
    let t1, t2;
    const cycle = () => {
      setC2Phase('logo_only');
      t1 = setTimeout(() => {
        setC2Phase('logo_secured');
        t2 = setTimeout(() => {
          setC2Phase('final_message');
        }, 1500);
      }, 1500);
    };
    cycle();
    const interval = setInterval(cycle, 6500); // 1.5 + 1.5 + 3.5 = 6.5s
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, []);

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

          <div className="relative h-[400px] md:h-[600px] rounded-[3rem] flex items-center justify-center">
            
            <div 
              className="flex gap-8 items-center perspective-[1200px]"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Motion Design Visual Stack */}
              <motion.div 
                animate={{ rotateX: 15, rotateY: -15 }}
                className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] transform-style-3d drop-shadow-2xl"
              >
                {/* Card 0: Malware / Threat (Typing -> Bug) */}
                <motion.div 
                  animate={{ 
                    z: activeCard === 0 ? 100 : activeCard === 2 ? -100 : 0, 
                    y: activeCard === 0 ? 0 : activeCard === 2 ? 40 : -20, 
                    x: activeCard === 0 ? 0 : activeCard === 2 ? -30 : 30, 
                    scale: activeCard === 0 ? 1.1 : 1,
                    rotate: activeCard === 0 ? 0 : activeCard === 2 ? -15 : 15,
                  }}
                  transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                  style={{ zIndex: activeCard === 0 ? 30 : activeCard === 2 ? 10 : 20 }}
                  className="absolute inset-0 bg-white shadow-2xl rounded-[2.5rem] flex flex-col items-center justify-center border border-red-100 cursor-pointer overflow-hidden"
                  onClick={() => setActiveCard(0)}
                >
                   <AnimatePresence mode="wait">
                      {activeCard === 0 && c0Phase === 'typing' ? (
                        <motion.div 
                          key="typing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                          className="w-full px-6 flex flex-col items-center gap-3"
                        >
                           {/* Pulsing warning dot */}
                           <motion.div 
                             animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                             transition={{ duration: 1, repeat: Infinity }}
                             className="w-3 h-3 rounded-full bg-yellow-400 mb-1"
                             style={{ boxShadow: '0 0 12px rgba(250,204,21,0.6)' }}
                           />
                           <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 w-full shadow-sm relative overflow-hidden flex items-center">
                              <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-3 shrink-0 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">$$</div>
                              <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "linear" }}
                                className="overflow-hidden whitespace-nowrap border-r-2 border-red-400 text-sm font-medium text-gray-700"
                              >
                                {t('home.scamPrize')}
                              </motion.div>
                           </div>
                        </motion.div>
                      ) : activeCard === 0 && c0Phase === 'bug' ? (
                        <motion.div 
                          key="bug"
                          initial={{ opacity: 0, scale: 2, rotate: 180, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                          className="relative"
                        >
                          {/* Red glow ring */}
                          <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-[-16px] rounded-[2.5rem] border-2 border-red-400/40"
                          />
                          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-[2rem] flex items-center justify-center"
                            style={{ boxShadow: '0 0 50px rgba(239,68,68,0.4), 0 10px 30px rgba(239,68,68,0.3)' }}>
                             <Bug className="w-12 h-12 text-white" />
                          </div>
                        </motion.div>
                      ) : (
                         <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center opacity-50">
                           <Bug className="w-10 h-10 text-red-300" />
                         </div>
                      )}
                   </AnimatePresence>
                </motion.div>

                {/* Card 1: Sana (Tools popping out) */}
                <motion.div 
                  animate={{ 
                    z: activeCard === 1 ? 100 : activeCard === 0 ? -100 : 0, 
                    y: activeCard === 1 ? 0 : activeCard === 0 ? 40 : -20, 
                    x: activeCard === 1 ? 0 : activeCard === 0 ? -30 : 30, 
                    scale: activeCard === 1 ? 1.1 : 1,
                    rotate: activeCard === 1 ? 0 : activeCard === 0 ? -15 : 15,
                  }}
                  transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                  style={{ zIndex: activeCard === 1 ? 30 : activeCard === 0 ? 10 : 20 }}
                  className="absolute inset-0 bg-[#1a1a1a] shadow-2xl rounded-[2.5rem] flex items-center justify-center border border-gray-800 cursor-pointer overflow-hidden"
                  onClick={() => setActiveCard(1)}
                >
                  {/* Glowing ring behind logo */}
                  {activeCard === 1 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="absolute w-40 h-40 rounded-full pointer-events-none"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  )}
                  {activeCard === 1 && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none"
                    />
                  )}

                  {/* Orbiting tools - improved paths */}
                  {activeCard === 1 && [
                    { Icon: Shield, delay: 0, size: 160, dur: 6, color: 'text-emerald-400' },
                    { Icon: Lock, delay: 0, size: 120, dur: 8, color: 'text-blue-400' },
                    { Icon: Activity, delay: 0, size: 200, dur: 10, color: 'text-purple-400' }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                      transition={{ duration: item.dur, repeat: Infinity, ease: 'linear' }}
                      className="absolute pointer-events-none"
                      style={{ width: item.size, height: item.size }}
                    >
                      <motion.div
                        animate={{ scale: [0.7, 1, 0.7], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                        className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-xl border border-gray-700/50"
                        style={{ boxShadow: '0 0 12px rgba(255,255,255,0.05)' }}
                      >
                        <item.Icon className={`w-4 h-4 ${item.color}`} />
                      </motion.div>
                    </motion.div>
                  ))}
                  
                  {/* Main Logo */}
                  <motion.div 
                    animate={activeCard === 1 ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-28 h-28 bg-[#1a1a1a] rounded-[2rem] flex items-center justify-center relative z-10"
                    style={{ boxShadow: activeCard === 1 ? '0 0 40px rgba(255,255,255,0.08), 0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.3)' }}
                  >
                    <div className="w-10 h-10 bg-[#fafafa] rounded-lg" />
                  </motion.div>
                </motion.div>
                
                {/* Card 2: Security (Scam -> Sana Overlay -> No) */}
                <motion.div 
                  animate={{ 
                    z: activeCard === 2 ? 100 : activeCard === 1 ? -100 : 0, 
                    y: activeCard === 2 ? 0 : activeCard === 1 ? 40 : -20, 
                    x: activeCard === 2 ? 0 : activeCard === 1 ? -30 : 30, 
                    scale: activeCard === 2 ? 1.1 : 1,
                    rotate: activeCard === 2 ? 0 : activeCard === 1 ? -15 : 15,
                  }}
                  transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                  style={{ zIndex: activeCard === 2 ? 30 : activeCard === 1 ? 10 : 20 }}
                  className="absolute inset-0 bg-white shadow-2xl rounded-[2.5rem] border border-emerald-100 cursor-pointer overflow-hidden flex items-center justify-center" 
                  onClick={() => setActiveCard(2)}
                >
                  <div className="absolute inset-0 bg-gray-50 rounded-[2.5rem] flex flex-col justify-end p-6 pb-10">
                    <div className="w-full flex flex-col gap-4">
                      
                      {/* Incoming Scam Message stays permanently */}
                      <AnimatePresence>
                        {activeCard === 2 && (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="w-full flex justify-start"
                          >
                            <div className="bg-gray-200 text-gray-800 p-4 rounded-2xl rounded-bl-sm max-w-[85%] text-sm font-medium shadow-sm">
                              {t('home.scamBlocked')}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Outgoing Message Seamless Morphing */}
                      <AnimatePresence>
                        {activeCard === 2 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full flex justify-end"
                          >
                            <div className="bg-[#1a1a1a] rounded-2xl rounded-br-sm shadow-lg w-[140px] h-[48px] flex items-center justify-center overflow-hidden relative">
                              <AnimatePresence mode="wait">
                                {(c2Phase === 'logo_only' || c2Phase === 'logo_secured') ? (
                                  <motion.div 
                                    key="logo_state"
                                    initial={{ opacity: 0, filter: 'blur(4px)', scale: 0.8 }}
                                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                                    exit={{ opacity: 0, filter: 'blur(4px)', scale: 1.2, position: 'absolute' }}
                                    transition={{ duration: 0.4 }}
                                    className="flex items-center justify-center w-full h-full absolute inset-0"
                                  >
                                    <motion.div layout className="w-8 h-8 flex items-center justify-center shrink-0">
                                      <div className="w-4 h-4 bg-[#fafafa] rounded-sm" />
                                    </motion.div>
                                    
                                    <AnimatePresence>
                                      {c2Phase === 'logo_secured' && (
                                        <motion.div 
                                          initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                                          animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                                          className="overflow-hidden whitespace-nowrap"
                                        >
                                          <span className="text-white font-bold text-sm tracking-wide pr-1">{t('home.secured')}</span>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </motion.div>
                                ) : (
                                  <motion.div 
                                    key="text_state"
                                    initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.8 }}
                                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                  >
                                    <span className="text-white text-sm font-bold whitespace-nowrap">
                                      {t('home.no')}
                                    </span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Side Menu - Unified Capsule */}
              <div className="ml-8 bg-white border border-gray-200 rounded-full p-2 flex flex-col gap-2 shadow-lg relative">
                {/* Active Indicator Background */}
                <motion.div 
                  className="absolute left-2 w-12 h-12 bg-gray-100 rounded-full z-0"
                  animate={{ y: activeCard * 56 }} // 48px height + 8px gap
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />

                {[
                  { id: 0, icon: Bug, color: 'text-red-500' },
                  { id: 1, icon: Shield, color: 'text-blue-500' },
                  { id: 2, icon: Lock, color: 'text-emerald-500' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCard(item.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors relative z-10 ${
                      activeCard === item.id 
                        ? item.color 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Architecture Section (Replaced old grid) */}
      <section className="py-24 relative overflow-hidden bg-white max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <Badge variant="info" className="mb-4">{t('home.ecosystem')}</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight">{t('home.protection.title')}</h2>
          <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg">{t('home.protection.subtitle')}</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] text-white flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{t('home.protection.item1.title')}</h3>
                <p className="text-gray-600 leading-relaxed">{t('home.protection.item1.description')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{t('home.protection.item2.title')}</h3>
                <p className="text-gray-600 leading-relaxed">{t('home.protection.item2.description')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gray-50 rounded-[3rem] p-10 border border-gray-200 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
              <div className="w-full h-[320px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 mb-8 flex items-center justify-center overflow-hidden relative">
                
                {/* Polished Motion Design Layer */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0a0f1a] rounded-[2rem]">
                  {/* Hex grid background */}
                  <div className="absolute inset-0 opacity-[0.07]" style={{
                    backgroundImage: `radial-gradient(circle, rgba(16,185,129,0.8) 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                  }} />

                  {/* Pulsing concentric rings */}
                  {[80, 130, 190].map((size, i) => (
                    <motion.div key={i}
                      animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                      className="absolute rounded-full border border-emerald-500/25"
                      style={{ width: size, height: size }}
                    />
                  ))}

                  {/* 3D tilted scanning ring */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '600px' }}>
                    <motion.div animate={{ rotateZ: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      className="w-44 h-44 rounded-full"
                      style={{ transform: 'rotateX(65deg)', border: '2px solid rgba(16,185,129,0.35)', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}
                    />
                  </div>

                  {/* Orbiting data nodes */}
                  {[0, 1, 2, 3].map(i => (
                    <motion.div key={`node-${i}`}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute flex items-center justify-center pointer-events-none"
                      style={{ width: 120 + i * 40, height: 120 + i * 40 }}
                    >
                      <motion.div
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                        className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-emerald-400"
                        style={{ boxShadow: '0 0 8px rgba(16,185,129,0.8)' }}
                      />
                    </motion.div>
                  ))}

                  {/* Core Shield Logo */}
                  <motion.div 
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center relative z-20 border border-emerald-500/30"
                    style={{ boxShadow: '0 0 30px rgba(16,185,129,0.25), 0 0 60px rgba(16,185,129,0.1)' }}
                  >
                    <div className="w-6 h-6 bg-white rounded-md" />
                  </motion.div>

                  {/* Threat detection + neutralization */}
                  {[
                    { id: 1, startX: -140, startY: -50, delay: 0 },
                    { id: 2, startX: 130, startY: 70, delay: 1.8 },
                    { id: 3, startX: -70, startY: 110, delay: 3.5 },
                    { id: 4, startX: 100, startY: -80, delay: 5 },
                  ].map(t => (
                    <motion.div key={t.id}
                      animate={{ 
                        opacity: [0, 1, 1, 0],
                        x: [t.startX, t.startX * 0.3, 0, 0],
                        y: [t.startY, t.startY * 0.3, 0, 0],
                        scale: [0.6, 1, 1.8, 0],
                      }}
                      transition={{ duration: 4.5, repeat: Infinity, delay: t.delay, ease: 'easeInOut' }}
                      className="absolute z-10"
                    >
                      <Bug className="w-4 h-4 text-red-400 relative z-10" />
                      <motion.div
                        animate={{ opacity: [0, 0, 0.8, 0], scale: [0.5, 0.5, 2.5, 4] }}
                        transition={{ duration: 4.5, repeat: Infinity, delay: t.delay }}
                        className="absolute inset-[-4px] bg-red-500/60 rounded-full blur-md"
                      />
                    </motion.div>
                  ))}

                  {/* Radar sweep */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[250%] h-[250%] origin-center pointer-events-none"
                    style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(16,185,129,0.4) 345deg, rgba(16,185,129,0) 360deg)' }}
                  />

                  {/* Ambient glow */}
                  <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                </div>

              </div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-xl font-bold text-[#1a1a1a]">{t('home.protection.visual.title')}</h4>
                <Badge variant="purple" className="text-[10px] animate-pulse">
                  {t('home.inDevelopment')}
                </Badge>
              </div>
              <p className="text-gray-500 mt-2 leading-relaxed">{t('home.protection.visual.description')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="cyber-line opacity-50 my-16 max-w-5xl mx-auto" />

      {/* Cyber Facts integrated below */}
      <section className="py-10 max-w-3xl mx-auto">
        <CyberFact />
      </section>
      
    </div>
  );
};

export default HomePage;

