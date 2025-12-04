'use client';

import { useState, useEffect } from 'react';
import { CPUFilterProps, CPUFilters } from '@/types';
import { Search, Filter, X } from 'lucide-react';

export function CPUFilter({ 
  manufacturers, 
  sockets, 
  cores, 
  priceRange, 
  condition, 
  onFilterChange 
}: CPUFilterProps) {
  const [filters, setFilters] = useState<CPUFilters>({
    manufacturers: [],
    sockets: [],
    cores: [],
    priceRange: [0, 10000],
    condition: [],
    search: '',
    sortBy: 'newest'
  });

  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (newFilters: Partial<CPUFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: CPUFilters = {
      manufacturers: [],
      sockets: [],
      cores: [],
      priceRange: [0, 10000],
      condition: [],
      search: '',
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const toggleArrayFilter = (array: string[], value: string) => {
    return array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const toggleNumberArrayFilter = (array: number[], value: number) => {
    return array.includes(value) 
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search CPUs..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange({ sortBy: e.target.value as CPUFilters['sortBy'] })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popularity">Most Popular</option>
        </select>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Manufacturers */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Manufacturers</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {manufacturers.map((manufacturer) => (
                  <label key={manufacturer} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.manufacturers.includes(manufacturer)}
                      onChange={() => handleFilterChange({
                        manufacturers: toggleArrayFilter(filters.manufacturers, manufacturer)
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{manufacturer}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sockets */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Sockets</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sockets.map((socket) => (
                  <label key={socket} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.sockets.includes(socket)}
                      onChange={() => handleFilterChange({
                        sockets: toggleArrayFilter(filters.sockets, socket)
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{socket}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cores */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Cores</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cores.map((core) => (
                  <label key={core} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.cores.includes(core)}
                      onChange={() => handleFilterChange({
                        cores: toggleNumberArrayFilter(filters.cores, core)
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{core} cores</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Condition</h3>
              <div className="space-y-2">
                {condition.map((cond) => (
                  <label key={cond} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.condition.includes(cond)}
                      onChange={() => handleFilterChange({
                        condition: toggleArrayFilter(filters.condition, cond)
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{cond.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Price Range</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange({
                    priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange({
                    priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000]
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear All Filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


