'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/lib/chat';
import { formatCurrency } from '@/utils';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, messages, sendMessage, setCurrentConversation, markAsRead } = useChat();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.id as string;

  const conversation = conversations.find(conv => conv.id === conversationId);

  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversation, setCurrentConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const otherUser = user.id === conversation.buyer_id ? conversation.seller : conversation.buyer;

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
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Messages
              </Link>
              <div className="h-6 w-px bg-gray-600"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    {otherUser?.display_name || otherUser?.username}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {user.id === conversation.buyer_id ? 'Seller' : 'Buyer'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {listingType && (
                <Link
                  href={listingUrl}
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  View Listing
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Listing Info */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20 flex-shrink-0">
              {listingImageUrl ? (
                <img 
                  src={listingImageUrl} 
                  alt={listing?.title || 'Listing image'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex w-full h-full items-center justify-center">
                  <span className="text-2xl">🖥️</span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{listing?.title || 'Listing'}</h2>
              <p className="text-lg text-[var(--brand)] font-semibold">
                {formatCurrency(listing?.price || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-6">
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
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
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
      <div className="bg-[var(--card-bg)] border-t border-[var(--card-border)] px-6 lg:px-12 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="bg-[var(--brand)] hover:bg-[var(--brand-light)] disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}






