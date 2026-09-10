import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Edit3,
  Check,
  UserCheck,
  Loader2,
  FileText,
  AlertCircle,
  UserPlus,
  Trash2
} from 'lucide-react';
import { apiRequest, openTeamDeck, getTeamDeckDirectUrl } from '../services/api';
import { NocDownloadButton } from './NocDownloadButton';
import { MemberModal } from './MemberModal';

export const AdminTeamDetailModal = ({ teamId, isOpen, onClose, token, onTeamUpdated }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDomain, setEditDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [reassigningLeadId, setReassigningLeadId] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);

  // Member Management State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      apiRequest('/event-info').then(setEventInfo).catch(console.error);
    }
  }, [isOpen]);

  const fetchTeamDetail = async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest(`/admin/teams/${teamId}`);
      setTeam(data);
      setEditName(data.teamName);
      setEditDomain(data.domain || '');
    } catch (err) {
      console.error('Failed to load team details:', err);
      setError(err.message || 'Could not fetch team details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teamId) {
      fetchTeamDetail();
    }
  }, [isOpen, teamId]);

  const handleSaveTeamInfo = async () => {
    setSaving(true);
    try {
      const updated = await apiRequest(`/admin/teams/${teamId}`, {
        method: 'PATCH',
        data: {
          teamName: editName.trim(),
          domain: editDomain.trim(),
        },
      });

      setTeam(updated);
      setIsEditing(false);
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update team');
    } finally {
      setSaving(false);
    }
  };

  const handleReassignLead = async (newLeadId) => {
    if (!confirm('Are you sure you want to reassign the Team Leader role?')) return;
    setReassigningLeadId(newLeadId);
    try {
      const updated = await apiRequest(`/admin/teams/${teamId}/lead`, {
        method: 'PATCH',
        data: { newLeadId },
      });

      setTeam(updated);
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      alert(err.message || 'Failed to reassign team lead');
    } finally {
      setReassigningLeadId(null);
    }
  };

  const handleOpenAddMember = () => {
    setMemberToEdit(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (member) => {
    setMemberToEdit(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (memberData) => {
    if (memberToEdit?._id) {
      const updated = await apiRequest(`/admin/teams/${teamId}/members/${memberToEdit._id}`, {
        method: 'PATCH',
        data: memberData,
      });
      setTeam(updated);
    } else {
      const updated = await apiRequest(`/admin/teams/${teamId}/members`, {
        method: 'POST',
        data: memberData,
      });
      setTeam(updated);
    }
    if (onTeamUpdated) onTeamUpdated();
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} (${member.email}) from this team roster?`)) {
      return;
    }

    setRemovingMemberId(member._id);
    try {
      const updated = await apiRequest(`/admin/teams/${teamId}/members/${member._id}`, {
        method: 'DELETE',
      });
      setTeam(updated);
      if (onTeamUpdated) onTeamUpdated();
    } catch (err) {
      alert(err.message || 'Failed to remove team member.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (!isOpen) return null;

  const members = team?.memberIds || [];
  const lead = team?.leadId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-[#121212] border border-[var(--border)] hud-frame w-full max-w-3xl p-5 sm:p-6 shadow-2xl relative text-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge live">TEAM #{team?.regnId || 'REGISTRY'}</span>
              <span className="mono dim text-xs">SOURCE: {team?.createdVia?.toUpperCase() || 'IMPORT'}</span>
            </div>
            <h3 className="text-xl font-black uppercase text-white mt-1">
              {team?.teamName || 'Team Details'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center mono dim text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--red2)]" />
            Loading team profile &amp; roster...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-400 mono text-xs">{error}</div>
        ) : (
          <div className="overflow-y-auto overflow-x-hidden space-y-6 flex-1 pr-1 modal-scroll">
            {/* Team Meta & Presentation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Info & Edit Card */}
              <div className="bg-black/40 p-4 border border-[var(--border)] rounded">
                <div className="flex justify-between items-center mb-3">
                  <span className="mono text-xs text-[var(--red2)] font-bold">
                    [ TEAM IDENTITY ]
                  </span>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mono text-xs dim hover:text-white flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTeamInfo}
                        disabled={saving}
                        className="text-xs text-[var(--red2)] mono font-bold hover:underline"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-neutral-400 mono hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mono dim text-[10px] block mb-1">TEAM NAME</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="mono dim text-[10px] block mb-1">DOMAIN TRACK</label>
                      <input
                        type="text"
                        value={editDomain}
                        onChange={(e) => setEditDomain(e.target.value)}
                        className="w-full p-2 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="dim mono">Name: </span>
                      <strong className="text-white">{team.teamName}</strong>
                    </div>
                    <div>
                      <span className="dim mono">Track: </span>
                      <span className="text-neutral-300">{team.domain || 'Open Innovation'}</span>
                    </div>
                    <div>
                      <span className="dim mono">Registration: </span>
                      <span className="text-neutral-300">{team.regnId}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* PPT Status Card */}
              <div className="bg-black/40 p-4 border border-[var(--border)] rounded flex flex-col justify-between">
                <div>
                  <span className="mono text-xs text-[var(--red2)] font-bold block mb-2">
                    [ PRESENTATION DECK ]
                  </span>
                  {team.ppt ? (
                    <div className="text-xs">
                      <span className="badge live mb-2">Uploaded &amp; Verified</span>
                      <p className="dim mono text-[11px] mt-2">
                        Uploaded via Cloudinary secure bucket.
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <span className="badge mb-2">Pending Submission</span>
                      <p className="dim mono text-[11px] mt-2">
                        No PPT uploaded by team leader yet.
                      </p>
                    </div>
                  )}
                </div>

                {team.ppt && (
                  <a
                    href={getTeamDeckDirectUrl(team)}
                    onClick={(e) => {
                      e.preventDefault();
                      openTeamDeck(team);
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost text-xs py-1.5 px-3.5 mt-3 inline-flex items-center gap-2 w-max cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Uploaded Deck
                  </a>
                )}
              </div>
            </div>

            {/* Roster & Members */}
            <div className="bg-black/40 p-4 border border-[var(--border)] rounded space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-[var(--border)]/50">
                <div className="mono text-xs text-[var(--red2)] font-bold flex items-center gap-2">
                  <span>[ ROSTER MEMBERSHIP ({members.length}/5) ]</span>
                  {members.length < 5 && (
                    <span className="text-[10px] text-neutral-400 font-normal">({5 - members.length} slots open)</span>
                  )}
                </div>
                {members.length < 5 && (
                  <button
                    type="button"
                    onClick={handleOpenAddMember}
                    className="btn btn-primary text-xs py-1 px-2.5 flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              {/* Lead Entry */}
              {lead && (
                <div className="p-3.5 border border-[var(--red2)]/40 bg-red-950/20 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">{lead.name}</span>
                      <span className="badge live">Team Lead</span>
                      {lead.isActivated && (
                        <span className="text-[10px] text-green-400 mono">✓ Activated</span>
                      )}
                    </div>
                    <div className="mono dim text-[11px] mt-1 break-all">{lead.email} {lead.mobile ? `· ${lead.mobile}` : ''}</div>
                    {lead.organisation && (
                      <div className="dim text-[11px] mt-0.5">{lead.organisation}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => handleOpenEditMember(lead)}
                      className="mono text-xs text-neutral-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-black/40 hover:bg-black/80 border border-[var(--border)] transition-colors"
                      title="Edit team leader details"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Additional Members */}
              {members.map((m) => {
                if (m._id === lead?._id) return null;
                const isReassigning = reassigningLeadId === m._id;
                const isRemoving = removingMemberId === m._id;

                return (
                  <div
                    key={m._id}
                    className="p-3.5 border border-[var(--border)] bg-black/50 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{m.name}</span>
                        <span className="badge">Member</span>
                        {m.isActivated && (
                          <span className="text-[10px] text-green-400 mono">✓ Activated</span>
                        )}
                      </div>
                      <div className="mono dim text-[11px] mt-1 break-all">{m.email} {m.mobile ? `· ${m.mobile}` : ''}</div>
                      {m.organisation && (
                        <div className="dim text-[11px] mt-0.5">{m.organisation}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center flex-wrap">
                      <button
                        onClick={() => handleOpenEditMember(m)}
                        className="mono text-xs text-neutral-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-black/40 hover:bg-black/80 border border-[var(--border)] transition-colors"
                        title="Edit member details"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>

                      <button
                        onClick={() => handleReassignLead(m._id)}
                        disabled={isReassigning}
                        className="btn btn-ghost text-[10px] py-1 px-2.5 mono"
                        title="Promote this member to designated team lead"
                      >
                        {isReassigning ? 'Reassigning...' : 'Promote to Lead →'}
                      </button>

                      <button
                        onClick={() => handleRemoveMember(m)}
                        disabled={isRemoving}
                        className="mono text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 transition-colors"
                        title="Remove member from roster"
                      >
                        {isRemoving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] shrink-0 gap-3">
          {team ? (
            <NocDownloadButton
              team={team}
              eventInfo={eventInfo}
              variant="admin"
              buttonText="Download Team NOC"
            />
          ) : <div />}
          <button onClick={onClose} className="btn btn-ghost text-xs">
            Close
          </button>
        </div>

        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => {
            setIsMemberModalOpen(false);
            setMemberToEdit(null);
          }}
          onSave={handleSaveMember}
          initialData={memberToEdit}
          title={memberToEdit ? (memberToEdit._id === lead?._id ? 'Edit Team Leader' : 'Edit Member Details') : 'Add New Member'}
        />
      </div>
    </div>
  );
};
