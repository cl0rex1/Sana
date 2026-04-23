import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Card from '../ui/Card';

import { TrendingUp, BarChart2, PieChart as PieChartIcon } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 rounded-xl border border-gray-200 min-w-[180px] shadow-lg">
      <p className="text-xs font-semibold text-[#1a1a1a] mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">{entry.name}</span>
          </div>
          <span className="text-xs font-mono font-semibold text-[#1a1a1a]">
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Pie chart colors */
const PIE_COLORS = ['#00f0ff', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981'];

/**
 * Statistics charts component.
 * Renders an AreaChart for trends, BarChart for category breakdown,
 * and PieChart for incident distribution.
 */
const StatsChart = ({ data, breakdown }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Card className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('dashboard.noChartData', 'No data available for the selected range')}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Area Chart — Incident Trends */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-blue" />
          {t('dashboard.trends')}
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
            />
            <Area
              type="monotone"
              dataKey="phishingAttempts"
              name="Phishing"
              stroke="#00f0ff"
              fill="url(#gradCyan)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#00f0ff' }}
            />
            <Area
              type="monotone"
              dataKey="fraudCases"
              name="Fraud"
              stroke="#8b5cf6"
              fill="url(#gradPurple)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#8b5cf6' }}
            />
            <Area
              type="monotone"
              dataKey="bullyingCases"
              name="Cyberbullying"
              stroke="#ef4444"
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Monthly Breakdown */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-accent-purple" />
            {t('dashboard.breakdown')}
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.slice(-12)} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="fraudCases" name="Fraud" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="phishingAttempts" name="Phishing" fill="#00f0ff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="malwareDetected" name="Malware" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart — Incident Distribution */}
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-accent-cyan" />
            {t('dashboard.distribution')}
          </h3>
          {breakdown && breakdown.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    paddingAngle={3}
                  >
                    {breakdown.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {breakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">{t('dashboard.noBreakdownData', 'No breakdown data')}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StatsChart;
