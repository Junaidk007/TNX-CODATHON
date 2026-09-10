import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { apiRequest, openTeamDeck, getTeamDeckDirectUrl } from '../services/api';
import {
  UploadCloud,
  FileCheck,
  Check,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Clock,
  Award,
  AlertCircle,
  Loader2,
  Users,
  FileText,
  UserPlus,
  Trash2,
  Building2,
} from 'lucide-react';
import { NocDownloadButton } from '../components/NocDownloadButton';
import { MemberModal } from '../components/MemberModal';

export function MyTeamPage() {
  const { userProfile, role, logout, clerkToken, refreshProfile, setUserProfile } = useAuthContext();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Team Name (Lead only)
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [savingTeamName, setSavingTeamName] = useState(false);

  // Edit Own Name
  const [isEditingOwnName, setIsEditingOwnName] = useState(false);
  const [newOwnName, setNewOwnName] = useState(userProfile?.name || '');
  const [savingOwnName, setSavingOwnName] = useState(false);

  // PPT File Upload
  const [pptFile, setPptFile] = useState(null);
  const [uploadingPpt, setUploadingPpt] = useState(false);
  const [pptSuccessMsg, setPptSuccessMsg] = useState('');

  // Member Management Modal State (Lead Only)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Event Info for NOC
  const [eventInfo, setEventInfo] = useState({});

  const isLead = userProfile?.role === 'lead' || userProfile?.role === 'admin';

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
      const updated = await apiRequest(`/teams/me/members/${memberToEdit._id}`, {
        method: 'PATCH',
        data: memberData,
      });
      setTeam(updated);
      if (memberToEdit.email === userProfile?.email) {
        setUserProfile((prev) => ({ ...prev, ...memberData }));
      }
    } else {
      const updated = await apiRequest('/teams/me/members', {
        method: 'POST',
        data: memberData,
      });
      setTeam(updated);
    }
    refreshProfile();
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} (${member.email}) from this team roster?`)) {
      return;
    }

    setRemovingMemberId(member._id);
    try {
      const updated = await apiRequest(`/teams/me/members/${member._id}`, {
        method: 'DELETE',
      });
      setTeam(updated);
      refreshProfile();
    } catch (err) {
      alert(err.message || 'Failed to remove team member.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const fetchMyTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/teams/me');
      setTeam(data);
      setNewTeamName(data.teamName);
    } catch (err) {
      console.error('Failed to load team:', err);
      setError(err.message || 'Could not load your team information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTeam();
    setNewOwnName(userProfile?.name || '');
  }, [userProfile]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await apiRequest('/event-info');
        console.log('Fetched /api/event-info response:', response);
        setEventInfo(response);
      } catch (err) {
        console.warn('Could not load event info for NOC:', err);
      }
    };
    fetchEvent();
  }, []);

  useEffect(() => {
    if (eventInfo && Object.keys(eventInfo).length > 0) {
      console.log('eventInfo state updated successfully:', eventInfo);
    }
  }, [eventInfo]);

  const handleSaveTeamName = async () => {
    if (!newTeamName.trim() || newTeamName === team?.teamName) {
      setIsEditingTeamName(false);
      return;
    }
    setSavingTeamName(true);
    try {
      const updated = await apiRequest('/teams/me', {
        method: 'PATCH',
        data: { teamName: newTeamName.trim() },
      });
      setTeam(updated);
      setIsEditingTeamName(false);
      refreshProfile();
    } catch (err) {
      alert(err.message || 'Failed to update team name');
    } finally {
      setSavingTeamName(false);
    }
  };

  const handleSaveOwnName = async () => {
    if (!newOwnName.trim() || newOwnName === userProfile?.name) {
      setIsEditingOwnName(false);
      return;
    }
    setSavingOwnName(true);
    try {
      const updated = await apiRequest('/users/me', {
        method: 'PATCH',
        data: { name: newOwnName.trim() },
      });
      setUserProfile((prev) => ({ ...prev, ...updated }));
      setIsEditingOwnName(false);
      fetchMyTeam();
    } catch (err) {
      alert(err.message || 'Failed to update your name');
    } finally {
      setSavingOwnName(false);
    }
  };

  const handlePptUpload = async (e) => {
    e.preventDefault();
    if (!pptFile) return;

    setUploadingPpt(true);
    setPptSuccessMsg('');
    try {
      const formData = new FormData();
      formData.append('file', pptFile);

      const res = await apiRequest('/teams/me/ppt', {
        method: 'POST',
        data: formData,
      });

      setTeam((prev) => ({ ...prev, ppt: res.pptUrl }));
      setPptSuccessMsg('Deck uploaded successfully to Cloudinary!');
      setPptFile(null);
    } catch (err) {
      alert(err.message || 'Failed to upload presentation deck');
    } finally {
      setUploadingPpt(false);
    }
  };

  if (role === 'admin') {
    return (
      <div className="wrap py-16">
        <div className="hud-frame p-8 sm:p-10 text-center max-w-lg mx-auto">
          <div className="eyebrow justify-center">ORGANIZER CONSOLE</div>
          <h2 className="text-2xl font-black mt-2">ADMIN ACCOUNT DETECTED</h2>
          <p className="dim text-sm mt-3 leading-relaxed">
            You are logged in with administrator privileges ({userProfile?.email}). Organizers do not have a team roster.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/admin" className="btn btn-primary">
              Open Admin Console →
            </Link>
            <button onClick={() => logout()} className="btn btn-ghost">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !team) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="hud-frame p-8 text-center max-w-md w-full">
          <div className="eyebrow justify-center">ROSTER TELEMETRY</div>
          <div className="grad-text mono text-lg font-bold mt-2">RETRIEVING TEAM DATA...</div>
          <div className="w-full bg-[#161616] border border-[var(--border)] h-1.5 mt-5 overflow-hidden rounded-full">
            <div className="bg-[var(--red2)] h-full animate-pulse w-2/3 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="wrap py-12">
        <div className="hud-frame p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-[var(--red2)] mx-auto mb-3" />
          <h2 className="text-xl font-bold">Failed to load team</h2>
          <p className="dim text-sm mt-2">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={fetchMyTeam} className="btn btn-primary">
              Retry Sync
            </button>
            <button onClick={() => logout()} className="btn btn-ghost">
              Sign Out
            </button>
            <Link to="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allMembers = [];
  if (team?.leadId) {
    allMembers.push({ ...team.leadId, isLead: true });
  }
  if (Array.isArray(team?.memberIds)) {
    team.memberIds.forEach((m) => {
      if (m._id !== team.leadId?._id) {
        allMembers.push({ ...m, isLead: false });
      }
    });
  }

  return (
    <div>
      <section className="section" style={{ paddingTop: 52 }}>
        <div className="wrap">
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div className="eyebrow">
                Authenticated Session · {isLead ? 'Team Lead' : 'Team Member'}
              </div>
              <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 46px)' }}>
                Team <span className="grad-text">{team?.teamName || 'YOUR TEAM'}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge live">SESSION ACTIVE</span>
              <span className="badge">{team?.regnId || 'REGN #'}</span>
            </div>
          </div>

          {/* 2-Column Grid */}
          <div className="grid g2" style={{ marginTop: 40, gap: 24, alignItems: 'start' }}>
            {/* LEFT COLUMN: Team Name & Members */}
            <div className="grid" style={{ gap: 24 }}>
              {/* Team Details Panel */}
              <div className="hud-frame" style={{ padding: 26 }}>
                <div
                  className="mono dim"
                  style={{ fontSize: 11, letterSpacing: '.08em', marginBottom: 16 }}
                >
                  TEAM DETAILS · {isLead ? 'EDITABLE BY LEAD' : 'READ ONLY'}
                </div>

                <label className="mono dim" style={{ fontSize: 11 }}>
                  TEAM NAME
                </label>

                {isEditingTeamName && isLead ? (
                  <div style={{ marginTop: 6, marginBottom: 18 }}>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'var(--bg-alt)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        color: 'var(--text)',
                        fontWeight: 600,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button
                        onClick={handleSaveTeamName}
                        disabled={savingTeamName}
                        className="btn btn-primary text-xs py-1.5 px-4"
                      >
                        {savingTeamName ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingTeamName(false);
                          setNewTeamName(team?.teamName || '');
                        }}
                        className="btn btn-ghost text-xs py-1.5 px-4"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 6,
                      marginBottom: 18,
                      padding: '10px 14px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{team?.teamName}</span>
                    {isLead && (
                      <button
                        onClick={() => setIsEditingTeamName(true)}
                        className="mono dim hover:text-white text-xs flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 14, fontSize: 13 }} className="dim">
                  <span>
                    Track:{' '}
                    <strong style={{ color: 'var(--text)' }}>
                      {team?.domain || 'Open Innovation'}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Size:{' '}
                    <strong style={{ color: 'var(--text)' }}>{allMembers.length} Members</strong>
                  </span>
                </div>
              </div>

              {/* Members Panel */}
              <div className="panel" style={{ padding: 26 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <div
                    className="mono dim"
                    style={{ fontSize: 11, letterSpacing: '.08em' }}
                  >
                    TEAM MEMBERS ({allMembers.length}/5)
                  </div>
                  {isLead && allMembers.length < 5 && (
                    <button
                      onClick={handleOpenAddMember}
                      className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {allMembers.map((member, idx) => {
                    const isCurrentUser = member.email === userProfile?.email;

                    return (
                      <div
                        key={member._id || idx}
                        className="p-3.5 border border-[var(--border)] rounded bg-black/40 hover:border-[var(--red2)]/60 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-3 min-w-0">
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 4,
                                background: member.isLead ? 'var(--grad)' : 'var(--bg-alt)',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--mono)',
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--white)',
                                flexShrink: 0,
                              }}
                            >
                              {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white">{member.name}</span>
                                {member.isLead ? (
                                  <span className="badge live">Team Lead</span>
                                ) : (
                                  <span className="badge">Member</span>
                                )}
                                {isCurrentUser && (
                                  <span className="mono text-[10px] text-neutral-400">[YOU]</span>
                                )}
                              </div>

                              <div className="mono dim text-xs mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-neutral-300">{member.email}</span>
                                {member.mobile && (
                                  <>
                                    <span className="text-neutral-600">·</span>
                                    <span>{member.mobile}</span>
                                  </>
                                )}
                              </div>

                              {member.organisation && (
                                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                                  <Building2 className="w-3 h-3 text-[var(--red2)] shrink-0" />
                                  <span className="truncate">{member.organisation}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Member Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border)]/40 w-full sm:w-auto justify-end">
                            {isLead ? (
                              <>
                                <button
                                  onClick={() => handleOpenEditMember(member)}
                                  className="btn btn-ghost text-xs py-1 px-2.5 flex items-center gap-1"
                                  title="Edit member information"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                {!member.isLead && (
                                  <button
                                    onClick={() => handleRemoveMember(member)}
                                    disabled={removingMemberId === member._id}
                                    className="btn btn-ghost text-xs py-1 px-2.5 text-red-400 hover:text-red-300 flex items-center gap-1"
                                    title="Remove member from team"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    <span>{removingMemberId === member._id ? 'Removing...' : 'Remove'}</span>
                                  </button>
                                )}
                              </>
                            ) : isCurrentUser ? (
                              <button
                                onClick={() => handleOpenEditMember(member)}
                                className="btn btn-ghost text-xs py-1 px-2.5 flex items-center gap-1"
                                title="Edit your details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="dim" style={{ fontSize: 12, marginTop: 18 }}>
                  {isLead
                    ? 'As Team Leader, you can add up to 5 members and update name, email, college/organisation, or phone number anytime.'
                    : 'Team composition and member information are managed by your designated Team Leader.'}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: Submission & Event Timeline */}
            <div className="grid" style={{ gap: 24 }}>
              {/* Official NOC Document Card */}
              <div
                className="panel"
                style={{
                  padding: 26,
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  background: 'linear-gradient(180deg, rgba(88, 28, 135, 0.12) 0%, rgba(0, 0, 0, 0.4) 100%)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="mono text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>FINALIST NOC · OFFICIAL CERTIFICATE</span>
                  </div>
                  <span className="badge" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', color: '#c084fc' }}>
                    2-PAGE A4
                  </span>
                </div>

                <p className="dim text-xs leading-relaxed mb-4">
                  Official No Objection Certificate issued by <strong className="text-white">TechNeekX</strong> for your team. Submit this to your institution or college administration to request academic leave and On-Duty (OD) status.
                </p>

                <div className="bg-black/50 border border-purple-900/40 rounded p-3 mb-4 mono text-[11px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="dim">NOC NO:</span>
                    <span className="text-white font-semibold">TNX-NOC-{team?.regnId || 'REGISTRY'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dim">TEAM NAME:</span>
                    <span className="text-purple-300 font-semibold">{team?.teamName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dim">MEMBERS COVERED:</span>
                    <span className="text-white">{allMembers.length} Registered Members</span>
                  </div>
                </div>

                <NocDownloadButton
                  team={team}
                  eventInfo={eventInfo}
                  buttonText="Download Official Team NOC (PDF)"
                />
              </div>

              {/* Presentation Deck Submission */}
              <div className="panel" style={{ padding: 26 }}>
                <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em' }}>
                  SUBMISSION · PRESENTATION DECK
                </div>

                {team?.ppt ? (
                  <div
                    style={{
                      marginTop: 16,
                      background: 'rgba(225,6,0,0.06)',
                      border: '1px solid rgba(225,6,0,0.3)',
                      borderRadius: 4,
                      padding: 20,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileCheck className="w-5 h-5 text-[var(--red2)]" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Presentation Uploaded</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      <a
                        href={getTeamDeckDirectUrl(team)}
                        onClick={(e) => {
                          e.preventDefault();
                          openTeamDeck(team);
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost text-xs py-1.5 px-3 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Current Deck
                      </a>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 16,
                      border: '1.5px dashed var(--border)',
                      borderRadius: 4,
                      padding: 28,
                      textAlign: 'center',
                    }}
                  >
                    <UploadCloud className="w-8 h-8 text-[var(--red2)] mx-auto mb-2 opacity-80" />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      No presentation deck submitted yet
                    </div>
                    <div className="dim" style={{ fontSize: 12, marginTop: 6 }}>
                      .ppt, .pptx, or .pdf (Max 25MB)
                    </div>
                  </div>
                )}

                {/* Upload Form (Lead Only) */}
                {isLead ? (
                  <form onSubmit={handlePptUpload} style={{ marginTop: 22 }}>
                    <div className="mono dim text-xs my-3.5 font-bold">
                      {team?.ppt ? 'REPLACE PRESENTATION DECK' : 'SELECT FILE TO UPLOAD'}
                    </div>

                    <input
                      type="file"
                      id="ppt-deck-upload-input"
                      accept=".ppt,.pptx,.pdf"
                      onChange={(e) => setPptFile(e.target.files[0] || null)}
                      className="hidden"
                    />

                    <label
                      htmlFor="ppt-deck-upload-input"
                      className="group block cursor-pointer transition-all hover:border-[var(--red2)]"
                      style={{
                        border: pptFile ? '1.5px solid var(--red2)' : '1.5px dashed rgba(255, 42, 61, 0.4)',
                        background: pptFile ? 'rgba(225, 6, 0, 0.08)' : 'rgba(0, 0, 0, 0.5)',
                        borderRadius: 6,
                        padding: '22px 18px',
                        textAlign: 'center',
                      }}
                    >
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{
                            background: pptFile ? 'var(--red2)' : 'rgba(255, 42, 61, 0.12)',
                            color: pptFile ? '#ffffff' : 'var(--red2)',
                            border: '1px solid rgba(255, 42, 61, 0.3)',
                          }}
                        >
                          {uploadingPpt ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : pptFile ? (
                            <FileCheck className="w-6 h-6" />
                          ) : (
                            <UploadCloud className="w-6 h-6" />
                          )}
                        </div>

                        {pptFile ? (
                          <div>
                            <div className="font-bold text-sm text-white break-all">
                              {pptFile.name}
                            </div>
                            <div className="mono text-xs text-[var(--red2)] font-semibold mt-1">
                              {(pptFile.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-sm text-white group-hover:text-[var(--red2)] transition-colors">
                              Click to Choose File or Drag &amp; Drop
                            </div>
                            <div className="mono text-xs dim mt-1">
                              .PPT, .PPTX, or .PDF (Max 25MB)
                            </div>
                          </div>
                        )}
                      </div>
                    </label>

                    {pptSuccessMsg && (
                      <div className="mono text-xs text-green-400 mt-3 p-2 bg-green-950/30 border border-green-800 rounded flex items-center gap-2">
                        ✓ {pptSuccessMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!pptFile || uploadingPpt}
                      className="btn btn-primary w-full mt-4 py-3 text-sm font-bold tracking-wider uppercase"
                    >
                      {uploadingPpt ? 'Uploading Deck...' : team?.ppt ? 'Replace Deck →' : 'Upload Deck →'}
                    </button>
                  </form>
                ) : (
                  <div className="hud-frame p-4 text-center mt-4">
                    <div className="mono dim text-xs">
                      Deck submission is managed by your designated Team Leader ({team?.leadId?.name || 'Lead'}).
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Event Day Card */}
              <div className="hud-frame" style={{ padding: 26 }}>
                <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em' }}>
                  HACKATHON DAY CHECKPOINTS
                </div>

                <div className="space-y-3 mt-4 mono text-xs">
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="dim">09:00 AM</span>
                    <span>Check-in &amp; ID Verification</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="dim">10:15 AM</span>
                    <span className="text-[var(--red2)] font-bold">Hacking Window Opens</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="dim">01:00 PM</span>
                    <span>Lunch &amp; Networking</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border)] pb-2">
                    <span className="dim">03:45 PM</span>
                    <span className="text-[var(--red2)] font-bold">Deck Submission Closes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="dim">04:00 PM</span>
                    <span>Live Pitch Demos (5 mins)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Add / Edit Modal */}
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => {
            setIsMemberModalOpen(false);
            setMemberToEdit(null);
          }}
          onSave={handleSaveMember}
          initialData={memberToEdit}
          isLead={memberToEdit?.isLead || false}
        />
      </section>
    </div>
  );
}
