import React from 'react';

export function Header() {
  return (
    <header className="bg-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            <div>
              <h1 className="text-xl font-bold">Slow the Growth</h1>
              <p className="text-xs text-primary-200">Community Flood Reporting</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
