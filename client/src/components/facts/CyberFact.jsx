import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, ShieldAlert, AlertTriangle, Fingerprint } from 'lucide-react';
import api from '../../utils/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { motion } from 'framer-motion';

/**
 * Cyber-Fact Marquee component.
 * Displays a continuous scrolling list of facts.
 */

// Fallback facts for when the backend is not running
const fallbackFacts = [
  {
    text: 'In 2024, Kazakhstan recorded over 20,000 cases of internet fraud, with total damages exceeding ₸12 billion.',
    category: 'fraud',
    severity: 'critical',
    source: 'Ministry of Internal Affairs of Kazakhstan',
  },
  {
    text: 'Over 67% of phishing attacks in Central Asia use fake banking websites that mimic Kaspi Bank and Halyk Bank.',
    category: 'phishing',
    severity: 'critical',
    source: 'CERT-KZ Report 2024',
  },
  {
    text: 'Cyberbullying among Kazakh teens aged 12-17 increased by 43% between 2023-2025.',
    category: 'cyberbullying',
    severity: 'high',
    source: 'UNICEF Kazakhstan',
  },
  {
    text: '38% of Kazakh internet users use the same password for banking, social media, and email.',
    category: 'identity-theft',
    severity: 'high',
    source: 'Digital Security Survey KZ 2024',
  },
  {
    text: 'Deepfake voice scams have emerged in Kazakhstan: criminals clone voices from 3 seconds of audio.',
    category: 'fraud',
    severity: 'critical',
    source: 'AI Fraud Watch CIS 2025',
  },
  {
    text: 'SIM-swapping attacks in Kazakhstan grew by 320% in 2024, draining bank accounts within minutes.',
    category: 'identity-theft',
    severity: 'critical',
    source: 'Telecom Security Task Force KZ',
  },
  {
    text: 'Over 80% of data breaches involve stolen or weak credentials, not advanced hacking techniques.',
    category: 'phishing',
    severity: 'high',
    source: 'Global Cyber Report 2024',
  },
  {
    text: 'A cyberattack occurs every 39 seconds globally, affecting mostly unsuspecting individuals.',
    category: 'fraud',
    severity: 'medium',
    source: 'Cyber Defense Institute',
  },
  {
    text: 'Public Wi-Fi networks in cafes account for 22% of localized man-in-the-middle attacks.',
    category: 'fraud',
    severity: 'medium',
    source: 'NetSec Survey',
  },
  {
    text: 'The average financial loss to an individual from a successful social engineering attack is over $3,000.',
    category: 'identity-theft',
    severity: 'critical',
    source: 'Fraud Action Network',
  },
  {
    text: 'Fake banking apps on third-party stores steal credentials from 1 in 15 users who download them.',
    category: 'phishing',
    severity: 'high',
    source: 'Mobile Threat Intelligence',
  },
  {
    text: '45% of employees admit to reusing their corporate passwords for personal online accounts.',
    category: 'identity-theft',
    severity: 'medium',
    source: 'Enterprise Security Pulse',
  },
  {
    text: 'Spear-phishing emails targeting specific individuals have a 70% higher open rate than mass spam.',
    category: 'phishing',
    severity: 'critical',
    source: 'Threat Matrix 2025',
  },
  {
    text: '95% of cybersecurity breaches are caused by human error, according to industry research.',
    category: 'fraud',
    severity: 'high',
    source: 'IBM Security Report',
  },
  {
    text: 'The average time to identify a data breach in 2024 was over 200 days.',
    category: 'identity-theft',
    severity: 'medium',
    source: 'Global Data Pulse',
  },
  {
    text: 'Small businesses are the target of 43% of all cyberattacks globally.',
    category: 'fraud',
    severity: 'high',
    source: 'SME Security Alliance',
  },
  {
    text: 'Cryptojacking attacks, using your device to mine crypto, increased by 65% in 2024.',
    category: 'fraud',
    severity: 'medium',
    source: 'Malware Insight',
  },
  {
    text: 'QR code phishing (Quishing) became a major threat in CIS, leading to 15% of mobile fraud.',
    category: 'phishing',
    severity: 'high',
    source: 'Cyber Intel KZ',
  },
  {
    text: 'The global cost of cybercrime is expected to reach $10.5 trillion annually by 2025.',
    category: 'fraud',
    severity: 'critical',
    source: 'Cybersecurity Ventures',
  },
  {
    text: '70% of social engineering attacks in emerging economies are delivered via SMS (Smishing).',
    category: 'phishing',
    severity: 'high',
    source: 'Mobile Security Forum',
  },
  {
    text: 'Using multi-factor authentication (MFA) blocks 99.9% of automated account takeover attacks.',
    category: 'identity-theft',
    severity: 'critical',
    source: 'Microsoft Security',
  },
  {
    text: 'IoT devices are attacked on average once every 5 minutes in unsecured environments.',
    category: 'fraud',
    severity: 'medium',
    source: 'IoT Watchdog',
  },
  {
    text: 'Password "123456" is still used by millions, accounting for 10% of brute-force successes.',
    category: 'identity-theft',
    severity: 'high',
    source: 'Password Habits Study',
  },
  {
    text: 'Shadow IT—using unsanctioned software at work—is responsible for 30% of data leaks.',
    category: 'identity-theft',
    severity: 'medium',
    source: 'Enterprise Security Pulse',
  },
  {
    text: 'Supply chain attacks grew by 40% in 2024, targeting vendors to reach their customers.',
    category: 'fraud',
    severity: 'critical',
    source: 'Supply Chain Guard',
  },
  {
    text: 'Kazakhstan implemented a new AI-based monitoring system in 2025 to track illicit crypto-fraud.',
    category: 'fraud',
    severity: 'medium',
    source: 'National AI Center KZ',
  },
  {
    text: 'Cyber insurance claims for social engineering rose by 120% in the last 18 months.',
    category: 'fraud',
    severity: 'high',
    source: 'InsureTech Report',
  }
];

const CyberFact = () => {
  const { t, i18n } = useTranslation();
  const [facts, setFacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const initFacts = async () => {
      setLoading(true);
      try {
        // Try to fetch 3 fresh facts from AI simultaneously
        const aiPromises = Array(3).fill(0).map(() => api.get(`/ai/fact?lang=${i18n.language}`));
        const responses = await Promise.allSettled(aiPromises);
        
        const aiFacts = responses
          .filter(r => r.status === 'fulfilled' && r.value.data && r.value.data.text && !r.value.data.message)
          .map(r => ({ ...r.value.data, source: 'AI Cyber Intel' }));
          
        if (isMounted) {
          // Combine AI facts with local fallback facts to make a massive list
          const combined = [...aiFacts, ...fallbackFacts];
          // Duplicate the list so the infinite scroll is seamless
          setFacts([...combined, ...combined, ...combined, ...combined]);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          // Just use fallback facts if AI fails completely
          const combined = [...fallbackFacts, ...fallbackFacts, ...fallbackFacts, ...fallbackFacts];
          setFacts(combined);
          setLoading(false);
        }
      }
    };
    
    initFacts();
    
    return () => {
      isMounted = false;
    };
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'phishing': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'fraud': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'identity-theft': return <Fingerprint className="w-5 h-5 text-purple-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <Badge variant="critical">Critical</Badge>;
      case 'high': return <Badge variant="warning">High</Badge>;
      case 'medium': return <Badge variant="info">Medium</Badge>;
      default: return <Badge variant="low">Low</Badge>;
    }
  };

  return (
    <div className="w-full h-[600px] overflow-hidden relative bg-[#fafafa] rounded-[3rem] border border-gray-100 shadow-inner">
      {/* Gradients for fading edges */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#fafafa] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#fafafa] to-transparent z-10 pointer-events-none" />
      
      <div className="flex gap-6 justify-center h-full pt-10 px-4 [&:hover>div>div]:[animation-play-state:paused]">
        
        {/* Helper function to render a column */}
        {[0, 1, 2, 3].map((colIndex) => {
          // Shuffle or offset the facts per column so they don't look identical
          const columnFacts = [...facts].sort(() => 0.5 - Math.random());
          const isScrollDown = colIndex % 2 !== 0;

          return (
            <div key={colIndex} className="w-[300px] h-full overflow-hidden hidden md:block first:block">
              <motion.div 
                animate={{ y: isScrollDown ? ['-50%', '0%'] : ['0%', '-50%'] }} 
                transition={{ duration: 80 + (colIndex * 15), repeat: Infinity, ease: 'linear' }}
                className="flex flex-col gap-6"
              >
                {columnFacts.map((fact, idx) => (
                  <Card 
                    key={`${idx}-${fact.text.substring(0,5)}`} 
                    className="w-full bg-white hover:shadow-xl transition-shadow border border-gray-100 flex flex-col justify-between group cursor-pointer"
                    padding="p-6"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                          {getIcon(fact.category)}
                        </div>
                        {getSeverityBadge(fact.severity)}
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed mb-4 text-[14px]">
                        "{fact.text}"
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {fact.source}
                      </p>
                    </div>
                  </Card>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CyberFact;
