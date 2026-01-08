'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, CPUListing } from '@/lib/supabase';
import { formatCurrency } from '@/utils';
import { useAuth } from '@/lib/auth';
import { useConversationStarter } from '@/hooks/useConversationStarter';
import { Heart, Eye, MapPin, Truck, Package, Star, Calendar, Zap, Thermometer, Cpu, MemoryStick, Clock, Layers } from 'lucide-react';

export default function CPUDetails() {
  const params = useParams();
  const router = useRouter();
  const [cpuListing, setCpuListing] = useState<CPUListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const { user, signOut } = useAuth();
  const { startConversation } = useConversationStarter();

  useEffect(() => {
    if (params.id) {
      fetchCPU(params.id as string);
    }
  }, [params.id]);

  const fetchCPU = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
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
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching CPU:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('CPU not found');
      }

      setCpuListing(data);
      
      // Increment view count (don't await to avoid blocking the UI)
      supabase
        .from('cpu_listings')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error incrementing view count:', error);
          }
        });
        
    } catch (err) {
      console.error('Failed to fetch CPU:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch CPU');
    } finally {
      setLoading(false);
    }
  };

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

  const getImages = () => {
    if (!cpuListing) return [];
    return cpuListing.image_urls || [];
  };

  const images = getImages();

  const handleFavorite = async () => {
    if (!cpuListing) return;
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('cpu_favorites')
          .delete()
          .eq('cpu_listing_id', cpuListing.id);
        
        // Decrement favorite count
        await supabase
          .from('cpu_listings')
          .update({ favorite_count: Math.max(0, (cpuListing.favorite_count || 0) - 1) })
          .eq('id', cpuListing.id);
      } else {
        // Add to favorites
        await supabase
          .from('cpu_favorites')
          .insert({ cpu_listing_id: cpuListing.id });
        
        // Increment favorite count
        await supabase
          .from('cpu_listings')
          .update({ favorite_count: (cpuListing.favorite_count || 0) + 1 })
          .eq('id', cpuListing.id);
      }
      
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const handleContactSeller = async () => {
    if (!cpuListing) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    // Prevent users from contacting themselves
    if (user.id === cpuListing.seller_id) {
      return;
    }

    try {
      const conversation = await startConversation(cpuListing.id, cpuListing.seller_id, 'cpu');
      if (conversation) {
        router.push(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading CPU details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cpuListing) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">Error: {error || 'CPU not found'}</p>
          <Link 
            href="/cpus"
            className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Back to CPUs
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
              <Link href="/cpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to CPUs
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
                  <button 
                    onClick={handleContactSeller}
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    {user && user.id === cpuListing.seller_id ? 'Your Listing' : 'Contact Seller'}
                  </button>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden">
              {images.length > 0 ? (
                <img 
                  src={images[selectedImageIndex]} 
                  alt={cpuListing.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <span className="text-8xl">🖥️</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg border overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'border-[var(--brand)] ring-2 ring-[var(--brand)]/50' 
                        : 'border-[var(--card-border)] hover:border-[var(--brand)]/50'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${cpuListing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(cpuListing.condition)}`}>
                  {cpuListing.condition.replace('-', ' ')}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-300">{cpuListing.seller?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-400">({cpuListing.seller?.review_count || 0})</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{cpuListing.title}</h1>
              
              {cpuListing.cpu_model && (
                <p className="text-xl text-gray-400 mb-4">
                  {cpuListing.cpu_model.manufacturer?.name} {cpuListing.cpu_model.model_name}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">by</span>
                  <span className="text-sm font-medium text-[var(--brand)]">{cpuListing.seller?.display_name || cpuListing.seller?.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">👁️</span>
                  <span className="text-sm text-gray-300">{cpuListing.view_count || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">❤️</span>
                  <span className="text-sm text-gray-300">{cpuListing.favorite_count || 0} favorites</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-white">{formatCurrency(cpuListing.price)}</span>
                    {cpuListing.original_price && cpuListing.original_price > cpuListing.price && (
                      <span className="text-2xl text-gray-400 line-through">{formatCurrency(cpuListing.original_price)}</span>
                    )}
                  </div>
                  {cpuListing.original_price && cpuListing.original_price > cpuListing.price && (
                    <span className="text-lg text-green-400 font-medium">
                      Save {formatCurrency(cpuListing.original_price - cpuListing.price)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Manufacturer</div>
                  <div className="text-lg font-medium text-[var(--brand)]">{cpuListing.cpu_model?.manufacturer?.name}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleContactSeller}
                  className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105"
                >
                  {user && user.id === cpuListing.seller_id ? 'Your Listing' : 'Contact Seller'}
                </button>
                <button 
                  onClick={handleFavorite}
                  className={`px-6 py-4 border rounded-lg font-medium text-lg transition-all duration-200 ${
                    isFavorited 
                      ? 'bg-[var(--brand)] text-white border-[var(--brand)]' 
                      : 'border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white'
                  }`}
                >
                  {isFavorited ? '❤️ Saved' : '❤️ Save'}
                </button>
              </div>
            </div>

            {/* CPU Specifications */}
            {cpuListing.cpu_model && (
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
                <h3 className="text-xl font-bold text-white mb-6">⚡ CPU Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                    <Cpu className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Cores / Threads</div>
                      <div className="font-medium text-white">{cpuListing.cpu_model.cores} / {cpuListing.cpu_model.threads}</div>
                    </div>
                  </div>
                  
                  {cpuListing.cpu_model.base_clock && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Clock className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">Base Clock</div>
                        <div className="font-medium text-white">{cpuListing.cpu_model.base_clock} GHz</div>
                      </div>
                    </div>
                  )}

                  {cpuListing.cpu_model.boost_clock && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Zap className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">Boost Clock</div>
                        <div className="font-medium text-white">{cpuListing.cpu_model.boost_clock} GHz</div>
                      </div>
                    </div>
                  )}

                  {cpuListing.cpu_model.tdp && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Thermometer className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">TDP</div>
                        <div className="font-medium text-white">{cpuListing.cpu_model.tdp}W</div>
                      </div>
                    </div>
                  )}

                  {cpuListing.cpu_model.socket && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Layers className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">Socket</div>
                        <div className="font-medium text-white">{cpuListing.cpu_model.socket}</div>
                      </div>
                    </div>
                  )}

                  {cpuListing.cpu_model.cache_l3 && (
                    <div className="flex items-center space-x-3 py-3">
                      <MemoryStick className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">L3 Cache</div>
                        <div className="font-medium text-white">{cpuListing.cpu_model.cache_l3} MB</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-6">📋 Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cpuListing.purchase_date && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">Purchase Date:</span>
                    <span className="text-gray-300 font-medium">{new Date(cpuListing.purchase_date).toLocaleDateString()}</span>
                  </div>
                )}

                {cpuListing.warranty_remaining_months && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">Warranty Remaining:</span>
                    <span className="text-gray-300 font-medium">{cpuListing.warranty_remaining_months} months</span>
                  </div>
                )}

                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <span className="text-gray-400">Overclocked:</span>
                  <span className="text-gray-300 font-medium">
                    {cpuListing.overclocked ? (cpuListing.max_overclock ? `Up to ${cpuListing.max_overclock} GHz` : 'Yes') : 'No'}
                  </span>
                </div>

                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <span className="text-gray-400">Original Box:</span>
                  <span className="text-gray-300 font-medium">{cpuListing.original_box ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <span className="text-gray-400">Original Manual:</span>
                  <span className="text-gray-300 font-medium">{cpuListing.original_manual ? 'Yes' : 'No'}</span>
                </div>

                <div className="flex justify-between py-3">
                  <span className="text-gray-400">Cooling Included:</span>
                  <span className="text-gray-300 font-medium">{cpuListing.cooling_included ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Location & Shipping */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-6">🚚 Location & Shipping</h3>
              <div className="space-y-3">
                {cpuListing.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-300 font-medium">{cpuListing.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Shipping:</span>
                  <span className="text-gray-300 font-medium">{cpuListing.shipping_available ? 'Available' : 'Not Available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Local Pickup:</span>
                  <span className="text-gray-300 font-medium">{cpuListing.local_pickup ? 'Available' : 'Not Available'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {cpuListing.description && (
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
                <h3 className="text-xl font-bold text-white mb-4">📝 Description</h3>
                <p className="text-gray-300 leading-relaxed">{cpuListing.description}</p>
              </div>
            )}

            {/* Seller Information */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-4">👤 Seller Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-gray-300 font-medium">{cpuListing.seller?.display_name || cpuListing.seller?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-300 font-medium">{cpuListing.seller?.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400">({cpuListing.seller?.review_count || 0} reviews)</span>
                  </div>
                </div>
                {cpuListing.seller?.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-300 font-medium">{cpuListing.seller.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-gray-300 font-medium">
                    {new Date(cpuListing.seller?.created_at || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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