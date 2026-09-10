import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { apiRequest } from '../services/api';
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
  FileText
} from 'lucide-react';
import { NocDownloadButton } from '../components/NocDownloadButton';

export function MyTeamPage() {
  const { userProfile, clerkToken, refreshProfile, setUserProfile } = useAuthContext();

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

  // Event Info for NOC
  const [eventInfo, setEventInfo] = useState({});

  const isLead = userProfile?.role === 'lead' || userProfile?.role === 'admin';

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
          <button onClick={fetchMyTeam} className="btn btn-primary mt-6">
            Retry Sync
          </button>
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
                  className="mono dim"
                  style={{ fontSize: 11, letterSpacing: '.08em', marginBottom: 12 }}
                >
                  TEAM MEMBERS ({allMembers.length})
                </div>

                <div>
                  {allMembers.map((member, idx) => {
                    const isCurrentUser = member.email === userProfile?.email;

                    return (
                      <div
                        key={member._id || idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '14px 0',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 4,
                              background: member.isLead ? 'var(--grad)' : 'var(--bg-alt)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--mono)',
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'var(--white)',
                            }}
                          >
                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                          </div>

                          <div>
                            <div style={{ fontSize: 14.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {isCurrentUser && isEditingOwnName ? (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    value={newOwnName}
                                    onChange={(e) => setNewOwnName(e.target.value)}
                                    className="px-2 py-1 text-xs"
                                    style={{ width: 140 }}
                                  />
                                  <button
                                    onClick={handleSaveOwnName}
                                    disabled={savingOwnName}
                                    className="btn btn-primary text-[10px] py-0.5 px-2"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setIsEditingOwnName(false)}
                                    className="text-[10px] dim px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span>{member.name}</span>
                                  {isCurrentUser && (
                                    <button
                                      onClick={() => setIsEditingOwnName(true)}
                                      className="text-neutral-500 hover:text-white"
                                      title="Edit your name"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="mono dim text-xs mt-0.5">{member.email}</div>
                          </div>
                        </div>

                        <div>
                          {member.isLead ? (
                            <span className="badge live">Team Lead</span>
                          ) : (
                            <span className="badge">Member</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="dim" style={{ fontSize: 12.5, marginTop: 16 }}>
                  Only your personal name is editable. Contact hackathon organizers to update registered email or modify team composition.
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
                        href={`/api/teams/${team._id || team.id || team.regnId}/ppt`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost text-xs py-1.5 px-3.5 inline-flex items-center gap-2"
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
      </section>
    </div>
  );
}
