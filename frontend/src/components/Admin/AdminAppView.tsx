import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Layout/Header';
import { Footer } from '../Layout/Footer';
import { FloodMap } from '../Map/FloodMap';
import { ReportForm } from '../Report/ReportForm';
import { ReportList } from '../Report/ReportList';
import { AlertBanner } from '../Dashboard/AlertBanner';
import { StatsPanel } from '../Dashboard/StatsPanel';
import { WeatherWidget } from '../Dashboard/WeatherWidget';
import { useAppStore } from '../../store/appStore';
import { getDeviceFingerprint } from '../../services/deviceFingerprint';

// Volusia County (Daytona Beach area) coordinates
const MOCK_VOLUSIA_LOCATION = {
  lat: 29.2108,
  lng: -81.0228,
};

export function AdminAppView() {
  const navigate = useNavigate();
  const {
    setUserLocation,
    setIsInVolusia,
    setDeviceFingerprint,
  } = useAppStore();

  const adminToken = localStorage.getItem('admin_token');

  useEffect(() => {
    // Check if user is logged in as admin
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    // Initialize with mocked Volusia location
    const initializeAdminView = async () => {
      const fingerprint = await getDeviceFingerprint();
      setDeviceFingerprint(fingerprint);
      setUserLocation(MOCK_VOLUSIA_LOCATION);
      setIsInVolusia(true);
    };

    initializeAdminView();
  }, [adminToken, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Admin notice banner */}
      <div className="bg-purple-600 text-white py-2 px-4 text-center text-sm font-medium">
        🛡️ Admin View - Simulated Volusia County Location (29.2108°, -81.0228°)
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="ml-4 underline hover:no-underline"
        >
          Back to Admin Dashboard
        </button>
      </div>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Alerts Section */}
        <div className="mb-6">
          <AlertBanner />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <FloodMap />
          </div>

          {/* Right Column - Stats & Weather */}
          <div className="space-y-6">
            <StatsPanel />
            <WeatherWidget />
          </div>
        </div>

        {/* Report Form & List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ReportForm />
          </div>

          <div>
            <ReportList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
