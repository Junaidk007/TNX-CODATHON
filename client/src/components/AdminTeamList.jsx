import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  Shield, 
  Award, 
  RefreshCw, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText 
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { AdminTeamDetailModal } from './AdminTeamDetailModal';

export const AdminTeamList = ({ token, refreshTrigger }) => {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({ totalTeams: 0, totalParticipants: 0, totalActivated: 0, totalPptsSubmitted: 0 });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected Team for Inspection Modal
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  const fetchTeamsAndStats = async () => {
    setLoading(true);
    try {
      const [teamsData, statsData] = await Promise.all([
        apiRequest(`/admin/teams${filterType !== 'all' ? `?createdVia=${filterType}` : ''}`, { token }),
        apiRequest('/admin/stats', { token }),
      ]);
      setTeams(teamsData || []);
      setStats(statsData || { totalTeams: 0, totalParticipants: 0, totalActivated: 0, totalPptsSubmitted: 0 });
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndStats();
  }, [token, refreshTrigger, filterType]);

  const filteredTeams = teams.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(s) ||
      t.regnId.toLowerCase().includes(s) ||
      t.leadId?.name?.toLowerCase().includes(s) ||
      t.leadId?.email?.toLowerCase().includes(s) ||
      t.domain?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Swiss Telemetry Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="f1-card p-5 border-l-4 border-l-black">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            TOTAL TEAMS
          </div>
          <div className="text-3xl font-black italic tracking-tight text-black mt-1">
            {stats.totalTeams}
          </div>
        </div>

        <div className="f1-card p-5 border-l-4 border-l-[#e10600]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            FINALIST CANDIDATES
          </div>
          <div className="text-3xl font-black italic tracking-tight text-[#e10600] mt-1">
            {stats.totalParticipants}
          </div>
        </div>

        <div className="f1-card p-5 border-l-4 border-l-emerald-600">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            ACTIVATED (LOGGED IN)
          </div>
          <div className="text-3xl font-black italic tracking-tight text-emerald-700 mt-1">
            {stats.totalActivated}
          </div>
        </div>

        <div className="f1-card p-5 border-l-4 border-l-cyan-600">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
            PPT DECKS SUBMITTED
          </div>
          <div className="text-3xl font-black italic tracking-tight text-cyan-800 mt-1">
            {stats.totalPptsSubmitted || 0}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#f8f9fa] border border-black/10">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search regn ID, team, lead, track..."
            className="w-full pl-9 pr-4 py-2 text-xs font-mono border border-black/30 focus:border-[#e10600] focus:outline-none bg-white text-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex bg-white p-1 border border-black/20 text-xs font-mono font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 transition-colors uppercase ${
                filterType === 'all' ? 'bg-black text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('preload')}
              className={`px-3 py-1 transition-colors uppercase ${
                filterType === 'preload' ? 'bg-black text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              Preload
            </button>
            <button
              onClick={() => setFilterType('wildcard')}
              className={`px-3 py-1 transition-colors uppercase ${
                filterType === 'wildcard' ? 'bg-black text-white' : 'text-slate-600 hover:text-black'
              }`}
            >
              Wildcard
            </button>
          </div>

          <button
            onClick={fetchTeamsAndStats}
            title="Refresh Teams"
            className="p-2 bg-white border border-black/20 hover:border-black text-slate-600 hover:text-black transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTeams.map((team) => (
          <div
            key={team._id}
            className="f1-card p-6 flex flex-col justify-between group border-l-4 hover:border-l-[#e10600] border-l-black"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="f1-telemetry-badge px-2 py-0.5 bg-black text-white">
                      {team.regnId}
                    </span>
                    <span className="f1-telemetry-badge px-2 py-0.5 border border-black/20 text-slate-700">
                      {team.createdVia}
                    </span>
                    {team.ppt ? (
                      <span className="f1-telemetry-badge px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                        PPT READY
                      </span>
                    ) : (
                      <span className="f1-telemetry-badge px-2 py-0.5 bg-red-100 text-[#e10600] border border-red-200">
                        NO PPT
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-black italic uppercase tracking-tight text-black pt-1">
                    {team.teamName}
                  </h4>
                </div>

                {team.domain && (
                  <span className="text-[10px] font-mono uppercase bg-[#f8f9fa] px-2.5 py-1 border border-black/10 text-slate-700 font-bold">
                    {team.domain}
                  </span>
                )}
              </div>

              {/* Members Preview */}
              <div className="mt-4 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  ROSTER ({team.memberIds?.length || 0}/5):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.memberIds?.map((mem) => {
                    const isLead = mem._id === team.leadId?._id || mem.role === 'lead';
                    return (
                      <span
                        key={mem._id}
                        className={`text-xs px-2 py-0.5 border font-mono font-bold uppercase flex items-center gap-1 ${
                          isLead
                            ? 'bg-red-50 border-[#e10600] text-[#e10600]'
                            : 'bg-[#f8f9fa] border-black/10 text-slate-800'
                        }`}
                      >
                        {isLead && <Award className="w-3 h-3 text-[#e10600]" />}
                        <span>{mem.name}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">
                Lead: <strong className="text-black">{team.leadId?.name || 'Unassigned'}</strong>
              </span>

              <button
                onClick={() => setSelectedTeamId(team._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white hover:bg-[#e10600] text-xs font-mono font-bold uppercase transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect / Override</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && !loading && (
        <div className="p-12 text-center bg-[#f8f9fa] border border-black/10 text-slate-500 font-mono text-xs">
          No teams found matching the search criteria.
        </div>
      )}

      {/* Team Detail / Override Modal */}
      {selectedTeamId && (
        <AdminTeamDetailModal
          teamId={selectedTeamId}
          isOpen={!!selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
          token={token}
          onUpdated={fetchTeamsAndStats}
        />
      )}
    </div>
  );
};
