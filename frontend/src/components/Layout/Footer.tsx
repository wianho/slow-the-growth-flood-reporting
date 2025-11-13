import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <a
              href="https://wianho.github.io/volusia-flood-advocacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-yellow-300 transition-all px-3 py-2 sm:px-6 sm:py-3 rounded-lg bg-primary-600 hover:bg-primary-500 shadow-lg hover:shadow-xl text-xs sm:text-sm md:text-base lg:text-lg font-bold italic underline text-center leading-tight"
            >
              WANT TO EMAIL YOUR REPRESENTATIVES? CLICK TO EMAIL HERE.
            </a>
          </div>
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
