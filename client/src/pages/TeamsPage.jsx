import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const DEFAULT_TEAMS = [
  { _id: '1', teamName: 'ALPHA++', domain: 'AI & Machine Learning', memberCount: 5 },
  { _id: '2', teamName: 'CODE CRUSADERS', domain: 'FinTech & Automation', memberCount: 4 },
  { _id: '3', teamName: 'NEXUS', domain: 'Smart City Solutions', memberCount: 5 },
  { _id: '4', teamName: 'BYTE FORCE', domain: 'Cybersecurity', memberCount: 3 },
  { _id: '5', teamName: 'QUANTUM LEAP', domain: 'Healthcare Technology', memberCount: 4 },
  { _id: '6', teamName: 'STACK OVERFLOW', domain: 'Web & Mobile Applications', memberCount: 5 },
  { _id: '7', teamName: 'GREEN PULSE', domain: 'Sustainability & Green Innovation', memberCount: 2 },
  { _id: '8', teamName: 'SYNAPSE', domain: 'Open Innovation', memberCount: 1 },
  { _id: '9', teamName: 'CYBER SENTINELS', domain: 'Cybersecurity', memberCount: 4 },
  { _id: '10', teamName: 'NEURAL NETWORKS', domain: 'AI & Machine Learning', memberCount: 5 },
  { _id: '11', teamName: 'MEDTECH INNOVATORS', domain: 'Healthcare Technology', memberCount: 3 },
  { _id: '12', teamName: 'BLOCKCHAIN BRIGADE', domain: 'FinTech & Automation', memberCount: 4 },
];

function getInitials(name) {
  if (!name) return 'TNX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function TeamsPage() {
  const [teams, setTeams] = useState(DEFAULT_TEAMS);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicTeams()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data);
        }
      })
      .catch((err) => {
        console.warn('Using default public teams fallback:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
    const matchesSearch = t.teamName.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = !domainFilter || t.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  return (
    <div>
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="wrap">
          <div className="eyebrow">Roster</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 50px)' }}>
            Teams at <span className="grad-text">TNX Codathon 2K26</span>
          </h1>
          <p className="dim" style={{ maxWidth: 560, fontSize: 16, marginTop: 16 }}>
            Confirmed finalist teams building across 8 tracks. Only public team identity is shown here —
            participant contact details remain private to organizers and each team's own secure portal.
          </p>

          {/* Controls: Search & Filter */}
          <div
            style={{
              display: 'flex',
              gap: 14,
              marginTop: 32,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Search team name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mono"
              style={{
                padding: '11px 16px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text)',
                fontSize: 13,
                minWidth: 220,
              }}
            />

            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="mono"
              style={{
                padding: '11px 16px',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text)',
                fontSize: 13,
              }}
            >
              <option value="">All tracks</option>
              {domains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <span className="mono dim" style={{ fontSize: 12 }}>
              {filteredTeams.length} {filteredTeams.length === 1 ? 'team' : 'teams'} shown
            </span>
          </div>

          {/* Teams Grid */}
          <div className="grid g4" style={{ marginTop: 32 }}>
            {filteredTeams.map((team) => (
              <div
                key={team._id || team.teamName}
                className="panel"
                style={{
                  padding: 20,
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 4,
                      background: 'var(--grad)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--mono)',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--white)',
                    }}
                  >
                    {getInitials(team.teamName)}
                  </div>
                  <span className="badge">
                    {team.memberCount || 1} {team.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <div style={{ marginTop: 16, fontWeight: 700, fontSize: 17, letterSpacing: '.02em' }}>
                  {team.teamName}
                </div>

                <div
                  className="mono dim"
                  style={{
                    fontSize: 11.5,
                    marginTop: 6,
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {team.domain || 'Open Innovation'}
                </div>
              </div>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="hud-frame p-8 text-center mt-8">
              <div className="mono dim text-sm">No teams match your search or filter.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
