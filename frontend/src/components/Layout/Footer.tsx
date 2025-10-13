import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-sm">
            Slow the Growth - Open Source Community Project
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Data resets every Wednesday at 5 AM EST
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Integrated with NOAA, USGS, and Volusia County GIS data
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <a
              href="https://github.com/wianho/slow-the-growth-flood-reporting"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            {' | '}
            <a
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
