'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { GPUModel, GPUManufacturer } from '@/hooks/useGPUs';
import { Upload, Plus, X } from 'lucide-react';

export default function SellGPUPage() {
  const { user, signOut } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'excellent',
    manufacturer: '',
    model: '',
    memory_size: '',
    memory_type: '',
    architecture: '',
    base_clock: '',
    boost_clock: '',
    tdp: '',
    cuda_cores: '',
    stream_processors: '',
    purchase_date: '',
    warranty_remaining_months: '',
    overclocked: false,
    max_overclock: '',
    cooling_included: false,
    original_box: true,
    original_manual: true,
    image_urls: [] as string[],
    location: '',
    shipping_available: true,
    local_pickup: true
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addImageUrl = () => {
    if (newImageUrl.trim() && formData.image_urls.length < 10) {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, newImageUrl.trim()]
      }));
      setNewImageUrl('');
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to create listings');
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure user record exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // Create user record if it doesn't exist
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || '',
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            rating: 5.0,
            review_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          alert('Failed to create user profile. Please try again.');
          return;
        }
      }

      // Create the listing in Supabase
      const { data, error } = await supabase
        .from('gpu_listings')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          condition: formData.condition as 'new' | 'like-new' | 'excellent' | 'good' | 'fair',
          status: 'draft', // Start as draft
          manufacturer: formData.manufacturer || null,
          model: formData.model || null,
          memory_size: formData.memory_size ? parseInt(formData.memory_size) : null,
          memory_type: formData.memory_type || null,
          architecture: formData.architecture || null,
          base_clock: formData.base_clock ? parseInt(formData.base_clock) : null,
          boost_clock: formData.boost_clock ? parseInt(formData.boost_clock) : null,
          tdp: formData.tdp ? parseInt(formData.tdp) : null,
          cuda_cores: formData.cuda_cores ? parseInt(formData.cuda_cores) : null,
          stream_processors: formData.stream_processors ? parseInt(formData.stream_processors) : null,
          purchase_date: formData.purchase_date || null,
          warranty_remaining_months: formData.warranty_remaining_months ? parseInt(formData.warranty_remaining_months) : null,
          overclocked: formData.overclocked,
          max_overclock: formData.max_overclock ? parseInt(formData.max_overclock) : null,
          cooling_included: formData.cooling_included,
          original_box: formData.original_box,
          original_manual: formData.original_manual,
          image_urls: formData.image_urls.length > 0 ? formData.image_urls : null,
          location: formData.location || null,
          shipping_available: formData.shipping_available,
          local_pickup: formData.local_pickup,
          seller_id: user.id,
          view_count: 0,
          favorite_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        alert('Failed to create listing: ' + error.message);
        return;
      }

      // Success - redirect to seller dashboard
      alert('GPU listing created successfully! You can now publish it from your dashboard.');
      window.location.href = '/seller';

    } catch (err) {
      console.error('Failed to create listing:', err);
      alert('An unexpected error occurred while creating the listing');
    } finally {
      setIsSubmitting(false);
    }
  };


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
              <Link href="/gpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to GPUs
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">
                    Welcome, {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/auth"
                    className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <section className="px-6 lg:px-12 py-12 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10 rounded-2xl mb-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Sell Your GPU
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              List your graphics card for sale and reach potential buyers. Get fair prices for your premium GPU.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* GPU Information */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">GPU Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., NVIDIA, AMD, Intel"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model *
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., RTX 4080, RX 7800 XT, Arc A770"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Memory Size (GB)
                  </label>
                  <input
                    type="number"
                    name="memory_size"
                    value={formData.memory_size}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="8"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Memory Type
                  </label>
                  <select
                    name="memory_type"
                    value={formData.memory_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  >
                    <option value="" className="bg-[var(--card-bg)]">Select memory type...</option>
                    <option value="GDDR6" className="bg-[var(--card-bg)]">GDDR6</option>
                    <option value="GDDR6X" className="bg-[var(--card-bg)]">GDDR6X</option>
                    <option value="GDDR5" className="bg-[var(--card-bg)]">GDDR5</option>
                    <option value="HBM2" className="bg-[var(--card-bg)]">HBM2</option>
                    <option value="HBM3" className="bg-[var(--card-bg)]">HBM3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Architecture
                </label>
                <input
                  type="text"
                  name="architecture"
                  value={formData.architecture}
                  onChange={handleInputChange}
                  placeholder="e.g., Ada Lovelace, RDNA 3, Xe-HPG"
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Clock (MHz)
                  </label>
                  <input
                    type="number"
                    name="base_clock"
                    value={formData.base_clock}
                    onChange={handleInputChange}
                    min="100"
                    step="10"
                    placeholder="2100"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Boost Clock (MHz)
                  </label>
                  <input
                    type="number"
                    name="boost_clock"
                    value={formData.boost_clock}
                    onChange={handleInputChange}
                    min="100"
                    step="10"
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    TDP (W)
                  </label>
                  <input
                    type="number"
                    name="tdp"
                    value={formData.tdp}
                    onChange={handleInputChange}
                    min="50"
                    step="10"
                    placeholder="320"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CUDA Cores
                  </label>
                  <input
                    type="number"
                    name="cuda_cores"
                    value={formData.cuda_cores}
                    onChange={handleInputChange}
                    min="100"
                    step="100"
                    placeholder="9728"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stream Processors
                  </label>
                  <input
                    type="number"
                    name="stream_processors"
                    value={formData.stream_processors}
                    onChange={handleInputChange}
                    min="100"
                    step="100"
                    placeholder="3840"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Listing Details */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Listing Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., NVIDIA RTX 4080 - Excellent Condition"
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe your GPU, its condition, any modifications, etc."
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="599.99"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Price (€)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="799.99"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                >
                  <option value="new" className="bg-[var(--card-bg)]">New</option>
                  <option value="like-new" className="bg-[var(--card-bg)]">Like New</option>
                  <option value="excellent" className="bg-[var(--card-bg)]">Excellent</option>
                  <option value="good" className="bg-[var(--card-bg)]">Good</option>
                  <option value="fair" className="bg-[var(--card-bg)]">Fair</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Warranty Remaining (months)
                  </label>
                  <input
                    type="number"
                    name="warranty_remaining_months"
                    value={formData.warranty_remaining_months}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="12"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="overclocked"
                    checked={formData.overclocked}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    GPU has been overclocked
                  </label>
                </div>

                {formData.overclocked && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Overclock (MHz)
                    </label>
                    <input
                      type="number"
                      name="max_overclock"
                      value={formData.max_overclock}
                      onChange={handleInputChange}
                      step="10"
                      placeholder="2600"
                      className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="cooling_included"
                    checked={formData.cooling_included}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    GPU cooler included
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="original_box"
                    checked={formData.original_box}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Original box included
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="original_manual"
                    checked={formData.original_manual}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Original manual included
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Shipping */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Location & Shipping</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State/Province"
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shipping_available"
                    checked={formData.shipping_available}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Shipping available
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="local_pickup"
                    checked={formData.local_pickup}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-[var(--brand)] focus:ring-[var(--brand)]"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Local pickup available
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Images</h2>

            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!newImageUrl.trim() || formData.image_urls.length >= 10}
                  className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-light)] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {formData.image_urls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.image_urls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`GPU image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImageUrl(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/gpus"
              className="px-6 py-3 border border-[var(--card-border)] text-gray-300 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.price}
              className="px-6 py-3 bg-[var(--brand)] text-white rounded-lg hover:bg-[var(--brand-light)] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Listing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Create Listing</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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