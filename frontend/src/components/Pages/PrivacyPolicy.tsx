import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../Layout/Header';
import { Footer } from '../Layout/Footer';

export function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

          <p className="text-sm text-gray-600 mb-6">
            Last Updated: October 13, 2025
          </p>

          <div className="prose prose-sm sm:prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Overview</h2>
              <p className="text-gray-700">
                Slow the Growth Flood Reporting ("we", "our", or "the Service") is a community-driven
                platform that helps citizens report and track flooding in Volusia and Palm Beach Counties, Florida.
                We are committed to protecting your privacy while providing this public service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Information We Collect</h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-2">Location Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>GPS Coordinates:</strong> When you submit a flood report, we collect your precise
                  latitude and longitude to map flooding locations accurately
                </li>
                <li>
                  <strong>County Verification:</strong> We verify your location is within our service areas
                  (Volusia or Palm Beach County) before allowing report submission
                </li>
                <li>
                  <strong>Purpose:</strong> Location data is used solely for mapping flood reports and
                  preventing abuse from outside our service areas
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Device Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Device Fingerprint:</strong> We generate a unique identifier based on your device
                  characteristics (browser, screen size, timezone, etc.)
                </li>
                <li>
                  <strong>Purpose:</strong> Device fingerprints prevent spam and enforce rate limits
                  (maximum 3 reports per hour per device)
                </li>
                <li>
                  <strong>No Personal Information:</strong> Device fingerprints do not contain personally
                  identifiable information
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4">Report Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Road name or location description (optional)</li>
                <li>Flood severity level</li>
                <li>Timestamp of report submission</li>
                <li>Confidence score (based on nearby reports)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Flood Mapping:</strong> Display flooding locations on public maps for community awareness</li>
                <li><strong>Advocacy:</strong> Aggregate data to demonstrate flooding patterns and advocate for better infrastructure</li>
                <li><strong>Spam Prevention:</strong> Enforce rate limits and prevent abuse</li>
                <li><strong>Data Analysis:</strong> Analyze flooding trends to support policy changes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Sharing and Public Access</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Public Maps:</strong> All flood reports are displayed publicly on our map,
                  showing location, severity, and timestamp
                </li>
                <li>
                  <strong>No Personal Information:</strong> We do not display or share any personally
                  identifiable information
                </li>
                <li>
                  <strong>Third-Party Services:</strong> We integrate data from NOAA (weather alerts) and
                  USGS (river gauges) for context
                </li>
                <li>
                  <strong>GIS Data:</strong> We display Volusia County GIS data (Future Land Use designations)
                  to show development pressure in flood-prone areas
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Active Reports:</strong> Flood reports expire and are archived every Wednesday at 5 AM EST
                </li>
                <li>
                  <strong>Archived Reports:</strong> Historical data is retained for up to 52 weeks for
                  trend analysis and advocacy
                </li>
                <li>
                  <strong>Device Fingerprints:</strong> Stored temporarily for rate limiting (cleared periodically)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Delete Your Reports:</strong> You can delete any report you submitted from the report list
                </li>
                <li>
                  <strong>Opt Out of Location Services:</strong> You can deny location permissions in your browser,
                  but you won't be able to submit reports
                </li>
                <li>
                  <strong>Data Access:</strong> All your submitted reports are visible in the public map and report list
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Cookies and Local Storage</h2>
              <p className="text-gray-700">
                We use browser local storage to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Store your authentication token (for API access)</li>
                <li>Cache device fingerprint (to avoid recalculating)</li>
                <li>Remember your preferences</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We do not use tracking cookies or third-party analytics.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Security</h2>
              <p className="text-gray-700">
                We implement reasonable security measures including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>HTTPS encryption for all data transmission</li>
                <li>Rate limiting to prevent abuse</li>
                <li>Input validation and sanitization</li>
                <li>Geographic restrictions (reports only accepted from service areas)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Children's Privacy</h2>
              <p className="text-gray-700">
                This service is not intended for children under 13. We do not knowingly collect
                information from children under 13. If you are a parent or guardian and believe
                your child has provided us with information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Open Source</h2>
              <p className="text-gray-700">
                This project is open source. You can review our code, privacy practices, and
                data handling at:{' '}
                <a
                  href="https://github.com/wianho/slow-the-growth-flood-reporting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  GitHub Repository
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. Changes will be posted on this
                page with an updated "Last Updated" date. Continued use of the service after changes
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Contact</h2>
              <p className="text-gray-700">
                For questions about this privacy policy or our data practices, please open an issue
                on our{' '}
                <a
                  href="https://github.com/wianho/slow-the-growth-flood-reporting/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  GitHub Issues page
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
