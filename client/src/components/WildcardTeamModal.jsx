import React, { useState } from 'react';
import { UserPlus, Plus, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api';

export const WildcardTeamModal = ({ isOpen, onClose, onTeamCreated, token }) => {
  const [teamName, setTeamName] = useState('');
  const [regnId, setRegnId] = useState('');
  const [domain, setDomain] = useState('');
  const [lead, setLead] = useState({ name: '', email: '', mobile: '', organisation: '' });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (members.length >= 4) {
      setError('A team can have at most 5 members total (1 Lead + 4 Members).');
      return;
    }
    setMembers([...members, { name: '', email: '', mobile: '', organisation: '' }]);
    setError(null);
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, idx) => idx !== index));
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !lead.name.trim() || !lead.email.trim()) {
      setError('Team name and Lead details (Name, Email) are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest('/admin/teams', {
        method: 'POST',
        data: {
          teamName: teamName.trim(),
          regnId: regnId.trim() || undefined,
          domain: domain.trim(),
          lead,
          members: members.filter((m) => m.name.trim() && m.email.trim()),
        },
        token,
      });

      if (onTeamCreated) onTeamCreated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create wildcard team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#121212] border border-[var(--border)] hud-frame w-full max-w-2xl p-5 sm:p-6 shadow-2xl relative text-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--red)] text-white flex items-center justify-center font-bold rounded">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wide text-white">
                Add Wildcard Team
              </h3>
              <p className="text-xs text-neutral-400 mono">Manual Team Onboarding Form (Max 5 Members)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="overflow-y-auto overflow-x-hidden space-y-5 flex-1 pr-1 modal-scroll py-2">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs mono flex items-start gap-2 rounded">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Section 1: Team Meta */}
            <div className="bg-black/50 p-4 sm:p-5 border border-[var(--border)] rounded space-y-4">
              <div className="mono text-xs font-bold uppercase text-[var(--red2)] tracking-wider">
                [ 01 / TEAM INFORMATION ]
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mono dim text-xs block mb-1.5 font-medium">TEAM NAME *</label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Cyber Ninjas"
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mono dim text-xs block mb-1.5 font-medium">REGISTRATION ID</label>
                  <input
                    type="text"
                    value={regnId}
                    onChange={(e) => setRegnId(e.target.value)}
                    placeholder="Optional or auto-generated"
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mono dim text-xs block mb-1.5 font-medium">DOMAIN / TRACK</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. AI & Machine Learning, FinTech, etc."
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Team Lead */}
            <div className="bg-black/50 p-4 sm:p-5 border border-[var(--border)] rounded space-y-4">
              <div className="mono text-xs font-bold uppercase text-[var(--red2)] tracking-wider">
                [ 02 / TEAM LEADER ]
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mono dim text-xs block mb-1.5 font-medium">LEAD NAME *</label>
                  <input
                    type="text"
                    required
                    value={lead.name}
                    onChange={(e) => setLead({ ...lead, name: e.target.value })}
                    placeholder="Full Name"
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mono dim text-xs block mb-1.5 font-medium">LEAD EMAIL *</label>
                  <input
                    type="email"
                    required
                    value={lead.email}
                    onChange={(e) => setLead({ ...lead, email: e.target.value })}
                    placeholder="lead@college.edu"
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mono dim text-xs block mb-1.5 font-medium">LEAD MOBILE</label>
                  <input
                    type="tel"
                    value={lead.mobile}
                    onChange={(e) => setLead({ ...lead, mobile: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mono dim text-xs block mb-1.5 font-medium">INSTITUTE / ORGANISATION</label>
                  <input
                    type="text"
                    value={lead.organisation}
                    onChange={(e) => setLead({ ...lead, organisation: e.target.value })}
                    placeholder="e.g. SRMCEM Lucknow"
                    className="w-full text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Additional Members */}
            <div className="bg-black/50 p-4 sm:p-5 border border-[var(--border)] rounded space-y-4">
              <div className="flex items-center justify-between">
                <div className="mono text-xs font-bold uppercase text-[var(--red2)] tracking-wider">
                  [ 03 / ADDITIONAL MEMBERS ({members.length} / 4) ]
                </div>
                {members.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="btn btn-ghost text-[10px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Member
                  </button>
                )}
              </div>

              {members.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 border border-[var(--border)] bg-black/60 rounded space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-[11px] text-neutral-300 font-bold">
                      MEMBER #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-neutral-400 hover:text-[var(--red2)] text-xs p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={m.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      className="w-full text-xs sm:text-sm"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email *"
                      value={m.email}
                      onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                      className="w-full text-xs sm:text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile (optional)"
                      value={m.mobile}
                      onChange={(e) => handleMemberChange(idx, 'mobile', e.target.value)}
                      className="w-full text-xs sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Organisation (optional)"
                      value={m.organisation}
                      onChange={(e) => handleMemberChange(idx, 'organisation', e.target.value)}
                      className="w-full text-xs sm:text-sm"
                    />
                  </div>
                </div>
              ))}

              {members.length === 0 && (
                <p className="dim mono text-xs text-center py-3 bg-black/30 rounded border border-dashed border-[var(--border)]/60">
                  No extra members added (solo team or click "+ Add Member" above).
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions (Sticky at bottom, outside scroll) */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-xs py-2 px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Creating Team...</span>
                </>
              ) : (
                'Create Wildcard Team →'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
