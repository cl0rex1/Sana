import React from 'react';
import LifeScenario from '../components/simulation/LifeScenario';

/**
 * Simulation page — hosts the Life Scenario gamified simulation.
 */
const SimulationPage = () => {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <LifeScenario />
      </div>
    </div>
  );
};

export default SimulationPage;
