import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Incident } from '../types';
import { Filter, Plus, Search, X } from 'lucide-react';

export const IncidentList: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [assignedToMe, setAssignedToMe] = useState(false);

  // Create Modal
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState('Low');
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      const response = await api.get<Incident[]>('/incidents/');
      setIncidents(response.data);
    } catch (error) {
      addToast('Failed to load incidents.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleCreateIncident = async () => {
    if (!newTitle.trim() || !newDescription.trim() || !newCategory.trim()) {
      addToast('Title, Description, and Category are mandatory.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.post<Incident>('/incidents/', {
        title: newTitle,
        description: newDescription,
        severity: newSeverity,
        category: newCategory,
        location: newLocation || undefined,
        status: 'Open'
      });
      addToast('Incident created successfully', 'success');
      setIsCreatingModalOpen(false);
      // Reset
      setNewTitle('');
      setNewDescription('');
      setNewSeverity('Low');
      setNewCategory('');
      setNewLocation('');
      // Navigate or Refresh
      navigate(`/incidents/${response.data.id}`);
    } catch (error) {
      addToast('Failed to create incident.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title?.toLowerCase().includes(search.toLowerCase()) || 
                          incident.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || incident.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || incident.severity === severityFilter;
    const matchesAssignee = !assignedToMe || incident.assigned_to === user?.id;
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesAssignee;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'var(--severity-critical)';
      case 'high': return 'var(--severity-high)';
      case 'medium': return 'var(--severity-medium)';
      default: return 'var(--severity-low)';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent-primary)]"></div></div>;
  }

  return (
    <>
      {/* Create Modal */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed' }}>
          <div className="glass-panel p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Incident</h2>
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => setIsCreatingModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                <input 
                  type="text" 
                  className="sentinel-input" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="E.g. Database connection timeout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description *</label>
                <textarea 
                  className="sentinel-input min-h-[100px]" 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  placeholder="Provide detailed information..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Severity *</label>
                  <select 
                    className="sentinel-input cursor-pointer"
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value)}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Category *</label>
                  <input 
                    type="text" 
                    className="sentinel-input" 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)} 
                    placeholder="E.g. Infrastructure, Security..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Location (Optional)</label>
                <input 
                  type="text" 
                  className="sentinel-input" 
                  value={newLocation} 
                  onChange={(e) => setNewLocation(e.target.value)} 
                  placeholder="E.g. us-east-1, Main Server Room"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
              <button className="sentinel-btn sentinel-btn-ghost" onClick={() => setIsCreatingModalOpen(false)}>
                Cancel
              </button>
              <button 
                className="sentinel-btn sentinel-btn-primary" 
                onClick={handleCreateIncident}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Incident'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 animate-slide-up relative">
        <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Incidents</h1>
        <button 
          className="sentinel-btn sentinel-btn-primary"
          onClick={() => setIsCreatingModalOpen(true)}
        >
          <Plus size={18} />
          Create Incident
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search incidents..." 
            className="sentinel-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 border-l pl-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <Filter size={18} className="text-[var(--text-muted)]" />
          <select 
            className="sentinel-input py-1 px-2 text-sm w-auto cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select 
            className="sentinel-input py-1 px-2 text-sm w-auto cursor-pointer"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <label className="flex items-center ml-2 cursor-pointer text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              className="mr-2 rounded border-[var(--border-strong)] bg-[var(--bg-base)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
            />
            Assigned to Me
          </label>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-panel overflow-hidden">
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
                <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ID</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Title</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] border-b last:border-0"
                    style={{ borderColor: 'var(--border-subtle)' }}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>#{incident.id}</td>
                    <td className="px-6 py-4 font-medium">{incident.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-[var(--bg-surface-elevated)] border"
                            style={{ borderColor: 'var(--border-subtle)', color: incident.status === 'Resolved' ? 'var(--status-resolved)' : 'var(--status-open)' }}>
                        {incident.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center text-sm font-medium" style={{ color: getSeverityColor(incident.severity || 'low') }}>
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getSeverityColor(incident.severity || 'low') }}></span>
                        {incident.severity || 'Low'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{incident.category || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(incident.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
