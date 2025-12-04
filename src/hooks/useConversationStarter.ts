'use client';

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Conversation } from '@/lib/chat';

type ListingType = 'system' | 'cpu' | 'gpu';

export function useConversationStarter() {
  const { user } = useAuth();

  const startConversation = useCallback(
    async (listingId: string, sellerId: string, listingType: ListingType): Promise<Conversation | null> => {
      if (!user) {
        throw new Error('You must be signed in to contact sellers.');
      }

      if (user.id === sellerId) {
        return null;
      }

      try {
        let query = supabase
          .from('conversations')
          .select(
            `
              *,
              system:systems(id, title, price, image_url),
              cpu_listing:cpu_listings(id, title, price, image_urls),
              gpu_listing:gpu_listings(id, title, price, image_urls),
              buyer:users!conversations_buyer_id_fkey(id, username, display_name),
              seller:users!conversations_seller_id_fkey(id, username, display_name)
            `,
          )
          .eq('buyer_id', user.id);

        if (listingType === 'system') {
          query = query.eq('system_id', listingId);
        } else if (listingType === 'cpu') {
          query = query.eq('cpu_listing_id', listingId);
        } else {
          query = query.eq('gpu_listing_id', listingId);
        }

        const { data: existingConv } = await query.single();

        if (existingConv) {
          return existingConv as Conversation;
        }

        const payload: Record<string, any> = {
          buyer_id: user.id,
          seller_id: sellerId,
        };

        if (listingType === 'system') {
          payload.system_id = listingId;
        } else if (listingType === 'cpu') {
          payload.cpu_listing_id = listingId;
        } else {
          payload.gpu_listing_id = listingId;
        }

        const { data, error } = await supabase
          .from('conversations')
          .insert(payload)
          .select(
            `
              *,
              system:systems(id, title, price, image_url),
            cpu_listing:cpu_listings(id, title, price, image_urls),
            gpu_listing:gpu_listings(id, title, price, image_urls),
              buyer:users!conversations_buyer_id_fkey(id, username, display_name),
              seller:users!conversations_seller_id_fkey(id, username, display_name)
            `,
          )
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return data as Conversation;
      } catch (err) {
        console.error('Failed to create conversation:', err);
        throw err instanceof Error ? err : new Error('Failed to create conversation');
      }
    },
    [user],
  );

  return { startConversation };
}



