import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Incident, Comment, ActivityLog } from '../types';
import { AlertCircle, BrainCircuit, Check, Clock, MessageSquare, Send, Trash2, X } from 'lucide-react';

type TimelineItem = 
  | { type: 'comment'; data: Comment; timestamp: number }
  | { type: 'activity'; data: ActivityLog; timestamp: number };

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit State
  const [newComment, setNewComment] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      const incRes = await api.get<Incident>(`/incidents/${id}`);
      setIncident(incRes.data);

      const [comRes, actRes] = await Promise.all([
        api.get<Comment[]>(`/incidents/${id}/comments`),
        api.get<ActivityLog[]>(`/incidents/${id}/activity`)
      ]);

      const merged: TimelineItem[] = [
        ...comRes.data.map(c => ({ type: 'comment' as const, data: c, timestamp: new Date(c.created_at).getTime() })),
        ...actRes.data.map(a => ({ type: 'activity' as const, data: a, timestamp: new Date(a.created_at).getTime() }))
      ].sort((a, b) => a.timestamp - b.timestamp);

      setTimeline(merged);
    } catch (err) {
      addToast('Failed to load incident details.', 'error');
      navigate('/incidents');
    } finally {
      setIsLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 30000); // 30s polling
    return () => clearInterval(interval);
  }, [fetchDetails]);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      setPendingStatus(newStatus);
      setIsResolving(true);
    } else {
      updateIncident({ status: newStatus });
    }
  };

  const submitResolution = () => {
    if (!resolutionNotes.trim()) {
      addToast('Resolution notes are mandatory.', 'error');
      return;
    }
    updateIncident({ status: pendingStatus!, resolution_notes: resolutionNotes });
    setIsResolving(false);
    setPendingStatus(null);
  };

  const updateIncident = async (updates: Partial<Incident>) => {
    if (!incident) return;
    const previous = { ...incident };
    // Optimistic Update
    setIncident({ ...incident, ...updates });

    try {
      await api.put(`/incidents/${id}`, updates);
      addToast('Incident updated successfully', 'success');
      fetchDetails(); // Refresh activity log
    } catch (err) {
      setIncident(previous);
      addToast('Failed to update incident. Reverting changes.', 'error');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(`/incidents/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchDetails();
    } catch (err) {
      addToast('Failed to post comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/incidents/${id}/comments/${commentId}`);
      fetchDetails();
      addToast('Comment deleted', 'success');
    } catch (err) {
      addToast('Failed to delete comment', 'error');
    }
  };

  if (isLoading || !incident) {
    return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--accent-primary)]"></div></div>;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative animate-slide-up">
      {/* Resolution Modal */}
      {isResolving && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="glass-panel p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Resolve Incident</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Please provide mandatory resolution notes to close this incident.
            </p>
            <textarea 
              className="sentinel-input min-h-[120px] mb-4"
              placeholder="What actions were taken? Root cause?"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button className="sentinel-btn sentinel-btn-ghost" onClick={() => setIsResolving(false)}>
                <X size={16} /> Cancel
              </button>
              <button className="sentinel-btn sentinel-btn-primary" onClick={submitResolution}>
                <Check size={16} /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-[var(--bg-surface-elevated)]" style={{ borderColor: 'var(--border-subtle)', color: incident.status === 'Resolved' ? 'var(--status-resolved)' : 'var(--status-open)' }}>
                {incident.status || 'Open'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border bg-[var(--bg-surface-elevated)]" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                {incident.severity || 'Low'}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Created {new Date(incident.created_at).toLocaleString()}</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{incident.title}</h1>
            <div className="p-4 rounded-lg bg-[rgba(0,0,0,0.2)] border" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{incident.description}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold block" style={{ color: 'var(--text-muted)' }}>Category</span> {incident.category || 'N/A'}</div>
              <div><span className="font-semibold block" style={{ color: 'var(--text-muted)' }}>Location</span> {incident.location || 'N/A'}</div>
            </div>
          </div>

          {(incident.ai_summary || incident.ai_severity || incident.ai_recommended_action) && (
            <div className="glass-panel p-6 border-l-4" style={{ borderLeftColor: 'var(--accent-secondary)' }}>
              <h3 className="text-lg font-bold flex items-center mb-4" style={{ color: 'var(--accent-secondary)' }}>
                <BrainCircuit size={20} className="mr-2" /> AI Sentinel Analysis
              </h3>
              {incident.ai_summary && <div className="mb-4"><p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Summary</p><p className="text-sm">{incident.ai_summary}</p></div>}
              {incident.ai_severity && <div className="mb-4"><p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Predicted Severity</p><p className="text-sm">{incident.ai_severity}</p></div>}
              {incident.ai_recommended_action && <div><p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Recommended Action</p><p className="text-sm">{incident.ai_recommended_action}</p></div>}
            </div>
          )}

          {incident.resolution_notes && (
            <div className="glass-panel p-6 border-l-4" style={{ borderLeftColor: 'var(--status-resolved)' }}>
              <h3 className="text-lg font-bold flex items-center mb-2" style={{ color: 'var(--status-resolved)' }}>
                <Check size={20} className="mr-2" /> Resolution Notes
              </h3>
              <p className="whitespace-pre-wrap">{incident.resolution_notes}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'var(--border-subtle)' }}>Actions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Status</label>
                <select 
                  className="sentinel-input cursor-pointer"
                  value={incident.status || 'Open'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Severity</label>
                <select 
                  className="sentinel-input cursor-pointer"
                  value={incident.severity || 'Low'}
                  onChange={(e) => updateIncident({ severity: e.target.value })}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Assignee ID</label>
                  <input 
                    type="number" 
                    className="sentinel-input"
                    value={incident.assigned_to || ''}
                    onChange={(e) => updateIncident({ assigned_to: parseInt(e.target.value) || null })}
                    placeholder="User ID"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel flex flex-col h-[600px]">
            <h3 className="text-lg font-bold p-4 border-b flex items-center shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <Clock size={18} className="mr-2" /> Timeline
            </h3>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {timeline.length === 0 ? (
                <p className="text-center text-sm mt-10" style={{ color: 'var(--text-muted)' }}>No activity yet.</p>
              ) : (
                timeline.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    {item.type === 'activity' ? (
                      <div className="flex items-center gap-2 px-2 py-1 my-1">
                        <AlertCircle size={14} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>User {item.data.performed_by}</span> 
                          {' '}{item.data.message || item.data.activity_type}
                        </span>
                        <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
                          {new Date(item.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-[var(--bg-surface-elevated)] p-3 rounded-lg border relative group" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>User {item.data.user_id}</span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(item.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{item.data.content}</p>
                        
                        {(isAdmin || user?.id === item.data.user_id) && (
                          <button 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--severity-critical)] hover:bg-[rgba(219,75,75,0.1)] p-1 rounded"
                            onClick={() => handleDeleteComment(item.data.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="sentinel-input"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                />
                <button className="sentinel-btn sentinel-btn-primary px-3" onClick={handlePostComment}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
