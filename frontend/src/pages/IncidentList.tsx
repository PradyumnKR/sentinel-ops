import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Incident, User } from '../types';
import { Filter, Plus, Search, RefreshCw, AlertCircle, AlertTriangle, CheckCircle, Shield, ChevronDown, MoreHorizontal } from 'lucide-react';

export const IncidentList: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, severityFilter, assignedToMe]);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incRes, userRes] = await Promise.all([
        api.get<Incident[]>('/incidents/'),
        api.get<User[]>('/users')
      ]);
      setIncidents(incRes.data);
      setUsers(userRes.data);
    } catch (error) {
      addToast('Failed to load incidents.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIncidents();
  }, [fetchIncidents]);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title?.toLowerCase().includes(search.toLowerCase()) || 
                          incident.id.toString().includes(search.toLowerCase()) ||
                          incident.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'ALL' || incident.severity.toUpperCase() === severityFilter;
    const matchesAssignedToMe = !assignedToMe || (user && incident.assigned_to === user.id);
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesAssignedToMe;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'var(--status-critical)';
      case 'high': return 'var(--status-high)';
      case 'medium': return 'var(--status-medium)';
      default: return 'var(--status-low)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return '#9ca3af';
      case 'investigating': return 'var(--status-critical)';
      case 'identified': return 'var(--status-high)';
      case 'resolving': return 'var(--status-medium)';
      case 'resolved': return 'var(--status-resolved)';
      default: return 'var(--text-muted)';
    }
  };

  const getDuration = (createdAt: string, resolvedAt?: string | null) => {
    const parseUTC = (dateStr: string | null | undefined) => {
      if (!dateStr) return new Date();
      const hasTz = dateStr.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr);
      return new Date(hasTz ? dateStr : `${dateStr}Z`);
    };

    const start = parseUTC(createdAt).getTime();
    const end = resolvedAt ? parseUTC(resolvedAt).getTime() : new Date().getTime();
    const diffMins = Math.max(0, Math.floor((end - start) / 60000));
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const getInitials = (userId: number | undefined) => {
    if (!userId) return '-';
    const user = users.find(u => u.id === userId);
    return user ? user.name.charAt(0).toUpperCase() : 'U';
  };
  
  const getAvatarColor = (userId: number | undefined) => {
    if (!userId) return '#3f3f46';
    const colors = ['#8B5CF6', '#F59E0B', '#52525B', '#10B981', '#3B82F6'];
    return colors[userId % colors.length];
  };

  if (isLoading && incidents.length === 0) {
    return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-(--button-primary)"></div></div>;
  }

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="headline-lg">Active Incidents</h1>
          <p className="text-(--text-secondary) mt-1 text-sm">Monitor and triage system alerts across infrastructure.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="sentinel-btn sentinel-btn-ghost bg-(--bg-surface) hover:bg-(--bg-surface-hover) border border-(--border-subtle) px-3 text-white"
            onClick={() => navigate('/incidents/new')}
          >
            <Plus size={16} /> DECLARE INCIDENT
          </button>
          <button 
            className="sentinel-btn sentinel-btn-ghost bg-(--bg-surface) hover:bg-(--bg-surface-hover) border border-(--border-subtle) px-3 text-white"
            onClick={fetchIncidents}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between mt-6 mb-2">
        <div className="w-full xl:w-96 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search incidents by ID, service, or keywords..." 
            className="sentinel-input text-sm py-2.5 bg-(--bg-surface) border-zinc-800"
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="flex flex-wrap gap-1 bg-(--bg-surface) border border-(--border-subtle) p-1 rounded-lg">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => {
              const getSevDotColor = (s: string) => {
                switch (s) {
                  case 'CRITICAL': return '#ef4444';
                  case 'HIGH': return '#f59e0b';
                  case 'MEDIUM': return '#fcd34d';
                  case 'LOW': return '#10b981';
                  default: return '';
                }
              };
              const dotColor = getSevDotColor(sev);
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`label-caps px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${severityFilter === sev ? 'bg-(--border-strong) text-white shadow-sm' : 'text-(--text-secondary) hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
                >
                  {dotColor && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }}></span>}
                  {sev}
                </button>
              );
            })}
          </div>

          <div className="hidden xl:block w-px h-8 bg-(--border-subtle) mx-1"></div>

          <button 
            onClick={() => setAssignedToMe(!assignedToMe)}
            className={`label-caps px-4 py-2.5 rounded-lg border transition-colors ${assignedToMe ? 'bg-(--button-primary) border-(--button-primary) text-white' : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-secondary) hover:text-white'}`}
          >
            ASSIGNED TO ME
          </button>

          <div className="relative">
            <select 
              className="appearance-none bg-(--bg-surface) label-caps pl-5 pr-10 py-2.5 border border-(--border-subtle) rounded-lg cursor-pointer hover:bg-(--bg-surface-hover) text-white transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">STATUS: ALL</option>
              <option value="Open">OPEN</option>
              <option value="Investigating">INVESTIGATING</option>
              <option value="Identified">IDENTIFIED</option>
              <option value="Resolving">RESOLVING</option>
              <option value="Resolved">RESOLVED</option>
            </select>
            <Filter size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-(--text-muted)" />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 glass-panel p-4 bg-zinc-950/20 border-zinc-800/80">
        <div className="flex items-center gap-3 px-4 py-2 border-r border-zinc-800/50 last:border-r-0">
          <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#a78bfa] shrink-0">
            <Shield size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono leading-none">{filteredIncidents.length}</div>
            <div className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-bold mt-1">Total Incidents</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 border-r border-zinc-800/50 last:border-r-0">
          <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444] shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono leading-none">
              {filteredIncidents.filter(i => i.severity.toLowerCase() === 'critical').length}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-bold mt-1">Critical</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-r border-zinc-800/50 last:border-r-0">
          <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono leading-none">
              {filteredIncidents.filter(i => i.severity.toLowerCase() === 'high').length}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-bold mt-1">High</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-r border-zinc-800/50 last:border-r-0">
          <div className="w-10 h-10 rounded-lg bg-[#fcd34d]/10 border border-[#fcd34d]/20 flex items-center justify-center text-[#fcd34d] shrink-0">
            <AlertCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono leading-none">
              {filteredIncidents.filter(i => i.severity.toLowerCase() === 'medium').length}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-bold mt-1">Medium</div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 last:border-r-0">
          <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
            <CheckCircle size={18} />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono leading-none">
              {filteredIncidents.filter(i => i.severity.toLowerCase() === 'low').length}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-bold mt-1">Low</div>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-panel overflow-hidden mt-4">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Filter size={48} style={{ color: 'var(--text-muted)' }} className="mb-4 opacity-50" />
            <h3 className="text-xl font-medium" style={{ color: 'var(--text-secondary)' }}>No incidents found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex flex-col justify-between min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">ID</th>
                  <th className="px-4 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">INCIDENT DETAILS</th>
                  <th className="px-4 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">SERVICE</th>
                  <th className="px-4 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">ASSIGNEE</th>
                  <th className="px-4 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">DURATION</th>
                  <th className="px-4 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)] text-right pr-4">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="cursor-pointer transition-colors hover:bg-(--bg-surface-hover) border-t border-(--border-subtle)"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-4 py-6 label-mono text-sm font-semibold text-[#a78bfa]">INC-{incident.id}</td>
                    <td className="px-4 py-6">
                      <div className="font-semibold text-base text-white mb-2">{incident.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded border bg-black/25 label-caps text-[10px]"
                              style={{ borderColor: getSeverityColor(incident.severity), color: getSeverityColor(incident.severity) }}>
                          {incident.severity}
                        </span>
                        <span className="label-mono text-xs text-[var(--text-secondary)] bg-[rgba(255,255,255,0.03)] px-2 py-0.5 rounded border border-zinc-800/80">{incident.category || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6">
                      <span className="label-mono text-[var(--text-secondary)] text-sm">
                        {incident.location || 'core-svc'}
                      </span>
                    </td>
                    <td className="px-4 py-6">
                      {incident.assigned_to ? (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md" style={{ backgroundColor: getAvatarColor(incident.assigned_to) }}>
                          {getInitials(incident.assigned_to)}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-(--text-secondary) bg-(--bg-surface-elevated) text-xs font-bold border border-(--border-subtle)">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-6 label-mono text-xs text-(--text-secondary)">
                      {getDuration(incident.created_at, incident.resolved_at)}
                    </td>
                    <td className="px-4 py-6 text-right pr-4">
                      <div className="flex items-center justify-end">
                        <span className="inline-flex items-center label-caps px-3 py-1.5 rounded bg-[rgba(255,255,255,0.01)] border text-[10px]" style={{ borderColor: `${getStatusColor(incident.status || 'Investigating')}30`, color: getStatusColor(incident.status || 'Investigating') }}>
                          <span className="w-2 h-2 rounded-full mr-2.5" style={{ backgroundColor: getStatusColor(incident.status || 'Investigating'), boxShadow: `0 0 8px ${getStatusColor(incident.status || 'Investigating')}` }}></span>
                          {(incident.status || 'INVESTIGATING').toUpperCase()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Footer */}
            <div className="px-8 py-5 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/10">
              <span className="text-xs text-[var(--text-muted)] font-mono">
                Showing {filteredIncidents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredIncidents.length)} of {filteredIncidents.length} incidents
              </span>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                  &lt;
                </button>
                
                {Array.from({ length: Math.ceil(filteredIncidents.length / itemsPerPage) || 1 }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                        currentPage === pageNum 
                          ? 'bg-[#7C3AED] text-white shadow' 
                          : 'border border-zinc-850 hover:border-zinc-700 text-[var(--text-secondary)] hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredIncidents.length / itemsPerPage) || 1, prev + 1))}
                  disabled={currentPage === (Math.ceil(filteredIncidents.length / itemsPerPage) || 1)}
                  className="w-8 h-8 rounded border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                  &gt;
                </button>
              </div>

              <div className="relative">
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="appearance-none bg-zinc-900 text-xs font-mono text-[var(--text-secondary)] pl-3 pr-8 py-1.5 border border-zinc-850 rounded cursor-pointer hover:bg-zinc-800/80 hover:text-white transition-colors"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
