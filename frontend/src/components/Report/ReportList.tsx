import React from 'react';
import { useFloodReports } from '../../hooks/useFloodReports';
import { SEVERITY_LABELS } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

export function ReportList() {
  const { data, isLoading, error } = useFloodReports();

  if (isLoading) {
    return <div className="text-center py-4">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded">
        Error loading reports
      </div>
    );
  }

  if (!data || data.features.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No active flood reports
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold mb-4">Recent Reports</h3>
      {data.features.slice(0, 10).map((feature) => (
        <div
          key={feature.properties.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold">
                {SEVERITY_LABELS[feature.properties.severity as keyof typeof SEVERITY_LABELS]}
              </h4>
              {feature.properties.road_name && (
                <p className="text-sm text-gray-600">
                  {feature.properties.road_name}
                </p>
              )}
            </div>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
              {feature.properties.confidence_score} {feature.properties.confidence_score === 1 ? 'report' : 'reports'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatDistanceToNow(new Date(feature.properties.created_at), {
              addSuffix: true,
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
