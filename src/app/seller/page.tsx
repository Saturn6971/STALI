'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase, System, CPUListing } from '@/lib/supabase';
import { GPUListing } from '@/hooks/useGPUs';
import { formatCurrency } from '@/utils';

type SellerListing = (System & { type: 'system' }) | (GPUListing & { type: 'gpu' }) | (CPUListing & { type: 'cpu' });

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [systems, setSystems] = useState<System[]>([]);
  const [gpuListings, setGpuListings] = useState<GPUListing[]>([]);
  const [cpuListings, setCpuListings] = useState<CPUListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'draft'>('active');

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserSystems();
      fetchUserGPUs();
      fetchUserCPUs();
    }
  }, [user, authLoading]);

  const fetchUserSystems = async () => {
    if (!user) return;
    
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
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user systems:', error);
        throw new Error(error.message);
      }

      setSystems(data || []);
    } catch (err) {
      console.error('Failed to fetch user systems:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch systems');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGPUs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('gpu_listings')
        .select(`
          *,
          gpu_model:gpu_models(
            *,
            manufacturer:gpu_manufacturers(*)
          ),
          seller:users(*)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user GPUs:', error);
        throw new Error(error.message);
      }

      setGpuListings(data || []);
    } catch (err) {
      console.error('Failed to fetch user GPUs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch GPUs');
    }
  };

  const fetchUserCPUs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cpu_listings')
        .select(`
          *,
          cpu_model:cpu_models(
            *,
            manufacturer:cpu_manufacturers(*)
          ),
          seller:users(*)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user CPUs:', error);
        throw new Error(error.message);
      }

      setCpuListings(data || []);
    } catch (err) {
      console.error('Failed to fetch user CPUs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch CPUs');
    }
  };

  const handleStatusChange = async (listingId: string, newStatus: 'active' | 'sold' | 'draft', listingType: 'system' | 'gpu' | 'cpu') => {
    try {
      const tableName = listingType === 'system' ? 'systems' : listingType === 'gpu' ? 'gpu_listings' : 'cpu_listings';
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq('id', listingId);

      if (error) {
        console.error(`Error updating ${listingType} status:`, error);
        return;
      }

      // Update local state
      if (listingType === 'system') {
        setSystems(prev => 
          prev.map(system => 
            system.id === listingId 
              ? { ...system, status: newStatus }
              : system
          )
        );
      } else if (listingType === 'gpu') {
        setGpuListings(prev => 
          prev.map(gpu => 
            gpu.id === listingId 
              ? { ...gpu, status: newStatus }
              : gpu
          )
        );
      } else {
        setCpuListings(prev => 
          prev.map(cpu => 
            cpu.id === listingId 
              ? { ...cpu, status: newStatus }
              : cpu
          )
        );
      }
    } catch (err) {
      console.error(`Failed to update ${listingType} status:`, err);
    }
  };

  const handleDeleteListing = async (listingId: string, listingType: 'system' | 'gpu' | 'cpu') => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const tableName = listingType === 'system' ? 'systems' : listingType === 'gpu' ? 'gpu_listings' : 'cpu_listings';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', listingId);

      if (error) {
        console.error(`Error deleting ${listingType}:`, error);
        return;
      }

      // Update local state
      if (listingType === 'system') {
        setSystems(prev => prev.filter(system => system.id !== listingId));
      } else if (listingType === 'gpu') {
        setGpuListings(prev => prev.filter(gpu => gpu.id !== listingId));
      } else {
        setCpuListings(prev => prev.filter(cpu => cpu.id !== listingId));
      }
    } catch (err) {
      console.error(`Failed to delete ${listingType}:`, err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'sold': return 'text-blue-400 bg-blue-400/20';
      case 'draft': return 'text-yellow-400 bg-yellow-400/20';
      case 'pending': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-400 bg-green-400/20';
      case 'like-new': return 'text-green-400 bg-green-400/20';
      case 'excellent': return 'text-blue-400 bg-blue-400/20';
      case 'good': return 'text-yellow-400 bg-yellow-400/20';
      case 'fair': return 'text-orange-400 bg-orange-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const filteredSystems = systems.filter(system => {
    if (activeTab === 'active') return system.status === 'active';
    if (activeTab === 'sold') return system.status === 'sold';
    if (activeTab === 'draft') return system.status === 'draft';
    return true;
  });

  const filteredGPUs = gpuListings.filter(gpu => {
    if (activeTab === 'active') return gpu.status === 'active';
    if (activeTab === 'sold') return gpu.status === 'sold';
    if (activeTab === 'draft') return gpu.status === 'draft';
    return true;
  });

  const filteredCPUs = cpuListings.filter(cpu => {
    if (activeTab === 'active') return cpu.status === 'active';
    if (activeTab === 'sold') return cpu.status === 'sold';
    if (activeTab === 'draft') return cpu.status === 'draft';
    return true;
  });

  // Combine systems, GPUs, and CPUs for display
  const allListings: SellerListing[] = [
    ...filteredSystems.map(system => ({ ...system, type: 'system' as const })),
    ...filteredGPUs.map(gpu => ({ ...gpu, type: 'gpu' as const })),
    ...filteredCPUs.map(cpu => ({ ...cpu, type: 'cpu' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to access your seller dashboard.</p>
          <Link
            href="/auth"
            className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 lg:px-12 py-12 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Seller Dashboard
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Manage your PC parts and complete systems listings
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/seller/add-listing"
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
            >
              <span>🖥️</span>
              <span>Sell Complete System</span>
            </Link>
            <Link
              href="/cpus/sell"
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
            >
              <span>⚡</span>
              <span>Sell Individual CPU</span>
            </Link>
            <Link
              href="/gpus/sell"
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
            >
              <span>🎮</span>
              <span>Sell Graphics Card</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {systems.filter(s => s.status === 'active').length + gpuListings.filter(g => g.status === 'active').length + cpuListings.filter(c => c.status === 'active').length}
              </div>
              <div className="text-gray-400">Active Listings</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {systems.filter(s => s.status === 'sold').length + gpuListings.filter(g => g.status === 'sold').length + cpuListings.filter(c => c.status === 'sold').length}
              </div>
              <div className="text-gray-400">Sold Items</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {systems.reduce((sum, s) => sum + (s.view_count || 0), 0) + gpuListings.reduce((sum, g) => sum + (g.view_count || 0), 0) + cpuListings.reduce((sum, c) => sum + (c.view_count || 0), 0)}
              </div>
              <div className="text-gray-400">Total Views</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {systems.reduce((sum, s) => sum + (s.favorite_count || 0), 0) + gpuListings.reduce((sum, g) => sum + (g.favorite_count || 0), 0) + cpuListings.reduce((sum, c) => sum + (c.favorite_count || 0), 0)}
              </div>
              <div className="text-gray-400">Total Favorites</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-6 lg:px-12 py-4 border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 bg-[var(--card-bg)] rounded-lg p-1">
            {[
              { id: 'active', label: 'Active', count: systems.filter(s => s.status === 'active').length + gpuListings.filter(g => g.status === 'active').length + cpuListings.filter(c => c.status === 'active').length },
              { id: 'sold', label: 'Sold', count: systems.filter(s => s.status === 'sold').length + gpuListings.filter(g => g.status === 'sold').length + cpuListings.filter(c => c.status === 'sold').length },
              { id: 'draft', label: 'Drafts', count: systems.filter(s => s.status === 'draft').length + gpuListings.filter(g => g.status === 'draft').length + cpuListings.filter(c => c.status === 'draft').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[var(--brand)] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[var(--card-border)]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="px-6 lg:px-12 py-12">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={fetchUserSystems}
                className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          ) : allListings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {activeTab === 'active' ? 'No Active Listings' : 
                 activeTab === 'sold' ? 'No Sold Items' : 'No Drafts'}
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'active' ? 'Start by creating your first listing' : 
                 activeTab === 'sold' ? 'Your sold items will appear here' : 'Save drafts to work on later'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/seller/add-listing"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
                >
                  <span>🖥️</span>
                  <span>Sell Complete System</span>
                </Link>
                <Link
                  href="/cpus/sell"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
                >
                  <span>⚡</span>
                  <span>Sell Individual CPU</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden transition-all duration-300 hover:scale-102"
                >
                  {/* Image */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20">
                    {listing.type === 'system' ? (
                      listing.image_url ? (
                        <img 
                          src={listing.image_url} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex w-full h-full items-center justify-center">
                          <span className="text-6xl">{listing.category?.icon || '🖥️'}</span>
                        </div>
                      )
                    ) : listing.type === 'cpu' ? (
                      listing.image_urls && listing.image_urls.length > 0 ? (
                        <img 
                          src={listing.image_urls[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex w-full h-full items-center justify-center">
                          <span className="text-6xl">⚡</span>
                        </div>
                      )
                    ) : (
                      listing.image_urls && listing.image_urls.length > 0 ? (
                        <img 
                          src={listing.image_urls[0]} 
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex w-full h-full items-center justify-center">
                          <span className="text-6xl">🎮</span>
                        </div>
                      )
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{listing.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(listing.condition)}`}>
                        {listing.condition.replace('-', ' ')}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">{formatCurrency(listing.price)}</span>
                        {listing.original_price && listing.original_price > listing.price && (
                          <span className="text-lg text-gray-400 line-through">{formatCurrency(listing.original_price)}</span>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Views:</span>
                        <span className="text-gray-300">{listing.view_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Favorites:</span>
                        <span className="text-gray-300">{listing.favorite_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-gray-300">{new Date(listing.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Link
                          href={listing.type === 'system' ? `/systems/${listing.id}` : listing.type === 'cpu' ? `/cpus/${listing.id}` : `/gpus/${listing.id}`}
                          className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-2 rounded-lg font-medium text-center transition-all duration-200 hover:scale-105"
                        >
                          View
                        </Link>
                        <Link
                          href={listing.type === 'system' ? `/seller/edit-listing/${listing.id}` : listing.type === 'cpu' ? `/cpus/sell` : `/gpus/sell`}
                          className="flex-1 border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white py-2 rounded-lg font-medium text-center transition-all duration-200"
                        >
                          Edit
                        </Link>
                      </div>
                      
                      {/* Status Actions */}
                      <div className="flex space-x-2">
                        {listing.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(listing.id, 'sold', listing.type)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-center transition-all duration-200"
                            >
                              Mark Sold
                            </button>
                            <button
                              onClick={() => handleStatusChange(listing.id, 'draft', listing.type)}
                              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-medium text-center transition-all duration-200"
                            >
                              Draft
                            </button>
                          </>
                        )}
                        
                        {listing.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(listing.id, 'active', listing.type)}
                            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-2 rounded-lg font-medium text-center transition-all duration-200"
                          >
                            Publish
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteListing(listing.id, listing.type)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 mt-16">
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






