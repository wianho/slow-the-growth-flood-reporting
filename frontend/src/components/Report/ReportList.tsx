import React, { useState } from 'react';
import { useFloodReports } from '../../hooks/useFloodReports';
import { SEVERITY_LABELS } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReport } from '../../services/api';

export function ReportList() {
  const { data, isLoading, error } = useFloodReports();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floodReports'] });
      setDeletingId(null);
    },
    onError: () => {
      alert('Failed to delete report');
      setDeletingId(null);
    },
  });

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

  const handleDelete = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setDeletingId(reportId);
      deleteMutation.mutate(parseInt(reportId, 10));
    }
  };

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
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                {feature.properties.confidence_score} {feature.properties.confidence_score === 1 ? 'report' : 'reports'}
              </span>
              {feature.properties.is_own_report && (
                <button
                  onClick={() => handleDelete(feature.properties.id)}
                  disabled={deletingId === feature.properties.id}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === feature.properties.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
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
