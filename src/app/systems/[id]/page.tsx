'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, System } from '@/lib/supabase';
import { formatCurrency } from '@/utils';
import { checkGamingCompatibility, getCompatibilityColor, getCompatibilityLabel } from '@/utils/gamingCompatibility';
import { popularGames } from '@/components/ui/GamingFilter';
import { useAuth } from '@/lib/auth';
import { useConversationStarter } from '@/hooks/useConversationStarter';

export default function SystemDetails() {
  const params = useParams();
  const router = useRouter();
  const [system, setSystem] = useState<System | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showGamingCompatibility, setShowGamingCompatibility] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const { user, signOut } = useAuth();
  const { startConversation } = useConversationStarter();

  useEffect(() => {
    if (params.id) {
      fetchSystem(params.id as string);
    }
  }, [params.id, user]);

  const fetchSystem = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // First, try to fetch the system without status restriction
      let { data, error } = await supabase
        .from('systems')
        .select(`
          *,
          category:categories(*),
          seller:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching system:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('System not found');
      }

      // Check if user can view this system
      // Allow viewing if:
      // 1. System is active (public)
      // 2. System is draft/sold/pending but user is the owner
      const isOwner = user && data.seller_id === user.id;
      const canView = data.status === 'active' || isOwner;

      if (!canView) {
        const statusMessage = data.status === 'draft' 
          ? 'This listing is a draft and is only visible to the owner.'
          : data.status === 'sold'
          ? 'This listing has been sold and is no longer available.'
          : 'This listing is not available for viewing.';
        setError(statusMessage);
        setLoading(false);
        return;
      }

      setSystem(data);
      
      // Only increment view count for active systems
      if (data.status === 'active') {
        supabase
          .from('systems')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Error incrementing view count:', error);
            }
          });
      }
        
    } catch (err) {
      console.error('Failed to fetch system:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch system');
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'like-new': return 'text-green-400 bg-green-400/20';
      case 'excellent': return 'text-blue-400 bg-blue-400/20';
      case 'good': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getImages = () => {
    if (!system) return [];
    const images = [];
    if (system.image_url) images.push(system.image_url);
    if (system.image_urls) images.push(...system.image_urls);
    return images;
  };

  const images = getImages();

  const handleFavorite = async () => {
    if (!system) return;
    
    try {
      setIsFavoriting(true);

      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('system_id', system.id);
        
        // Decrement favorite count
        await supabase
          .from('systems')
          .update({ favorite_count: Math.max(0, (system.favorite_count || 0) - 1) })
          .eq('id', system.id);
      } else {
        // Add to favorites (you might want to add user authentication here)
        await supabase
          .from('favorites')
          .insert({ system_id: system.id });
        
        // Increment favorite count
        await supabase
          .from('systems')
          .update({ favorite_count: (system.favorite_count || 0) + 1 })
          .eq('id', system.id);
      }
      
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error('Error updating favorite:', err);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleContactSeller = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (!system) return;

    // Prevent users from contacting themselves
    if (user.id === system.seller_id) {
      return;
    }

    try {
      setIsContacting(true);

      const conversation = await startConversation(system.id, system.seller_id);
      if (conversation) {
        router.push(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsContacting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading system details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !system) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <p className="text-red-400 mb-4">Error: {error || 'System not found'}</p>
          <Link 
            href="/systems"
            className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            Back to Systems
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
              <Link href="/systems" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Systems
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
                  {system.status === 'active' && (
                    <button 
                    onClick={handleContactSeller}
                    disabled={isContacting || (user && user.id === system.seller_id)}
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isContacting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      </div>
                    ) : (
                      user && user.id === system.seller_id ? 'Your Listing' : 'Contact Seller'
                    )}
                    </button>
                  )}
                  {system.status === 'draft' && user && user.id === system.seller_id && (
                    <Link
                      href={`/seller/edit-listing/${system.id}`}
                      className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                    >
                      Edit Draft
                    </Link>
                  )}
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
                  alt={system.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <span className="text-8xl">{system.category?.icon || '🖥️'}</span>
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
                      alt={`${system.title} ${index + 1}`}
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
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(system.condition)}`}>
                    {system.condition.replace('-', ' ')}
                  </span>
                  {system.status === 'draft' && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-400/20 text-yellow-400">
                      Draft
                    </span>
                  )}
                  {system.status === 'sold' && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-400/20 text-red-400">
                      Sold
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-300">{system.seller?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-400">({system.seller?.review_count || 0})</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{system.title}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">by</span>
                  <span className="text-sm font-medium text-[var(--brand)]">{system.seller?.display_name || system.seller?.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">👁️</span>
                  <span className="text-sm text-gray-300">{system.view_count || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">❤️</span>
                  <span className="text-sm text-gray-300">{system.favorite_count || 0} favorites</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl font-bold text-white">{formatCurrency(system.price)}</span>
                    {system.original_price && system.original_price > system.price && (
                      <span className="text-2xl text-gray-400 line-through">{formatCurrency(system.original_price)}</span>
                    )}
                  </div>
                  {system.original_price && system.original_price > system.price && (
                    <span className="text-lg text-green-400 font-medium">
                      Save {formatCurrency(system.original_price - system.price)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Category</div>
                  <div className="text-lg font-medium text-[var(--brand)]">{system.category?.name}</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handleContactSeller}
                  disabled={isContacting || (user && user.id === system.seller_id)}
                  className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isContacting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    </div>
                  ) : (
                    user && user.id === system.seller_id ? 'Your Listing' : 'Contact Seller'
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

            {/* Gaming Compatibility */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">🎮 Gaming Performance</h3>
                <button 
                  onClick={() => setShowGamingCompatibility(!showGamingCompatibility)}
                  className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors"
                >
                  {showGamingCompatibility ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showGamingCompatibility && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-[var(--background)] rounded-lg">
                      <div className="text-2xl font-bold text-green-400">90+</div>
                      <div className="text-sm text-gray-400">High-End Games</div>
                    </div>
                    <div className="text-center p-4 bg-[var(--background)] rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">60+</div>
                      <div className="text-sm text-gray-400">Mid-Range Games</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {popularGames.slice(0, 5).map((game) => {
                      const compatibility = checkGamingCompatibility(system, [game], '1080p', 'medium', 60);
                      return (
                        <div key={game.id} className="flex justify-between items-center">
                          <span className="text-gray-300">{game.name}</span>
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
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-6">📋 Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {system.cpu && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">CPU:</span>
                    <span className="text-gray-300 font-medium">{system.cpu}</span>
                  </div>
                )}
                {system.gpu && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">GPU:</span>
                    <span className="text-gray-300 font-medium">{system.gpu}</span>
                  </div>
                )}
                {system.ram && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">RAM:</span>
                    <span className="text-gray-300 font-medium">{system.ram}</span>
                  </div>
                )}
                {system.storage && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">Storage:</span>
                    <span className="text-gray-300 font-medium">{system.storage}</span>
                  </div>
                )}
                {system.motherboard && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">Motherboard:</span>
                    <span className="text-gray-300 font-medium">{system.motherboard}</span>
                  </div>
                )}
                {system.psu && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">PSU:</span>
                    <span className="text-gray-300 font-medium">{system.psu}</span>
                  </div>
                )}
                {system.case_model && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <span className="text-gray-400">Case:</span>
                    <span className="text-gray-300 font-medium">{system.case_model}</span>
                  </div>
                )}
                {system.cooling && (
                  <div className="flex justify-between py-3">
                    <span className="text-gray-400">Cooling:</span>
                    <span className="text-gray-300 font-medium">{system.cooling}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {system.description && (
              <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
                <h3 className="text-xl font-bold text-white mb-4">📝 Description</h3>
                <p className="text-gray-300 leading-relaxed">{system.description}</p>
              </div>
            )}

            {/* Seller Information */}
            <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
              <h3 className="text-xl font-bold text-white mb-4">👤 Seller Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="text-gray-300 font-medium">{system.seller?.display_name || system.seller?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-gray-300 font-medium">{system.seller?.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-400">({system.seller?.review_count || 0} reviews)</span>
                  </div>
                </div>
                {system.seller?.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-gray-300 font-medium">{system.seller.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-gray-300 font-medium">
                    {new Date(system.seller?.created_at || '').toLocaleDateString()}
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
            © 2025 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}
