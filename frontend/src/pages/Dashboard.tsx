import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Incident } from '../types';
import { AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get<Incident[]>('/incidents/');
        setIncidents(response.data);
      } catch (error) {
        addToast('Failed to load dashboard data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, [addToast]);

  const activeIncidents = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');
  const criticalIncidents = activeIncidents.filter(i => i.severity.toLowerCase() === 'critical' || i.severity.toLowerCase() === 'high');
  const myIncidents = activeIncidents.filter(i => i.assigned_to === user?.id);

  const recentIncidents = [...incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
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
    <div className="space-y-8 animate-slide-up">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center">
          <div className="p-4 rounded-full mr-4" style={{ backgroundColor: 'rgba(238, 175, 104, 0.1)', color: 'var(--status-open)' }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Active Incidents</p>
            <p className="text-3xl font-bold">{activeIncidents.length}</p>
          </div>
        </div>
        
        <div className="glass-panel p-6 flex items-center">
          <div className="p-4 rounded-full mr-4" style={{ backgroundColor: 'rgba(219, 75, 75, 0.1)', color: 'var(--severity-critical)' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Critical / High Priority</p>
            <p className="text-3xl font-bold">{criticalIncidents.length}</p>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center">
          <div className="p-4 rounded-full mr-4" style={{ backgroundColor: 'rgba(122, 162, 247, 0.1)', color: 'var(--accent-primary)' }}>
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Assigned To Me</p>
            <p className="text-3xl font-bold">{myIncidents.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-lg font-semibold">Recent Incidents</h2>
          <button className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-primary)' }} onClick={() => navigate('/incidents')}>
            View All
          </button>
        </div>
        
        {recentIncidents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCircle size={48} style={{ color: 'var(--status-resolved)' }} className="mb-4 opacity-50" />
            <h3 className="text-xl font-medium" style={{ color: 'var(--text-secondary)' }}>All clear!</h3>
            <p style={{ color: 'var(--text-muted)' }}>There are no active or recent incidents tracked.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Title</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Severity</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((incident) => (
                <tr 
                  key={incident.id} 
                  className="cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] border-b last:border-0"
                  style={{ borderColor: 'var(--border-subtle)' }}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                >
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
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(incident.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
