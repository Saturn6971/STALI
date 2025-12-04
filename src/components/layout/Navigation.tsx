'use client';

import Link from 'next/link';
import { NavigationProps } from '@/types';

export default function Navigation({ isMobileMenuOpen, onMobileMenuToggle }: NavigationProps) {
  return (
    <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand)] to-[var(--brand-light)] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🐺</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--brand)] to-[var(--brand-light)] bg-clip-text text-transparent">
              Stali
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Home
            </Link>
            <Link href="/systems" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Systems
            </Link>
            <Link href="/cpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              CPUs
            </Link>
            <Link href="/seller" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Sell
            </Link>
            <Link href="/chat" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
              Messages
            </Link>
            <div className="h-6 w-px bg-gray-600"></div>
            <Link href="/cpus/sell" className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105">
              Sell CPU
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[var(--card-bg)] transition-colors duration-200"
            onClick={onMobileMenuToggle}
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
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                Home
              </Link>
              <Link href="/systems" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                Systems
              </Link>
              <Link href="/cpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                CPUs
              </Link>
              <Link href="/seller" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                Sell
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium py-2">
                Messages
              </Link>
              <div className="pt-4">
                <Link href="/cpus/sell" className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 block text-center">
                  Sell CPU
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
