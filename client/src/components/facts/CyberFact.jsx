import React, { useState, useCallback } from 'react';
import { Zap, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * Cyber-Fact Generator component.
 * Fetches random cybersecurity facts from the backend API.
 * Falls back to a local set of facts if the API is unavailable.
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
];

const CyberFact = () => {
  const [fact, setFact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [usedFallbackIndices, setUsedFallbackIndices] = useState([]);

  /** Fetch a random fact from the API, fallback to local data */
  const fetchFact = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await api.get('/facts/random');
      setFact(response.data);
    } catch {
      // Fallback: pick a random local fact (avoid repeats until all used)
      let availableIndices = fallbackFacts
        .map((_, i) => i)
        .filter((i) => !usedFallbackIndices.includes(i));

      if (availableIndices.length === 0) {
        availableIndices = fallbackFacts.map((_, i) => i);
        setUsedFallbackIndices([]);
      }

      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setFact(fallbackFacts[randomIndex]);
      setUsedFallbackIndices((prev) => [...prev, randomIndex]);
    } finally {
      setLoading(false);
    }
  }, [usedFallbackIndices]);

  /** Copy fact text to clipboard */
  const copyToClipboard = useCallback(async () => {
    if (!fact) return;
    try {
      await navigator.clipboard.writeText(fact.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fact.text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [fact]);

  /** Map severity to badge variant */
  const getSeverityVariant = (severity) => {
    const map = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };
    return map[severity] || 'medium';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-yellow-100 border border-yellow-200 flex items-center justify-center">
          <Zap className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-2">
          Cyber-Fact Generator
        </h2>
        <p className="text-sm text-gray-500">
          Discover shocking facts about internet fraud and cybersecurity in Kazakhstan
        </p>
      </div>

      {/* Fact Display Card */}
      <Card
        className={`mb-6 min-h-[200px] flex flex-col justify-center transition-all duration-500 ${
          fact ? 'border-accent-cyan/20' : 'border-primary-600/20'
        }`}
        glow={!!fact}
      >
        {!fact && !loading && (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Click the button below to generate a cyber fact</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="w-10 h-10 mx-auto mb-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading fact...</p>
          </div>
        )}

        {fact && !loading && (
          <div className="animate-fade-in">
            {/* Category and severity badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="info">{fact.category}</Badge>
              <Badge variant={getSeverityVariant(fact.severity)}>
                {fact.severity}
              </Badge>
            </div>

            {/* Fact text */}
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-4 font-medium">
              "{fact.text}"
            </p>

            {/* Source */}
            <p className="text-xs text-gray-500">
              Source: <span className="text-gray-800 font-semibold">{fact.source}</span>
            </p>
          </div>
        )}
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={fetchFact}
          loading={loading}
          icon={RefreshCw}
          className="flex-1"
        >
          {fact ? 'Generate New Fact' : 'Generate Fact'}
        </Button>

        {fact && (
          <Button
            variant="secondary"
            size="lg"
            onClick={copyToClipboard}
            icon={copied ? Check : Copy}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-3 text-center">{error}</p>
      )}
    </div>
  );
};

export default CyberFact;
