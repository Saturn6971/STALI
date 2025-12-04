'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, System } from '@/lib/supabase';
import GamingFilter, { GamingFilter as GamingFilterType, popularGames } from '@/components/ui/GamingFilter';
import { checkGamingCompatibility, getCompatibilityColor, getCompatibilityLabel } from '@/utils/gamingCompatibility';
import { formatCurrency } from '@/utils';
import { useAuth } from '@/lib/auth';

export default function CompleteSystems() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-low');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamingFilter, setGamingFilter] = useState<GamingFilterType>({
    selectedGames: [],
    resolution: '1080p',
    qualityPreset: 'medium',
    targetFps: 60
  });
  const [showGamingFilter, setShowGamingFilter] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchSystems();
  }, []);

  const fetchSystems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('systems')
        .select(`
          *,
          category:categories(*),
          seller:users(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching systems:', error);
        throw new Error(error.message);
      }

      setSystems(data || []);
    } catch (err) {
      console.error('Failed to fetch systems:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch systems');
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Systems' },
    { id: 'Gaming', label: 'Gaming' },
    { id: 'Workstation', label: 'Workstation' },
    { id: 'Streaming', label: 'Streaming' },
    { id: 'Compact', label: 'Compact' },
    { id: 'Budget', label: 'Budget' },
    { id: 'AI/ML', label: 'AI/ML' }
  ];

  const sortOptions = [
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'newest', label: 'Newest First' }
  ];

  const filteredSystems = systems
    .filter(system => {
      // Category filter
      const categoryMatch = selectedFilter === 'all' || system.category?.name === selectedFilter;
      
      // Gaming compatibility filter
      let gamingMatch = true;
      if (gamingFilter.selectedGames.length > 0) {
        const selectedGamesData = popularGames.filter((game) => 
          gamingFilter.selectedGames.includes(game.id)
        );
        
        const compatibility = checkGamingCompatibility(
          system,
          selectedGamesData,
          gamingFilter.resolution,
          gamingFilter.qualityPreset,
          gamingFilter.targetFps
        );
        
        gamingMatch = compatibility.isCompatible;
      }
      
      return categoryMatch && gamingMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.seller?.rating || 0) - (a.seller?.rating || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'like-new': return 'text-green-400 bg-green-400/20';
      case 'excellent': return 'text-blue-400 bg-blue-400/20';
      case 'good': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🐺</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
                Stali
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Home
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">
                    Welcome, {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                  </span>
                  <button 
                    onClick={() => signOut()}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                  <Link 
                    href="/seller"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Sell Your System
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
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 lg:px-12 py-12 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Complete PC Systems
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Ready-to-use computers for gaming, work, and everything in between. All systems are tested and verified.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Sort */}
      <section className="px-6 lg:px-12 py-8 border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === filter.id
                      ? 'bg-[var(--brand)] text-white'
                      : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Sort and Gaming Filter */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowGamingFilter(!showGamingFilter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  showGamingFilter || gamingFilter.selectedGames.length > 0
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-[var(--card-bg)] text-gray-300 hover:text-white hover:bg-[var(--card-border)]'
                }`}
              >
                🎮 Gaming Filter {gamingFilter.selectedGames.length > 0 && `(${gamingFilter.selectedGames.length})`}
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id} className="bg-[var(--card-bg)]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gaming Filter */}
      {showGamingFilter && (
        <section className="px-6 lg:px-12 py-8">
          <div className="max-w-7xl mx-auto">
            <GamingFilter onFilterChange={setGamingFilter} />
          </div>
        </section>
      )}

      {/* Systems Grid */}
      <section className="px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
                <p className="text-gray-400">Loading systems...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={fetchSystems}
                className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSystems.map((system) => (
                <Link
                  key={system.id}
                  href={`/systems/${system.id}`}
                  className={`relative bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden transition-all duration-300 cursor-pointer group block ${
                    hoveredCard === system.id ? 'scale-105 shadow-2xl' : 'hover:scale-102'
                  }`}
                  onMouseEnter={() => setHoveredCard(system.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20">
                    {system.image_url ? (
                      <>
                        <img 
                          src={system.image_url} 
                          alt={system.title}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          loading="lazy"
                          onError={(e) => {
                            // Hide image and show fallback
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="hidden absolute inset-0 w-full h-full items-center justify-center bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20">
                          <span className="text-6xl">{system.category?.icon || '🖥️'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex w-full h-full items-center justify-center">
                        <span className="text-6xl">{system.category?.icon || '🖥️'}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{system.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(system.condition)}`}>
                        {system.condition.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">{formatCurrency(system.price)}</span>
                        {system.original_price && system.original_price > system.price && (
                          <span className="text-lg text-gray-400 line-through">{formatCurrency(system.original_price)}</span>
                        )}
                      </div>
                      {system.original_price && system.original_price > system.price && (
                        <span className="text-sm text-green-400 font-medium">
                          Save {formatCurrency(system.original_price - system.price)}
                        </span>
                      )}
                    </div>

                    {/* Gaming Compatibility */}
                    {gamingFilter.selectedGames.length > 0 && (
                      <div className="mb-4">
                        {(() => {
                          const selectedGamesData = popularGames.filter((game) => 
                            gamingFilter.selectedGames.includes(game.id)
                          );
                          
                          const compatibility = checkGamingCompatibility(
                            system,
                            selectedGamesData,
                            gamingFilter.resolution,
                            gamingFilter.qualityPreset,
                            gamingFilter.targetFps
                          );
                          
                          return (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Gaming Score:</span>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(compatibility.score)}`}>
                                  {compatibility.score}/100
                                </span>
                                <span className="text-xs text-gray-400">
                                  {getCompatibilityLabel(compatibility.score)}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Specs */}
                    <div className="space-y-2 mb-4">
                      {system.cpu && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">CPU:</span>
                          <span className="text-gray-300">{system.cpu}</span>
                        </div>
                      )}
                      {system.gpu && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">GPU:</span>
                          <span className="text-gray-300">{system.gpu}</span>
                        </div>
                      )}
                      {system.ram && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">RAM:</span>
                          <span className="text-gray-300">{system.ram}</span>
                        </div>
                      )}
                      {system.storage && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Storage:</span>
                          <span className="text-gray-300">{system.storage}</span>
                        </div>
                      )}
                    </div>

                    {/* Seller & Rating */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">by</span>
                        <span className="text-sm font-medium text-[var(--brand)]">{system.seller?.display_name || system.seller?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-300">{system.seller?.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-400">({system.seller?.review_count || 0})</span>
                      </div>
                    </div>

                    {/* Actions */}
                        <div className="flex space-x-3">
                          <div className="flex-1 bg-[var(--brand)] text-white py-3 rounded-lg font-medium text-center">
                            View Details
                          </div>
                          {user && user.id !== system.seller_id && (
                            <button 
                              className="px-4 py-3 border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white rounded-lg font-medium transition-all duration-200"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Handle contact seller
                              }}
                            >
                              💬
                            </button>
                          )}
                        </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-white px-8 py-3 rounded-lg font-medium transition-all duration-200">
              Load More Systems
            </button>
          </div>
        </div>
      </section>

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
            © 2024 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}
