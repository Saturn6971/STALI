'use client';

import { SystemComparisonProps } from '@/types';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/utils';
import Link from 'next/link';

export function SystemComparison({ systems, onRemove, onClear }: SystemComparisonProps) {

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'like-new':
        return 'text-green-400 bg-green-400/20';
      case 'excellent':
        return 'text-blue-400 bg-blue-400/20';
      case 'good':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'fair':
        return 'text-orange-400 bg-orange-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (systems.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-4 sm:p-6 text-center">
        <p className="text-gray-400 text-sm sm:text-base">No systems selected for comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--background)] px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            System Comparison ({systems.length} items)
          </h2>
          <button
            onClick={onClear}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 text-red-400 hover:text-red-300 transition-colors text-sm"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>
        {/* Mobile scroll hint */}
        <p className="text-xs text-gray-500 mt-2 sm:hidden">Swipe left/right to compare</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-400 sticky left-0 bg-[var(--background)] z-10">Specification</th>
              {systems.map((system) => (
                <th key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-400 relative min-w-[140px] sm:min-w-[180px]">
                  <button
                    onClick={() => onRemove(system.id)}
                    className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="pr-5 sm:pr-6">
                    <div className="font-medium text-white truncate text-xs sm:text-sm">{system.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {system.category?.name || 'N/A'}
                    </div>
                    <Link 
                      href={`/systems/${system.id}`}
                      className="inline-flex items-center space-x-1 text-xs text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors mt-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)]">
            {/* Price */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Price</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  <div className="font-semibold text-green-400">{formatCurrency(system.price)}</div>
                  {system.original_price && system.original_price > system.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatCurrency(system.original_price)}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Condition */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Condition</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(system.condition)}`}>
                    {system.condition.replace('-', ' ')}
                  </span>
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Category</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.category?.name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* CPU */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">CPU</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.cpu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* GPU */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">GPU</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.gpu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* RAM */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">RAM</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.ram || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Storage */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Storage</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.storage || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Motherboard */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Motherboard</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.motherboard || 'N/A'}
                </td>
              ))}
            </tr>

            {/* PSU */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">PSU</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.psu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Case */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Case</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.case_model || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Cooling */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Cooling</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {system.cooling || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Seller */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Seller</td>
              {systems.map((system) => (
                <td key={system.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  <div>
                    <div>{system.seller?.display_name || system.seller?.username || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      ★ {system.seller?.rating?.toFixed(1) || '0.0'} ({system.seller?.review_count || 0})
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

