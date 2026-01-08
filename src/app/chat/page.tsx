'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useChat } from '@/lib/chat';
import { formatCurrency } from '@/utils';

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading, error, refreshConversations } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchTerm.toLowerCase();
    const fields = [
      conv.system?.title,
      conv.cpu_listing?.title,
      conv.gpu_listing?.title,
      conv.buyer?.display_name,
      conv.buyer?.username,
      conv.seller?.display_name,
      conv.seller?.username,
    ];

    return fields.some((field) => field?.toLowerCase()?.includes(searchLower) ?? false);
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to view your conversations.</p>
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

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🐺</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
                Stali
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Home
              </Link>
              <button
                onClick={refreshConversations}
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 lg:px-12 py-12 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Messages
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Chat with buyers and sellers about PC parts and systems
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="px-6 lg:px-12 py-6 border-b border-[var(--card-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <span className="text-gray-500">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conversations List */}
      <section className="px-6 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <button 
                onClick={refreshConversations}
                className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start a conversation by contacting a seller about a system'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/systems"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  Browse Systems
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations.map((conversation) => {
                const otherUser = user.id === conversation.buyer_id ? conversation.seller : conversation.buyer;
                const isUnread = conversation.unread_count && conversation.unread_count > 0;
                const listing =
                  conversation.system ||
                  conversation.cpu_listing ||
                  conversation.gpu_listing;
                const listingImage =
                  (listing && 'image_url' in listing
                    ? (listing as { image_url?: string }).image_url
                    : undefined) ||
                  (listing && 'image_urls' in listing
                    ? (listing as { image_urls?: string[] | null }).image_urls?.[0] || undefined
                    : undefined);
                const listingPrice = (listing as any)?.price ?? 0;
                
                return (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className={`block bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6 transition-all duration-200 hover:scale-102 hover:border-[var(--brand)]/50 ${
                      isUnread ? 'ring-2 ring-[var(--brand)]/30' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* System Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20 flex-shrink-0">
                        {listingImage ? (
                          <img 
                            src={listingImage} 
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

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white truncate">
                            {listing?.title || 'Conversation'}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {isUnread && (
                              <span className="bg-[var(--brand)] text-white text-xs font-bold px-2 py-1 rounded-full">
                                {conversation.unread_count}
                              </span>
                            )}
                            <span className="text-sm text-gray-400">
                              {formatTime(conversation.last_message_at)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-400">
                              {user.id === conversation.buyer_id ? 'Seller:' : 'Buyer:'}
                            </span>
                            <span className="text-sm font-medium text-[var(--brand)]">
                              {otherUser?.display_name || otherUser?.username || 'Unknown user'}
                            </span>
                            <span className="text-sm text-gray-400">
                              • {formatCurrency(listingPrice)}
                            </span>
                          </div>
                          {conversation.last_message && (
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {conversation.last_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-[var(--card-border)] bg-[var(--card-bg)]/50 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded flex items-center justify-center">
              <span className="text-white text-sm">🐺</span>
            </div>
            <span className="text-lg font-bold">Stali</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2026 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}






