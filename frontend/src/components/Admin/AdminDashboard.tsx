import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

interface AdminReport {
  id: string;
  latitude: number;
  longitude: number;
  road_name?: string;
  severity: string;
  device_fingerprint: string;
  created_at: string;
  expires_at: string;
  confidence_score: number;
}

interface AdminStats {
  total: number;
  today: number;
  thisWeek: number;
  bySeverity: {
    minor?: number;
    moderate?: number;
    severe?: number;
  };
}

export function AdminDashboard() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const adminToken = localStorage.getItem('admin_token');
  const adminUsername = localStorage.getItem('admin_username');

  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/reports`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      setReports(reportsRes.data.reports);
      setStats(statsRes.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    setDeletingId(reportId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      await fetchData();
    } catch (error) {
      alert('Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to DELETE ALL reports? This cannot be undone!')) return;
    if (!confirm('Are you REALLY sure? This will delete ALL flood reports permanently!')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/reports`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      await fetchData();
      alert('All reports deleted successfully');
    } catch (error) {
      alert('Failed to clear reports');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Logged in as: {adminUsername}</p>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/app-view"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
              >
                🛡️ View App as Volusia User
              </a>
              <a
                href="/"
                className="px-4 py-2 text-blue-600 hover:text-blue-800 inline-block"
              >
                View Map
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">Total Reports</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">Today</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">This Week</h3>
              <p className="text-3xl font-bold text-green-600">{stats.thisWeek}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-medium">By Severity</h3>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Minor:</span>
                  <span className="font-semibold">{stats.bySeverity.minor || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moderate:</span>
                  <span className="font-semibold">{stats.bySeverity.moderate || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Severe:</span>
                  <span className="font-semibold">{stats.bySeverity.severe || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All Reports
          </button>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Reports ({reports.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                        {report.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        {report.road_name && (
                          <div className="text-xs text-gray-500">{report.road_name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            report.severity === 'severe'
                              ? 'bg-red-100 text-red-800'
                              : report.severity === 'moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {report.confidence_score}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {report.device_fingerprint.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={deletingId === report.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === report.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
