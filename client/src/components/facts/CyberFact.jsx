import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ShieldAlert, AlertTriangle, Fingerprint, Sparkles, RotateCcw } from 'lucide-react';
import api from '../../utils/api';
import Badge from '../ui/Badge';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/**
 * CyberFact — Subway Train Animation Component
 *
 * Phases:
 *   wall     → moving columns of mock facts (alternating scroll directions)
 *   rush     → wall transforms into a full-block metro train rushing past
 *   revealed → train passed, generate UI is visible behind it
 *   loading  → fetching AI fact
 *   fact     → displaying the AI-generated fact
 */

// ─── Mock Data ────────────────────────────────────────────────────────
const wallFacts = [
  { text: 'In 2024, Kazakhstan recorded over 20,000 cases of internet fraud, with total damages exceeding ₸12 billion.', category: 'fraud', severity: 'critical', source: 'Ministry of Internal Affairs of Kazakhstan' },
  { text: 'Over 67% of phishing attacks in Central Asia use fake banking websites mimicking Kaspi Bank and Halyk Bank.', category: 'phishing', severity: 'critical', source: 'CERT-KZ Report 2024' },
  { text: 'Cyberbullying among Kazakh teens aged 12-17 increased by 43% between 2023-2025.', category: 'cyberbullying', severity: 'high', source: 'UNICEF Kazakhstan' },
  { text: '38% of Kazakh internet users reuse the same password for banking, social media, and email.', category: 'identity-theft', severity: 'high', source: 'Digital Security Survey KZ 2024' },
  { text: 'Deepfake voice scams have emerged in Kazakhstan — criminals clone voices from just 3 seconds of audio.', category: 'fraud', severity: 'critical', source: 'AI Fraud Watch CIS 2025' },
  { text: 'SIM-swapping attacks in Kazakhstan grew by 320% in 2024, draining bank accounts within minutes.', category: 'identity-theft', severity: 'critical', source: 'Telecom Security Task Force KZ' },
  { text: 'Over 80% of data breaches involve stolen or weak credentials, not advanced hacking techniques.', category: 'phishing', severity: 'high', source: 'Verizon DBIR 2024' },
  { text: 'A cyberattack occurs every 39 seconds globally, affecting mostly unsuspecting individuals.', category: 'fraud', severity: 'medium', source: 'University of Maryland Study' },
  { text: 'Public Wi-Fi networks in cafes account for 22% of localized man-in-the-middle attacks.', category: 'fraud', severity: 'medium', source: 'Norton Cyber Safety Report' },
  { text: 'Fake banking apps on third-party stores steal credentials from 1 in 15 users who download them.', category: 'phishing', severity: 'high', source: 'Kaspersky Mobile Threat Report' },
  { text: '95% of cybersecurity breaches are caused by human error, according to industry research.', category: 'fraud', severity: 'high', source: 'IBM X-Force Threat Intelligence' },
  { text: 'Using multi-factor authentication blocks 99.9% of automated account takeover attacks.', category: 'identity-theft', severity: 'critical', source: 'Microsoft Security Research' },
  { text: 'Spear-phishing emails targeting specific individuals have a 70% higher open rate than mass spam.', category: 'phishing', severity: 'critical', source: 'Proofpoint Threat Report 2024' },
  { text: 'The average financial loss from a successful social engineering attack is over $3,000 per victim.', category: 'identity-theft', severity: 'critical', source: 'FBI IC3 Annual Report' },
  { text: 'QR code phishing (Quishing) became a major threat in CIS, leading to 15% of all mobile fraud.', category: 'phishing', severity: 'high', source: 'Group-IB Threat Intelligence' },
  { text: 'Password "123456" is still used by millions, accounting for 10% of brute-force successes.', category: 'identity-theft', severity: 'high', source: 'NordPass Password Study 2024' },
];

// Split facts into 4 columns
const col1 = wallFacts.filter((_, i) => i % 4 === 0);
const col2 = wallFacts.filter((_, i) => i % 4 === 1);
const col3 = wallFacts.filter((_, i) => i % 4 === 2);
const col4 = wallFacts.filter((_, i) => i % 4 === 3);
const columns = [col1, col2, col3, col4];

// ─── Helpers ──────────────────────────────────────────────────────────
const getIcon = (cat) => {
  switch (cat?.toLowerCase()) {
    case 'phishing': return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'fraud': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'identity-theft': return <Fingerprint className="w-4 h-4 text-purple-500" />;
    default: return <ShieldAlert className="w-4 h-4 text-blue-500" />;
  }
};
const sevVariant = (s) => {
  switch (s?.toLowerCase()) {
    case 'critical': return 'critical';
    case 'high': return 'warning';
    case 'medium': return 'info';
    default: return 'low';
  }
};

// ─── Mini Fact Card ───────────────────────────────────────────────────
const MiniCard = ({ fact }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm select-none shrink-0" style={{ height: 150 }}>
    <div className="flex justify-between items-start mb-2">
      <div className="p-1.5 bg-gray-50 rounded-lg">{getIcon(fact.category)}</div>
      <Badge variant={sevVariant(fact.severity)}>{fact.severity}</Badge>
    </div>
    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3 font-medium">"{fact.text}"</p>
  </div>
);

// ─── Big Train Card (fills the full block height) ────────────────────
const TrainCard = ({ fact }) => (
  <div
    className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl select-none shrink-0 flex flex-col justify-between"
    style={{ width: 480, height: '100%', minHeight: 480 }}
  >
    <div>
      <div className="flex justify-between items-start mb-5">
        <div className="p-3 bg-gray-50 rounded-2xl">{getIcon(fact.category)}</div>
        <Badge variant={sevVariant(fact.severity)}>{fact.severity}</Badge>
      </div>
      <p className="text-xl text-gray-800 leading-relaxed font-semibold mb-4">"{fact.text}"</p>
    </div>
    <div className="pt-4 border-t border-gray-100 mt-auto">
      <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {fact.source}
      </p>
    </div>
  </div>
);

// ─── Scrolling Column (for the wall) ─────────────────────────────────
const ScrollColumn = ({ facts, direction = 'down', duration = 30 }) => {
  // Duplicate facts 4x for seamless loop
  const list = [...facts, ...facts, ...facts, ...facts];
  const goDown = direction === 'down';

  return (
    <div className="flex-1 overflow-hidden relative h-full">
      <motion.div
        className="flex flex-col gap-4"
        animate={{ y: goDown ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {list.map((fact, i) => (
          <MiniCard key={`${direction}-${i}`} fact={fact} />
        ))}
      </motion.div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// ─── Main Component ─────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════
const CyberFact = () => {
  const { i18n } = useTranslation();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });

  const [phase, setPhase] = useState('wall'); // wall | rush | loading | fact
  const [aiFact, setAiFact] = useState(null);
  const [bgState, setBgState] = useState('idle'); // idle | loading | ready
  const [hasTriggered, setHasTriggered] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Start rush when the section becomes visible
  useEffect(() => {
    if (isInView && !hasTriggered) {
      const timer = setTimeout(() => {
        setHasTriggered(true);
        setPhase('rush');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasTriggered]);

  // Preload AI fact as soon as rush starts (so it's ready when train finishes)
  useEffect(() => {
    if (phase === 'rush' && bgState === 'idle') {
      setBgState('loading');
      
      // Safety timeout: if AI is too slow, use fallback after 4s
      const safetyTimer = setTimeout(() => {
        if (bgState === 'loading') {
          setAiFact(wallFacts[Math.floor(Math.random() * wallFacts.length)]);
          setBgState('ready');
        }
      }, 4000);

      api.get(`/ai/fact?lang=${i18n.language}`)
        .then(data => {
          if (data && data.text) {
            setAiFact(data);
            setBgState('ready');
          } else throw new Error('Invalid');
        })
        .catch(() => {
          setAiFact(wallFacts[Math.floor(Math.random() * wallFacts.length)]);
          setBgState('ready');
        })
        .finally(() => clearTimeout(safetyTimer));
    }
  }, [phase, bgState, i18n.language]);

  // Generate AI fact (button click)
  const generateFact = useCallback(async () => {
    if (cooldown) return;
    setCooldown(true);
    setPhase('loading');
    try {
      const data = await api.get(`/ai/fact?lang=${i18n.language}`);
      if (data && data.text) setAiFact(data);
      else throw new Error('Invalid');
    } catch {
      setAiFact(wallFacts[Math.floor(Math.random() * wallFacts.length)]);
    }
    setPhase('fact');
    setTimeout(() => setCooldown(false), 3000);
  }, [i18n.language, cooldown]);

  // Replay
  const replay = useCallback(() => {
    setAiFact(null);
    setBgState('idle');
    setHasTriggered(false);
    setPhase('wall');
  }, []);

  // Train finishes → show fact or loading
  const handleTrainEnd = useCallback(() => {
    if (bgState === 'ready' && aiFact) setPhase('fact');
    else setPhase('loading');
  }, [bgState, aiFact]);

  // If phase is loading and fact becomes ready, show it
  useEffect(() => {
    if (phase === 'loading' && bgState === 'ready' && aiFact) {
      setPhase('fact');
    }
  }, [phase, bgState, aiFact]);

  const trainFacts = wallFacts;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-[3rem] border border-gray-100 bg-[#fafafa] shadow-inner"
      style={{ height: 560, overflow: phase === 'rush' ? 'visible' : 'hidden' }}
    >
      {/* ═══════════════════════════════════════════════════════════
           LAYER 0 (bottom): Generate UI — always rendered behind
         ═══════════════════════════════════════════════════════════ */}
      {/* LAYER 0 (bottom): Generate / Loading / Fact — visible behind the train */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Loading spinner behind train */}
          {phase === 'rush' && (
            <motion.div key="rush-bg" className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-3 h-3 bg-[#1a1a1a] rounded-full"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }} />
                ))}
              </div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Generating cyber fact…</p>
            </motion.div>
          )}

          {/* AI Fact result */}
          {phase === 'fact' && aiFact && (
            <motion.div key="fact" className="px-8 w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ type: 'spring', bounce: 0.3 }}>
              <div className="relative bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-50 rounded-xl">{getIcon(aiFact.category)}</div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{aiFact.category}</span>
                  </div>
                  <Badge variant={sevVariant(aiFact.severity)}>{aiFact.severity}</Badge>
                </div>
                <p className="text-[#1a1a1a] text-lg font-medium leading-relaxed mb-6">"{aiFact.text}"</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {aiFact.source || aiFact.category}
                  </p>
                  <div className="flex gap-2">
                    <motion.button 
                      whileHover={!cooldown ? { scale: 1.05 } : {}} 
                      whileTap={!cooldown ? { scale: 0.95 } : {}} 
                      onClick={generateFact}
                      disabled={cooldown}
                      className={`px-4 py-2 bg-[#1a1a1a] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md ${cooldown ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <Sparkles className="w-3 h-3" /> {cooldown ? 'Wait...' : 'New Fact'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={replay}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-colors">
                      <RotateCcw className="w-3 h-3" /> Replay
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           LAYER 1: The WALL — 4 scrolling columns
         ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'wall' && (
          <motion.div
            key="wall-layer"
            className="absolute inset-0 z-10 flex gap-4 p-4"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Fade edges top/bottom */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#fafafa] to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#fafafa] to-transparent z-20 pointer-events-none" />

            {columns.map((colFacts, colIdx) => (
              <ScrollColumn
                key={colIdx}
                facts={colFacts}
                direction={colIdx % 2 === 0 ? 'down' : 'up'}
                duration={25 + colIdx * 5}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
           LAYER 2: The TRAIN — full-block rushing animation
         ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === 'rush' && (
          <>
            <motion.div
              key="train-layer"
              className="absolute z-20"
              style={{ top: 0, bottom: 0, left: '-10vw', right: '-10vw' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Train container — breaks out to full viewport width */}
              <div className="absolute inset-0 overflow-visible">
                {/* The train strip — massive cards, starts off-screen right, ends off-screen left */}
                <motion.div
                  className="absolute top-0 h-full flex items-stretch gap-8 py-4"
                  initial={{ left: '110%' }}
                  animate={{ left: '-9000px' }}
                  transition={{ duration: 5.5, ease: [0.08, 0.0, 0.2, 1] }}
                  onAnimationComplete={handleTrainEnd}
                >
                  {trainFacts.map((fact, i) => (
                    <TrainCard key={i} fact={fact} />
                  ))}
                </motion.div>
              </div>

              {/* Speed lines */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-[1px]"
                    style={{
                      top: `${8 + i * 7.5}%`,
                      width: '150%',
                      left: '-25%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(200,200,200,0.5) 40%, rgba(200,200,200,0.5) 60%, transparent 100%)',
                    }}
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: '-100%', opacity: [0, 0.5, 0.5, 0] }}
                    transition={{
                      duration: 0.6,
                      delay: 0.3 + i * 0.12,
                      repeat: 6,
                      repeatDelay: 0.2,
                      ease: 'linear',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Vignette Layer — Now overflowing BEYOND the card boundaries */}
            <motion.div
              className="absolute z-30 pointer-events-none"
              style={{ top: 0, bottom: 0, left: '-20vw', right: '-20vw' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ 
                times: [0, 0.1, 0.6, 0.9], 
                duration: 4,
                ease: "easeInOut"
              }}
            >
              <div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, #1a1a1a 0%, rgba(26,26,26,0.8) 8%, transparent 20%)',
                }}
              />
              {/* Sana branding — moved outside the card boundaries */}
              <div className="absolute left-[10vw] top-1/2 -translate-y-1/2 flex flex-col items-start gap-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                  <div className="w-6 h-6 bg-white rounded-[5px]" />
                </div>
                <div>
                  <p className="text-white text-3xl font-bold tracking-tight">Sana</p>
                  <p className="text-white/50 text-xs font-medium mt-1.5 max-w-[180px] leading-relaxed">
                    Cyber awareness<br />powered by AI
                  </p>
                </div>
                <motion.div
                  className="w-12 h-[2px] bg-white/20 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyberFact;
