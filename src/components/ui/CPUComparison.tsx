'use client';

import { CPUComparisonProps } from '@/types';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/utils';
import Link from 'next/link';

export function CPUComparison({ cpuListings, onRemove, onClear }: CPUComparisonProps) {

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'text-green-400 bg-green-400/20';
      case 'like-new':
        return 'text-blue-400 bg-blue-400/20';
      case 'excellent':
        return 'text-purple-400 bg-purple-400/20';
      case 'good':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'fair':
        return 'text-orange-400 bg-orange-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (cpuListings.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-6 text-center">
        <p className="text-gray-400">No CPUs selected for comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--background)] px-6 py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            CPU Comparison ({cpuListings.length} items)
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
              {cpuListings.map((cpu) => (
                <th key={cpu.id} className="px-4 py-3 text-center text-sm font-medium text-gray-400 relative">
                  <button
                    onClick={() => onRemove(cpu.id)}
                    className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="pr-6">
                    <div className="font-medium text-white truncate">{cpu.title}</div>
                    <div className="text-xs text-gray-500">
                      {cpu.cpu_model?.manufacturer?.name} {cpu.cpu_model?.model_name}
                    </div>
                    <Link 
                      href={`/cpus/${cpu.id}`}
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
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  <div className="font-semibold text-green-400">{formatCurrency(cpu.price)}</div>
                  {cpu.original_price && cpu.original_price > cpu.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatCurrency(cpu.original_price)}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Condition */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Condition</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(cpu.condition)}`}>
                    {cpu.condition.replace('-', ' ')}
                  </span>
                </td>
              ))}
            </tr>

            {/* Manufacturer */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Manufacturer</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.manufacturer?.name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Model */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Model</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.model_name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Series */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Series</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.series || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Generation */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Generation</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.generation || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Socket */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Socket</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.socket || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Cores */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Cores</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.cores || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Threads */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Threads</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.threads || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Base Clock */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Base Clock</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.base_clock ? `${cpu.cpu_model.base_clock} GHz` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Boost Clock */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Boost Clock</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.boost_clock ? `${cpu.cpu_model.boost_clock} GHz` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* TDP */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">TDP</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.tdp ? `${cpu.cpu_model.tdp}W` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* L3 Cache */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">L3 Cache</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.cache_l3 ? `${cpu.cpu_model.cache_l3} MB` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Memory Support */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Memory Support</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.memory_support || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Integrated Graphics */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Integrated Graphics</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.integrated_graphics ? 'Yes' : 'No'}
                </td>
              ))}
            </tr>

            {/* Release Date */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Release Date</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.release_date ? new Date(cpu.cpu_model.release_date).toLocaleDateString() : 'N/A'}
                </td>
              ))}
            </tr>

            {/* MSRP */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">MSRP</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  {cpu.cpu_model?.msrp ? formatCurrency(cpu.cpu_model.msrp) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Seller */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-300">Seller</td>
              {cpuListings.map((cpu) => (
                <td key={cpu.id} className="px-4 py-3 text-center text-sm text-gray-300">
                  <div>
                    <div>{cpu.seller?.display_name || cpu.seller?.username || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      ★ {cpu.seller?.rating?.toFixed(1) || '0.0'} ({cpu.seller?.review_count || 0})
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


