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
                          className="w-full px-6 flex flex-col items-center"
                        >
                           <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 w-full shadow-sm relative overflow-hidden flex items-center">
                              <div className="w-6 h-6 bg-green-500 rounded-full mr-3 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">$$</div>
                              <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "linear" }}
                                className="overflow-hidden whitespace-nowrap border-r-2 border-blue-500 text-sm font-medium text-gray-700"
                              >
                                You won $10,000! Click here...
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
                          className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                        >
                           <Bug className="w-12 h-12 text-white" />
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
                  {/* Orbiting tools - only animate if active */}
                  {activeCard === 1 && [
                    { Icon: Shield, delay: 0 },
                    { Icon: Lock, delay: 1.5 },
                    { Icon: Activity, delay: 3 }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: item.delay }}
                      className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                    >
                      <motion.div 
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: item.delay }}
                        className="absolute -top-4 bg-gray-800 p-2 rounded-xl border border-gray-700"
                      >
                        <item.Icon className="w-5 h-5 text-accent-cyan" />
                      </motion.div>
                    </motion.div>
                  ))}
                  
                  {/* Main Logo (Custom Square Hole Logo) */}
                  <motion.div 
                    animate={activeCard === 1 ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(26,26,26,0)", "0 0 40px rgba(26,26,26,0.3)", "0 0 0px rgba(26,26,26,0)"] } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-28 h-28 bg-[#1a1a1a] rounded-[2rem] flex items-center justify-center relative z-10 shadow-2xl"
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
                              Urgent: Your account is blocked! Pay to unlock immediately.
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
                                          <span className="text-white font-bold text-sm tracking-wide pr-1">Secured</span>
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
                                      {t('home.no', 'No, nice try!')}
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
          <Badge variant="info" className="mb-4">Ecosystem</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] tracking-tight">How Sana Protects You</h2>
          <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg">A comprehensive toolkit designed to test, train, and fortify your digital habits against modern social engineering tactics.</p>
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
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Simulated Phishing Environments</h3>
                <p className="text-gray-600 leading-relaxed">Experience hyper-realistic clones of popular Kazakh banking and service portals to test your awareness safely.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Device Vulnerability Checks</h3>
                <p className="text-gray-600 leading-relaxed">Interactive lessons on securing your smartphone, 2FA setup, and identifying malicious apps masquerading as useful tools.</p>
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
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#0f172a] rounded-[2rem]">
                  {/* Grid Background */}
                  <motion.div 
                    animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"
                  />

                  {/* Stable 3D Scanning Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '800px' }}>
                    <motion.div 
                      animate={{ rotateZ: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-48 h-48 border-[2px] border-emerald-500/40 rounded-full"
                      style={{ transform: 'rotateX(60deg)' }}
                    />
                    <motion.div 
                      animate={{ rotateZ: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute w-64 h-64 border border-emerald-400/20 rounded-full border-dashed"
                      style={{ transform: 'rotateX(60deg)' }}
                    />
                  </div>

                  {/* Core Shield Logo */}
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], filter: ['drop-shadow(0 0 10px rgba(16,185,129,0.3))', 'drop-shadow(0 0 20px rgba(16,185,129,0.6))', 'drop-shadow(0 0 10px rgba(16,185,129,0.3))'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center relative z-20 shadow-2xl border border-gray-800"
                  >
                    <div className="w-6 h-6 bg-white rounded-md" />
                  </motion.div>

                  {/* Cyclical Threat Destruction */}
                  {[
                    { id: 1, startX: -120, startY: -40, endX: -40, endY: -10, delay: 0 },
                    { id: 2, startX: 120, startY: 60, endX: 40, endY: 20, delay: 1.5 },
                    { id: 3, startX: -60, startY: 100, endX: -20, endY: 40, delay: 3 },
                  ].map(threat => (
                    <motion.div 
                      key={threat.id}
                      initial={{ opacity: 0, x: threat.startX, y: threat.startY, scale: 0.5 }}
                      animate={{ 
                        opacity: [0, 1, 1, 0], 
                        x: [threat.startX, threat.endX, threat.endX, threat.endX],
                        y: [threat.startY, threat.endY, threat.endY, threat.endY],
                        scale: [0.5, 1, 1.5, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, delay: threat.delay, ease: "easeInOut" }}
                      className="absolute z-10 flex items-center justify-center"
                    >
                      <div className="relative">
                        <Bug className="w-5 h-5 text-red-500 relative z-10" />
                        {/* Explosion effect */}
                        <motion.div 
                          animate={{ opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 2, 3] }}
                          transition={{ duration: 4, repeat: Infinity, delay: threat.delay }}
                          className="absolute inset-0 bg-red-500 rounded-full blur-sm"
                        />
                      </div>
                    </motion.div>
                  ))}

                  {/* Radar Scanning Beam */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[200%] h-[200%] opacity-20 origin-center pointer-events-none"
                    style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16,185,129,0.8) 360deg)' }}
                  />
                </div>

              </div>
              <h4 className="text-xl font-bold text-[#1a1a1a]">Real-Time Threat Analysis</h4>
              <p className="text-gray-500 mt-2 leading-relaxed">Our AI system continuously monitors and analyzes emerging scam tactics globally, instantly adapting our simulations to protect you against tomorrow's threats today.</p>
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
