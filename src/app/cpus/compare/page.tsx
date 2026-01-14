'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { CPUComparison } from '@/components/ui/CPUComparison';
import { useCPUFiltered } from '@/hooks/useCPUs';
import { CPUListing, supabase } from '@/lib/supabase';

function CPUCompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [comparisonCPUs, setComparisonCPUs] = useState<CPUListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get comparison IDs from URL parameters
    const ids = searchParams.get('ids')?.split(',') || [];
    setComparisonIds(ids);
    
    if (ids.length > 0) {
      fetchComparisonCPUs(ids);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchComparisonCPUs = async (ids: string[]) => {
    try {
      setLoading(true);
      // Fetch CPU listings for comparison
      const { data, error } = await supabase
        .from('cpu_listings')
        .select(`
          *,
          cpu_model:cpu_models(
            *,
            manufacturer:cpu_manufacturers(*)
          ),
          seller:users(*)
        `)
        .in('id', ids)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching comparison CPUs:', error);
        return;
      }

      setComparisonCPUs(data || []);
    } catch (err) {
      console.error('Failed to fetch comparison CPUs:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = (cpuId: string) => {
    const newIds = comparisonIds.filter(id => id !== cpuId);
    setComparisonIds(newIds);
    setComparisonCPUs(comparisonCPUs.filter(cpu => cpu.id !== cpuId));
    
    // Update URL
    if (newIds.length > 0) {
      router.push(`/cpus/compare?ids=${newIds.join(',')}`);
    } else {
      router.push('/cpus');
    }
  };

  const clearComparison = () => {
    setComparisonIds([]);
    setComparisonCPUs([]);
    router.push('/cpus');
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

  if (comparisonCPUs.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        {/* Navigation */}
        <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
                  <span className="text-white text-base sm:text-lg">🐺</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
                  Stali
                </h1>
              </Link>
              <Link href="/cpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">← Back to CPUs</span>
                <span className="sm:hidden">← CPUs</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">CPU Comparison</h1>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">No CPUs selected for comparison</p>
            <Link
              href="/cpus"
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm sm:text-base"
            >
              Browse CPUs
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
                <span className="text-white text-base sm:text-lg">🐺</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
                Stali
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/cpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">← Back to CPUs</span>
                <span className="sm:hidden">← CPUs</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">CPU Comparison</h1>
          <p className="text-gray-400 text-sm sm:text-base">Compare {comparisonCPUs.length} CPUs side by side</p>
        </div>

        <CPUComparison 
          cpuListings={comparisonCPUs}
          onRemove={removeFromComparison}
          onClear={clearComparison}
        />
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-12 py-6 sm:py-8 border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-3 md:mb-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm">🐺</span>
            </div>
            <span className="text-base sm:text-lg font-bold">Stali</span>
          </div>
          <div className="text-gray-400 text-xs sm:text-sm text-center">
            © 2026 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CPUComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading comparison...</p>
        </div>
      </div>
    }>
      <CPUCompareContent />
    </Suspense>
  );
}
