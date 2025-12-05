'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/ui/Modal';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [openModal, setOpenModal] = useState<'buying' | 'selling' | 'safety' | null>(null);
  const { user, signOut } = useAuth();

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (submitStatus !== 'idle') {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message.');
      }

      setSubmitStatus('success');
      setSubmitMessage('Thanks! Your message has been sent.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: unknown) {
      setSubmitStatus('error');
      setSubmitMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Link href="/seller" className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:scale-105 text-center">
                Start Selling
              </Link>
              <a
                href="#about"
                className="border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white px-8 py-4 rounded-lg font-medium text-lg transition-all duration-200 text-center"
              >
                Learn More
              </a>
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
              <Link
                href="/auth"
                className="inline-block bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              >
                Join Now
              </Link>
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
                  <a href="mailto:ali.dadak@student.htldornbirn.at" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
                    ali.dadak@student.htldornbirn.at
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--brand)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🧾</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Support Tickets</h4>
                  <p className="text-gray-400 mb-2">Open a ticket and we’ll reply via email.</p>
                  <a href="mailto:ali.dadak@student.htldornbirn.at?subject=Support%20Ticket" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
                    Create Ticket
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--brand)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📚</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Help Center</h4>
                  <p className="text-gray-400 mb-2">Browse guides and FAQs for quick answers.</p>
                  <a href="#help" className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors">
                    View Help Center
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-2xl p-8 border border-[var(--card-border)]">
              <h4 className="text-xl font-bold mb-6">Send us a message</h4>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange('subject')}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange('message')}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white py-3 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
                {submitStatus !== 'idle' && (
                  <p
                    className={`text-sm ${
                      submitStatus === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {submitMessage}
                  </p>
                )}
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
            <button
              onClick={() => setOpenModal('buying')}
              className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] hover:border-[var(--brand)]/50 transition-colors text-left cursor-pointer"
            >
              <div className="text-3xl mb-4">🛒</div>
              <h4 className="text-xl font-bold mb-3">Buying Guide</h4>
              <p className="text-gray-400 mb-4">Learn how to find and purchase the perfect PC components.</p>
              <span className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors font-medium">
                Read Guide →
              </span>
            </button>
            <button
              onClick={() => setOpenModal('selling')}
              className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] hover:border-[var(--brand)]/50 transition-colors text-left cursor-pointer"
            >
              <div className="text-3xl mb-4">💰</div>
              <h4 className="text-xl font-bold mb-3">Selling Tips</h4>
              <p className="text-gray-400 mb-4">Maximize your sales with our expert selling strategies.</p>
              <span className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors font-medium">
                Learn More →
              </span>
            </button>
            <button
              onClick={() => setOpenModal('safety')}
              className="bg-[var(--card-bg)] rounded-xl p-6 border border-[var(--card-border)] hover:border-[var(--brand)]/50 transition-colors text-left cursor-pointer"
            >
              <div className="text-3xl mb-4">🔒</div>
              <h4 className="text-xl font-bold mb-3">Safety & Security</h4>
              <p className="text-gray-400 mb-4">Stay safe while buying and selling on our platform.</p>
              <span className="text-[var(--brand)] hover:text-[var(--brand-light)] transition-colors font-medium">
                Safety Tips →
              </span>
            </button>
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

      {/* Guide Modals */}
      <Modal
        isOpen={openModal === 'buying'}
        onClose={() => setOpenModal(null)}
        title="Buying Guide"
        icon="🛒"
      >
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Finding the Perfect Components</h3>
            <p className="mb-4">
              Searching for PC components on Stali is easy! Use our advanced filters to narrow down your search by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Category:</strong> CPUs, GPUs, or Complete Systems</li>
              <li><strong className="text-white">Price Range:</strong> Set your budget to find components within your price range</li>
              <li><strong className="text-white">Condition:</strong> Filter by new, like-new, excellent, good, or fair condition</li>
              <li><strong className="text-white">Location:</strong> Find local sellers for pickup or browse shipping options</li>
              <li><strong className="text-white">Brand & Model:</strong> Search for specific manufacturers and models</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Evaluating Listings</h3>
            <p className="mb-4">
              When browsing listings, pay attention to these important details:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Photos:</strong> Check multiple images to assess condition and authenticity</li>
              <li><strong className="text-white">Description:</strong> Read seller notes about usage, overclocking, and included accessories</li>
              <li><strong className="text-white">Specifications:</strong> Verify technical specs match your requirements</li>
              <li><strong className="text-white">Warranty:</strong> Check remaining warranty coverage if applicable</li>
              <li><strong className="text-white">Seller History:</strong> Review seller ratings and previous transactions</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Making a Purchase</h3>
            <p className="mb-4">
              Before making a purchase, follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Contact the Seller:</strong> Use our messaging system to ask questions about the item</li>
              <li><strong className="text-white">Verify Compatibility:</strong> Ensure the component is compatible with your system</li>
              <li><strong className="text-white">Negotiate Price:</strong> Discuss pricing and payment terms with the seller</li>
              <li><strong className="text-white">Secure Payment:</strong> Use our secure payment system or verified payment methods</li>
              <li><strong className="text-white">Arrange Delivery:</strong> Coordinate shipping or local pickup</li>
            </ol>
          </div>

          <div className="bg-[var(--brand)]/10 border border-[var(--brand)]/30 rounded-lg p-4">
            <p className="text-[var(--brand-light)] font-medium">
              💡 <strong>Tip:</strong> Always communicate through our platform's messaging system to maintain records of your conversation and protect your purchase.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openModal === 'selling'}
        onClose={() => setOpenModal(null)}
        title="Selling Tips"
        icon="💰"
      >
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Creating an Effective Listing</h3>
            <p className="mb-4">
              A great listing is the key to successful sales. Here's how to create one:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">High-Quality Photos:</strong> Take clear, well-lit photos from multiple angles showing the component and any included accessories</li>
              <li><strong className="text-white">Detailed Description:</strong> Include specifications, condition, usage history, and any relevant details about the component</li>
              <li><strong className="text-white">Accurate Condition:</strong> Be honest about wear, scratches, or any issues - buyers appreciate transparency</li>
              <li><strong className="text-white">Competitive Pricing:</strong> Research similar listings to price competitively while ensuring fair value</li>
              <li><strong className="text-white">Complete Information:</strong> Fill out all specification fields to help buyers find your listing</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Maximizing Your Sale Price</h3>
            <p className="mb-4">
              To get the best price for your components:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Original Packaging:</strong> Include original boxes and manuals - buyers value this</li>
              <li><strong className="text-white">Accessories:</strong> List all included items (coolers, cables, documentation)</li>
              <li><strong className="text-white">Warranty Information:</strong> Highlight any remaining warranty coverage</li>
              <li><strong className="text-white">Testing Proof:</strong> Provide evidence of functionality if possible</li>
              <li><strong className="text-white">Bundle Deals:</strong> Consider bundling related components for added value</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Best Practices for Sellers</h3>
            <p className="mb-4">
              Maintain your reputation and build trust:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Quick Responses:</strong> Reply to buyer inquiries promptly</li>
              <li><strong className="text-white">Clear Communication:</strong> Be professional and transparent in all interactions</li>
              <li><strong className="text-white">Secure Packaging:</strong> Package items carefully to prevent damage during shipping</li>
              <li><strong className="text-white">Fast Shipping:</strong> Ship items quickly after payment confirmation</li>
              <li><strong className="text-white">Follow Up:</strong> Confirm receipt and ensure buyer satisfaction</li>
            </ul>
          </div>

          <div className="bg-[var(--brand)]/10 border border-[var(--brand)]/30 rounded-lg p-4">
            <p className="text-[var(--brand-light)] font-medium">
              💡 <strong>Pro Tip:</strong> Take advantage of our Seller Dashboard to manage all your listings, track inquiries, and monitor your sales performance in one place.
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={openModal === 'safety'}
        onClose={() => setOpenModal(null)}
        title="Safety & Security"
        icon="🔒"
      >
        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">Secure Transactions</h3>
            <p className="mb-4">
              Your security is our top priority. Follow these guidelines to stay safe:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Use Platform Messaging:</strong> Keep all communications within our messaging system for records and protection</li>
              <li><strong className="text-white">Verify Seller Identity:</strong> Check seller profiles, ratings, and transaction history before purchasing</li>
              <li><strong className="text-white">Secure Payment Methods:</strong> Use verified payment systems - avoid wire transfers or cash payments for remote transactions</li>
              <li><strong className="text-white">Inspect Before Accepting:</strong> For local pickups, inspect items thoroughly before completing payment</li>
              <li><strong className="text-white">Report Suspicious Activity:</strong> Contact us immediately if you encounter scams or fraud</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Red Flags to Watch For</h3>
            <p className="mb-4">
              Be cautious if you encounter:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Requests to communicate outside our platform</li>
              <li>Pressure to make quick decisions or payments</li>
              <li>Prices that seem too good to be true</li>
              <li>Sellers unwilling to provide additional photos or information</li>
              <li>Payment requests via unusual methods (gift cards, wire transfers, etc.)</li>
              <li>Poor grammar, urgent requests, or suspicious communication patterns</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Protecting Your Account</h3>
            <p className="mb-4">
              Keep your account and personal information secure:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li><strong className="text-white">Strong Passwords:</strong> Use unique, complex passwords for your account</li>
              <li><strong className="text-white">Two-Factor Authentication:</strong> Enable 2FA for additional account security</li>
              <li><strong className="text-white">Privacy Settings:</strong> Review and adjust your privacy settings regularly</li>
              <li><strong className="text-white">Don't Share Credentials:</strong> Never share your login information with anyone</li>
              <li><strong className="text-white">Secure Networks:</strong> Avoid accessing your account on public Wi-Fi networks</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-3">Local Meetups</h3>
            <p className="mb-4">
              For in-person transactions:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Meet in public, well-lit locations during daytime</li>
              <li>Bring a friend or let someone know where you're going</li>
              <li>Inspect the item thoroughly before payment</li>
              <li>Trust your instincts - if something feels wrong, walk away</li>
              <li>Verify the item matches the listing description</li>
            </ul>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-medium">
              ⚠️ <strong>Important:</strong> If you suspect fraud or encounter a scam, report it immediately through our platform or contact support. We take all security concerns seriously and will investigate promptly.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}