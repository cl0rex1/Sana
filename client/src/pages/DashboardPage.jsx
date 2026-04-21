import React from 'react';
import Dashboard from '../components/dashboard/Dashboard';

/**
 * Dashboard page — hosts the interactive statistics dashboard.
 */
const DashboardPage = () => {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <Dashboard />
      </div>
    </div>
  );
};

export default DashboardPage;
