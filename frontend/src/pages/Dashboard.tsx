import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Filter, 
  ChevronRight, 
  Search, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react'

// Mock Initial Incidents
const initialIncidents = [
  { id: 'INC-2049', title: 'OAuth Provider Timeout', service: 'Auth-Service', priority: 'CRITICAL', status: 'ACTIVE', time: '10 mins ago', assignee: 'Jane Cooper' },
  { id: 'INC-2048', title: 'Spike in API Latency (p99 > 2.5s)', service: 'Gateway', priority: 'HIGH', status: 'ACTIVE', time: '23 mins ago', assignee: 'Alex Rivera' },
  { id: 'INC-2047', title: 'Database Replication Lag', service: 'Postgres-DB', priority: 'MEDIUM', status: 'ACKNOWLEDGED', time: '1 hr ago', assignee: 'Sarah Chen' },
  { id: 'INC-2046', title: 'SSL Certificate Expiration Warning', service: 'Web-Proxy', priority: 'LOW', status: 'RESOLVED', time: '3 hrs ago', assignee: 'Dave K.' },
]

export default function Dashboard() {
  const [incidents] = useState(initialIncidents)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const navigate = useNavigate()

  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length
  const criticalCount = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          incident.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          incident.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === 'ALL' || incident.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-xl p-6 hidden md:flex flex-col justify-between">
        <div className="space-y-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight block text-sm">SENTINEL</span>
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wider block -mt-1">OPS DECK</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-550/10 text-indigo-400 font-medium text-sm transition-all border border-indigo-500/10">
              <Activity className="w-4 h-4" />
              Incidents Dashboard
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white text-sm transition-all">
              <Shield className="w-4 h-4" />
              Security Alerts
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white text-sm transition-all">
              <Settings className="w-4 h-4" />
              System Config
            </a>
          </nav>
        </div>

        {/* User Info / Log Out */}
        <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-550 flex items-center justify-center font-bold text-sm text-white">
              JD
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-200">John Doe</span>
              <span className="block text-[10px] text-zinc-500">Ops Lead</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Active Command</h1>
            <p className="text-sm text-zinc-400 mt-1">Real-time status of production microservices.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 inset-y-0 my-auto w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search events, host..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-550 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none transition-all"
              />
            </div>
            <button className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
            </button>
            <Link 
              to="/incident/new"
              className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-550 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-650/15 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Incident
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1 */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Active Incidents</span>
              <span className="text-3xl font-black mt-2 block">{activeCount}</span>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/10">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Critical Severity</span>
              <span className="text-3xl font-black text-red-500 mt-2 block">{criticalCount}</span>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/10">
              <Shield className="w-6 h-6" />
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Avg Resolve Time</span>
              <span className="text-3xl font-black mt-2 block">18m</span>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-550 border border-indigo-500/10">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Resolved (Today)</span>
              <span className="text-3xl font-black text-emerald-500 mt-2 block">{resolvedCount}</span>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-550 border border-emerald-550/10">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-450" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Filters:</span>
            <div className="flex items-center gap-1.5 ml-2">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    filterPriority === p 
                      ? 'bg-white text-zinc-950 border-white font-semibold' 
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-zinc-550">{filteredIncidents.length} items logged</span>
        </div>

        {/* Incident List */}
        <div className="space-y-3.5">
          {filteredIncidents.map((incident, idx) => {
            const priorityColors: Record<string, string> = {
              CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/10',
              HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/10',
              MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
              LOW: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
            }

            const statusColors: Record<string, string> = {
              ACTIVE: 'bg-red-500',
              ACKNOWLEDGED: 'bg-amber-500',
              RESOLVED: 'bg-emerald-500',
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={incident.id}
                onClick={() => navigate(`/incident/${incident.id}`)}
                className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-850 hover:border-zinc-750 rounded-2xl transition-all cursor-pointer"
              >
                {/* Details */}
                <div className="flex items-start gap-4">
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border tracking-wider mt-0.5 ${priorityColors[incident.priority]}`}>
                    {incident.priority}
                  </span>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-zinc-500">{incident.id}</span>
                      <h3 className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{incident.title}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1.5">
                      <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">{incident.service}</span>
                      <span>Assigned to <strong className="text-zinc-400">{incident.assignee}</strong></span>
                      <span>• {incident.time}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${statusColors[incident.status]}`}></span>
                    <span className="text-xs font-semibold tracking-wider text-zinc-350">{incident.status}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:translate-x-1 group-hover:text-white transition-all" />
                </div>
              </motion.div>
            )
          })}

          {filteredIncidents.length === 0 && (
            <div className="text-center py-16 bg-zinc-900/10 border border-dashed border-zinc-850 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-400">All systems operational</p>
              <p className="text-xs text-zinc-650 mt-1">No incidents match your current search/filters.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
