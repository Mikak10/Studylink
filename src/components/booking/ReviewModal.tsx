import React, { useState } from 'react';
import { Booking } from '../../types';
import { useStudyLinkData } from '../../context/DataContext';
import { X, Star, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  onClose,
  onReviewSubmitted,
}) => {
  const { addReview, activePersona } = useStudyLinkData();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide a brief comment on your tutoring experience.');
      return;
    }

    addReview({
      bookingId: booking.id,
      tutorId: booking.tutorId,
      studentName: booking.studentName || activePersona.name,
      rating,
      comment: comment.trim(),
      courseCode: booking.courseCode,
    });

    onReviewSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Peer Tutoring Feedback
            </h3>
            <p className="text-xs text-slate-500">
              Session with {booking.tutorName} · {booking.courseCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Star Rating Picker */}
          <div className="text-center py-2">
            <label className="block font-semibold text-slate-700 mb-2">
              How would you rate this peer tutoring session?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="block text-xs font-semibold text-amber-700 mt-1 font-mono">
              {rating === 5
                ? '5.0 ★ Exceptional Explanation'
                : rating === 4
                ? '4.0 ★ Very Helpful'
                : rating === 3
                ? '3.0 ★ Satisfactory'
                : 'Needs Improvement'}
            </span>
          </div>

          {/* Comment Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              Written Review & Advice for Fellow LAU Students *
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="e.g. Nour explained vector calculus step-by-step and helped me solve 3 tricky past midterm questions. Very patient!"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-normal focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              required
            />
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
            Note: Reviews are published to the tutor&apos;s public profile to help LAU peers discover qualified study partners.
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
