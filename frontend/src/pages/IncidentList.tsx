import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Incident, User } from '../types';
import { Filter, Plus, Search, RefreshCw } from 'lucide-react';

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
      case 'investigating': return 'var(--status-critical)';
      case 'identified': return 'var(--status-high)';
      case 'monitoring': return 'var(--accent-secondary)';
      case 'resolved': return 'var(--status-resolved)';
      default: return 'var(--text-muted)';
    }
  };

  const getDuration = (createdAt: string, resolvedAt?: string | null) => {
    const start = new Date(createdAt).getTime();
    const end = resolvedAt ? new Date(resolvedAt).getTime() : new Date().getTime();
    const diffMins = Math.floor((end - start) / 60000);
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
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search incidents by ID, service, or keywords..." 
            className="sentinel-input pl-10! text-sm py-2.5 bg-(--bg-surface)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="flex flex-wrap gap-1 bg-(--bg-surface) border border-(--border-subtle) p-1 rounded-lg">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`label-caps px-4 py-2 rounded-md transition-colors ${severityFilter === sev ? 'bg-(--border-strong) text-white shadow-sm' : 'text-(--text-secondary) hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}
              >
                {sev}
              </button>
            ))}
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
              <option value="Monitoring">MONITORING</option>
              <option value="Resolved">RESOLVED</option>
              <option value="Closed">CLOSED</option>
            </select>
            <Filter size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-(--text-muted)" />
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-8 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">ID</th>
                  <th className="px-8 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">INCIDENT DETAILS</th>
                  <th className="px-8 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)] min-w-50">SERVICE</th>
                  <th className="px-8 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">ASSIGNEE</th>
                  <th className="px-8 py-5 label-caps text-(--text-secondary) bg-[rgba(255,255,255,0.02)]">DURATION</th>
                  <th className="px-8 py-5 label-caps text-(--text-secondary) text-right bg-[rgba(255,255,255,0.02)]">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="cursor-pointer transition-colors hover:bg-(--bg-surface-hover) border-t border-(--border-subtle)"
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-8 py-6 label-mono text-(--text-secondary)">INC-{incident.id}</td>
                    <td className="px-8 py-6">
                      <div className="font-medium text-base text-white mb-3">{incident.title}</div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md label-caps bg-black/30 border"
                              style={{ borderColor: getSeverityColor(incident.severity), color: getSeverityColor(incident.severity) }}>
                          {incident.severity}
                        </span>
                        <span className="label-mono text-(--text-secondary) bg-[rgba(255,255,255,0.03)] px-2 py-1 rounded-md">{incident.category || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="label-mono text-(--accent-glow) font-medium tracking-wide">
                        {incident.location || 'core-svc'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {incident.assigned_to ? (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" style={{ backgroundColor: getAvatarColor(incident.assigned_to) }}>
                          {getInitials(incident.assigned_to)}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-(--text-secondary) bg-(--bg-surface-elevated) text-sm font-bold border border-(--border-subtle)">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 label-mono text-(--text-secondary)">
                      {incident.status === 'Resolved' ? '--' : getDuration(incident.created_at, incident.resolved_at)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center label-caps px-3 py-1.5 rounded-md bg-[rgba(255,255,255,0.02)] border border-(--border-subtle)" style={{ color: getStatusColor(incident.status || 'Investigating') }}>
                        <span className="w-2 h-2 rounded-full mr-2.5" style={{ backgroundColor: getStatusColor(incident.status || 'Investigating'), boxShadow: `0 0 8px ${getStatusColor(incident.status || 'Investigating')}` }}></span>
                        {(incident.status || 'INVESTIGATING').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
