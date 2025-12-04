import { useState, useEffect } from 'react';
import { supabase, System } from '@/lib/supabase';

export function useSystems() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('systems')
        .select(`
          *,
          category:categories(*),
          seller:users(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSystems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch systems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  return {
    systems,
    loading,
    error,
    refetch: fetchSystems
  };
}

