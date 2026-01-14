'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCPUs, useCPUManufacturers, useCPUFiltered } from '@/hooks/useCPUs';
import { CPUFilters } from '@/types';
import { Plus, Grid, List, Heart, Eye, MapPin, Truck, Package, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/utils';
import { useRouter } from 'next/navigation';
import { useComparison } from '@/hooks/useComparison';

export default function CPUsPage() {
  const router = useRouter();
  const { comparisonList, addToComparison, removeFromComparison, clearComparison, isInComparison } = useComparison();
  const [filters, setFilters] = useState<CPUFilters>({
    manufacturers: [],
    sockets: [],
    cores: [],
    priceRange: [0, 10000],
    condition: [],
    search: '',
    sortBy: 'newest'
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { manufacturers } = useCPUManufacturers();
  const { cpuListings, loading, error } = useCPUFiltered(filters);
  const { user, signOut } = useAuth();

  // Extract unique values for filters
  const uniqueSockets = Array.from(new Set(
    cpuListings
      .map(cpu => cpu.cpu_model?.socket)
      .filter(Boolean)
  )) as string[];

  const uniqueCores = Array.from(new Set(
    cpuListings
      .map(cpu => cpu.cpu_model?.cores)
      .filter((cores): cores is number => typeof cores === 'number')
  )).sort((a, b) => a - b);

  const uniqueConditions = Array.from(new Set(
    cpuListings.map(cpu => cpu.condition)
  ));

  const manufacturerNames = manufacturers.map(m => m.name);

  const handleFilterChange = (newFilters: CPUFilters) => {
    setFilters(newFilters);
  };

  const addToComparisonHandler = (cpuId: string) => {
    const success = addToComparison(cpuId);
    if (!success && comparisonList.length >= 4) {
      alert('You can compare up to 4 CPUs at once. Please remove one from your comparison first.');
    }
  };

  const goToComparison = () => {
    if (comparisonList.length > 0) {
      router.push(`/cpus/compare?ids=${comparisonList.join(',')}`);
    }
  };

  const comparisonCPUs = cpuListings.filter(cpu => comparisonList.includes(cpu.id));

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-400 bg-green-400/20';
      case 'like-new': return 'text-blue-400 bg-blue-400/20';
      case 'excellent': return 'text-purple-400 bg-purple-400/20';
      case 'good': return 'text-yellow-400 bg-yellow-400/20';
      case 'fair': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const cpuFilters = [
    { id: 'all', label: 'All CPUs' },
    { id: 'Intel', label: 'Intel' },
    { id: 'AMD', label: 'AMD' },
    { id: 'Apple', label: 'Apple' },
    { id: 'Qualcomm', label: 'Qualcomm' }
  ];

  const sortOptions = [
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'popularity', label: 'Most Popular' }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🐺</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
                Stali
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Home
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm hidden lg:inline">
                    Welcome, {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                  </span>
                  <button 
                    onClick={() => signOut()}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                  <Link 
                    href="/cpus/sell"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Sell CPU
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/auth"
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-4 lg:px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-2">
              <Link href="/" className="text-gray-300 hover:text-white p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              {user ? (
                <Link 
                  href="/cpus/sell"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  Sell
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-4 sm:px-6 lg:px-12 py-8 sm:py-12 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              CPUs & Processors
            </h1>
            <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto px-2">
              High-performance processors from Intel, AMD, and more. Find the perfect CPU for your build.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="px-4 sm:px-6 lg:px-12 py-4 sm:py-8 border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {cpuFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    if (filter.id === 'all') {
                      setFilters({...filters, manufacturers: []});
                    } else {
                      const newManufacturers = filters.manufacturers.includes(filter.id) 
                        ? filters.manufacturers.filter(m => m !== filter.id)
                        : [...filters.manufacturers, filter.id];
                      setFilters({...filters, manufacturers: newManufacturers});
                    }
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter.id === 'all' && filters.manufacturers.length === 0
                      ? 'bg-[var(--brand)] text-white'
                      : filter.id !== 'all' && filters.manufacturers.includes(filter.id)
                      ? 'bg-[var(--brand)] text-white'
                      : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Sort and View Controls */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                  showFilters || Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== '' && v !== 'newest')
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)]'
                }`}
              >
                🔍 <span className="hidden sm:inline">Advanced </span>Filters
              </button>
              
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 sm:flex-none">
                <span className="text-gray-400 font-medium text-sm hidden sm:inline">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as CPUFilters['sortBy']})}
                  className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-2 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-[var(--brand)] transition-colors flex-1 sm:flex-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id} className="bg-[var(--card-bg)]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-[var(--card-bg)] rounded-lg shadow-sm border border-[var(--card-border)]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-[var(--brand)] text-white' : 'text-gray-300 hover:bg-[var(--card-border)]'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-[var(--brand)] text-white' : 'text-gray-300 hover:bg-[var(--card-border)]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Filters */}
      {showFilters && (
        <section className="px-4 sm:px-6 lg:px-12 py-4 sm:py-8 bg-[var(--card-bg)]/30 border-b border-[var(--card-border)]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Advanced Filters</h3>
              <p className="text-xs sm:text-sm text-gray-400">Refine your search with detailed filters</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-x-6 sm:gap-y-6">
              {/* Search */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  placeholder="Search CPUs..."
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              {/* Price Range */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">Price Range (€)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({...filters, priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]})}
                    placeholder="Min"
                    className="w-full min-w-0 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                  <span className="text-gray-400 flex-shrink-0">to</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value) || 10000]})}
                    placeholder="Max"
                    className="w-full min-w-0 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>

              {/* Sockets */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">Socket Type</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {uniqueSockets.map(socket => (
                    <button
                      key={socket}
                      onClick={() => {
                        const newSockets = filters.sockets.includes(socket)
                          ? filters.sockets.filter(s => s !== socket)
                          : [...filters.sockets, socket];
                        setFilters({...filters, sockets: newSockets});
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                        filters.sockets.includes(socket)
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)] border border-[var(--card-border)]'
                      }`}
                    >
                      {socket}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Cores</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {uniqueCores.map(core => (
                    <button
                      key={core}
                      onClick={() => {
                        const newCores = filters.cores.includes(core)
                          ? filters.cores.filter(c => c !== core)
                          : [...filters.cores, core];
                        setFilters({...filters, cores: newCores});
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                        filters.cores.includes(core)
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)] border border-[var(--card-border)]'
                      }`}
                    >
                      {core} cores
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {uniqueConditions.map(condition => (
                    <button
                      key={condition}
                      onClick={() => {
                        const newConditions = filters.condition.includes(condition)
                          ? filters.condition.filter(c => c !== condition)
                          : [...filters.condition, condition];
                        setFilters({...filters, condition: newConditions});
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                        filters.condition.includes(condition)
                          ? 'bg-[var(--brand)] text-white'
                          : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)] border border-[var(--card-border)]'
                      }`}
                    >
                      {condition.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  onClick={() => setFilters({
                    manufacturers: [],
                    sockets: [],
                    cores: [],
                    priceRange: [0, 10000],
                    condition: [],
                    search: '',
                    sortBy: 'newest'
                  })}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CPUs Grid */}
      <section className="px-4 sm:px-6 lg:px-12 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
                <p className="text-gray-400">Loading CPUs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          ) : cpuListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No CPUs Found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms to find more CPUs.
              </p>
              <button
                onClick={() => setFilters({
                  manufacturers: [],
                  sockets: [],
                  cores: [],
                  priceRange: [0, 10000],
                  condition: [],
                  search: '',
                  sortBy: 'newest'
                })}
                className="bg-[var(--brand)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brand-light)] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {cpuListings.map((cpu) => (
                <Link
                  key={cpu.id}
                  href={`/cpus/${cpu.id}`}
                  className={`relative bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden transition-all duration-300 cursor-pointer group block ${
                    hoveredId === cpu.id ? 'scale-105 shadow-2xl' : 'hover:scale-102'
                  }`}
                  onMouseEnter={() => setHoveredId(cpu.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20">
                    {cpu.image_urls && cpu.image_urls.length > 0 ? (
                      <>
                        <img 
                          src={cpu.image_urls[0]} 
                          alt={cpu.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="hidden absolute inset-0 w-full h-full items-center justify-center bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20">
                          <span className="text-6xl">🖥️</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex w-full h-full items-center justify-center">
                        <span className="text-6xl">🖥️</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{cpu.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(cpu.condition)}`}>
                        {cpu.condition.replace('-', ' ')}
                      </span>
                    </div>

                    {/* CPU Model */}
                    {cpu.cpu_model && (
                      <p className="text-gray-400 mb-3">
                        {cpu.cpu_model.manufacturer?.name} {cpu.cpu_model.model_name}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">{formatCurrency(cpu.price)}</span>
                        {cpu.original_price && cpu.original_price > cpu.price && (
                          <span className="text-lg text-gray-400 line-through">{formatCurrency(cpu.original_price)}</span>
                        )}
                      </div>
                      {cpu.original_price && cpu.original_price > cpu.price && (
                        <span className="text-sm text-green-400 font-medium">
                          Save {formatCurrency(cpu.original_price - cpu.price)}
                        </span>
                      )}
                    </div>

                    {/* Specifications */}
                    {cpu.cpu_model && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Cores:</span>
                          <span className="text-gray-300">{cpu.cpu_model.cores}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Threads:</span>
                          <span className="text-gray-300">{cpu.cpu_model.threads}</span>
                        </div>
                        {cpu.cpu_model.base_clock && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Base Clock:</span>
                            <span className="text-gray-300">{cpu.cpu_model.base_clock} GHz</span>
                          </div>
                        )}
                        {cpu.cpu_model.socket && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Socket:</span>
                            <span className="text-gray-300">{cpu.cpu_model.socket}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{cpu.view_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{cpu.favorite_count}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seller & Rating */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">by</span>
                        <span className="text-sm font-medium text-[var(--brand)]">{cpu.seller?.display_name || cpu.seller?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-300">{cpu.seller?.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-400">({cpu.seller?.review_count || 0})</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <div className="flex-1 bg-[var(--brand)] text-white py-3 rounded-lg font-medium text-center">
                        View Details
                      </div>
                      <button 
                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isInComparison(cpu.id)
                            ? 'bg-green-600 text-white'
                            : comparisonList.length >= 4
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToComparisonHandler(cpu.id);
                        }}
                        disabled={isInComparison(cpu.id) || comparisonList.length >= 4}
                      >
                        {isInComparison(cpu.id) ? '✓ Added' : '+ Compare'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-white px-8 py-3 rounded-lg font-medium transition-all duration-200">
              Load More CPUs
            </button>
          </div>
        </div>
      </section>

      {/* Comparison Sidebar */}
      {comparisonCPUs.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">CPU Comparison ({comparisonCPUs.length}/4)</h3>
            <button
              onClick={clearComparison}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {comparisonCPUs.map((cpu) => (
              <div key={cpu.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate">{cpu.title}</span>
                <button
                  onClick={() => removeFromComparison(cpu.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={goToComparison}
            className="w-full mt-3 bg-[var(--brand)] text-white py-2 rounded-lg font-medium hover:bg-[var(--brand-light)] transition-colors"
          >
            Compare CPUs ({comparisonCPUs.length})
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-[var(--card-border)] bg-[var(--card-bg)]/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded flex items-center justify-center">
              <span className="text-white text-sm">🐺</span>
            </div>
            <span className="text-lg font-bold">Stali</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}
