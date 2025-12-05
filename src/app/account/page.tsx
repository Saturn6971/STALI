'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import Modal from '@/components/ui/Modal';

export default function AccountPage() {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    phone: '',
    location: '',
  });

  // Password change fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/auth?redirect=/account');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser]);

  const fetchUserProfile = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser(data);
        setFormData({
          username: data.username || '',
          display_name: data.display_name || '',
          phone: data.phone || '',
          location: data.location || '',
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          display_name: formData.display_name || null,
          phone: formData.phone || null,
          location: formData.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (error) throw error;

      setSuccess('Profile updated successfully!');
      await fetchUserProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    if (!authUser) return;

    try {
      setDeleting(true);
      setError(null);

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Call the API route to delete the account (requires admin privileges)
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: session.access_token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      // Sign out (this will clear the session)
      const { error: signOutError } = await signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        // Continue with redirect even if sign out fails
      }

      // Redirect to home
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to delete account. Please contact support if this issue persists.';
      setError(errorMessage);
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation */}
      <nav className="bg-[var(--card-bg)]/80 backdrop-blur-sm border-b border-[var(--card-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              Stali
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Profile Information Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
          
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={authUser.email || ''}
                disabled
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, Country"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              />
            </div>

            {user && (
              <div className="pt-4 border-t border-[var(--card-border)]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Rating:</span>
                    <span className="ml-2 text-white font-medium">{user.rating.toFixed(1)} ⭐</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Reviews:</span>
                    <span className="ml-2 text-white font-medium">{user.review_count}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Member since:</span>
                    <span className="ml-2 text-white font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password *
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[var(--brand)] hover:bg-[var(--brand-light)] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className="bg-[var(--card-bg)] border border-red-500/50 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Danger Zone</h2>
          <p className="text-gray-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirm('');
          setError(null);
        }}
        title="Delete Account"
        icon="⚠️"
      >
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 font-medium mb-2">Warning: This action cannot be undone!</p>
            <p className="text-gray-300 text-sm">
              This will permanently delete your account and all associated data, including:
            </p>
            <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
              <li>Your profile information</li>
              <li>All your listings</li>
              <li>Your message history</li>
              <li>Your reviews and ratings</li>
            </ul>
          </div>

          <div>
            <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-300 mb-2">
              Type <span className="font-mono text-red-400">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              id="deleteConfirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="DELETE"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirm('');
                setError(null);
              }}
              className="flex-1 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-white rounded-lg hover:bg-[var(--card-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting || deleteConfirm !== 'DELETE'}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

