import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReport } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { useRateLimit } from '../../hooks/useRateLimit';
import { validateReportSubmission } from '../../utils/validation';

export function ReportForm() {
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [roadName, setRoadName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { userLocation, isInVolusia } = useAppStore();
  const { rateLimitInfo, updateRateLimit } = useRateLimit();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['floodReports'] });
      if (data.rateLimit) {
        updateRateLimit(data.rateLimit.remaining, data.rateLimit.resetAt);
      }
      setRoadName('');
      setError(null);
      alert('Report submitted successfully!');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to submit report');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userLocation) {
      setError('Location not available. Please enable location services.');
      return;
    }

    const validation = validateReportSubmission(
      userLocation.lat,
      userLocation.lng,
      severity
    );

    if (!validation.valid) {
      setError(validation.error || 'Invalid submission');
      return;
    }

    if (rateLimitInfo.remaining <= 0) {
      setError('Rate limit exceeded. Please try again later.');
      return;
    }

    mutation.mutate({
      latitude: userLocation.lat,
      longitude: userLocation.lng,
      road_name: roadName || undefined,
      severity,
    });
  };

  if (!isInVolusia) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
        You must be in Volusia County to submit a flood report.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Report Flooding</h2>

      <div className="mb-4 text-sm text-gray-600">
        Reports remaining today: <strong>{rateLimitInfo.remaining}</strong>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Severity Level *
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="minor">Minor - Passable with caution</option>
            <option value="moderate">Moderate - Difficult to pass</option>
            <option value="severe">Severe - Road closed/impassable</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Street/Road Name (Optional)
          </label>
          <input
            type="text"
            value={roadName}
            onChange={(e) => setRoadName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Main Street"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || rateLimitInfo.remaining <= 0}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
