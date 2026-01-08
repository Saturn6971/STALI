'use client';

import { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useCPUModels } from '@/hooks/useCPUs';

export default function SellCPUPage() {
  const { user, signOut } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'excellent',
    cpu_model_id: '',
    purchase_date: '',
    warranty_remaining_months: '',
    overclocked: false,
    max_overclock: '',
    cooling_included: false,
    original_box: true,
    original_manual: true,
    location: '',
    shipping_available: true,
    local_pickup: true,
    image_urls: [] as string[]
  });

  const { cpuModels, loading: cpuModelsLoading, error: cpuModelsError } = useCPUModels();
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCPUModel = formData.cpu_model_id
    ? cpuModels.find(model => model.id === formData.cpu_model_id) || null
    : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

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
        .from('cpu_listings')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          condition: formData.condition as 'new' | 'like-new' | 'excellent' | 'good' | 'fair',
          status: 'draft', // Start as draft
          cpu_model_id: formData.cpu_model_id || null,
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
      alert('CPU listing created successfully! You can now publish it from your dashboard.');
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
              <Link href="/cpus" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to CPUs
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
              Sell Your CPU
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              List your CPU for sale and reach potential buyers. Get fair prices for your premium components.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* CPU Model Selection */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">CPU Model</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select CPU Model *
                </label>
                <select
                  name="cpu_model_id"
                  value={formData.cpu_model_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                >
                  <option value="" className="bg-[var(--card-bg)]">Choose a CPU model...</option>
                  {cpuModelsLoading && (
                    <option value="" disabled className="bg-[var(--card-bg)]">
                      Loading CPU models...
                    </option>
                  )}
                  {cpuModelsError && (
                    <option value="" disabled className="bg-[var(--card-bg)]">
                      Failed to load CPU models
                    </option>
                  )}
                  {!cpuModelsLoading && !cpuModelsError && cpuModels.map((model) => (
                      <option key={model.id} value={model.id} className="bg-[var(--card-bg)]">
                        {model.manufacturer?.name} {model.model_name} - {model.cores} cores, {model.threads} threads
                      </option>
                    ))}
                </select>
              </div>

              {selectedCPUModel && (
                <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--card-border)]">
                  <h3 className="font-medium text-white mb-2">Selected CPU Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Manufacturer:</span>
                      <span className="ml-2 font-medium text-gray-300">{selectedCPUModel.manufacturer?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Model:</span>
                      <span className="ml-2 font-medium text-gray-300">{selectedCPUModel.model_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cores/Threads:</span>
                      <span className="ml-2 font-medium text-gray-300">{selectedCPUModel.cores}/{selectedCPUModel.threads}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Socket:</span>
                      <span className="ml-2 font-medium text-gray-300">{selectedCPUModel.socket || 'N/A'}</span>
                    </div>
                    {selectedCPUModel.base_clock && (
                      <div>
                        <span className="text-gray-400">Base Clock:</span>
                        <span className="ml-2 font-medium text-gray-300">{selectedCPUModel.base_clock} GHz</span>
                      </div>
                    )}
                    {selectedCPUModel.tdp && (
                      <div>
                        <span className="text-gray-400">TDP:</span>
                        <span className="ml-2 font-medium text-gray-300">{selectedCPUModel.tdp}W</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                  placeholder="e.g., Intel Core i7-12700K - Excellent Condition"
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
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
                  placeholder="Describe your CPU, its condition, any modifications, etc."
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
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
                    placeholder="299.99"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
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
                    placeholder="399.99"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
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
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    CPU has been overclocked
                  </label>
                </div>

                {formData.overclocked && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Overclock (GHz)
                    </label>
                    <input
                      type="number"
                      name="max_overclock"
                      value={formData.max_overclock}
                      onChange={handleInputChange}
                      step="0.1"
                      placeholder="5.2"
                      className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="cooling_included"
                    checked={formData.cooling_included}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    CPU cooler included
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="original_box"
                    checked={formData.original_box}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="shipping_available"
                    checked={formData.shipping_available}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                  className="flex-1 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
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
                        alt={`CPU image ${index + 1}`}
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
              href="/cpus"
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
