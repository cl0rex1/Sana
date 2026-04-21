/**
 * Mock statistics data for 2024-2026.
 * Simulates monthly cybersecurity incident data for Kazakhstan.
 * Used as fallback when the backend is unavailable.
 */

const generateMockStats = () => {
  const data = [];
  const startYear = 2024;
  const endYear = 2026;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      // Create realistic growing trend with seasonal variation
      const yearFactor = 1 + (year - startYear) * 0.35;
      const seasonalWave = 1 + Math.sin(((month - 2) / 12) * Math.PI * 2) * 0.2;
      const randomNoise = 0.85 + Math.random() * 0.3;

      const fraud = Math.round(180 * yearFactor * seasonalWave * randomNoise);
      const bullying = Math.round(95 * yearFactor * seasonalWave * randomNoise);
      const phishing = Math.round(240 * yearFactor * seasonalWave * randomNoise);
      const malware = Math.round(65 * yearFactor * seasonalWave * randomNoise);
      const breaches = Math.round(18 * yearFactor * seasonalWave * randomNoise);

      data.push({
        date: `${months[month]} ${year}`,
        month: months[month],
        year,
        monthIndex: month,
        fullDate: new Date(year, month, 1).toISOString(),
        totalIncidents: fraud + bullying + phishing + malware + breaches,
        fraudCases: fraud,
        bullyingCases: bullying,
        phishingAttempts: phishing,
        malwareDetected: malware,
        dataBreaches: breaches,
      });
    }
  }

  return data;
};

export const mockStats = generateMockStats();

/**
 * Get stats filtered by date range (year and month indices).
 */
export const getFilteredStats = (stats, fromIndex, toIndex) => {
  return stats.slice(fromIndex, toIndex + 1);
};

/**
 * Calculate summary from a set of stat records.
 */
export const calculateSummary = (stats) => {
  if (!stats.length) {
    return { totalIncidents: 0, avgPerMonth: 0, topThreat: 'N/A', growthRate: 0 };
  }

  const totals = stats.reduce(
    (acc, s) => ({
      totalIncidents: acc.totalIncidents + s.totalIncidents,
      fraud: acc.fraud + s.fraudCases,
      bullying: acc.bullying + s.bullyingCases,
      phishing: acc.phishing + s.phishingAttempts,
      malware: acc.malware + s.malwareDetected,
      breaches: acc.breaches + s.dataBreaches,
    }),
    { totalIncidents: 0, fraud: 0, bullying: 0, phishing: 0, malware: 0, breaches: 0 }
  );

  // Determine top threat category
  const categories = [
    { name: 'Phishing', value: totals.phishing },
    { name: 'Fraud', value: totals.fraud },
    { name: 'Cyberbullying', value: totals.bullying },
    { name: 'Malware', value: totals.malware },
    { name: 'Data Breaches', value: totals.breaches },
  ];
  const topThreat = categories.sort((a, b) => b.value - a.value)[0].name;

  // Growth rate (first vs last period)
  const firstHalf = stats.slice(0, Math.floor(stats.length / 2));
  const secondHalf = stats.slice(Math.floor(stats.length / 2));
  const firstAvg = firstHalf.reduce((s, d) => s + d.totalIncidents, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((s, d) => s + d.totalIncidents, 0) / (secondHalf.length || 1);
  const growthRate = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

  return {
    totalIncidents: totals.totalIncidents,
    avgPerMonth: Math.round(totals.totalIncidents / stats.length),
    topThreat,
    growthRate,
    breakdown: categories.sort((a, b) => b.value - a.value),
  };
};

export default mockStats;
