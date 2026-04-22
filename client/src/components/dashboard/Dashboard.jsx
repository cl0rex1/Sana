import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Target, Flame, Activity } from 'lucide-react';
import { mockStats, getFilteredStats, calculateSummary } from '../../data/mockStats';
import StatCard from './StatCard';
import StatsChart from './StatsChart';
import DateFilter from './DateFilter';

/**
 * Interactive Statistics Dashboard.
 * Displays cybersecurity incident data (2024-2026) with charts and filters.
 * Uses mock data as fallback; designed to work with backend API.
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(mockStats.length - 1);

  // Labels for the date filter
  const dateLabels = useMemo(() => mockStats.map((s) => s.date), []);

  // Filtered data based on slider range
  const filteredStats = useMemo(
    () => getFilteredStats(mockStats, fromIndex, toIndex),
    [fromIndex, toIndex]
  );

  // Summary statistics
  const summary = useMemo(() => calculateSummary(filteredStats), [filteredStats]);

  const handleRangeChange = (from, to) => {
    setFromIndex(from);
    setToIndex(to);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-[3rem] border border-gray-200 p-8 md:p-12 mb-8 shadow-sm">
        {/* Decorative background graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="w-16 h-16 mb-6 rounded-2xl bg-[#1a1a1a] shadow-[0_10px_30px_rgba(26,26,26,0.15)] flex items-center justify-center border border-gray-800">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight mb-2">
              {t('dashboard.title')}
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              {t('dashboard.subtitle')}
            </p>
            <div className="flex items-center gap-2 text-emerald-600 font-mono font-medium text-sm bg-emerald-50 w-fit px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Live Threat Telemetry Active
            </div>
          </div>
          <div className="text-sm font-mono font-medium text-blue-700 bg-blue-50 px-4 py-3 rounded-2xl border border-blue-100 flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4" />
            <span>{filteredStats.length} months of telemetry mapped</span>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative z-10">
        <DateFilter
          fromIndex={fromIndex}
          toIndex={toIndex}
          maxIndex={mockStats.length - 1}
          onChange={handleRangeChange}
          labels={dateLabels}
        />
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label={t('dashboard.totalIncidents')}
          value={summary.totalIncidents}
          color="danger"
          trend={summary.growthRate}
          trendLabel="vs previous period"
          delay={0}
        />
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          label={t('dashboard.avgPerMonth')}
          value={summary.avgPerMonth}
          color="cyan"
          delay={100}
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label={t('dashboard.topThreat')}
          value={summary.topThreat}
          color="purple"
          delay={200}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label={t('dashboard.growthRate')}
          value={`${summary.growthRate > 0 ? '+' : ''}${summary.growthRate}`}
          suffix="%"
          color={summary.growthRate > 0 ? 'warning' : 'success'}
          delay={300}
        />
      </div>

      {/* Charts */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-[3rem] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <StatsChart data={filteredStats} breakdown={summary.breakdown} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
