import React from 'react';
import { useFloodReports } from '../../hooks/useFloodReports';

export function StatsPanel() {
  const { data } = useFloodReports();

  const stats = {
    total: data?.features.length || 0,
    minor: data?.features.filter((f) => f.properties.severity === 'minor').length || 0,
    moderate: data?.features.filter((f) => f.properties.severity === 'moderate').length || 0,
    severe: data?.features.filter((f) => f.properties.severity === 'severe').length || 0,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Active Reports</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-100 rounded">
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center p-4 bg-yellow-100 rounded">
          <div className="text-3xl font-bold text-yellow-800">{stats.minor}</div>
          <div className="text-sm text-yellow-700">Minor</div>
        </div>
        <div className="text-center p-4 bg-orange-100 rounded">
          <div className="text-3xl font-bold text-orange-800">{stats.moderate}</div>
          <div className="text-sm text-orange-700">Moderate</div>
        </div>
        <div className="text-center p-4 bg-red-100 rounded">
          <div className="text-3xl font-bold text-red-800">{stats.severe}</div>
          <div className="text-sm text-red-700">Severe</div>
        </div>
      </div>
    </div>
  );
}
