'use client';

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Conversation } from '@/lib/chat';

export function useConversationStarter() {
  const { user } = useAuth();

  const startConversation = useCallback(
    async (systemId: string, sellerId: string): Promise<Conversation | null> => {
      if (!user) {
        throw new Error('You must be signed in to contact sellers.');
      }

      if (user.id === sellerId) {
        return null;
      }

      try {
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('*')
          .eq('system_id', systemId)
          .eq('buyer_id', user.id)
          .single();

        if (existingConv) {
          return existingConv as Conversation;
        }

        const { data, error } = await supabase
          .from('conversations')
          .insert({
            system_id: systemId,
            buyer_id: user.id,
            seller_id: sellerId,
          })
          .select(
            `
              *,
              system:systems(id, title, price, image_url),
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



