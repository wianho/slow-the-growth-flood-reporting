import React from 'react';

export function Header() {
  return (
    <header className="bg-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Slow the Growth Logo"
              className="w-12 h-12 object-contain rounded-lg"
            />
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
