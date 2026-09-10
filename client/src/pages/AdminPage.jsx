import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import { AdminImportModal } from '../components/AdminImportModal';
import { WildcardTeamModal } from '../components/WildcardTeamModal';
import { AdminEventInfoModal } from '../components/AdminEventInfoModal';
import { AdminTeamDetailModal } from '../components/AdminTeamDetailModal';
import {
  UploadCloud,
  UserPlus,
  Settings,
  RefreshCw,
  Search,
  ExternalLink,
  Shield,
  FileCheck
} from 'lucide-react';

export function AdminPage() {
  const { userProfile, clerkToken } = useAuthContext();

  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalParticipants: 0,
    totalActivated: 0,
    totalPptsSubmitted: 0,
    wildcardTeams: 0,
  });
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isWildcardOpen, setIsWildcardOpen] = useState(false);
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [teamsData, statsData] = await Promise.all([
        apiRequest('/admin/teams'),
        apiRequest('/admin/stats'),
      ]);
      setTeams(teamsData || []);
      setStats(statsData || {
        totalTeams: 0,
        totalParticipants: 0,
        totalActivated: 0,
        totalPptsSubmitted: 0,
        wildcardTeams: 0,
      });
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [refreshTrigger]);

  const domains = [
    'AI & Machine Learning',
    'Cybersecurity',
    'FinTech & Automation',
    'Healthcare Technology',
    'Open Innovation',
    'Smart City Solutions',
    'Sustainability & Green Innovation',
    'Web & Mobile Applications',
  ];

  const filteredTeams = teams.filter((t) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.teamName.toLowerCase().includes(s) ||
      (t.regnId && t.regnId.toLowerCase().includes(s)) ||
      (t.leadId?.name && t.leadId.name.toLowerCase().includes(s)) ||
      (t.leadId?.email && t.leadId.email.toLowerCase().includes(s));

    const matchesDomain = !domainFilter || t.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const wildcardCount = teams.filter((t) => t.createdVia === 'wildcard').length;

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
              <div className="eyebrow">Organizer Console</div>
              <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 46px)' }}>
                Admin <span className="grad-text">Dashboard</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="badge live">ROLE: ADMIN</span>
              <button
                onClick={() => setRefreshTrigger((c) => c + 1)}
                className="btn btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5"
                title="Refresh Registry"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* 4 Stat HUD Frames */}
          <div className="grid g4" style={{ marginTop: 40 }}>
            <div className="hud-frame" style={{ padding: 22 }}>
              <div className="mono dim" style={{ fontSize: 11 }}>
                TOTAL TEAMS
              </div>
              <div className="grad-text mono" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>
                {stats.totalTeams || teams.length}
              </div>
            </div>

            <div className="hud-frame" style={{ padding: 22 }}>
              <div className="mono dim" style={{ fontSize: 11 }}>
                PARTICIPANTS
              </div>
              <div className="grad-text mono" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>
                {stats.totalParticipants || '128'}
              </div>
            </div>

            <div className="hud-frame" style={{ padding: 22 }}>
              <div className="mono dim" style={{ fontSize: 11 }}>
                PPTS SUBMITTED
              </div>
              <div className="grad-text mono" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>
                {stats.totalPptsSubmitted} / {stats.totalTeams || teams.length}
              </div>
            </div>

            <div
              className="hud-frame"
              style={{ padding: 22, borderColor: 'rgba(255, 42, 61, 0.4)' }}
            >
              <div className="mono" style={{ fontSize: 11, color: 'var(--red2)' }}>
                WILDCARD TEAMS
              </div>
              <div
                className="mono"
                style={{ fontSize: 30, fontWeight: 700, marginTop: 6, color: 'var(--red2)' }}
              >
                {wildcardCount || stats.wildcardTeams || 0}
              </div>
            </div>
          </div>

          {/* Organizer Actions Row */}
          <div className="grid g2" style={{ marginTop: 32, gap: 20 }}>
            {/* Bulk Import */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em', marginBottom: 14 }}>
                BULK IMPORT
              </div>
              <div
                style={{
                  border: '1.5px dashed var(--border)',
                  borderRadius: 4,
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14 }}>Upload finalist CSV / .xlsx</div>
                <div className="dim" style={{ fontSize: 12, marginTop: 6 }}>
                  Groups rows by Regn ID · updates existing teams on match
                </div>
              </div>
              <button onClick={() => setIsImportOpen(true)} className="btn btn-primary" style={{ marginTop: 14 }}>
                Import File →
              </button>
            </div>

            {/* Wildcard & Schedule */}
            <div className="panel" style={{ padding: 24 }}>
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em', marginBottom: 14 }}>
                ORGANIZER ACTIONS
              </div>
              <p className="dim" style={{ fontSize: 13.5 }}>
                Manually register wildcard teams outside the bulk import or update public event schedule and prize pool metadata.
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={() => setIsWildcardOpen(true)} className="btn btn-ghost">
                  + Add Wildcard Team
                </button>
                <button onClick={() => setIsEventEditorOpen(true)} className="btn btn-ghost">
                  <Settings className="w-3.5 h-3.5 mr-1" /> Edit Event Info
                </button>
              </div>
            </div>
          </div>

          {/* Team Registry Table */}
          <div className="panel" style={{ marginTop: 28, padding: 0, overflow: 'hidden' }}>
            {/* Registry Filter Bar */}
            <div
              style={{
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className="mono dim" style={{ fontSize: 11, letterSpacing: '.08em' }}>
                TEAM REGISTRY ({filteredTeams.length} TEAMS)
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search teams / leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mono text-xs"
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    color: 'var(--text)',
                    minWidth: 180,
                  }}
                />

                <select
                  value={domainFilter}
                  onChange={(e) => setDomainFilter(e.target.value)}
                  className="mono text-xs"
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    color: 'var(--text)',
                  }}
                >
                  <option value="">All tracks</option>
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr
                    className="mono dim"
                    style={{
                      fontSize: 11,
                      textAlign: 'left',
                      letterSpacing: '.05em',
                      borderBottom: '1px solid var(--border)',
                      background: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <th style={{ padding: '12px 14px' }}>TEAM</th>
                    <th style={{ padding: '12px 10px' }}>TRACK</th>
                    <th style={{ padding: '12px 10px' }}>SIZE</th>
                    <th style={{ padding: '12px 10px' }}>LEAD</th>
                    <th style={{ padding: '12px 10px' }}>PPT</th>
                    <th style={{ padding: '12px 10px' }}>SOURCE</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((t) => {
                    const memberCount =
                      (Array.isArray(t.memberIds) ? t.memberIds.length : 0) + (t.leadId ? 1 : 0);

                    return (
                      <tr
                        key={t._id}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s',
                        }}
                        className="hover:bg-white/[0.02]"
                      >
                        <td style={{ padding: '14px 14px', fontWeight: 600 }}>
                          <div>{t.teamName}</div>
                          <div className="mono dim text-[10px] mt-0.5">{t.regnId}</div>
                        </td>

                        <td style={{ padding: '14px 10px' }} className="dim mono text-xs">
                          {t.domain || 'Open Innovation'}
                        </td>

                        <td style={{ padding: '14px 10px' }} className="dim">
                          {memberCount}
                        </td>

                        <td style={{ padding: '14px 10px' }}>
                          <div className="font-medium text-white">{t.leadId?.name || '—'}</div>
                          {t.leadId?.email && (
                            <div className="mono dim text-[11px]">{t.leadId.email}</div>
                          )}
                        </td>

                        <td style={{ padding: '14px 10px' }}>
                          {t.ppt ? (
                            <span className="badge live">Uploaded</span>
                          ) : (
                            <span className="badge">Pending</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 10px' }} className="dim mono text-[11px]">
                          {t.createdVia === 'wildcard' ? 'Wildcard' : 'Import'}
                        </td>

                        <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedTeamId(t._id)}
                            className="mono text-xs hover:underline cursor-pointer"
                            style={{ color: 'var(--white)' }}
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTeams.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: 32, textAlign: 'center' }} className="mono dim">
                        No team records found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AdminImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        token={clerkToken}
        onImportSuccess={() => setRefreshTrigger((c) => c + 1)}
      />

      <WildcardTeamModal
        isOpen={isWildcardOpen}
        onClose={() => setIsWildcardOpen(false)}
        token={clerkToken}
        onTeamCreated={() => setRefreshTrigger((c) => c + 1)}
      />

      <AdminEventInfoModal
        isOpen={isEventEditorOpen}
        onClose={() => setIsEventEditorOpen(false)}
        token={clerkToken}
        onUpdated={() => setRefreshTrigger((c) => c + 1)}
      />

      <AdminTeamDetailModal
        teamId={selectedTeamId}
        isOpen={Boolean(selectedTeamId)}
        onClose={() => setSelectedTeamId(null)}
        token={clerkToken}
        onTeamUpdated={() => setRefreshTrigger((c) => c + 1)}
      />
    </div>
  );
}
