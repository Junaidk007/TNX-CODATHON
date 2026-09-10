import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  UploadCloud, 
  FileCheck, 
  Edit3, 
  Check, 
  X, 
  User, 
  Calendar, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  Award,
  Clock,
  Sparkles,
  ChevronRight,
  Flame
} from 'lucide-react';
import { apiRequest, openTeamDeck, getTeamDeckDirectUrl } from '../services/api';
import { NocDownloadButton } from './NocDownloadButton';

export const ParticipantDashboard = ({ userProfile, token, onProfileUpdate, eventInfo: propEventInfo }) => {
  const [team, setTeam] = useState(null);
  const [eventInfo, setEventInfo] = useState(propEventInfo || null);
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

  // PPT Upload State
  const [pptFile, setPptFile] = useState(null);
  const [uploadingPpt, setUploadingPpt] = useState(false);
  const [pptSuccessMsg, setPptSuccessMsg] = useState('');

  const isLead = userProfile?.role === 'lead' || userProfile?.role === 'admin';

  const fetchMyTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/teams/me', { token });
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
  }, [token, userProfile]);

  useEffect(() => {
    if (!eventInfo) {
      apiRequest('/event-info', { token })
        .then(setEventInfo)
        .catch(console.error);
    }
  }, [token]);

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
        token,
      });
      setTeam(updated);
      setIsEditingTeamName(false);
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
        token,
      });
      if (onProfileUpdate) onProfileUpdate(updated);
      setIsEditingOwnName(false);
    } catch (err) {
      alert(err.message || 'Failed to update your name');
    } finally {
      setSavingOwnName(false);
    }
  };

  const handlePptUpload = async (e) => {
    const file = e.target.files?.[0] || pptFile;
    if (!file) return;

    setUploadingPpt(true);
    setPptSuccessMsg('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiRequest('/teams/me/ppt', {
        method: 'POST',
        data: formData,
        token,
      });
      setTeam((prev) => ({ ...prev, ppt: res.pptUrl }));
      setPptSuccessMsg('Presentation uploaded to Cloudinary successfully!');
      setPptFile(null);
    } catch (err) {
      alert(err.message || 'Failed to upload presentation deck.');
    } finally {
      setUploadingPpt(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#e10600] animate-spin" />
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold font-mono">
          Loading Telemetry & Team Data...
        </span>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="p-8 rounded-xl border border-red-600/30 bg-red-50 text-center max-w-xl mx-auto my-12">
        <h3 className="text-lg font-bold text-red-700">Team Information Unavailable</h3>
        <p className="text-sm text-slate-600 mt-2">{error || 'No team is assigned to your account.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Telemetry Header Bar */}
      <div className="f1-card p-6 sm:p-8 rounded-none border-l-4 border-l-[#e10600] relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-[#e10600]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="f1-telemetry-badge px-2.5 py-1 bg-black text-white">
                REGN ID: {team.regnId}
              </span>
              <span className="f1-telemetry-badge px-2.5 py-1 bg-[#e10600] text-white">
                TRACK: {team.domain || 'GENERAL INNOVATION'}
              </span>
              <span className="f1-telemetry-badge px-2 py-0.5 border border-black/20 text-slate-700">
                {team.createdVia.toUpperCase()}
              </span>
            </div>

            {/* Team Name Heading */}
            {isEditingTeamName ? (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="px-3 py-1.5 text-xl sm:text-2xl font-black italic uppercase border-2 border-[#e10600] focus:outline-none bg-white text-black"
                />
                <button
                  onClick={handleSaveTeamName}
                  disabled={savingTeamName}
                  className="p-2 bg-[#e10600] text-white hover:bg-red-700 transition-colors"
                >
                  {savingTeamName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsEditingTeamName(false)}
                  className="p-2 bg-slate-200 text-black hover:bg-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-1">
                <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-black">
                  {team.teamName}
                </h1>
                {isLead && (
                  <button
                    onClick={() => setIsEditingTeamName(true)}
                    title="Edit Team Name"
                    className="p-1.5 text-slate-400 hover:text-[#e10600] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Telemetry Status */}
          <div className="flex items-center gap-4 bg-[#f8f9fa] border border-black/10 p-4">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">
                PPT STATUS
              </div>
              <div className="text-sm font-black uppercase text-black flex items-center justify-end gap-1.5 mt-0.5">
                {team.ppt ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-emerald-700">SUBMITTED</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#e10600]" />
                    <span className="text-[#e10600]">PENDING</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (Presentation Upload) & Right Column (Roster) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Presentation Upload Zone (Lead only or View for Member) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="f1-card p-6 sm:p-7 relative border-t-2 border-t-black">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#e10600] text-white flex items-center justify-center font-bold">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-black">
                    Presentation Deck (PPT)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono uppercase">Cloudinary Storage Pipeline</p>
                </div>
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
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-[#e10600] text-xs font-bold font-mono uppercase transition-colors cursor-pointer"
                >
                  <span>View PPT</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* If Lead: Upload / Replace Dropzone */}
            {isLead ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-black/20 hover:border-[#e10600] bg-[#fdfdfd] p-6 text-center transition-colors">
                  <input
                    type="file"
                    id="ppt-upload-input"
                    accept=".ppt,.pptx,.pdf"
                    onChange={handlePptUpload}
                    disabled={uploadingPpt}
                    className="hidden"
                  />
                  <label
                    htmlFor="ppt-upload-input"
                    className="cursor-pointer block space-y-2"
                  >
                    <div className="w-12 h-12 bg-red-50 text-[#e10600] flex items-center justify-center mx-auto border border-red-200">
                      {uploadingPpt ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-tight text-black">
                      {uploadingPpt
                        ? 'Uploading to Cloudinary...'
                        : team.ppt
                        ? 'Click to Replace Current PPT'
                        : 'Upload Team Presentation Deck'}
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      Accepts PowerPoint (.pptx, .ppt) and PDF (.pdf) up to 25MB
                    </p>
                  </label>
                </div>

                {pptSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{pptSuccessMsg}</span>
                  </div>
                )}
              </div>
            ) : (
              /* If Member: Read-Only Submission Status */
              <div className="p-6 bg-[#f8f9fa] border border-black/10 text-center space-y-2">
                <div className="text-xs font-mono uppercase text-slate-500">Submission Access</div>
                <div className="text-sm font-bold text-black">
                  {team.ppt ? 'Your team leader has uploaded the presentation deck.' : 'Awaiting presentation deck upload from team leader.'}
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
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-black text-white hover:bg-[#e10600] text-xs font-bold font-mono uppercase transition-colors cursor-pointer"
                  >
                    <span>Download Deck</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="f1-card p-6 bg-[#f8f9fa] border-t-2 border-t-slate-400">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
                MY PROFILE TELEMETRY
              </div>
              <span className="f1-telemetry-badge px-2 py-0.5 bg-black text-white">
                ROLE: {userProfile?.role?.toUpperCase()}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-mono">CANDIDATE NAME</div>
                  {isEditingOwnName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={newOwnName}
                        onChange={(e) => setNewOwnName(e.target.value)}
                        className="px-2.5 py-1 text-sm font-bold border border-black focus:outline-none bg-white text-black"
                      />
                      <button
                        onClick={handleSaveOwnName}
                        disabled={savingOwnName}
                        className="p-1 bg-[#e10600] text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsEditingOwnName(false)}
                        className="p-1 bg-slate-200 text-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-base font-black text-black flex items-center gap-2 mt-0.5">
                      <span>{userProfile?.name}</span>
                      <button
                        onClick={() => setIsEditingOwnName(true)}
                        className="text-slate-400 hover:text-[#e10600]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-mono">EMAIL (LOCKED)</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5 font-mono">{userProfile?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Team NOC Download Card */}
          <div className="f1-card p-6 bg-[#f8f9fa] border-l-4 border-l-purple-600">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="text-xs font-bold uppercase tracking-widest text-purple-700 font-mono">
                FINALIST TEAM NOC
              </div>
              <span className="f1-telemetry-badge px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300">
                OFFICIAL
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Download the official 2-page No Objection Certificate for your team to submit to your college or university administration for academic leave approval and On-Duty (OD) status.
            </p>

            <div className="mt-4">
              <NocDownloadButton
                team={team}
                eventInfo={eventInfo}
                buttonText="Download Team NOC (PDF)"
              />
            </div>
          </div>
        </div>

        {/* Team Members Roster */}
        <div className="lg:col-span-6 space-y-6">
          <div className="f1-card p-6 sm:p-7 border-t-2 border-t-[#e10600]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-black">
                    Finalist Roster ({team.memberIds?.length || 0}/5)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono uppercase">Verified Participants</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {team.memberIds?.map((mem, idx) => {
                const isMemLead = mem._id === team.leadId?._id || mem.role === 'lead';
                return (
                  <div
                    key={mem._id || idx}
                    className={`p-4 border transition-all ${
                      isMemLead
                        ? 'bg-red-50/50 border-[#e10600]/40'
                        : 'bg-white border-black/10 hover:border-black/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-black uppercase">
                            {mem.name}
                          </span>
                          {isMemLead && (
                            <span className="f1-telemetry-badge px-2 py-0.5 bg-[#e10600] text-white">
                              LEADER
                            </span>
                          )}
                          {mem.isActivated && (
                            <span className="f1-telemetry-badge px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 font-mono mt-1">
                          {mem.email} {mem.mobile && `• ${mem.mobile}`}
                        </div>
                        {mem.organisation && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {mem.organisation}
                          </div>
                        )}
                      </div>

                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
