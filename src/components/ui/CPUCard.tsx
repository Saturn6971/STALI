'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CPUCardProps } from '@/types';
import { Heart, Eye, MapPin, Truck, Package } from 'lucide-react';
import { formatCurrency } from '@/utils';

export function CPUCard({ cpuListing, onHover, isHovered }: CPUCardProps) {
  const [imageError, setImageError] = useState(false);

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

  const handleMouseEnter = () => {
    onHover?.(cpuListing.id);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isHovered ? 'scale-105 shadow-2xl' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/cpus/${cpuListing.id}`}>
        <div className="relative">
          {/* Image */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            {cpuListing.image_urls && cpuListing.image_urls.length > 0 && !imageError ? (
              <img
                src={cpuListing.image_urls[0]}
                alt={cpuListing.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="text-gray-400 text-6xl">💻</div>
            )}
          </div>

          {/* Condition Badge */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(cpuListing.condition)}`}>
              {cpuListing.condition.replace('-', ' ')}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // TODO: Implement favorite functionality
            }}
          >
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {cpuListing.title}
          </h3>

          {/* CPU Model */}
          {cpuListing.cpu_model && (
            <p className="text-sm text-gray-600 mb-2">
              {cpuListing.cpu_model.manufacturer?.name} {cpuListing.cpu_model.model_name}
            </p>
          )}

          {/* Specifications */}
          {cpuListing.cpu_model && (
            <div className="text-xs text-gray-500 mb-3 space-y-1">
              <div className="flex justify-between">
                <span>Cores:</span>
                <span>{cpuListing.cpu_model.cores}</span>
              </div>
              <div className="flex justify-between">
                <span>Threads:</span>
                <span>{cpuListing.cpu_model.threads}</span>
              </div>
              {cpuListing.cpu_model.base_clock && (
                <div className="flex justify-between">
                  <span>Base Clock:</span>
                  <span>{cpuListing.cpu_model.base_clock} GHz</span>
                </div>
              )}
              {cpuListing.cpu_model.socket && (
                <div className="flex justify-between">
                  <span>Socket:</span>
                  <span>{cpuListing.cpu_model.socket}</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(cpuListing.price)}
              </span>
              {cpuListing.original_price && cpuListing.original_price > cpuListing.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatCurrency(cpuListing.original_price)}
                </span>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{cpuListing.view_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{cpuListing.favorite_count}</span>
            </div>
          </div>

          {/* Location & Shipping */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {cpuListing.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{cpuListing.location}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {cpuListing.shipping_available && (
                <div className="flex items-center space-x-1">
                  <Truck className="w-3 h-3" />
                  <span>Ship</span>
                </div>
              )}
              {cpuListing.local_pickup && (
                <div className="flex items-center space-x-1">
                  <Package className="w-3 h-3" />
                  <span>Pickup</span>
                </div>
              )}
            </div>
          </div>

          {/* Seller */}
          {cpuListing.seller && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {cpuListing.seller.display_name?.charAt(0) || cpuListing.seller.username.charAt(0)}
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {cpuListing.seller.display_name || cpuListing.seller.username}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-yellow-500">★</span>
                  <span className="text-xs text-gray-500">
                    {cpuListing.seller.rating.toFixed(1)} ({cpuListing.seller.review_count})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}


