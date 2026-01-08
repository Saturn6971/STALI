import { useState, useEffect } from 'react';
import { supabase, CPUListing, CPUModel, CPUManufacturer } from '@/lib/supabase';

export function useCPUs() {
  const [cpuListings, setCpuListings] = useState<CPUListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCPUs = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCpuListings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CPUs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCPUs();
  }, []);

  return {
    cpuListings,
    loading,
    error,
    refetch: fetchCPUs
  };
}

export function useCPUModels() {
  const [cpuModels, setCpuModels] = useState<CPUModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCPUModels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('cpu_models')
        .select(`
          *,
          manufacturer:cpu_manufacturers(*)
        `)
        .order('model_name', { ascending: true });

      if (error) throw error;
      setCpuModels(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CPU models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCPUModels();
  }, []);

  return {
    cpuModels,
    loading,
    error,
    refetch: fetchCPUModels
  };
}

export function useCPUManufacturers() {
  const [manufacturers, setManufacturers] = useState<CPUManufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('cpu_manufacturers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setManufacturers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch manufacturers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  return {
    manufacturers,
    loading,
    error,
    refetch: fetchManufacturers
  };
}

export function useCPUDetails(id: string) {
  const [cpuListing, setCpuListing] = useState<CPUListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCPUDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
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
        .eq('id', id)
        .single();

      if (error) throw error;
      setCpuListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CPU details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCPUDetails();
  }, [id]);

  return {
    cpuListing,
    loading,
    error,
    refetch: fetchCPUDetails
  };
}

export function useCPUFiltered(filters: {
  manufacturers?: string[];
  sockets?: string[];
  cores?: number[];
  priceRange?: [number, number];
  condition?: string[];
  search?: string;
  sortBy?: string;
}) {
  const [cpuListings, setCpuListings] = useState<CPUListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFilteredCPUs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('cpu_listings')
        .select(`
          *,
          cpu_model:cpu_models(
            *,
            manufacturer:cpu_manufacturers(*)
          ),
          seller:users(*)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.manufacturers && filters.manufacturers.length > 0) {
        query = query.in('cpu_model.manufacturer.name', filters.manufacturers);
      }

      if (filters.sockets && filters.sockets.length > 0) {
        query = query.in('cpu_model.socket', filters.sockets);
      }

      if (filters.cores && filters.cores.length > 0) {
        query = query.in('cpu_model.cores', filters.cores);
      }

      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      if (filters.condition && filters.condition.length > 0) {
        query = query.in('condition', filters.condition);
      }

      // Note: search is applied client-side to support nested relation filtering

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'popularity':
          query = query.order('view_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply client-side filtering for manufacturer and search (Supabase can't filter on nested relations)
      let filteredData = data || [];

      // Filter by manufacturer
      if (filters.manufacturers && filters.manufacturers.length > 0) {
        filteredData = filteredData.filter((cpu) => {
          const name = cpu.cpu_model?.manufacturer?.name?.toLowerCase() || '';
          return filters.manufacturers!.some((m) => name.includes(m.toLowerCase()));
        });
      }

      // Filter by search term (searches title, description, and model name)
      if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase().trim();
        filteredData = filteredData.filter((cpu) => {
          const title = (cpu.title || '').toLowerCase();
          const description = (cpu.description || '').toLowerCase();
          const modelName = (cpu.cpu_model?.model_name || '').toLowerCase();
          const manufacturerName = (cpu.cpu_model?.manufacturer?.name || '').toLowerCase();
          return (
            title.includes(searchLower) ||
            description.includes(searchLower) ||
            modelName.includes(searchLower) ||
            manufacturerName.includes(searchLower)
          );
        });
      }

      setCpuListings(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filtered CPUs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredCPUs();
  }, [filters]);

  return {
    cpuListings,
    loading,
    error,
    refetch: fetchFilteredCPUs
  };
}


