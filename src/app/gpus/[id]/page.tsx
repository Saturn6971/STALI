'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { GPUListing } from '@/hooks/useGPUs';
import { formatCurrency } from '@/utils';
import { useAuth } from '@/lib/auth';
import { useConversationStarter } from '@/hooks/useConversationStarter';
import { Heart, Eye, MapPin, Truck, Package, Star, Calendar, Zap, Thermometer, Monitor, MemoryStick, Clock, Layers } from 'lucide-react';

export default function GPUDetails() {
  const params = useParams();
  const router = useRouter();
  const [gpu, setGpu] = useState<GPUListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const { user, signOut } = useAuth();
  const { startConversation } = useConversationStarter();

  useEffect(() => {
    if (params.id) {
      fetchGPU(params.id as string);
    }
  }, [params.id, user]);

  // Check if user has favorited this GPU
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !params.id) {
        setIsFavorited(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('gpu_favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('gpu_listing_id', params.id as string)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking favorite status:', error);
        }
        setIsFavorited(!!data);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    checkFavoriteStatus();
  }, [user, params.id]);

  const fetchGPU = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
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
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching GPU:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('GPU not found');
      }

      setGpu(data);
      
      // Increment view count
      supabase
        .from('gpu_listings')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error incrementing view count:', error);
          }
        });
        
    } catch (err) {
      console.error('Failed to fetch GPU:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch GPU');
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
    if (!gpu) return [];
    return gpu.image_urls || [];
  };

  const images = getImages();

  const handleFavorite = async () => {
    if (!gpu) return;
    
    // Require authentication
    if (!user) {
      router.push('/auth?redirect=' + encodeURIComponent(`/gpus/${gpu.id}`));
      return;
    }
    
    try {
      setIsFavoriting(true);

      if (isFavorited) {
        const { error } = await supabase
          .from('gpu_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('gpu_listing_id', gpu.id);
        
        if (error) throw error;
        
        // Decrement favorite count
        await supabase
          .from('gpu_listings')
          .update({ favorite_count: Math.max(0, (gpu.favorite_count || 0) - 1) })
          .eq('id', gpu.id);
        
        setIsFavorited(false);
      } else {
        const { error } = await supabase
          .from('gpu_favorites')
          .insert({
            user_id: user.id,
            gpu_listing_id: gpu.id
          });
        
        if (error) throw error;
        
        // Increment favorite count
        await supabase
          .from('gpu_listings')
          .update({ favorite_count: (gpu.favorite_count || 0) + 1 })
          .eq('id', gpu.id);
        
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleContactSeller = async () => {
    if (!gpu) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    if (user.id === gpu.seller_id) {
      router.push('/seller');
      return;
    }

    try {
      setIsContacting(true);

      const conversation = await startConversation(gpu.id, gpu.seller_id, 'gpu');
      if (conversation) {
        router.push(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
        </div>
      </div>
    );
  }

  if (error || !gpu) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">GPU Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The GPU you are looking for does not exist.'}</p>
          <Link
            href="/gpus"
            className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Browse GPUs
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
              <Link href="/gpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to GPUs
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
                    disabled={isContacting || !!(user && user.id === gpu.seller_id)}
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isContacting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      </div>
                    ) : (
                      user && user.id === gpu.seller_id ? 'Your Listing' : 'Contact Seller'
                    )}
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
                  alt={gpu.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <span className="text-8xl">🎮</span>
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
                      alt={`${gpu.title} ${index + 1}`}
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(gpu.condition)}`}>
                  {gpu.condition.replace('-', ' ')}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-300">{gpu.seller?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-400">({gpu.seller?.review_count || 0})</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{gpu.title}</h1>
              
              {gpu.gpu_model && (
                <p className="text-xl text-gray-400 mb-4">
                  {gpu.gpu_model.manufacturer?.name} {gpu.gpu_model.model_name}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">by</span>
                  <span className="text-sm font-medium text-[var(--brand)]">{gpu.seller?.display_name || gpu.seller?.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">👁️</span>
                  <span className="text-sm text-gray-300">{gpu.view_count || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">❤️</span>
                  <span className="text-sm text-gray-300">{gpu.favorite_count || 0} favorites</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-white">{formatCurrency(gpu.price)}</span>
                    {gpu.original_price && gpu.original_price > gpu.price && (
                      <span className="text-2xl text-gray-400 line-through">{formatCurrency(gpu.original_price)}</span>
                    )}
                  </div>
                  {gpu.original_price && gpu.original_price > gpu.price && (
                    <span className="text-lg text-green-400 font-medium">
                      Save {formatCurrency(gpu.original_price - gpu.price)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Manufacturer</div>
                  <div className="text-lg font-medium text-[var(--brand)]">{gpu.gpu_model?.manufacturer?.name}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleContactSeller}
                  disabled={isContacting || !!(user && user.id === gpu.seller_id)}
                  className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isContacting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    </div>
                  ) : (
                    user && user.id === gpu.seller_id ? 'Your Listing' : 'Contact Seller'
                  )}
                </button>
                <button 
                  onClick={handleFavorite}
                  disabled={isFavoriting}
                  className={`px-6 py-4 border rounded-lg font-medium text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorited 
                      ? 'bg-[var(--brand)] text-white border-[var(--brand)]' 
                      : 'border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white'
                  }`}
                >
                  {isFavoriting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                    </div>
                  ) : (
                    isFavorited ? '❤️ Saved' : '❤️ Save'
                  )}
                </button>
              </div>
            </div>

            {/* GPU Specifications */}
            {gpu.gpu_model && (
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
                <h3 className="text-xl font-bold text-white mb-6">🎮 GPU Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                    <Monitor className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Memory</div>
                      <div className="font-medium text-white">{gpu.gpu_model.memory_size}GB {gpu.gpu_model.memory_type}</div>
                    </div>
                  </div>
                  
                  {gpu.gpu_model.base_clock && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Clock className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">Base Clock</div>
                        <div className="font-medium text-white">{gpu.gpu_model.base_clock} MHz</div>
                      </div>
                    </div>
                  )}
                  
                  {gpu.gpu_model.boost_clock && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Zap className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">Boost Clock</div>
                        <div className="font-medium text-white">{gpu.gpu_model.boost_clock} MHz</div>
                      </div>
                    </div>
                  )}
                  
                  {gpu.gpu_model.tdp && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Thermometer className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">TDP</div>
                        <div className="font-medium text-white">{gpu.gpu_model.tdp}W</div>
                      </div>
                    </div>
                  )}
                  
                  {gpu.gpu_model.cuda_cores && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Layers className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">CUDA Cores</div>
                        <div className="font-medium text-white">{gpu.gpu_model.cuda_cores.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  
                  {gpu.gpu_model.stream_processors && (
                    <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                      <Layers className="w-5 h-5 text-[var(--brand)]" />
                      <div>
                        <div className="text-sm text-gray-400">Stream Processors</div>
                        <div className="font-medium text-white">{gpu.gpu_model.stream_processors.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {gpu.description && (
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
                <h3 className="text-xl font-bold text-white mb-4">📝 Description</h3>
                <p className="text-gray-300 leading-relaxed">{gpu.description}</p>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-6">ℹ️ Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gpu.purchase_date && (
                  <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                    <Calendar className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Purchase Date</div>
                      <div className="font-medium text-white">{new Date(gpu.purchase_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                {gpu.warranty_remaining_months && (
                  <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                    <Package className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Warranty Remaining</div>
                      <div className="font-medium text-white">{gpu.warranty_remaining_months} months</div>
                    </div>
                  </div>
                )}
                {gpu.overclocked && (
                  <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                    <Zap className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Overclocked</div>
                      <div className="font-medium text-white">Yes {gpu.max_overclock && `(${gpu.max_overclock} MHz)`}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                  <Thermometer className="w-5 h-5 text-[var(--brand)]" />
                  <div>
                    <div className="text-sm text-gray-400">Cooling Included</div>
                    <div className="font-medium text-white">{gpu.cooling_included ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                  <Package className="w-5 h-5 text-[var(--brand)]" />
                  <div>
                    <div className="text-sm text-gray-400">Original Box</div>
                    <div className="font-medium text-white">{gpu.original_box ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 py-3 border-b border-[var(--card-border)]">
                  <Package className="w-5 h-5 text-[var(--brand)]" />
                  <div>
                    <div className="text-sm text-gray-400">Original Manual</div>
                    <div className="font-medium text-white">{gpu.original_manual ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Shipping */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-6">🚚 Location & Shipping</h3>
              <div className="space-y-4">
                {gpu.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-[var(--brand)]" />
                    <span className="text-gray-300">{gpu.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-[var(--brand)]" />
                  <span className="text-gray-300">{gpu.shipping_available ? 'Shipping Available' : 'No Shipping'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-[var(--brand)]" />
                  <span className="text-gray-300">{gpu.local_pickup ? 'Local Pickup Available' : 'No Local Pickup'}</span>
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
