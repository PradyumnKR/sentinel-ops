import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  ArrowLeft, 
  AlertTriangle, 
  User, 
  Clock, 
  Activity, 
  Send
} from 'lucide-react'
import api from '../services/api'
import { getToken } from '../utils/auth'

const getSeverityColor = (severity: string): string => {
  const s = (severity || 'low').toLowerCase()
  switch (s) {
    case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/10'
    case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/10'
    case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/10'
    case 'low':
    default:
      return 'bg-blue-500/10 text-blue-400 border-blue-500/10'
  }
}

const getStatusColor = (status: string): string => {
  const s = (status || 'draft').toLowerCase()
  switch (s) {
    case 'open': return 'bg-red-500'
    case 'in_progress': return 'bg-amber-500'
    case 'resolved': return 'bg-emerald-500'
    case 'draft':
    default:
      return 'bg-zinc-500'
  }
}

export default function Incident() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  // --- Form States (For New Incident) ---
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Auth-Service')
  const [severity, setSeverity] = useState('high')
  const [statusState, setStatusState] = useState('open')
  const [location, setLocation] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')

  // --- Detail States (For Viewing Incident) ---
  const [incidentData, setIncidentData] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(!isNew)
  const [submitting, setSubmitting] = useState(false)

  // --- Check Auth & Load Data ---
  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login')
      return
    }

    if (!isNew && id) {
      setLoading(true)
      Promise.all([
        api.get(`/api/incidents/${id}`),
        api.get(`/api/incidents/${id}/comments`),
        api.get(`/api/incidents/${id}/activity`)
      ])
        .then(([incident, commentList, activityList]) => {
          setIncidentData(incident?.data || incident)
          setComments(commentList?.data || commentList || [])
          setActivityLogs(activityList?.data || activityList || [])
          setLoading(false)
        })
        .catch(() => {
          navigate('/login')
        })
    }
  }, [id, isNew, navigate])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)

    const payload = {
      title,
      description: description.trim() || null,
      severity,
      status: statusState,
      category: category.trim() || null,
      location: location.trim() || null,
      assigned_to: assignedTo ? parseInt(assignedTo) : null,
      resolution_notes: resolutionNotes.trim() || null
    }

    api.post('/api/incidents/', payload)
      .then(() => {
        navigate('/dashboard')
      })
      .catch((err) => {
        console.error(err)
        setSubmitting(false)
      })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !id) return

    api.post(`/api/incidents/${id}/comments`, { content: newComment })
      .then(() => {
        setNewComment('')
        return Promise.all([
          api.get(`/api/incidents/${id}/comments`),
          api.get(`/api/incidents/${id}/activity`)
        ])
      })
      .then(([commentList, activityList]) => {
        setComments(commentList.data || [])
        setActivityLogs(activityList.data || [])
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const handleStatusChange = (newStatus: string) => {
    if (!id || !incidentData) return
    
    api.put(`/api/incidents/${id}`, { status: newStatus })
      .then(() => {
        return Promise.all([
          api.get(`/api/incidents/${id}`),
          api.get(`/api/incidents/${id}/activity`)
        ])
      })
      .then(([incident, activityList]) => {
        setIncidentData(incident)
        setActivityLogs(activityList.data || [])
      })
      .catch((err) => {
        console.error(err)
      })
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-550 animate-pulse" />
          <span className="text-sm font-medium text-zinc-400">{"Loading Incident Details..."}</span>
        </div>
      </div>
    )
  }

  // --- RENDER CREATION VIEW ---
  if (isNew) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-6">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-650/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-650/5 rounded-full blur-3xl animate-pulse"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-2xl bg-zinc-900/60 backdrop-blur-xl border border-zinc-850 rounded-3xl p-8 shadow-2xl"
        >
          {/* Back btn */}
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            {"Back to Command Deck"}
          </Link>

          <h1 className="text-2xl font-black mb-1">{"Declare New Incident"}</h1>
          <p className="text-sm text-zinc-400 mb-8">{"Paging relevant on-call engineers. Provide detailed operational context."}</p>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Incident Summary / Title"}</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Memory Leak on Payment Workers"
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              />
            </div>

            {/* Category / Affected Component */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Affected Component (Category)"}</label>
              <input 
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Auth-Service, Gateway, Billing-Engine"
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              />
            </div>

            {/* Severity & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Severity Level"}</label>
                <select 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                >
                  <option value="critical">{"CRITICAL (P1)"}</option>
                  <option value="high">{"HIGH (P2)"}</option>
                  <option value="medium">{"MEDIUM (P3)"}</option>
                  <option value="low">{"LOW (P4)"}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Initial Status"}</label>
                <select 
                  value={statusState}
                  onChange={(e) => setStatusState(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                >
                  <option value="open">{"OPEN"}</option>
                  <option value="draft">{"DRAFT"}</option>
                </select>
              </div>
            </div>

            {/* Location & Assigned To Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Location / Region"}</label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. us-east-1, eu-west-1"
                  className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Assigned To (User ID)"}</label>
                <input 
                  type="number"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="User ID (optional)"
                  className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Detailed Telemetry / Diagnostics"}</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include error codes, relevant links, logs, or metrics triggering this event..."
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              />
            </div>

            {/* Resolution Notes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">{"Resolution Notes"}</label>
              <textarea 
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Initial notes or context..."
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-red-650 hover:bg-red-550 text-white font-medium rounded-xl py-3.5 px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-650/20 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              {submitting ? "Declaring..." : "Declare Incident & Alarm On-Call"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    )
  }

  // --- RENDER DETAIL/TELEMETRY VIEW ---
  if (!incidentData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <span className="text-sm font-medium text-zinc-400">{"Incident not found."}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col md:flex-row">
      {/* Detail Panel */}
      <div className="flex-1 p-6 md:p-10 border-r border-zinc-900 overflow-y-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          {"Back to Dashboard"}
        </Link>

        {/* Incident Summary Card */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-zinc-550">{`INC-${incidentData.id}`}</span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border tracking-wider uppercase ${getSeverityColor(incidentData.severity)}`}>
              {(incidentData.severity || 'low').toUpperCase()} {"Severity"}
            </span>
            <span className="text-xs bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400">
              {incidentData.category || 'Uncategorized'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">{incidentData.title}</h1>
          <p className="text-sm text-zinc-450 leading-relaxed bg-zinc-900/30 p-5 rounded-2xl border border-zinc-870">
            {incidentData.description || 'No operational description provided.'}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 bg-zinc-900/20 p-5 rounded-2xl border border-zinc-900">
          <div className="flex items-center gap-3">
            <User className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-550 block">{"Assignee"}</span>
              <span className="text-xs font-semibold text-zinc-300">
                {incidentData.assigned_to ? `User ${incidentData.assigned_to}` : 'Unassigned'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-550 block">{"Reported At"}</span>
              <span className="text-xs font-semibold text-zinc-300">
                {new Date(incidentData.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-550 block">{"Location"}</span>
              <span className="text-xs font-semibold text-zinc-300">{incidentData.location || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-3">{"Mitigation & Actions"}</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={incidentData.status === 'in_progress' || incidentData.status === 'resolved'}
              className="px-4 py-2 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"Acknowledge Incident"}
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              disabled={incidentData.status === 'resolved'}
              className="px-4 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"Mark as Resolved"}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">{"Incident Comments"}</h2>
          
          <div className="space-y-4 mb-6">
            {comments.map((comment: any) => (
              <div key={comment.id} className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">{`User ${comment.user_id}`}</span>
                  <span className="text-[9px] text-zinc-650">{new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-zinc-300">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-zinc-600">{"No comments posted on this incident yet."}</p>
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Post status update or runbook result..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-850 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none transition-all"
            />
            <button 
              type="submit" 
              className="p-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Incident Activity Logs (Timeline) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">{"Operations Logs & Activity"}</h2>
          
          <div className="space-y-6 relative border-l border-zinc-900 ml-3 pl-6">
            {activityLogs.map((log: any) => (
              <div key={log.id} className="relative">
                <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-indigo-400" />
                </span>
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">{log.message}</span>
                    <span className="text-[9px] text-zinc-650">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  {log.activity_type && (
                    <span className="text-[8px] bg-zinc-900 border border-zinc-850 text-zinc-550 px-1.5 py-0.5 rounded block w-max mt-1 uppercase tracking-wider">
                      {log.activity_type}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <p className="text-xs text-zinc-600">{"No activity recorded yet."}</p>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry/Sidebar Panel */}
      <div className="w-full md:w-80 p-6 md:p-10 bg-zinc-950/40 backdrop-blur-xl border-l border-zinc-900 flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">{"Live Telemetry (Metrics)"}</h2>
          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-medium">{"Error Rate"}</span>
                <span className="text-red-400 font-bold">{"92%"}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-955 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-medium">{"p99 Latency"}</span>
                <span className="text-amber-400 font-bold">{"2.8s"}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-955 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-medium">{"Sync Backlog"}</span>
                <span className="text-emerald-400 font-bold">{"Normal"}</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-955 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight section if available in incidentData */}
        {(incidentData.ai_summary || incidentData.ai_recommended_action) && (
          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase text-indigo-400">{"AI Sentinel Insights"}</h3>
            {incidentData.ai_summary && (
              <p className="text-xs text-zinc-300 leading-relaxed">
                {incidentData.ai_summary}
              </p>
            )}
            {incidentData.ai_recommended_action && (
              <div className="pt-2 border-t border-indigo-900/20">
                <span className="text-[10px] uppercase font-bold text-indigo-500 block">{"Recommended Action"}</span>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {incidentData.ai_recommended_action}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Incident status summary widget */}
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">{"Live Status"}</h3>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${
              incidentData.status === 'open' ? 'bg-red-500 animate-pulse' : 
              incidentData.status === 'in_progress' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
            <span className="font-extrabold text-sm tracking-wider text-zinc-200">
              {(incidentData.status || 'draft').toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
