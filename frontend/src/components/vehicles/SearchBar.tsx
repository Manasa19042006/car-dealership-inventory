import React, { useState } from 'react';
import type { VehicleSearchParams } from '../../types/vehicle.types';

interface SearchBarProps {
  onSearch: (params: VehicleSearchParams) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [open, setOpen] = useState(false);

  const hasFilters = make || model || category || minPrice || maxPrice;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const params: VehicleSearchParams = {};
    if (make.trim()) params.make = make.trim();
    if (model.trim()) params.model = model.trim();
    if (category.trim()) params.category = category.trim();
    if (minPrice.trim()) params.minPrice = minPrice.trim();
    if (maxPrice.trim()) params.maxPrice = maxPrice.trim();
    onSearch(params);
  };

  const handleClear = (): void => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit}>
        {/* ── Main row ── */}
        <div className="flex items-center gap-0 p-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by make, e.g. Toyota…"
              value={make}
              onChange={e => setMake(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:opacity-50"
            />
            {make && (
              <button type="button" onClick={() => setMake('')} className="text-gray-400 hover:text-gray-600">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(p => !p)}
            className={`ml-2 flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-colors ${open ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 5a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 5a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
            {(model || category || minPrice || maxPrice) && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {[model, category, minPrice, maxPrice].filter(Boolean).length}
              </span>
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors flex items-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            <span className="hidden sm:inline">Search</span>
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="ml-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
              title="Clear all filters"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Advanced filters panel ── */}
        {open && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Advanced Filters</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Model</label>
                <input
                  type="text"
                  placeholder="e.g. Camry"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Category</label>
                <input
                  type="text"
                  placeholder="e.g. SUV"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Min Price ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 20000"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Max Price ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
export default SearchBar;
