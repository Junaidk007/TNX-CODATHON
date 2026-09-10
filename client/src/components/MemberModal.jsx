import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export function MemberModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isLead = false,
  title = null,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisation: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        organisation: initialData.organisation || '',
        mobile: initialData.mobile || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        organisation: '',
        mobile: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEdit = Boolean(initialData?._id || initialData?.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const name = formData.name.trim();
    const email = formData.email.toLowerCase().trim();
    const organisation = formData.organisation.trim();
    const mobile = formData.mobile.trim();

    if (!name) {
      setError('Member name is required.');
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await onSave({ name, email, organisation, mobile });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save team member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121212] border border-[var(--border)] hud-frame w-full max-w-lg p-6 shadow-2xl relative text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-950/40 border border-[var(--red2)] text-[var(--red2)] flex items-center justify-center">
              {isEdit ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <div className="mono text-[10px] text-[var(--red2)] tracking-wider uppercase font-bold">
                {isLead ? 'TEAM LEADER ROSTER' : 'TEAM MEMBER DATA'}
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {title || (isEdit ? `Edit ${isLead ? 'Leader' : 'Member'} Details` : 'Add Team Member')}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/30 border border-red-800 rounded flex items-start gap-2.5 text-xs text-red-200 mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="mono dim text-[11px] block mb-1 font-semibold">
              FULL NAME <span className="text-[var(--red2)]">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Morgan"
              className="w-full p-2.5 bg-black/60 border border-[var(--border)] rounded text-white font-medium focus:border-[var(--red2)]"
            />
          </div>

          <div>
            <label className="mono dim text-[11px] block mb-1 font-semibold">
              EMAIL ADDRESS <span className="text-[var(--red2)]">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. alex@example.com"
              className="w-full p-2.5 bg-black/60 border border-[var(--border)] rounded text-white mono focus:border-[var(--red2)]"
            />
            <span className="dim mono text-[10px] block mt-1">
              Must be unique across all hackathon teams. Used for OTP sign-in.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mono dim text-[11px] block mb-1 font-semibold">
                COLLEGE / ORGANISATION
              </label>
              <input
                type="text"
                value={formData.organisation}
                onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                placeholder="e.g. SRMCEM Lucknow"
                className="w-full p-2.5 bg-black/60 border border-[var(--border)] rounded text-white focus:border-[var(--red2)]"
              />
            </div>

            <div>
              <label className="mono dim text-[11px] block mb-1 font-semibold">
                PHONE NUMBER / MOBILE
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="e.g. +91 9876543210"
                className="w-full p-2.5 bg-black/60 border border-[var(--border)] rounded text-white mono focus:border-[var(--red2)]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 mt-6 border-t border-[var(--border)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost py-2 px-4 text-xs"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? 'Save Changes' : 'Add Member →'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
