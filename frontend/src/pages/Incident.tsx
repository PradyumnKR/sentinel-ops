import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  ArrowLeft, 
  AlertTriangle, 
  User, 
  Clock, 
  Activity, 
  Play, 
  Send
} from 'lucide-react'

// Mock Data Store for viewing
const mockIncidents: Record<string, unknown> = {
  'INC-2049': {
    id: 'INC-2049',
    title: 'OAuth Provider Timeout',
    service: 'Auth-Service',
    priority: 'CRITICAL',
    status: 'ACTIVE',
    assignee: 'Jane Cooper',
    reportedBy: 'DataDog Agent v8.2',
    description: 'Anomalous error rate spike detected in OAuth callbacks. HTTP 504 Gateway Timeout returned for 92% of client requests attempting authentication from EU-West-1.',
    created: '10 mins ago',
    timeline: [
      { id: 1, type: 'ALERT', text: 'Anomaly detected: HTTP 5xx spikes on /oauth/callback', time: '10 mins ago' },
      { id: 2, type: 'SYSTEM', text: 'Automated Playbook: auth_restart_db failed to resolve issue', time: '8 mins ago' },
      { id: 3, type: 'ASSIGN', text: 'Jane Cooper assigned to incident', time: '7 mins ago' },
    ]
  },
  'INC-2048': {
    id: 'INC-2048',
    title: 'Spike in API Latency (p99 > 2.5s)',
    service: 'Gateway',
    priority: 'HIGH',
    status: 'ACTIVE',
    assignee: 'Alex Rivera',
    reportedBy: 'Sentry-Integration',
    description: 'Gateway response latency exceeding operational limits. Outbound buffer overflow occurring on regional CDN endpoints.',
    created: '23 mins ago',
    timeline: [
      { id: 1, type: 'ALERT', text: 'Latency alert triggered for gateway route /api/v1', time: '23 mins ago' }
    ]
  },
  'INC-2047': {
    id: 'INC-2047',
    title: 'Database Replication Lag',
    service: 'Postgres-DB',
    priority: 'MEDIUM',
    status: 'ACKNOWLEDGED',
    assignee: 'Sarah Chen',
    reportedBy: 'Prometheus AlertManager',
    description: 'Write-ahead log buffer backlog is growing. Primary-secondary sync lag exceeded 15000ms threshold.',
    created: '1 hr ago',
    timeline: [
      { id: 1, type: 'ALERT', text: 'Replication lag metric exceeded 10s', time: '1 hr ago' },
      { id: 2, type: 'STATUS', text: 'Sarah Chen changed status to ACKNOWLEDGED', time: '45 mins ago' }
    ]
  }
}

export default function Incident() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  // --- Form States (For New Incident) ---
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [service, setService] = useState('Auth-Service')
  const [priority, setPriority] = useState('HIGH')
  const [assignee, setAssignee] = useState('Jane Cooper')

  // --- Detail States (For Viewing Incident) ---
  const incidentData = mockIncidents[id || ''] || mockIncidents['INC-2049']
  const [currentStatus, setCurrentStatus] = useState(incidentData.status)
  const [timeline, setTimeline] = useState(incidentData.timeline)
  const [newComment, setNewComment] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulated redirect
    navigate('/dashboard')
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    const newEvent = {
      id: timeline.length + 1,
      type: 'COMMENT',
      text: `John Doe: ${newComment}`,
      time: 'Just now'
    }
    setTimeline([...timeline, newEvent])
    setNewComment('')
  }

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    const newEvent = {
      id: timeline.length + 1,
      type: 'STATUS',
      text: `Status updated to ${newStatus}`,
      time: 'Just now'
    }
    setTimeline([...timeline, newEvent])
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
            Back to Command Deck
          </Link>

          <h1 className="text-2xl font-black mb-1">Declare New Incident</h1>
          <p className="text-sm text-zinc-400 mb-8">Paging relevant on-call engineers. Provide detailed operational context.</p>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Incident Summary / Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Memory Leak on Payment Workers"
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              />
            </div>

            {/* Service & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Affected Component</label>
                <select 
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                >
                  <option value="Auth-Service">Auth-Service</option>
                  <option value="Gateway">Gateway</option>
                  <option value="Postgres-DB">Postgres-DB</option>
                  <option value="Billing-Engine">Billing-Engine</option>
                  <option value="Redis-Cache">Redis-Cache</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Severity Level</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (P1)</option>
                  <option value="HIGH">HIGH (P2)</option>
                  <option value="MEDIUM">MEDIUM (P3)</option>
                  <option value="LOW">LOW (P4)</option>
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">On-Call Assignee</label>
              <select 
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              >
                <option value="Jane Cooper">Jane Cooper (On-call Lead)</option>
                <option value="Alex Rivera">Alex Rivera</option>
                <option value="Sarah Chen">Sarah Chen</option>
                <option value="Dave K.">Dave K.</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Detailed Telemetry / Diagnostics</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include error codes, relevant links, logs, or metrics triggering this event..."
                className="w-full bg-zinc-950/80 border border-zinc-850 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-sm transition-all focus:outline-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-red-650 hover:bg-red-550 text-white font-medium rounded-xl py-3.5 px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-650/20 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              Declare Incident & Alarm On-Call
            </motion.button>
          </form>
        </motion.div>
      </div>
    )
  }

  // --- RENDER DETAIL/TELEMETRY VIEW ---
  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/10',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/10',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
    LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col md:flex-row">
      {/* Detail Panel */}
      <div className="flex-1 p-6 md:p-10 border-r border-zinc-900 overflow-y-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Incident Summary Card */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-zinc-550">{incidentData.id}</span>
            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border tracking-wider uppercase ${priorityColors[incidentData.priority]}`}>
              {incidentData.priority} Severity
            </span>
            <span className="text-xs bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400">
              {incidentData.service}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-4">{incidentData.title}</h1>
          <p className="text-sm text-zinc-450 leading-relaxed bg-zinc-900/30 p-5 rounded-2xl border border-zinc-870">
            {incidentData.description}
          </p>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 bg-zinc-900/20 p-5 rounded-2xl border border-zinc-900">
          <div className="flex items-center gap-3">
            <User className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-550 block">Assignee</span>
              <span className="text-xs font-semibold text-zinc-300">{incidentData.assignee}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-550 block">Reported At</span>
              <span className="text-xs font-semibold text-zinc-300">{incidentData.created}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4.5 h-4.5 text-zinc-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-550 block">Reporter</span>
              <span className="text-xs font-semibold text-zinc-300">{incidentData.reportedBy}</span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-3">Mitigation & Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusChange('ACKNOWLEDGED')}
              disabled={currentStatus === 'ACKNOWLEDGED' || currentStatus === 'RESOLVED'}
              className="px-4 py-2 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Acknowledge Incident
            </button>
            <button
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={currentStatus === 'RESOLVED'}
              className="px-4 py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark as Resolved
            </button>
            <button className="px-4 py-2 text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer">
              <Play className="w-3.5 h-3.5" /> Run Automation Playbook
            </button>
          </div>
        </div>

        {/* Incident Timeline */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">Operations Logs & Activity</h2>
          
          <div className="space-y-6 relative border-l border-zinc-900 ml-3 pl-6">
            {timeline.map((event: any) => (
              <div key={event.id} className="relative">
                <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-zinc-950 border border-zinc-850 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-indigo-400" />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-zinc-200">{event.text}</span>
                    <span className="text-[10px] text-zinc-550">{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add timeline update / comment */}
          <form onSubmit={handleAddComment} className="flex gap-3 mt-8 ml-3">
            <input 
              type="text" 
              placeholder="Post status update or runbook result..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-850 focus:border-indigo-500 rounded-xl py-2 px-4 text-xs text-white focus:outline-none transition-all"
            />
            <button 
              type="submit" 
              className="p-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Telemetry/Sidebar Panel */}
      <div className="w-full md:w-80 p-6 md:p-10 bg-zinc-950/40 backdrop-blur-xl border-l border-zinc-900 flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-450 mb-4">Live Telemetry (Metrics)</h2>
          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-medium">Error Rate</span>
                <span className="text-red-400 font-bold">92%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-955 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-medium">p99 Latency</span>
                <span className="text-amber-400 font-bold">2.8s</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-955 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-medium">Sync Backlog</span>
                <span className="text-emerald-400 font-bold">Normal</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-955 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Incident status summary widget */}
        <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase text-zinc-500 mb-3">Live Status</h3>
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${
              currentStatus === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 
              currentStatus === 'ACKNOWLEDGED' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></span>
            <span className="font-extrabold text-sm tracking-wider text-zinc-200">{currentStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
