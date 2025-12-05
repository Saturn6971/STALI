'use client';

import { useState } from 'react';
import { CPUListing } from '@/types';
import { Heart, Eye, MapPin, Truck, Package, Star, Calendar, Zap, Thermometer, Cpu, MemoryStick, Clock, Layers } from 'lucide-react';
import { formatCurrency } from '@/utils';
import { useRouter } from 'next/navigation';
import { useComparison } from '@/hooks/useComparison';

interface CPUDetailsProps {
  cpuListing: CPUListing;
}

export function CPUDetails({ cpuListing }: CPUDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const router = useRouter();
  const { addToComparison, comparisonList } = useComparison();

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'like-new':
        return 'bg-blue-100 text-blue-800';
      case 'excellent':
        return 'bg-purple-100 text-purple-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'fair':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality
  };

  const handleAddToComparison = () => {
    const success = addToComparison(cpuListing.id);
    if (success) {
      router.push(`/cpus/compare?ids=${comparisonList.join(',')}`);
    } else if (comparisonList.length >= 4) {
      alert('You can compare up to 4 CPUs at once. Please remove one from your comparison first.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-[var(--card-bg)] rounded-lg overflow-hidden border border-[var(--card-border)]">
            {cpuListing.image_urls && cpuListing.image_urls.length > 0 ? (
              <img
                src={cpuListing.image_urls[selectedImageIndex]}
                alt={cpuListing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-8xl">
                💻
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {cpuListing.image_urls && cpuListing.image_urls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {cpuListing.image_urls.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-[var(--brand)]' : 'border-[var(--card-border)]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${cpuListing.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{cpuListing.title}</h1>
                {cpuListing.cpu_model && (
                  <p className="text-lg text-gray-400 mb-2">
                    {cpuListing.cpu_model.manufacturer?.name} {cpuListing.cpu_model.model_name}
                  </p>
                )}
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(cpuListing.condition)}`}>
                    {cpuListing.condition.replace('-', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>{cpuListing.view_count} views</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  isFavorited ? 'bg-red-100 text-red-600' : 'bg-[var(--card-bg)] text-gray-400 hover:bg-[var(--card-border)]'
                }`}
              >
                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-white">
                  {formatCurrency(cpuListing.price)}
                </span>
                {cpuListing.original_price && cpuListing.original_price > cpuListing.price && (
                  <div className="text-lg text-gray-400">
                    <span className="line-through">{formatCurrency(cpuListing.original_price)}</span>
                    <span className="ml-2 text-green-400 font-medium">
                      Save {formatCurrency(cpuListing.original_price - cpuListing.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications */}
          {cpuListing.cpu_model && (
            <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--card-border)]">
              <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-5 h-5 text-[var(--brand)]" />
                  <div>
                    <div className="text-sm text-gray-400">Cores / Threads</div>
                    <div className="font-medium text-white">{cpuListing.cpu_model.cores} / {cpuListing.cpu_model.threads}</div>
                  </div>
                </div>
                
                {cpuListing.cpu_model.base_clock && (
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Base Clock</div>
                      <div className="font-medium text-white">{cpuListing.cpu_model.base_clock} GHz</div>
                    </div>
                  </div>
                )}

                {cpuListing.cpu_model.boost_clock && (
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Boost Clock</div>
                      <div className="font-medium text-white">{cpuListing.cpu_model.boost_clock} GHz</div>
                    </div>
                  </div>
                )}

                {cpuListing.cpu_model.tdp && (
                  <div className="flex items-center space-x-3">
                    <Thermometer className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">TDP</div>
                      <div className="font-medium text-white">{cpuListing.cpu_model.tdp}W</div>
                    </div>
                  </div>
                )}

                {cpuListing.cpu_model.socket && (
                  <div className="flex items-center space-x-3">
                    <Cpu className="w-5 h-5 text-[var(--brand)]" />
                    <div>
                      <div className="text-sm text-gray-400">Socket</div>
                      <div className="font-medium text-white">{cpuListing.cpu_model.socket}</div>
                    </div>
                  </div>
                )}

                {cpuListing.cpu_model.cache_l3 && (
                  <div className="flex items-center space-x-3">
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Additional Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cpuListing.purchase_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Purchase Date</div>
                    <div className="font-medium text-white">{new Date(cpuListing.purchase_date).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {cpuListing.warranty_remaining_months && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Warranty Remaining</div>
                    <div className="font-medium text-white">{cpuListing.warranty_remaining_months} months</div>
                  </div>
                </div>
              )}

              {cpuListing.overclocked && (
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Overclocked</div>
                    <div className="font-medium text-white">
                      {cpuListing.max_overclock ? `Up to ${cpuListing.max_overclock} GHz` : 'Yes'}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Original Box</div>
                  <div className="font-medium text-white">{cpuListing.original_box ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Original Manual</div>
                  <div className="font-medium text-white">{cpuListing.original_manual ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Thermometer className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Cooling Included</div>
                  <div className="font-medium text-white">{cpuListing.cooling_included ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Shipping */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Location & Shipping</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cpuListing.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Location</div>
                    <div className="font-medium text-white">{cpuListing.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Shipping</div>
                  <div className="font-medium text-white">{cpuListing.shipping_available ? 'Available' : 'Not Available'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-400">Local Pickup</div>
                  <div className="font-medium text-white">{cpuListing.local_pickup ? 'Available' : 'Not Available'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller */}
          {cpuListing.seller && (
            <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--card-border)]">
              <h2 className="text-xl font-semibold text-white mb-4">Seller Information</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[var(--card-border)] rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {cpuListing.seller.display_name?.charAt(0) || cpuListing.seller.username.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {cpuListing.seller.display_name || cpuListing.seller.username}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{cpuListing.seller.rating.toFixed(1)}</span>
                    <span>({cpuListing.seller.review_count} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {cpuListing.description && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{cpuListing.description}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-[var(--brand)] text-white py-3 px-6 rounded-lg font-medium hover:bg-[var(--brand-light)] transition-colors">
              Contact Seller
            </button>
            <button className="flex-1 bg-[var(--card-bg)] text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-[var(--card-border)] transition-colors border border-[var(--card-border)]" onClick={handleAddToComparison}>
              Add to Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


