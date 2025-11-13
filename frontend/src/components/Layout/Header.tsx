import React from 'react';

export function Header() {
  return (
    <header className="bg-primary-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col space-y-3">
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
          <nav className="w-full">
            <a
              href="https://wianho.github.io/volusia-flood-advocacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-white hover:text-yellow-300 transition-all px-4 py-2 sm:px-6 sm:py-3 rounded-lg bg-primary-600 hover:bg-primary-500 shadow-lg hover:shadow-xl text-sm sm:text-base md:text-lg font-bold italic underline text-center leading-tight"
            >
              WANT TO EMAIL YOUR REPRESENTATIVES? CLICK TO EMAIL HERE.
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
