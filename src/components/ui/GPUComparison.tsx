'use client';

import { GPUComparisonProps, GPUListing } from '@/types';
import { X, Trash2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/utils';
import Link from 'next/link';

export function GPUComparison({ gpuListings, onRemove, onClear }: GPUComparisonProps) {

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

  if (gpuListings.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-4 sm:p-6 text-center">
        <p className="text-gray-400 text-sm sm:text-base">No GPUs selected for comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--background)] px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-white">
            GPU Comparison ({gpuListings.length} items)
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
              {gpuListings.map((gpu) => (
                <th key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-400 relative min-w-[140px] sm:min-w-[180px]">
                  <button
                    onClick={() => onRemove(gpu.id)}
                    className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="pr-5 sm:pr-6">
                    <div className="font-medium text-white truncate text-xs sm:text-sm">{gpu.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {gpu.gpu_model?.manufacturer?.name} {gpu.gpu_model?.model_name}
                    </div>
                    <Link 
                      href={`/gpus/${gpu.id}`}
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
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  <div className="font-semibold text-green-400">{formatCurrency(gpu.price)}</div>
                  {gpu.original_price && gpu.original_price > gpu.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatCurrency(gpu.original_price)}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Condition */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Condition</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(gpu.condition)}`}>
                    {gpu.condition.replace('-', ' ')}
                  </span>
                </td>
              ))}
            </tr>

            {/* Manufacturer */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Manufacturer</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.manufacturer?.name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Model */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Model</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.model_name || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Series */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Series</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.series || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Generation */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Generation</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.generation || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Architecture */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Architecture</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.architecture || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Memory Size */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Memory Size</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.memory_size ? `${gpu.gpu_model.memory_size} GB` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Memory Type */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Memory Type</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.memory_type || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Memory Bus Width */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Memory Bus Width</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.memory_bus_width ? `${gpu.gpu_model.memory_bus_width} bit` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Base Clock */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Base Clock</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.base_clock ? `${gpu.gpu_model.base_clock} MHz` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Boost Clock */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Boost Clock</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.boost_clock ? `${gpu.gpu_model.boost_clock} MHz` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Memory Clock */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Memory Clock</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.memory_clock ? `${gpu.gpu_model.memory_clock} MHz` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* CUDA Cores / Stream Processors */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">CUDA Cores / Stream Processors</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.cuda_cores || gpu.gpu_model?.stream_processors || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Ray Tracing Cores */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Ray Tracing Cores</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.ray_tracing_cores || 'N/A'}
                </td>
              ))}
            </tr>

            {/* Tensor Cores */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Tensor Cores</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.tensor_cores || 'N/A'}
                </td>
              ))}
            </tr>

            {/* TDP */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">TDP</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.tdp ? `${gpu.gpu_model.tdp}W` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* PCIe Version */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">PCIe Version</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.pcie_version || 'N/A'}
                </td>
              ))}
            </tr>

            {/* VR Ready */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">VR Ready</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.vr_ready ? 'Yes' : 'No'}
                </td>
              ))}
            </tr>

            {/* Release Date */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Release Date</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.release_date ? new Date(gpu.gpu_model.release_date).toLocaleDateString() : 'N/A'}
                </td>
              ))}
            </tr>

            {/* MSRP */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">MSRP</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  {gpu.gpu_model?.msrp ? formatCurrency(gpu.gpu_model.msrp) : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Seller */}
            <tr>
              <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 sticky left-0 bg-[var(--card-bg)] z-10">Seller</td>
              {gpuListings.map((gpu) => (
                <td key={gpu.id} className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-gray-300">
                  <div>
                    <div>{gpu.seller?.display_name || gpu.seller?.username || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      ★ {gpu.seller?.rating?.toFixed(1) || '0.0'} ({gpu.seller?.review_count || 0})
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
