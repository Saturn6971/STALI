'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { GPUComparison } from '@/components/ui/GPUComparison';
import { supabase, GPUListing } from '@/lib/supabase';

export default function GPUComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonGPUs, setComparisonGPUs] = useState<GPUListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get comparison IDs from URL parameters
    const ids = searchParams.get('ids')?.split(',') || [];
    setComparisonIds(ids);
    
    if (ids.length > 0) {
      fetchComparisonGPUs(ids);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchComparisonGPUs = async (ids: string[]) => {
    try {
      setLoading(true);
      // Fetch GPU listings for comparison
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
        .in('id', ids)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching comparison GPUs:', error);
        return;
      }

      setComparisonGPUs(data || []);
    } catch (err) {
      console.error('Failed to fetch comparison GPUs:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (gpuId: string) => {
    const newIds = comparisonIds.filter(id => id !== gpuId);
    setComparisonIds(newIds);
    setComparisonGPUs(comparisonGPUs.filter(gpu => gpu.id !== gpuId));
    
    // Update URL
    if (newIds.length > 0) {
      router.push(`/gpus/compare?ids=${newIds.join(',')}`);
    } else {
      router.push('/gpus');
    }
  };

  const clearComparison = () => {
    setComparisonIds([]);
    setComparisonGPUs([]);
    router.push('/gpus');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (comparisonGPUs.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
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
              <Link href="/gpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to GPUs
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">GPU Comparison</h1>
            <p className="text-gray-400 mb-8">No GPUs selected for comparison</p>
            <Link
              href="/gpus"
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              Browse GPUs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">GPU Comparison</h1>
          <p className="text-gray-400">Compare {comparisonGPUs.length} GPUs side by side</p>
        </div>

        <GPUComparison 
          gpuListings={comparisonGPUs}
          onRemove={removeFromComparison}
          onClear={clearComparison}
        />
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
            © 2024 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}
