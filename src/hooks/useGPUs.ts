'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface GPUManufacturer {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  founded_year?: number;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface GPUModel {
  id: string;
  manufacturer_id: string;
  model_name: string;
  series?: string;
  generation?: string;
  architecture?: string;
  memory_type?: string;
  memory_size?: number;
  memory_bus_width?: number;
  base_clock?: number;
  boost_clock?: number;
  memory_clock?: number;
  cuda_cores?: number;
  stream_processors?: number;
  ray_tracing_cores?: number;
  tensor_cores?: number;
  tdp?: number;
  pcie_version?: string;
  display_outputs?: string[];
  vr_ready?: boolean;
  release_date?: string;
  msrp?: number;
  features?: string[];
  image_url?: string;
  specifications_url?: string;
  created_at: string;
  updated_at: string;
  manufacturer?: GPUManufacturer;
}

export interface GPUListing {
  id: string;
  gpu_model_id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  condition: 'new' | 'like-new' | 'excellent' | 'good' | 'fair';
  status: 'active' | 'sold' | 'pending' | 'draft';
  purchase_date?: string;
  warranty_remaining_months?: number;
  overclocked?: boolean;
  max_overclock?: number;
  cooling_included?: boolean;
  original_box?: boolean;
  original_manual?: boolean;
  image_urls?: string[];
  view_count?: number;
  favorite_count?: number;
  location?: string;
  shipping_available?: boolean;
  local_pickup?: boolean;
  created_at: string;
  updated_at: string;
  gpu_model?: GPUModel;
  seller?: {
    id: string;
    username: string;
    display_name?: string;
    rating?: number;
    review_count?: number;
  };
}

export interface GPUFilters {
  manufacturers: string[];
  memorySizes: number[];
  priceRange: [number, number];
  condition: string[];
  search: string;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'popularity';
}

export const useGPUManufacturers = () => {
  const [manufacturers, setManufacturers] = useState<GPUManufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('gpu_manufacturers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching GPU manufacturers:', error);
        setError(error.message);
        return;
      }

      setManufacturers(data || []);
    } catch (err) {
      console.error('Failed to fetch GPU manufacturers:', err);
      setError('Failed to fetch GPU manufacturers');
    } finally {
      setLoading(false);
    }
  };

  return { manufacturers, loading, error, refetch: fetchManufacturers };
};

export const useGPUModels = () => {
  const [gpuModels, setGpuModels] = useState<GPUModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGPUModels();
  }, []);

  const fetchGPUModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('gpu_models')
        .select(`
          *,
          manufacturer:gpu_manufacturers(*)
        `)
        .order('model_name');

      if (error) {
        console.error('Error fetching GPU models:', error);
        setError(error.message);
        return;
      }

      setGpuModels(data || []);
    } catch (err) {
      console.error('Failed to fetch GPU models:', err);
      setError('Failed to fetch GPU models');
    } finally {
      setLoading(false);
    }
  };

  return { gpuModels, loading, error, refetch: fetchGPUModels };
};

export const useGPUFiltered = (filters: GPUFilters) => {
  const [gpuListings, setGpuListings] = useState<GPUListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilteredGPUs();
  }, [filters]);

  const fetchFilteredGPUs = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('gpu_listings')
        .select(`
          *,
          gpu_model:gpu_models(
            *,
            manufacturer:gpu_manufacturers(*)
          ),
          seller:users(id, username, display_name, rating, review_count)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.manufacturers.length > 0) {
        query = query.in('gpu_model.manufacturer.name', filters.manufacturers);
      }

      if (filters.memorySizes.length > 0) {
        query = query.in('gpu_model.memory_size', filters.memorySizes);
      }

      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
        query = query.gte('price', filters.priceRange[0]);
        query = query.lte('price', filters.priceRange[1]);
      }

      if (filters.condition.length > 0) {
        query = query.in('condition', filters.condition);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,gpu_model.model_name.ilike.%${filters.search}%`);
      }

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

      if (error) {
        console.error('Error fetching filtered GPUs:', error);
        setError(error.message);
        return;
      }

      setGpuListings(data || []);
    } catch (err) {
      console.error('Failed to fetch filtered GPUs:', err);
      setError('Failed to fetch GPUs');
    } finally {
      setLoading(false);
    }
  };

  return { gpuListings, loading, error, refetch: fetchFilteredGPUs };
};

export const useGPUs = () => {
  const [gpuListings, setGpuListings] = useState<GPUListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGPUs();
  }, []);

  const fetchGPUs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('gpu_listings')
        .select(`
          *,
          gpu_model:gpu_models(
            *,
            manufacturer:gpu_manufacturers(*)
          ),
          seller:users(id, username, display_name, rating, review_count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching GPUs:', error);
        setError(error.message);
        return;
      }

      setGpuListings(data || []);
    } catch (err) {
      console.error('Failed to fetch GPUs:', err);
      setError('Failed to fetch GPUs');
    } finally {
      setLoading(false);
    }
  };

  return { gpuListings, loading, error, refetch: fetchGPUs };
};

