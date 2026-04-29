import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ShieldAlert, AlertTriangle, Fingerprint, Sparkles, RotateCcw } from 'lucide-react';
import api from '../../utils/api';
import Badge from '../ui/Badge';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const createAiRequestId = () => `ai_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const cancelAiProviderRequest = (requestId) => {
  if (!requestId || typeof window === 'undefined') return;

  const url = `/api/ai/cancel/${encodeURIComponent(requestId)}`;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url);
    return;
  }

  fetch(url, {
    method: 'POST',
    keepalive: true,
  }).catch(() => {});
};

/**
 * CyberFact — Subway Train Animation Component
 *
 * Phases:
 *   wall     → moving columns of mock facts before the block enters view
 *   rush     → wall transforms into a full-block metro train rushing past
 *   loading  → fetching the fact
 *   fact     → displaying the generated or fallback fact as soon as it is ready
 */

// ─── Mock Data ────────────────────────────────────────────────────────
const wallFactsByLang = {
  en: [
    { text: 'Internet fraud remains one of the fastest-growing cyber threats for everyday users.', category: 'fraud', severity: 'critical', source: 'Sana Research' },
    { text: 'Phishing pages often imitate familiar banking and delivery services to steal credentials.', category: 'phishing', severity: 'high', source: 'CERT-KZ' },
    { text: 'Reusing one password across services dramatically increases account takeover risk.', category: 'identity-theft', severity: 'high', source: 'Microsoft Security Research' },
    { text: 'Two-factor authentication blocks most automated account takeover attempts.', category: 'identity-theft', severity: 'critical', source: 'Microsoft Security Research' },
    { text: 'Attackers frequently target urgent emotions to force risky clicks and transfers.', category: 'fraud', severity: 'medium', source: 'Sana Research' },
    { text: 'Fake mobile apps can mimic trusted tools while collecting login data in the background.', category: 'phishing', severity: 'high', source: 'Kaspersky Mobile Threat Report' },
    { text: 'Timely app and OS updates close vulnerabilities that malware campaigns actively exploit.', category: 'fraud', severity: 'medium', source: 'Sana Research' },
    { text: 'Weak account recovery settings can be abused even when the primary password is strong.', category: 'identity-theft', severity: 'high', source: 'Sana Research' },
  ],
  ru: [
    { text: 'Интернет-мошенничество остается одной из самых быстрорастущих киберугроз для обычных пользователей.', category: 'fraud', severity: 'critical', source: 'Sana Research' },
    { text: 'Фишинговые страницы часто имитируют знакомые банковские и сервисные сайты, чтобы украсть учетные данные.', category: 'phishing', severity: 'high', source: 'CERT-KZ' },
    { text: 'Повторное использование одного пароля в разных сервисах резко повышает риск захвата аккаунтов.', category: 'identity-theft', severity: 'high', source: 'Microsoft Security Research' },
    { text: 'Двухфакторная аутентификация блокирует большую часть автоматических попыток захвата аккаунта.', category: 'identity-theft', severity: 'critical', source: 'Microsoft Security Research' },
    { text: 'Злоумышленники часто давят на срочность и страх, чтобы подтолкнуть к опасным действиям.', category: 'fraud', severity: 'medium', source: 'Sana Research' },
    { text: 'Поддельные мобильные приложения могут выглядеть как полезные сервисы и скрытно собирать логины.', category: 'phishing', severity: 'high', source: 'Kaspersky Mobile Threat Report' },
    { text: 'Своевременные обновления системы и приложений закрывают уязвимости, используемые вредоносным ПО.', category: 'fraud', severity: 'medium', source: 'Sana Research' },
    { text: 'Слабые настройки восстановления доступа могут быть использованы даже при сложном пароле.', category: 'identity-theft', severity: 'high', source: 'Sana Research' },
  ],
  kz: [
    { text: 'Интернет-алаяқтық қарапайым пайдаланушылар үшін ең жылдам өсіп жатқан киберқауіптердің бірі болып отыр.', category: 'fraud', severity: 'critical', source: 'Sana Research' },
    { text: 'Фишинг беттері логин мен құпиясөзді ұрлау үшін банк және сервис сайттарына ұқсап жасалады.', category: 'phishing', severity: 'high', source: 'CERT-KZ' },
    { text: 'Бір құпиясөзді бірнеше сервисте қолдану аккаунтты басып алу қаупін күрт арттырады.', category: 'identity-theft', severity: 'high', source: 'Microsoft Security Research' },
    { text: 'Екі факторлы аутентификация аккаунтты автоматты түрде бұзып кіру әрекеттерінің көбін тоқтатады.', category: 'identity-theft', severity: 'critical', source: 'Microsoft Security Research' },
    { text: 'Шабуылдаушылар қауіпті әрекетке итермелеу үшін жиі асықтыру және қорқыту тактикасын қолданады.', category: 'fraud', severity: 'medium', source: 'Sana Research' },
    { text: 'Жалған мобильді қосымшалар пайдалы құрал сияқты көрініп, фондық режимде деректерді жинай алады.', category: 'phishing', severity: 'high', source: 'Kaspersky Mobile Threat Report' },
    { text: 'Жүйе мен қосымшаларды уақытында жаңарту зиянды код пайдаланатын осалдықтарды жабады.', category: 'fraud', severity: 'medium', source: 'Sana Research' },
    { text: 'Қалпына келтіру параметрлері әлсіз болса, күрделі құпиясөздің өзі аккаунтты толық қорғамайды.', category: 'identity-theft', severity: 'high', source: 'Sana Research' },
  ],
};

const normalizeLang = (lang) => {
  const normalized = (lang || 'en').toString().toLowerCase();
  if (normalized.startsWith('ru')) return 'ru';
  if (normalized.startsWith('kz') || normalized.startsWith('kk')) return 'kz';
  return 'en';
};

const pickLocalFact = (facts) => facts[Math.floor(Math.random() * facts.length)];

const normalizeFact = (fact, fallbackFact) => ({
  text: fact?.text || fallbackFact?.text || '',
  category: (fact?.category || 'general').toString().toLowerCase(),
  severity: (fact?.severity || 'medium').toString().toLowerCase(),
  source: fact?.source || fallbackFact?.source || 'Sana Research',
});

const isServerFallbackFact = (fact) =>
  !fact ||
  !fact.text ||
  fact.category === 'System' ||
  fact.source === 'Sana Security Lab';

const guaranteedLocalFact = (facts) => {
  const fallbackFact = pickLocalFact(facts);
  return normalizeFact(fallbackFact, fallbackFact);
};

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
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const normalizedLang = normalizeLang(i18n.language);
  const wallFacts = wallFactsByLang[normalizedLang] || wallFactsByLang.en;

  const col1 = wallFacts.filter((_, index) => index % 4 === 0);
  const col2 = wallFacts.filter((_, index) => index % 4 === 1);
  const col3 = wallFacts.filter((_, index) => index % 4 === 2);
  const col4 = wallFacts.filter((_, index) => index % 4 === 3);
  const columns = [col1, col2, col3, col4];

  const [phase, setPhase] = useState('wall'); // wall | rush | loading | fact
  const [aiFact, setAiFact] = useState(null);
  const [bgState, setBgState] = useState('idle'); // idle | loading | ready
  const [hasTriggered, setHasTriggered] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const aiRequestControllerRef = useRef(null);
  const aiRequestIdRef = useRef(null);

  useEffect(() => {
    const abortAiRequest = () => {
      cancelAiProviderRequest(aiRequestIdRef.current);
      aiRequestIdRef.current = null;
      aiRequestControllerRef.current?.abort();
      aiRequestControllerRef.current = null;
    };

    window.addEventListener('beforeunload', abortAiRequest);
    return () => {
      window.removeEventListener('beforeunload', abortAiRequest);
      abortAiRequest();
    };
  }, []);

  const fetchBestFact = useCallback(async ({ skipAi = false } = {}) => {
    // 1) Try AI endpoint first unless explicitly skipped
    if (!skipAi) {
      try {
        cancelAiProviderRequest(aiRequestIdRef.current);
        aiRequestControllerRef.current?.abort();
        const controller = new AbortController();
        const requestId = createAiRequestId();
        aiRequestControllerRef.current = controller;
        aiRequestIdRef.current = requestId;

        const aiData = await api.get(`/ai/fact?lang=${i18n.language}`, {
          signal: controller.signal,
          headers: {
            'X-AI-Request-ID': requestId,
          },
        });

        if (aiRequestControllerRef.current === controller) {
          aiRequestControllerRef.current = null;
        }
        if (aiRequestIdRef.current === requestId) {
          aiRequestIdRef.current = null;
        }

        if (!isServerFallbackFact(aiData)) {
          return normalizeFact(aiData);
        }
      } catch {
        // Ignore and continue with fallbacks.
      }
    }

    // 2) Try DB-backed random fact
    try {
      const randomResponse = await api.get(`/facts/random?lang=${i18n.language}`);
      const randomFact = randomResponse?.data || randomResponse;
      if (randomFact?.text) {
        return normalizeFact(randomFact, pickLocalFact(wallFacts));
      }
    } catch {
      // Ignore and continue with local fallback.
    }

    // 3) Final local fallback
    return guaranteedLocalFact(wallFacts);
  }, [i18n.language, wallFacts]);

  const fetchBestFactSafe = useCallback(async (options = {}) => {
    try {
      return await fetchBestFact(options);
    } catch {
      return guaranteedLocalFact(wallFacts);
    }
  }, [fetchBestFact, wallFacts]);

  // Start the reveal animation as soon as the section becomes visible.
  useEffect(() => {
    if (isInView && !hasTriggered) {
      setHasTriggered(true);
      setPhase('rush');
    }
  }, [isInView, hasTriggered]);

  // Fetch the fact immediately; the UI switches to the fact as soon as it arrives.
  useEffect(() => {
    if (isInView && bgState === 'idle') {
      setBgState('loading');
      (async () => {
        const fact = await fetchBestFactSafe();
        setAiFact(fact);
        setBgState('ready');
      })();
    }
  }, [isInView, bgState, fetchBestFactSafe]);

  // Generate AI fact (button click)
  const generateFact = useCallback(async () => {
    if (cooldown) return;
    setCooldown(true);
    setPhase('loading');
    const fact = await fetchBestFactSafe();
    setAiFact(fact);
    setBgState('ready');
    setPhase('fact');
    setTimeout(() => setCooldown(false), 3000);
  }, [fetchBestFactSafe, cooldown]);

  // Last-resort guard: never stay on loading forever.
  useEffect(() => {
    if (phase !== 'loading') return;

    const timer = setTimeout(() => {
      if (!aiFact) {
        setAiFact(guaranteedLocalFact(wallFacts));
      }
      setBgState('ready');
      setPhase('fact');
    }, 5000);

    return () => clearTimeout(timer);
  }, [phase, aiFact, wallFacts]);

  // Replay
  const replay = useCallback(() => {
    setAiFact(null);
    setBgState('idle');
    setHasTriggered(false);
    setPhase('wall');
  }, []);

  // Train finishes → show the fact if it is ready, otherwise show only the real request loader.
  const handleTrainEnd = useCallback(() => {
    if (bgState === 'ready' && aiFact) {
      setPhase('fact');
      return;
    }

    setPhase('loading');
  }, [bgState, aiFact]);

  // If the fact becomes ready, show it immediately, even while the train is still moving.
  useEffect(() => {
    if (['rush', 'loading'].includes(phase) && bgState === 'ready' && aiFact) {
      setPhase('fact');
    }
  }, [phase, bgState, aiFact]);

  const trainFacts = [...wallFacts, ...wallFacts, ...wallFacts];

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
          {phase === 'rush' && (
            <motion.div
              key="rush-bg"
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-[#1a1a1a] rounded-full"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading state after train animation */}
          {phase === 'loading' && (
            <motion.div
              key="loading-bg"
              className="flex flex-col items-center gap-4 px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              <p className="text-base font-semibold text-[#1a1a1a]">{t('simulation.preparingFact')}</p>
              <p className="text-xs text-gray-500 max-w-sm">
                {t('simulation.factFallbackNote')}
              </p>
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
                      <Sparkles className="w-3 h-3" /> {cooldown ? t('simulation.wait') : t('simulation.newFact')}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={replay}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-colors">
                      <RotateCcw className="w-3 h-3" /> {t('simulation.replay')}
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
          <motion.div
            key="train-layer"
            className="absolute z-20"
            style={{ top: 0, bottom: 0, left: '-10vw', right: '-10vw' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 overflow-visible">
              <motion.div
                className="absolute top-0 h-full flex items-stretch gap-8 py-4"
                initial={{ left: '110%' }}
                animate={{ left: '-25000px' }}
                transition={{ duration: 5, ease: [0.08, 0.0, 0.2, 1] }}
                onAnimationComplete={handleTrainEnd}
              >
                {trainFacts.map((fact, i) => (
                  <TrainCard key={i} fact={fact} />
                ))}
              </motion.div>
            </div>

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
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyberFact;
