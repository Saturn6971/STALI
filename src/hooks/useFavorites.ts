'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { System, CPUListing, GPUListing } from '@/types';
import { useAuth } from '@/lib/auth';

export interface FavoriteSystem {
  id: string;
  user_id: string;
  system_id: string;
  created_at: string;
  system?: System;
}

export interface FavoriteCPU {
  id: string;
  user_id: string;
  cpu_listing_id: string;
  created_at: string;
  cpu_listing?: CPUListing & {
    manufacturer?: string;
    model?: string;
    cores?: number;
    threads?: number;
    socket?: string;
  };
}

export interface FavoriteGPU {
  id: string;
  user_id: string;
  gpu_listing_id: string;
  created_at: string;
  gpu_listing?: GPUListing & {
    manufacturer?: string;
    model?: string;
    memory_size?: number;
    memory_type?: string;
  };
}

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteSystems, setFavoriteSystems] = useState<FavoriteSystem[]>([]);
  const [favoriteCPUs, setFavoriteCPUs] = useState<FavoriteCPU[]>([]);
  const [favoriteGPUs, setFavoriteGPUs] = useState<FavoriteGPU[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteSystems([]);
      setFavoriteCPUs([]);
      setFavoriteGPUs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all favorites in parallel
      const [systemsResult, cpusResult, gpusResult] = await Promise.all([
        // Fetch system favorites
        supabase
          .from('favorites')
          .select(`
            id,
            user_id,
            system_id,
            created_at,
            system:systems(
              *,
              category:categories(*),
              seller:users(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        // Fetch CPU favorites
        supabase
          .from('cpu_favorites')
          .select(`
            id,
            user_id,
            cpu_listing_id,
            created_at,
            cpu_listing:cpu_listings(
              *,
              cpu_model:cpu_models(
                *,
                manufacturer:cpu_manufacturers(*)
              ),
              seller:users(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        // Fetch GPU favorites
        supabase
          .from('gpu_favorites')
          .select(`
            id,
            user_id,
            gpu_listing_id,
            created_at,
            gpu_listing:gpu_listings(
              *,
              gpu_model:gpu_models(
                *,
                manufacturer:gpu_manufacturers(*)
              ),
              seller:users(*)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (systemsResult.error) throw systemsResult.error;
      if (cpusResult.error) throw cpusResult.error;
      if (gpusResult.error) throw gpusResult.error;

      // Filter out favorites where the listing no longer exists or is not active
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validSystems = (systemsResult.data || []).filter((fav: any) => 
        fav.system && fav.system.status === 'active'
      ) as unknown as FavoriteSystem[];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validCPUs = (cpusResult.data || []).filter((fav: any) => 
        fav.cpu_listing && fav.cpu_listing.status === 'active'
      ) as unknown as FavoriteCPU[];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validGPUs = (gpusResult.data || []).filter((fav: any) => 
        fav.gpu_listing && fav.gpu_listing.status === 'active'
      ) as unknown as FavoriteGPU[];

      setFavoriteSystems(validSystems);
      setFavoriteCPUs(validCPUs);
      setFavoriteGPUs(validGPUs);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeSystemFavorite = async (favoriteId: string) => {
    if (!user) return false;

    try {
      const favorite = favoriteSystems.find(f => f.id === favoriteId);
      if (!favorite) return false;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      // Update favorite count on the system
      if (favorite.system) {
        await supabase
          .from('systems')
          .update({ favorite_count: Math.max(0, (favorite.system.favorite_count || 0) - 1) })
          .eq('id', favorite.system_id);
      }

      setFavoriteSystems(prev => prev.filter(f => f.id !== favoriteId));
      return true;
    } catch (err) {
      console.error('Error removing system favorite:', err);
      return false;
    }
  };

  const removeCPUFavorite = async (favoriteId: string) => {
    if (!user) return false;

    try {
      const favorite = favoriteCPUs.find(f => f.id === favoriteId);
      if (!favorite) return false;

      const { error } = await supabase
        .from('cpu_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      // Update favorite count on the CPU listing
      if (favorite.cpu_listing) {
        await supabase
          .from('cpu_listings')
          .update({ favorite_count: Math.max(0, (favorite.cpu_listing.favorite_count || 0) - 1) })
          .eq('id', favorite.cpu_listing_id);
      }

      setFavoriteCPUs(prev => prev.filter(f => f.id !== favoriteId));
      return true;
    } catch (err) {
      console.error('Error removing CPU favorite:', err);
      return false;
    }
  };

  const removeGPUFavorite = async (favoriteId: string) => {
    if (!user) return false;

    try {
      const favorite = favoriteGPUs.find(f => f.id === favoriteId);
      if (!favorite) return false;

      const { error } = await supabase
        .from('gpu_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      // Update favorite count on the GPU listing
      if (favorite.gpu_listing) {
        await supabase
          .from('gpu_listings')
          .update({ favorite_count: Math.max(0, (favorite.gpu_listing.favorite_count || 0) - 1) })
          .eq('id', favorite.gpu_listing_id);
      }

      setFavoriteGPUs(prev => prev.filter(f => f.id !== favoriteId));
      return true;
    } catch (err) {
      console.error('Error removing GPU favorite:', err);
      return false;
    }
  };

  const isSystemFavorited = (systemId: string) => {
    return favoriteSystems.some(f => f.system_id === systemId);
  };

  const isCPUFavorited = (cpuListingId: string) => {
    return favoriteCPUs.some(f => f.cpu_listing_id === cpuListingId);
  };

  const isGPUFavorited = (gpuListingId: string) => {
    return favoriteGPUs.some(f => f.gpu_listing_id === gpuListingId);
  };

  const totalFavorites = favoriteSystems.length + favoriteCPUs.length + favoriteGPUs.length;

  return {
    favoriteSystems,
    favoriteCPUs,
    favoriteGPUs,
    loading,
    error,
    totalFavorites,
    refetch: fetchFavorites,
    removeSystemFavorite,
    removeCPUFavorite,
    removeGPUFavorite,
    isSystemFavorited,
    isCPUFavorited,
    isGPUFavorited,
  };
}
