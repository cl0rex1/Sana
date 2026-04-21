import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Shield, Bug } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-accent-cyan" />
            Cyber Threat <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Interactive cybersecurity statistics for Kazakhstan (2024–2026)
          </p>
        </div>
        <div className="text-xs font-mono text-gray-600 bg-primary-800/50 px-3 py-2 rounded-lg border border-primary-600/20">
          {filteredStats.length} months selected
        </div>
      </div>

      {/* Date Filter */}
      <DateFilter
        fromIndex={fromIndex}
        toIndex={toIndex}
        maxIndex={mockStats.length - 1}
        onChange={handleRangeChange}
        labels={dateLabels}
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🔥"
          label="Total Incidents"
          value={summary.totalIncidents}
          color="danger"
          trend={summary.growthRate}
          trendLabel="vs previous period"
          delay={0}
        />
        <StatCard
          icon="📊"
          label="Avg per Month"
          value={summary.avgPerMonth}
          color="cyan"
          delay={100}
        />
        <StatCard
          icon="🎯"
          label="Top Threat"
          value={summary.topThreat}
          color="purple"
          delay={200}
        />
        <StatCard
          icon="📈"
          label="Growth Rate"
          value={`${summary.growthRate > 0 ? '+' : ''}${summary.growthRate}`}
          suffix="%"
          color={summary.growthRate > 0 ? 'warning' : 'success'}
          delay={300}
        />
      </div>

      {/* Charts */}
      <StatsChart data={filteredStats} breakdown={summary.breakdown} />
    </div>
  );
};

export default Dashboard;
