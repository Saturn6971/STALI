'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    username: string;
    display_name: string;
  };
}

export interface Conversation {
  id: string;
  system_id: string | null;
  cpu_listing_id: string | null;
  gpu_listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  system?: {
    id: string;
    title: string;
    price: number;
    image_url?: string;
  };
  buyer?: {
    id: string;
    username: string;
    display_name: string;
  };
  cpu_listing?: {
    id: string;
    title: string;
    price: number;
    image_urls?: string[] | null;
  };
  gpu_listing?: {
    id: string;
    title: string;
    price: number;
    image_urls?: string[] | null;
  };
  seller?: {
    id: string;
    username: string;
    display_name: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export interface UserRating {
  id: string;
  conversation_id: string;
  rater_id: string;
  rated_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  createConversation: (systemId: string, sellerId: string) => Promise<Conversation | null>;
  sendMessage: (conversationId: string, content: string) => Promise<Message | null>;
  markAsRead: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  refreshConversations: () => Promise<void>;
  getUserRating: (conversationId: string, ratedUserId: string) => Promise<UserRating | null>;
  submitUserRating: (conversationId: string, ratedUserId: string, rating: number, comment: string) => Promise<UserRating | null>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  const fetchConversations = async (retryCount = 0) => {
    if (!user) return;

    const MAX_RETRIES = 2;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          system:systems(id, title, price, image_url),
          cpu_listing:cpu_listings(id, title, price, image_urls),
          gpu_listing:gpu_listings(id, title, price, image_urls),
          buyer:users!conversations_buyer_id_fkey(id, username, display_name),
          seller:users!conversations_seller_id_fkey(id, username, display_name),
          messages:messages(
            id,
            sender_id,
            content,
            message_type,
            is_read,
            created_at,
            sender:users!messages_sender_id_fkey(id, username, display_name)
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', JSON.stringify(error, null, 2));
        throw new Error(error.message || error.code || 'Failed to fetch conversations');
      }

      // Process conversations to get last message and unread count
      const processedConversations = (data || []).map(conv => {
        const sortedMessages = conv.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ) || [];
        
        const lastMessage = sortedMessages[0] || null;
        const unreadCount = conv.messages?.filter((msg: any) => 
          !msg.is_read && msg.sender_id !== user.id
        ).length || 0;

        return {
          ...conv,
          last_message: lastMessage,
          unread_count: unreadCount
        };
      });

      setConversations(processedConversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      
      // Check if it's a network error and retry
      const isNetworkError = err instanceof TypeError && 
        (err.message.includes('NetworkError') || err.message.includes('fetch'));
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        console.log(`Retrying fetchConversations (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        setLoading(true); // Keep loading state during retry
        // Exponential backoff: 1s, 2s
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchConversations(retryCount + 1);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(isNetworkError ? 'Network error. Please check your connection.' : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string, retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username, display_name)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', JSON.stringify(error, null, 2));
        throw new Error(error.message || error.code || 'Failed to fetch messages');
      }

      setMessages(data || []);
      setError(null); // Clear any previous error on success
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      
      // Check if it's a network error and retry
      const isNetworkError = err instanceof TypeError && 
        (err.message.includes('NetworkError') || err.message.includes('fetch'));
      
      if (isNetworkError && retryCount < MAX_RETRIES) {
        console.log(`Retrying fetchMessages (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        // Exponential backoff: 1s, 2s
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchMessages(conversationId, retryCount + 1);
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(isNetworkError ? 'Network error. Please check your connection.' : errorMessage);
    }
  };

  // Create a new conversation
  const createConversation = async (systemId: string, sellerId: string): Promise<Conversation | null> => {
    if (!user) return null;

    // Prevent users from creating conversations with themselves
    if (user.id === sellerId) {
      console.warn('Cannot create conversation with yourself');
      return null;
    }

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('system_id', systemId)
        .eq('buyer_id', user.id)
        .single();

      if (existingConv) {
        return existingConv as Conversation;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          system_id: systemId,
          buyer_id: user.id,
          seller_id: sellerId
        })
        .select(`
          *,
          system:systems(id, title, price, image_url),
          buyer:users!conversations_buyer_id_fkey(id, username, display_name),
          seller:users!conversations_seller_id_fkey(id, username, display_name)
        `)
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw new Error(error.message);
      }

      // Refresh conversations list
      await fetchConversations();
      
      return data as Conversation;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string): Promise<Message | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, username, display_name)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw new Error(error.message);
      }

      // Add message to local state
      setMessages(prev => [...prev, data]);
      
      // Refresh conversations in background (don't await to keep UI responsive)
      fetchConversations();

      return data as Message;
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    }
  };

  // Get user rating for a conversation
  const getUserRating = async (conversationId: string, ratedUserId: string): Promise<UserRating | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('rater_id', user.id)
        .eq('rated_user_id', ratedUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user rating:', error);
        return null;
      }

      return data as UserRating | null;
    } catch (err) {
      console.error('Failed to fetch user rating:', err);
      return null;
    }
  };

  // Submit or update user rating
  const submitUserRating = async (
    conversationId: string,
    ratedUserId: string,
    rating: number,
    comment: string
  ): Promise<UserRating | null> => {
    if (!user) return null;

    try {
      // Check if rating already exists
      const existingRating = await getUserRating(conversationId, ratedUserId);

      if (existingRating) {
        // Update existing rating
        const { data, error } = await supabase
          .from('user_ratings')
          .update({
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user rating:', error);
          throw new Error(error.message);
        }

        return data as UserRating;
      } else {
        // Insert new rating
        const { data, error } = await supabase
          .from('user_ratings')
          .insert({
            conversation_id: conversationId,
            rater_id: user.id,
            rated_user_id: ratedUserId,
            rating,
            comment: comment.trim() || null
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting user rating:', error);
          throw new Error(error.message);
        }

        return data as UserRating;
      }
    } catch (err) {
      console.error('Failed to submit user rating:', err);
      throw err;
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.conversation_id === conversationId && msg.sender_id !== user.id
            ? { ...msg, is_read: true }
            : msg
        )
      );

      // Refresh conversations in background to update unread count
      fetchConversations();
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  // Track current fetching conversation to prevent duplicate requests
  const fetchingConversationRef = { current: null as string | null };

  // Set current conversation and fetch its messages
  const handleSetCurrentConversation = (conversation: Conversation | null) => {
    // Skip if already set to the same conversation
    if (currentConversation?.id === conversation?.id) return;
    
    setCurrentConversation(conversation);
    if (conversation) {
      // Prevent duplicate fetches for the same conversation
      if (fetchingConversationRef.current === conversation.id) return;
      fetchingConversationRef.current = conversation.id;
      
      fetchMessages(conversation.id).finally(() => {
        fetchingConversationRef.current = null;
      });
      markAsRead(conversation.id);
    } else {
      setMessages([]);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only process messages from other users (our own messages are added locally)
          if (newMessage.sender_id === user.id) return;
          
          // Only add message if it's for the current conversation and not already in the list
          if (currentConversation && newMessage.conversation_id === currentConversation.id) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
          
          // Refresh conversations to update last message (in background)
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, currentConversation]);

  // Fetch conversations when user changes
  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user]);

  const value: ChatContextType = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    createConversation,
    sendMessage,
    markAsRead,
    setCurrentConversation: handleSetCurrentConversation,
    refreshConversations: fetchConversations,
    getUserRating,
    submitUserRating
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
