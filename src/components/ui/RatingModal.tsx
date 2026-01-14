'use client';

import { useState } from 'react';
import Modal from './Modal';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  userName: string;
  existingRating?: {
    rating: number;
    comment: string | null;
  } | null;
  isLoading?: boolean;
}

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
  existingRating,
  isLoading = false
}: RatingModalProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, comment);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    if (!existingRating) {
      setRating(0);
      setComment('');
    }
    setError(null);
    onClose();
  };

  const displayRating = hoveredRating || rating;

  const getRatingLabel = (value: number) => {
    switch (value) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingRating ? 'Update Rating' : 'Rate User'}
      icon="⭐"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)]"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center">
            <p className="text-gray-400 mb-2">
              How was your experience with <span className="text-white font-semibold">{userName}</span>?
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  {star <= displayRating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <span className={`text-lg font-medium ${displayRating > 0 ? 'text-[var(--brand)]' : 'text-gray-500'}`}>
              {getRatingLabel(displayRating)}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="rating-comment" className="block text-sm font-medium text-gray-300 mb-2">
              Comment (optional)
            </label>
            <textarea
              id="rating-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this user..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[var(--brand)] transition-colors resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/500</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-[var(--card-border)] hover:bg-[var(--card-border)]/80 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="flex-1 px-4 py-3 bg-[var(--brand)] hover:bg-[var(--brand-light)] disabled:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : existingRating ? (
                'Update Rating'
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
