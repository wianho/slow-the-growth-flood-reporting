import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getNOAAAlerts } from '../../services/api';

export function AlertBanner() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['noaaAlerts'],
    queryFn: getNOAAAlerts,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading || !alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className="bg-red-100 border-l-4 border-red-500 text-red-900 p-4 rounded"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold">{alert.event}</h3>
              <p className="text-sm mt-1">{alert.headline}</p>
              <p className="text-xs mt-2 text-red-700">{alert.areaDesc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
