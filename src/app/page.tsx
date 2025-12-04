'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const categories = [
    {
      id: 'cpus',
      title: 'CPUs',
      description: 'High-performance processors from Intel and AMD',
      icon: '🖥️',
      gradient: 'from-blue-500/20 to-purple-500/20',
      hoverGradient: 'from-blue-500/30 to-purple-500/30'
    },
    {
      id: 'gpus',
      title: 'GPUs',
      description: 'Latest graphics cards for gaming and professional work',
      icon: '🎮',
      gradient: 'from-green-500/20 to-teal-500/20',
      hoverGradient: 'from-green-500/30 to-teal-500/30'
    },
    {
      id: 'systems',
      title: 'Complete Systems',
      description: 'Ready-to-use PCs and custom builds',
      icon: '⚡',
      gradient: 'from-orange-500/20 to-red-500/20',
      hoverGradient: 'from-orange-500/30 to-red-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🐺</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
            Stali
          </h1>
        </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Home
              </a>
              <a href="#categories" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Categories
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Contact
              </a>
              <a href="#help" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Help
              </a>
              <div className="h-6 w-px bg-gray-600"></div>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">
                    Welcome, {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                  </span>
                  <Link 
                    href="/chat"
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Messages
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                  <Link 
                    href="/seller"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Seller Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <a 
                    href="/auth"
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </a>
                  <a 
                    href="/auth"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[var(--card-bg)] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[var(--card-border)]">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                  Home
                </a>
                <a href="#categories" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                  Categories
                </a>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                  About
                </a>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                  Contact
                </a>
                <a href="#help" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                  Help
                </a>
                
                {user ? (
                  <div className="pt-4 space-y-3">
                    <div className="text-gray-300 text-sm py-2">
                      Welcome, {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                    </div>
                    <Link 
                      href="/chat"
                      className="w-full text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
                    >
                      Messages
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="w-full text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
                    >
                      Sign Out
                    </button>
                    <Link 
                      href="/seller"
                      className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center block"
                    >
                      Seller Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 space-y-3">
                    <a 
                      href="/auth"
                      className="w-full text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2"
                    >
                      Sign In
                    </a>
                    <a 
                      href="/auth"
                      className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 text-center block"
                    >
                      Sign Up
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Premium PC Parts
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Marketplace
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Buy and sell CPUs, GPUs, and complete PC systems. Your trusted marketplace for premium computer components.
          </p>
          
          {/* Category Cards */}
          <div id="categories" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 cursor-pointer group ${
                  hoveredCard === category.id ? 'scale-105 shadow-2xl' : 'hover:scale-102'
                }`}
                onMouseEnter={() => setHoveredCard(category.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{category.title}</h3>
                  <p className="text-gray-400 mb-6">{category.description}</p>
                  <Link 
                    href={category.id === 'systems' ? '/systems' : category.id === 'cpus' ? '/cpus' : category.id === 'gpus' ? '/gpus' : '#'}
                    className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 block text-center"
                  >
                    Browse {category.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Sell Section */}
          <div className="bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10 rounded-2xl p-8 lg:p-12 border border-[var(--brand)]/20">
            <h3 className="text-3xl font-bold mb-4">Ready to Sell?</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              List your PC parts and complete systems on Stali. Get fair prices and connect with buyers who appreciate quality components.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cpus/sell" className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 text-center">
                Start Selling
              </Link>
              <button className="border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 lg:px-12 py-16 bg-[var(--card-bg)]/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Stali?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--brand)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Secure Transactions</h4>
              <p className="text-gray-400">Protected payments and verified sellers ensure safe transactions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--brand)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Fast Delivery</h4>
              <p className="text-gray-400">Quick shipping and local pickup options for immediate satisfaction.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--brand)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Quality Guaranteed</h4>
              <p className="text-gray-400">All listings verified for authenticity and working condition.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="px-6 lg:px-12 py-16 bg-[var(--card-bg)]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">About Stali</h3>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Stali is the premier marketplace for PC enthusiasts, gamers, and professionals. We connect buyers and sellers of high-quality computer components, ensuring every transaction is secure and every product meets our quality standards.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-2xl font-bold mb-4">Our Mission</h4>
              <p className="text-gray-400 mb-6">
                To create a trusted platform where PC enthusiasts can buy and sell premium components with confidence. We believe in quality, transparency, and fair pricing for all our users.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[var(--brand)] rounded-full"></div>
                  <span className="text-gray-300">Verified sellers and authentic products</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[var(--brand)] rounded-full"></div>
                  <span className="text-gray-300">Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[var(--brand)] rounded-full"></div>
                  <span className="text-gray-300">24/7 customer support</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand-light)]/20 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-2">Join Our Community</h4>
              <p className="text-gray-400 mb-6">
                Connect with thousands of PC enthusiasts, share builds, and discover the latest components.
              </p>
              <button className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 lg:px-12 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have questions? Need support? We're here to help. Reach out to our team anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--brand)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📧</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Email Support</h4>
                  <p className="text-gray-400 mb-2">Get help with your account, orders, or general questions.</p>
                  <a href="mailto:support@stali.com" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
                    support@stali.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--brand)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Live Chat</h4>
                  <p className="text-gray-400 mb-2">Chat with our support team in real-time.</p>
                  <button className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
                    Start Chat
                  </button>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--brand)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📞</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Phone Support</h4>
                  <p className="text-gray-400 mb-2">Speak directly with our support team.</p>
                  <a href="tel:+1-555-STALI" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
                    +1 (555) STALI
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-2xl p-8 border border-[var(--card-border)]">
              <h4 className="text-xl font-bold mb-6">Send us a message</h4>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section id="help" className="px-6 lg:px-12 py-16 bg-[var(--card-bg)]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Help Center</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find answers to common questions and learn how to get the most out of Stali.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] hover:border-[var(--brand)]/50 transition-colors">
              <div className="text-3xl mb-4">🛒</div>
              <h4 className="text-xl font-bold mb-3">Buying Guide</h4>
              <p className="text-gray-400 mb-4">Learn how to find and purchase the perfect PC components.</p>
              <a href="#" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors font-medium">
                Read Guide →
              </a>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] hover:border-[var(--brand)]/50 transition-colors">
              <div className="text-3xl mb-4">💰</div>
              <h4 className="text-xl font-bold mb-3">Selling Tips</h4>
              <p className="text-gray-400 mb-4">Maximize your sales with our expert selling strategies.</p>
              <a href="#" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors font-medium">
                Learn More →
              </a>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] hover:border-[var(--brand)]/50 transition-colors">
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-xl font-bold mb-3">Safety & Security</h4>
              <p className="text-gray-400 mb-4">Stay safe while buying and selling on our platform.</p>
              <a href="#" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors font-medium">
                Safety Tips →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-8 border-t border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded flex items-center justify-center">
              <span className="text-white text-sm">🐺</span>
            </div>
            <span className="text-lg font-bold">Stali</span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2025 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}