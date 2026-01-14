'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCurrency } from '@/utils';
import { Heart, Trash2, Eye, MapPin, Truck, Package, Cpu, Monitor, Computer, ArrowLeft } from 'lucide-react';

type TabType = 'all' | 'systems' | 'cpus' | 'gpus';

export default function SavedListingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    favoriteSystems, 
    favoriteCPUs, 
    favoriteGPUs, 
    loading, 
    error,
    totalFavorites,
    removeSystemFavorite,
    removeCPUFavorite,
    removeGPUFavorite
  } = useFavorites();
  
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/saved');
    }
  }, [user, authLoading, router]);

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

  const handleRemoveSystem = async (favoriteId: string) => {
    setRemovingId(favoriteId);
    await removeSystemFavorite(favoriteId);
    setRemovingId(null);
  };

  const handleRemoveCPU = async (favoriteId: string) => {
    setRemovingId(favoriteId);
    await removeCPUFavorite(favoriteId);
    setRemovingId(null);
  };

  const handleRemoveGPU = async (favoriteId: string) => {
    setRemovingId(favoriteId);
    await removeGPUFavorite(favoriteId);
    setRemovingId(null);
  };

  const tabs = [
    { id: 'all' as TabType, label: 'All', count: totalFavorites },
    { id: 'systems' as TabType, label: 'Systems', count: favoriteSystems.length, icon: Computer },
    { id: 'cpus' as TabType, label: 'CPUs', count: favoriteCPUs.length, icon: Cpu },
    { id: 'gpus' as TabType, label: 'GPUs', count: favoriteGPUs.length, icon: Monitor },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your saved listings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-current" />
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Saved Listings</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            {totalFavorites === 0 
              ? "You haven't saved any listings yet" 
              : `You have ${totalFavorites} saved listing${totalFavorites !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--brand)] text-white'
                  : 'bg-[var(--card-bg)] text-gray-300 hover:bg-[var(--card-border)] border border-[var(--card-border)]'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              {tab.label}
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20'
                  : 'bg-[var(--card-border)]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {totalFavorites === 0 && (
          <div className="text-center py-12 sm:py-20">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No saved listings yet</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6">Start browsing and save listings you're interested in!</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <Link
                href="/systems"
                className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base"
              >
                Browse Systems
              </Link>
              <Link
                href="/cpus"
                className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 border border-[var(--card-border)] text-sm sm:text-base"
              >
                Browse CPUs
              </Link>
              <Link
                href="/gpus"
                className="bg-[var(--card-bg)] hover:bg-[var(--card-border)] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 border border-[var(--card-border)] text-sm sm:text-base"
              >
                Browse GPUs
              </Link>
            </div>
          </div>
        )}

        {/* Systems */}
        {(activeTab === 'all' || activeTab === 'systems') && favoriteSystems.length > 0 && (
          <div className="mb-8 sm:mb-12">
            {activeTab === 'all' && (
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Computer className="w-5 h-5 sm:w-6 sm:h-6" />
                Systems ({favoriteSystems.length})
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favoriteSystems.map((favorite) => {
                const system = favorite.system;
                if (!system) return null;
                
                const imageUrl = system.image_url || (system.image_urls && system.image_urls[0]);
                
                return (
                  <div
                    key={favorite.id}
                    className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <Link href={`/systems/${system.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--background)]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={system.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Computer className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium ${getConditionColor(system.condition)}`}>
                          {system.condition}
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/systems/${system.id}`}>
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-[var(--brand)] transition-colors">
                          {system.title}
                        </h3>
                      </Link>

                      {/* Specs Preview */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {system.cpu && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {system.cpu}
                          </span>
                        )}
                        {system.gpu && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {system.gpu}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-[var(--brand)]">
                            {formatCurrency(system.price)}
                          </span>
                          {system.original_price && system.original_price > system.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatCurrency(system.original_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {system.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {system.favorite_count || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveSystem(favorite.id)}
                          disabled={removingId === favorite.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Remove from saved"
                        >
                          {removingId === favorite.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CPUs */}
        {(activeTab === 'all' || activeTab === 'cpus') && favoriteCPUs.length > 0 && (
          <div className="mb-8 sm:mb-12">
            {activeTab === 'all' && (
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />
                CPUs ({favoriteCPUs.length})
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favoriteCPUs.map((favorite) => {
                const cpu = favorite.cpu_listing;
                if (!cpu) return null;
                
                const imageUrl = cpu.image_urls && cpu.image_urls[0];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const cpuAny = cpu as any;
                const manufacturer = cpu.cpu_model?.manufacturer?.name || cpuAny.manufacturer;
                
                return (
                  <div
                    key={favorite.id}
                    className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <Link href={`/cpus/${cpu.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--background)]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={cpu.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Cpu className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium ${getConditionColor(cpu.condition)}`}>
                          {cpu.condition}
                        </div>
                        {manufacturer && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium bg-[var(--card-bg)]/90 text-white">
                            {manufacturer}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/cpus/${cpu.id}`}>
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-[var(--brand)] transition-colors">
                          {cpu.title}
                        </h3>
                      </Link>

                      {/* Specs Preview */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(cpu.cpu_model?.cores || cpuAny.cores) && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {cpu.cpu_model?.cores || cpuAny.cores} Cores
                          </span>
                        )}
                        {(cpu.cpu_model?.threads || cpuAny.threads) && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {cpu.cpu_model?.threads || cpuAny.threads} Threads
                          </span>
                        )}
                        {(cpu.cpu_model?.socket || cpuAny.socket) && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {cpu.cpu_model?.socket || cpuAny.socket}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-[var(--brand)]">
                            {formatCurrency(cpu.price)}
                          </span>
                          {cpu.original_price && cpu.original_price > cpu.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatCurrency(cpu.original_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        {cpu.shipping_available && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Shipping
                          </span>
                        )}
                        {cpu.local_pickup && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Pickup
                          </span>
                        )}
                        {cpu.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {cpu.location}
                          </span>
                        )}
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {cpu.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {cpu.favorite_count || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveCPU(favorite.id)}
                          disabled={removingId === favorite.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Remove from saved"
                        >
                          {removingId === favorite.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GPUs */}
        {(activeTab === 'all' || activeTab === 'gpus') && favoriteGPUs.length > 0 && (
          <div className="mb-8 sm:mb-12">
            {activeTab === 'all' && (
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                GPUs ({favoriteGPUs.length})
              </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favoriteGPUs.map((favorite) => {
                const gpu = favorite.gpu_listing;
                if (!gpu) return null;
                
                const imageUrl = gpu.image_urls && gpu.image_urls[0];
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const gpuAny = gpu as any;
                const manufacturer = gpu.gpu_model?.manufacturer?.name || gpuAny.manufacturer;
                
                return (
                  <div
                    key={favorite.id}
                    className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl sm:rounded-2xl overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <Link href={`/gpus/${gpu.id}`}>
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--background)]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={gpu.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Monitor className="w-16 h-16 text-gray-600" />
                          </div>
                        )}
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium ${getConditionColor(gpu.condition)}`}>
                          {gpu.condition}
                        </div>
                        {manufacturer && (
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium bg-[var(--card-bg)]/90 text-white">
                            {manufacturer}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link href={`/gpus/${gpu.id}`}>
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-[var(--brand)] transition-colors">
                          {gpu.title}
                        </h3>
                      </Link>

                      {/* Specs Preview */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(gpu.gpu_model?.memory_size || gpuAny.memory_size) && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {gpu.gpu_model?.memory_size || gpuAny.memory_size}GB VRAM
                          </span>
                        )}
                        {(gpu.gpu_model?.memory_type || gpuAny.memory_type) && (
                          <span className="text-xs bg-[var(--background)] text-gray-400 px-2 py-1 rounded">
                            {gpu.gpu_model?.memory_type || gpuAny.memory_type}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-2xl font-bold text-[var(--brand)]">
                            {formatCurrency(gpu.price)}
                          </span>
                          {gpu.original_price && gpu.original_price > gpu.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatCurrency(gpu.original_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        {gpu.shipping_available && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Shipping
                          </span>
                        )}
                        {gpu.local_pickup && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            Pickup
                          </span>
                        )}
                        {gpu.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {gpu.location}
                          </span>
                        )}
                      </div>

                      {/* Stats & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)]">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {gpu.view_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {gpu.favorite_count || 0}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveGPU(favorite.id)}
                          disabled={removingId === favorite.id}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Remove from saved"
                        >
                          {removingId === favorite.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

