import React from 'react';

/**
 * Root application component.
 * Currently renders the homepage placeholder.
 * Authentication, routing, and feature pages will be added in later steps.
 */
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <span className="text-3xl">🚗</span>
          <h1 className="text-white text-xl font-bold tracking-wide">
            Car Dealership Inventory
          </h1>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-6 text-7xl">🏎️</div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Car Dealership
            <br />
            <span className="text-blue-300">Inventory System</span>
          </h2>
          <p className="text-blue-200 text-lg sm:text-xl mb-8">
            Browse, search, and manage your vehicle inventory with ease.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/40 text-green-300 text-sm font-medium px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            System Initialised — More features coming soon
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center text-blue-300/60 text-sm py-4">
        © {new Date().getFullYear()} Car Dealership Inventory System
      </footer>
    </div>
  );
};

export default App;
