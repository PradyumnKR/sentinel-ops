import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Incident, Comment, ActivityLog, User } from '../types';
import { AlertTriangle, ShieldCheck, Search, Bell, Zap, User as UserIcon, Send, Terminal, Shield, Paperclip, Cpu, FileText } from 'lucide-react';

type TimelineItem = 
  | { type: 'comment'; data: Comment; timestamp: number }
  | { type: 'activity'; data: ActivityLog; timestamp: number };

const aiSeverityMap: Record<string, { bg: string, border: string, text: string }> = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  low: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' }
};

const allowedTransitions: Record<string, string[]> = {
  Open: ['Open', 'Investigating'],
  Investigating: ['Investigating', 'Open', 'Identified'],
  Identified: ['Identified', 'Investigating', 'Resolving'],
  Resolving: ['Resolving', 'Identified', 'Resolved'],
  Resolved: []
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

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Edit State
  const [newComment, setNewComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const incRes = await api.get<Incident>(`/incidents/${id}`);
      setIncident(incRes.data);
      if (incRes.data.resolution_notes) {
        setResolutionNotes(incRes.data.resolution_notes);
      }

      const [comRes, actRes, userRes] = await Promise.all([
        api.get<Comment[]>(`/incidents/${id}/comments`),
        api.get<ActivityLog[]>(`/incidents/${id}/activity`),
        api.get<User[]>('/users')
      ]);
      setUsers(userRes.data);

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

  const updateIncident = async (updates: Partial<Incident>) => {
    if (!incident) return;
    const previous = { ...incident };
    setIncident({ ...incident, ...updates });

    try {
      await api.put(`/incidents/${id}`, updates);
      addToast('Incident updated successfully', 'success');
      fetchDetails(); 
    } catch (err) {
      setIncident(previous);
      addToast('Failed to update incident. Reverting changes.', 'error');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateIncident({ status: newStatus });
  };

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      addToast('Resolution notes are mandatory before resolving.', 'error');
      // Focus the textarea
      document.getElementById('resolutionNotes')?.focus();
      return;
    }
    updateIncident({ status: 'Resolved', resolution_notes: resolutionNotes });
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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.post(`/incidents/${id}/analyze`);
      const { ai_summary, ai_severity, ai_recommended_action } = res.data;
      setIncident(prev => prev ? { ...prev, ai_summary, ai_severity, ai_recommended_action } : prev);
      addToast('AI Analysis complete', 'success');
    } catch (err) {
      addToast('Failed to analyze incident with AI', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !incident) {
    return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--button-primary)]"></div></div>;
  }

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'var(--status-critical)';
      case 'high': return 'var(--status-high)';
      case 'medium': return 'var(--status-medium)';
      default: return 'var(--status-low)';
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
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const seconds = Math.floor((Math.max(0, end - start) % 60000) / 1000);
    return (
      <span style={{ color: 'var(--status-high)' }}>
        {hours.toString().padStart(2, '0')}h {mins.toString().padStart(2, '0')}m {seconds.toString().padStart(2, '0')}s
      </span>
    );
  };

  const formatTimelineTimestamp = (timestamp: number) => {
    const d = new Date(timestamp);
    const time = d.toLocaleTimeString('en-US', { hour12: false });
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${time} ${day}-${month}-${year}`;
  };

  const isCritical = incident.severity.toLowerCase() === 'critical';

  return (
    <div className="animate-slide-up pb-10 flex flex-col h-full">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-4" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-widest text-white leading-tight">SENTINEL OPS</span>
          <span className="label-mono px-2 py-1 bg-[var(--bg-surface)] border rounded text-[var(--text-muted)]" style={{ borderColor: 'var(--border-subtle)' }}>INC-{incident.id}</span>
        </div>
      </div>

      {/* SECTION 1: Basic Info & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        
        {/* Left Column (Main details) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full label-caps bg-black/30 border"
                  style={{ borderColor: getSeverityColor(incident.severity), color: getSeverityColor(incident.severity) }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: getSeverityColor(incident.severity) }}></span>
              {incident.severity} SEVERITY
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full label-caps bg-black/30 border" 
                  style={{ borderColor: getStatusColor(incident.status), color: getStatusColor(incident.status) }}>
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: getStatusColor(incident.status) }}></span>
              {incident.status.toUpperCase()}
            </span>
          </div>
          
          <h1 className="headline-lg text-white mb-6">{incident.title}</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="label-caps text-[var(--text-muted)] mb-2">AFFECTED SERVICE</p>
              <div className="flex items-start gap-2">
                <Terminal size={14} className="text-[var(--status-high)] mt-0.5" />
                <span className="label-mono text-white leading-tight">{incident.location || 'us-east-1-cluster'}</span>
              </div>
            </div>
            <div>
              <p className="label-caps text-[var(--text-muted)] mb-2">TIME DETECTED</p>
              <span className="label-mono text-white">{new Date(incident.created_at).toLocaleTimeString('en-US', { hour12: false })} UTC</span>
            </div>
            <div>
              <p className="label-caps text-[var(--text-muted)] mb-2">DURATION</p>
              <span className="label-mono">{getDuration(incident.created_at, incident.resolved_at)}</span>
            </div>
            <div>
              <p className="label-caps text-[var(--text-muted)] mb-2">LEAD ASSIGNEE</p>
              {incident.assigned_to ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[var(--button-primary)] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {users.find(u => u.id === incident.assigned_to)?.name.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {users.find(u => u.id === incident.assigned_to)?.name || 'Unknown User'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-[var(--text-muted)]">Unassigned</span>
              )}
            </div>
          </div>
          
          {incident.description && (
            <div className="mt-8">
              <p className="label-caps text-[var(--text-muted)] mb-2">DESCRIPTION</p>
              <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{incident.description}</p>
            </div>
          )}
        </div>

        {/* Right Column (Status) */}
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block label-caps text-[var(--text-muted)] mb-2">STATUS</label>
            <div className="relative">
              {incident.status === 'Resolved' ? (
                <div className="sentinel-input bg-[var(--input-bg)] flex items-center !pl-8 cursor-not-allowed opacity-75 text-[var(--text-secondary)]">
                  Resolved
                </div>
              ) : (
                <select 
                  className="sentinel-input bg-[var(--input-bg)] appearance-none cursor-pointer !pl-8"
                  value={incident.status || 'Open'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {(allowedTransitions[incident.status] || ['Open', 'Investigating', 'Identified', 'Resolving', 'Resolved']).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(incident.status || 'Investigating') }}></div>
            </div>
          </div>

          <div>
            <label className="block label-caps text-[var(--text-muted)] mb-2">ASSIGNEE</label>
            <div className="relative">
              <select 
                className={`sentinel-input bg-[var(--input-bg)] appearance-none cursor-pointer !pl-11 ${
                  (user?.role !== 'admin' || incident.status === 'Resolved') ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                value={incident.assigned_to || ''}
                onChange={(e) => updateIncident({ assigned_to: parseInt(e.target.value) || null })}
                disabled={user?.role !== 'admin' || incident.status === 'Resolved'}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--button-primary)] flex items-center justify-center text-[10px] font-bold text-white pointer-events-none uppercase">
                {incident.assigned_to ? (users.find(u => u.id === incident.assigned_to)?.name.charAt(0) || 'U') : '-'}
              </div>
            </div>
          </div>

          {incident.status !== 'Resolved' && (
            <button 
              className="sentinel-btn sentinel-btn-primary w-full py-4 mt-2"
              onClick={handleResolve}
            >
              <ShieldCheck size={18} className="mr-2" /> DECLARE RESOLVED
            </button>
          )}
        </div>

      </div>

      {/* SECTION 2: AI Analysis & Resolution Notes */}
      <div className="mb-8 pb-8 border-b space-y-8" style={{ borderColor: 'var(--border-subtle)' }}>
        
        {/* AI Sentinel Analysis */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Shield size={20} className="mr-2 text-[#7C3AED]" /> AI Sentinel Analysis
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Automated analysis of the incident using AI-powered insights
              </p>
            </div>
            {incident.ai_severity ? (
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="flex items-center text-xs font-mono px-3 py-1.5 rounded border border-[#7C3AED]/40 text-[#a78bfa] hover:text-white hover:bg-[#7C3AED]/10 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <><span className="animate-spin h-3 w-3 mr-2 border-t-2 border-current rounded-full"></span> ANALYZING...</>
                ) : (
                  <><Zap size={12} className="mr-1.5" /> RE-ANALYZE</>
                )}
              </button>
            ) : (
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="flex items-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-mono uppercase text-xs sm:text-sm px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <><span className="animate-spin h-4 w-4 mr-2 border-t-2 border-white rounded-full"></span> ANALYZING...</>
                ) : (
                  <><Cpu size={16} className="mr-2" /> ANALYZE WITH AI</>
                )}
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary */}
              <div className="lg:col-span-2 ai-glass-panel p-5 relative overflow-hidden border border-[#7C3AED]/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#a78bfa]" />
                    <span className="label-caps text-white font-semibold text-xs tracking-wider">SUMMARY</span>
                  </div>
                  <Terminal size={14} className="text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                  {incident.ai_summary ? incident.ai_summary : "AI Analysis pending. Click 'Analyze with AI' to generate a summary of this incident."}
                </p>
              </div>

              {/* Risk Assessment */}
              <div className="lg:col-span-1 ai-glass-panel p-5 relative overflow-hidden border border-orange-500/30 flex flex-col justify-between min-h-[180px]">
                <div className="flex justify-between items-start mb-3">
                  <span className="label-caps text-orange-400 font-semibold text-xs tracking-wider">RISK ASSESSMENT</span>
                  <AlertTriangle size={14} className="text-orange-400" />
                </div>
                
                {incident.ai_severity ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center my-3">
                      <div className={`w-full py-3.5 rounded border text-center font-bold text-base tracking-wider uppercase ${
                        aiSeverityMap[incident.ai_severity.toLowerCase()] 
                          ? `${aiSeverityMap[incident.ai_severity.toLowerCase()].text} ${aiSeverityMap[incident.ai_severity.toLowerCase()].border} bg-black/40`
                          : 'text-white border-zinc-700 bg-black/40'
                      }`}>
                        {incident.ai_severity}
                      </div>
                    </div>
                    
                    <div className="border-t border-zinc-800/80 pt-3 text-center">
                      <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-mono">
                        Powered by Llama 3.3
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex-1 flex items-center justify-center my-4 text-center">
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Risk assessment pending. Run analysis to determine severity.
                      </p>
                    </div>
                    <div className="border-t border-zinc-800/80 pt-3 text-center">
                      <span className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase font-mono">
                        Powered by Llama 3.3
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="ai-glass-panel p-5 relative overflow-hidden border border-zinc-800/80">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-[#7C3AED]" />
                <span className="label-caps text-white font-semibold text-xs tracking-wider">RECOMMENDED ACTIONS</span>
              </div>
              {incident.ai_recommended_action ? (
                <div className="space-y-3">
                  {incident.ai_recommended_action.split('\n').filter(line => line.trim() !== '').map((step, idx) => {
                    const cleanStep = step.replace(/^\d+\.\s*/, '');
                    let title = cleanStep;
                    let subtext = '';
                    
                    // Check for potential subtext delimiters like colon, semi-colon, or dash
                    const splitIdx = cleanStep.indexOf(':');
                    if (splitIdx !== -1) {
                      title = cleanStep.substring(0, splitIdx).trim();
                      subtext = cleanStep.substring(splitIdx + 1).trim();
                    } else {
                      // Try comma or dash
                      const commaIdx = cleanStep.indexOf(',');
                      if (commaIdx !== -1) {
                        title = cleanStep.substring(0, commaIdx).trim();
                        subtext = cleanStep.substring(commaIdx + 1).trim();
                      }
                    }
                    
                    return (
                      <div key={idx} className="flex items-center gap-4 bg-zinc-950/20 p-4 rounded border border-zinc-800/50 border-l-4 border-l-[#7C3AED] hover:border-l-[#8B5CF6] transition-all">
                        {/* Number Badge */}
                        <div className="w-8 h-8 flex items-center justify-center bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#a78bfa] rounded font-mono font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>

                        {/* Step Text */}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white leading-snug">{title}</p>
                          {subtext && <p className="text-xs text-[var(--text-muted)] mt-1">{subtext}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Action recommendation pending. Run AI analysis to get suggested runbooks.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Notes */}
        <div>
          <h3 className="label-caps text-[var(--text-muted)] mb-3">RESOLUTION NOTES / DEBRIEF</h3>
          {incident.status === 'Resolved' ? (
            <div className="p-4 rounded border bg-[var(--input-bg)] border-[var(--border-subtle)] min-h-[140px] text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {resolutionNotes || "No resolution notes provided."}
            </div>
          ) : (
            <div className="relative">
              <textarea 
                id="resolutionNotes"
                className="sentinel-input bg-[var(--input-bg)] min-h-[140px] pb-14"
                placeholder="Document steps taken, root cause, and preventative measures..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-3">
                <Paperclip size={16} className="text-[var(--text-muted)] cursor-pointer hover:text-white" />
                <button 
                  className="sentinel-btn sentinel-btn-ghost bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-white text-xs px-3 py-1.5"
                  onClick={() => updateIncident({ resolution_notes: resolutionNotes })}
                >
                  Save Draft
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* SECTION 3: Timeline */}
      <div>
        <h3 className="label-caps text-[var(--text-muted)] mb-6">ACTIVITY TIMELINE</h3>
        <div className="space-y-6">
          
          {timeline.map((item, idx) => (
            <div key={idx} className="relative">
              {item.type === 'activity' ? (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] ring-4 ring-[var(--bg-void)] relative z-10"></div>
                    {idx !== timeline.length - 1 && <div className="w-px h-full bg-[var(--border-subtle)] absolute top-3"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="label-caps text-[var(--text-muted)] mr-4">SYSTEM</span>
                      <span className="label-mono text-[var(--text-muted)] whitespace-nowrap">{formatTimelineTimestamp(item.timestamp)}</span>
                    </div>
                    <div className="p-3 bg-[rgba(16,185,129,0.05)] rounded border border-[rgba(16,185,129,0.1)]">
                      <p className="terminal-text text-[var(--status-low)] leading-relaxed">
                        &gt; {item.data.activity_type.toUpperCase()}: <br/>
                        &gt; {item.data.message || 'ACTION RECORDED'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-5 h-5 rounded-full bg-[#1e1b4b] flex items-center justify-center text-[10px] font-bold text-[#818cf8] relative z-10 ring-4 ring-[var(--bg-void)]">
                      {item.data.user_id ? (users.find(u => u.id === item.data.user_id)?.name.charAt(0).toUpperCase() || 'U') : 'AI'}
                    </div>
                    {idx !== timeline.length - 1 && <div className="w-px h-full bg-[var(--border-subtle)] absolute top-6"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="label-caps text-white mr-4 truncate">
                        {item.data.user_id ? (users.find(u => u.id === item.data.user_id)?.name.toUpperCase() || 'UNKNOWN') : 'AI SENTINEL'}
                      </span>
                      <span className="label-mono text-[var(--text-muted)] whitespace-nowrap">{formatTimelineTimestamp(item.timestamp)}</span>
                    </div>
                    <div className="p-4 rounded-lg rounded-tl-none border" style={{ backgroundColor: item.data.user_id ? '#1e1b4b' : 'rgba(223, 209, 255, 0.05)', borderColor: item.data.user_id ? '#312e81' : 'rgba(223, 209, 255, 0.15)' }}>
                      <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{item.data.content}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {timeline.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No timeline events recorded.</p>
          )}

        </div>

        <div className="mt-8 relative">
          <input 
            type="text" 
            className="sentinel-input bg-[var(--input-bg)] !pr-12 rounded-full"
            placeholder="Add update or run command..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
          />
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--bg-surface-elevated)] flex items-center justify-center hover:bg-white hover:text-black transition-colors"
            onClick={handlePostComment}
          >
            <Send size={14} />
          </button>
        </div>
      </div>

    </div>
  );
};
