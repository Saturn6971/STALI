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
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6 text-center">
        <p className="text-gray-400">No systems selected for comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--background)] px-6 py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            System Comparison ({systems.length} items)
          </h2>
          <button
            onClick={onClear}
            className="flex items-center space-x-2 px-3 py-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Specification</th>
              {systems.map((system) => (
                <th key={system.id} className="px-4 py-3 text-center text-sm font-medium text-gray-400 relative">
                  <button
                    onClick={() => onRemove(system.id)}
                    className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="pr-6">
                    <div className="font-medium text-white truncate">{system.title}</div>
                    <div className="text-xs text-gray-500">
                      {system.category?.name || 'N/A'}
                    </div>
                    <Link 
                      href={`/systems/${system.id}`}
                      className="inline-flex items-center space-x-1 text-xs text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors mt-1"
                    >
                      <span>View Details</span>
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
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Price</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
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
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Condition</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(system.condition)}`}>
                    {system.condition.replace('-', ' ')}
                  </span>
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Category</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.category?.name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* CPU */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">CPU</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.cpu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* GPU */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">GPU</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.gpu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* RAM */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">RAM</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.ram || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Storage */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Storage</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.storage || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Motherboard */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Motherboard</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.motherboard || 'N/A'}
                </td>
              ))}
            </tr>

            {/* PSU */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">PSU</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.psu || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Case */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Case</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.case_model || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Cooling */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Cooling</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {system.cooling || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Seller */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Seller</td>
              {systems.map((system) => (
                <td key={system.id} className="px-4 py-3 text-center text-sm text-gray-300">
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

