import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { FloodMap } from './components/Map/FloodMap';
import { ReportForm } from './components/Report/ReportForm';
import { ReportList } from './components/Report/ReportList';
import { AlertBanner } from './components/Dashboard/AlertBanner';
import { StatsPanel } from './components/Dashboard/StatsPanel';
import { WeatherWidget } from './components/Dashboard/WeatherWidget';
import { useAppStore } from './store/appStore';
import { useGeolocation } from './hooks/useGeolocation';
import { getDeviceFingerprint } from './services/deviceFingerprint';
import { verifyLocation } from './services/api';
import { isInVolusiaBounds } from './utils/validation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { location, loading, error } = useGeolocation();
  const {
    setUserLocation,
    setIsInVolusia,
    setDeviceFingerprint,
    setToken,
  } = useAppStore();

  useEffect(() => {
    async function initialize() {
      // Get device fingerprint
      const fingerprint = await getDeviceFingerprint();
      setDeviceFingerprint(fingerprint);

      // If we have location, verify it
      if (location) {
        setUserLocation(location);
        const inVolusia = isInVolusiaBounds(location.lat, location.lng);
        setIsInVolusia(inVolusia);

        try {
          const result = await verifyLocation(location.lat, location.lng, fingerprint);
          if (result.token) {
            setToken(result.token);
          }
        } catch (err) {
          console.error('Location verification failed', err);
        }
      }
    }

    initialize();
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
            {loading ? (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                Getting your location...
              </div>
            ) : error ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-6 rounded-lg">
                <p className="font-bold">Location Required</p>
                <p className="text-sm mt-2">{error}</p>
                <p className="text-sm mt-2">
                  Please enable location services to submit flood reports.
                </p>
              </div>
            ) : (
              <ReportForm />
            )}
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
