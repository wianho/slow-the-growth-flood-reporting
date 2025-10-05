import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUSGSGauges } from '../../services/api';

export function WeatherWidget() {
  const { data: gauges, isLoading } = useQuery({
    queryKey: ['usgsGauges'],
    queryFn: getUSGSGauges,
    refetchInterval: 900000, // Refetch every 15 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Stream Gauges</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">USGS Stream Gauges</h2>
      {!gauges || gauges.length === 0 ? (
        <p className="text-gray-600">No gauge data available</p>
      ) : (
        <div className="space-y-3">
          {gauges.map((gauge) => (
            <div key={gauge.siteCode} className="border-b border-gray-200 pb-3 last:border-0">
              <h3 className="font-semibold text-sm">{gauge.siteName}</h3>
              <p className="text-sm text-gray-600">
                Water Level: <strong>{gauge.waterLevel.toFixed(2)} ft</strong>
              </p>
              {gauge.floodStage && (
                <p className="text-xs text-gray-500">
                  Flood Stage: {gauge.floodStage} ft
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
