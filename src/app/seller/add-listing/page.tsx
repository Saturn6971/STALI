'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Upload, Plus, X } from 'lucide-react';

export default function AddListingPage() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'excellent',
    category: '886dcd2e-ad7e-41ce-9c7f-d9cea0362cb9', // Default to Gaming
    cpu: '',
    gpu: '',
    ram: '',
    storage: '',
    motherboard: '',
    psu: '',
    caseModel: '',
    cooling: '',
    purchase_date: '',
    warranty_remaining_months: '',
    location: '',
    shipping_available: true,
    local_pickup: true,
    image_urls: [] as string[],
    video_url: ''
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
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
        .from('systems')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          condition: formData.condition as 'like-new' | 'excellent' | 'good' | 'fair',
          status: 'draft', // Start as draft
          cpu: formData.cpu || null,
          gpu: formData.gpu || null,
          ram: formData.ram || null,
          storage: formData.storage || null,
          motherboard: formData.motherboard || null,
          psu: formData.psu || null,
          case_model: formData.caseModel || null,
          cooling: formData.cooling || null,
          image_urls: formData.image_urls.length > 0 ? formData.image_urls : null,
          video_url: formData.video_url || null,
          seller_id: user.id,
          category_id: formData.category,
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
      alert('Listing created successfully! You can now publish it from your dashboard.');
      window.location.href = '/seller';
      
    } catch (err) {
      console.error('Failed to create listing:', err);
      alert('An unexpected error occurred while creating the listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to create listings.</p>
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
              <Link href="/seller" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 lg:px-12 py-12 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-light)]/10 rounded-2xl mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Sell Your Complete System
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              List your complete PC system for sale and reach potential buyers. Get fair prices for your premium build.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="e.g., High-End Gaming PC - RTX 4080"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="Describe your system, its condition, and any special features..."
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
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Original Price (€)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                    placeholder="3000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                >
                  <option value="like-new" className="bg-[var(--card-bg)]">Like New</option>
                  <option value="excellent" className="bg-[var(--card-bg)]">Excellent</option>
                  <option value="good" className="bg-[var(--card-bg)]">Good</option>
                  <option value="fair" className="bg-[var(--card-bg)]">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-[var(--card-bg)]">
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Specifications</h2>
                
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPU
                </label>
                <input
                  type="text"
                  name="cpu"
                  value={formData.cpu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="Intel Core i7-13700K"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GPU
                </label>
                <input
                  type="text"
                  name="gpu"
                  value={formData.gpu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="NVIDIA RTX 4080 16GB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  RAM
                </label>
                <input
                  type="text"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="32GB DDR5-5600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Storage
                </label>
                <input
                  type="text"
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="1TB NVMe SSD + 2TB HDD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motherboard
                </label>
                <input
                  type="text"
                  name="motherboard"
                  value={formData.motherboard}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="ASUS ROG Strix Z790-E"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PSU
                </label>
                <input
                  type="text"
                  name="psu"
                  value={formData.psu}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="Corsair RM850x 850W 80+ Gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Case
                </label>
                <input
                  type="text"
                  name="caseModel"
                  value={formData.caseModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="Fractal Design Torrent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cooling
                </label>
                <input
                  type="text"
                  name="cooling"
                  value={formData.cooling}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  placeholder="Noctua NH-D15 Chromax"
                />
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    min="0"
                    placeholder="12"
                    className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=... or direct video file URL"
                  className="w-full px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube, Vimeo, or direct video file URLs (MP4, WebM, etc.)
                </p>
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                        alt={`System image ${index + 1}`}
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
              href="/seller"
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
            © 2024 Stali. Your premium PC parts marketplace.
          </div>
        </div>
      </footer>
    </div>
  );
}
