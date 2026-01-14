'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useChat, UserRating } from '@/lib/chat';
import { formatCurrency } from '@/utils';
import RatingModal from '@/components/ui/RatingModal';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, messages, sendMessage, setCurrentConversation, markAsRead, getUserRating, submitUserRating } = useChat();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [existingRating, setExistingRating] = useState<UserRating | null>(null);
  const [loadingRating, setLoadingRating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.id as string;

  const conversation = conversations.find(conv => conv.id === conversationId);
  const prevMessagesLengthRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const hasSetConversationRef = useRef(false);

  useEffect(() => {
    // Only set conversation once when we first find it, or when ID changes
    if (conversation && !hasSetConversationRef.current) {
      hasSetConversationRef.current = true;
      setCurrentConversation(conversation);
    }
  }, [conversation, setCurrentConversation]);

  // Reset the ref when conversation ID changes
  useEffect(() => {
    hasSetConversationRef.current = false;
    isInitialLoadRef.current = true;
  }, [conversationId]);

  // Only scroll to bottom on initial load or when new messages are added
  useEffect(() => {
    const shouldScroll = 
      isInitialLoadRef.current || 
      messages.length > prevMessagesLengthRef.current;
    
    if (shouldScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: isInitialLoadRef.current ? 'auto' : 'smooth' });
    }
    
    prevMessagesLengthRef.current = messages.length;
    if (messages.length > 0) {
      isInitialLoadRef.current = false;
    }
  }, [messages]);

  // Determine the other user in the conversation
  const otherUser = user && conversation
    ? (user.id === conversation.buyer_id ? conversation.seller : conversation.buyer)
    : null;

  // Fetch existing rating when opening the modal
  const handleOpenRatingModal = useCallback(async () => {
    if (!conversation || !otherUser) return;
    
    setLoadingRating(true);
    setShowRatingModal(true);
    
    try {
      const rating = await getUserRating(conversation.id, otherUser.id);
      setExistingRating(rating);
    } catch (error) {
      console.error('Failed to fetch rating:', error);
    } finally {
      setLoadingRating(false);
    }
  }, [conversation, otherUser, getUserRating]);

  // Submit rating
  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!conversation || !otherUser) return;
    
    const result = await submitUserRating(conversation.id, otherUser.id, rating, comment);
    if (result) {
      setExistingRating(result);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to view this conversation.</p>
          <Link
            href="/auth"
            className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Conversation Not Found</h2>
          <p className="text-gray-400 mb-6">This conversation doesn't exist or you don't have access to it.</p>
          <Link
            href="/chat"
            className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  // Determine which listing this conversation is about
  const listingType = conversation.system_id
    ? 'system'
    : conversation.cpu_listing_id
    ? 'cpu'
    : conversation.gpu_listing_id
    ? 'gpu'
    : null;

  const listingUrl =
    listingType === 'system'
      ? `/systems/${conversation.system_id}`
      : listingType === 'cpu'
      ? `/cpus/${conversation.cpu_listing_id}`
      : listingType === 'gpu'
      ? `/gpus/${conversation.gpu_listing_id}`
      : '/';

  const listing =
    listingType === 'system'
      ? conversation.system
      : listingType === 'cpu'
      ? conversation.cpu_listing
      : listingType === 'gpu'
      ? conversation.gpu_listing
      : undefined;

  // Helper function to get the image URL from any listing type
  const getListingImageUrl = (listing: typeof conversation.system | typeof conversation.cpu_listing | typeof conversation.gpu_listing | undefined): string | undefined => {
    if (!listing) return undefined;
    if ('image_url' in listing && listing.image_url) {
      return listing.image_url;
    }
    if ('image_urls' in listing && listing.image_urls && listing.image_urls.length > 0) {
      return listing.image_urls[0];
    }
    return undefined;
  };

  const listingImageUrl = getListingImageUrl(listing);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* Navigation */}
      <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium flex-shrink-0">
                <span className="hidden sm:inline">← Back to Messages</span>
                <span className="sm:hidden">← Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm sm:text-lg">👤</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg font-bold text-white truncate">
                    {otherUser?.display_name || otherUser?.username}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                    {user.id === conversation.buyer_id ? 'Seller' : 'Buyer'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <button
                onClick={handleOpenRatingModal}
                className="bg-[var(--card-border)] hover:bg-[var(--card-border)]/80 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1 sm:space-x-2 text-sm"
              >
                <span>⭐</span>
                <span className="hidden sm:inline">Rate User</span>
              </button>
              {listingType && (
                <Link
                  href={listingUrl}
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm"
                >
                  <span className="hidden sm:inline">View Listing</span>
                  <span className="sm:hidden">View</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Listing Info */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20 flex-shrink-0">
              {listingImageUrl ? (
                <img 
                  src={listingImageUrl} 
                  alt={listing?.title || 'Listing image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <span className="text-xl sm:text-2xl">🖥️</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">{listing?.title || 'Listing'}</h2>
              <p className="text-base sm:text-lg text-[var(--brand)] font-semibold">
                {formatCurrency(listing?.price || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-4">Start the conversation</h3>
              <p className="text-gray-400">
                Send a message to {otherUser?.display_name || otherUser?.username} about this system
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === user.id;
                const showDate = index === 0 || 
                  formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center py-4">
                        <span className="bg-[var(--card-bg)] text-gray-400 px-4 py-2 rounded-full text-sm">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    )}
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                        isOwnMessage 
                          ? 'bg-[var(--brand)] text-white' 
                          : 'bg-[var(--card-bg)] text-white border border-[var(--card-border)]'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-[var(--card-bg)] border-t border-[var(--card-border)] px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-4">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors text-sm sm:text-base"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] disabled:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white sm:mr-2"></div>
                  <span className="hidden sm:inline">Sending...</span>
                </div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        userName={otherUser?.display_name || otherUser?.username || 'User'}
        existingRating={existingRating}
        isLoading={loadingRating}
      />
    </div>
  );
}






