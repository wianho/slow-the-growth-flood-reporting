import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReport } from '../../services/api';
import { useAppStore } from '../../store/appStore';
import { useRateLimit } from '../../hooks/useRateLimit';
import { validateReportSubmission } from '../../utils/validation';

export function ReportForm() {
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
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
      severity,
    });
  };

  if (!isInVolusia) {
    return (
      <div className="bg-blue-50 border border-blue-400 text-blue-800 px-4 py-3 rounded">
        <p className="font-bold mb-2">📍 Reporting Location Required</p>
        <p className="text-sm">
          Reports can only be submitted from participating counties:
        </p>
        <ul className="text-sm mt-2 ml-4 list-disc">
          <li><strong>Volusia County</strong></li>
          <li><strong>Palm Beach County</strong> (including Wellington)</li>
        </ul>
        <p className="text-sm mt-2">
          The map displays flood data statewide for public awareness. Want your county to participate? Contact us!
        </p>
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
