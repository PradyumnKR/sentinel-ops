import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import type { Incident } from "../types";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  User as UserIcon,
  Plus,
  History,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await api.get<Incident[]>("/incidents/");
        setIncidents(response.data);
      } catch (error) {
        addToast("Failed to load dashboard data.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncidents();
  }, [addToast]);

  const activityStyles: Record<string, { color: string; label: string }> = {
    incident_created: {
      color: "var(--status-resolved)",
      label: "INCIDENT_CREATED",
    },
    incident_updated: {
      color: "var(--status-high)",
      label: "INCIDENT_UPDATED",
    },
    comment_added: { color: "var(--accent-primary)", label: "COMMENT_ADDED" },
    status_changed: {
      color: "var(--status-critical)",
      label: "STATUS_CHANGED",
    },
  };
  const getActivityStyle = (type: string) =>
    activityStyles[type] || {
      color: "var(--text-muted)",
      label: type.toUpperCase(),
    };

  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hrs ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };
  useEffect(() => {
    api
      .get("/incidents/recent")
      .then((response) => {
        const withTimeAgo = response.data.map((item: any) => ({
          ...item,
          timeAgoText: timeAgo(item.created_at),
        }));
        setRecentActivity(withTimeAgo);
      })
      .catch((err) => console.error(err));
  }, []);
  const activeIncidents = incidents.filter(
    (i) => i.status !== "Resolved" && i.status !== "Closed",
  );
  const criticalIncidents = activeIncidents.filter(
    (i) =>
      i.severity.toLowerCase() === "critical" ||
      i.severity.toLowerCase() === "high",
  );
  const myIncidents = activeIncidents.filter((i) => i.assigned_to === user?.id);
  const resolvedToday = incidents.filter((i) => {
    if (i.status !== "Resolved" || !i.resolved_at) return false;
    const resolvedDateStr = i.resolved_at.split(/[T ]/)[0];
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    return resolvedDateStr === todayStr;
  }).length;

  const sortedIncidents = [...incidents].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const totalItems = sortedIncidents.length;
  const totalPages = Math.ceil(totalItems / 5) || 1;
  const paginatedIncidents = sortedIncidents.slice((currentPage - 1) * 5, currentPage * 5);

  const getTableStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#9ca3af";
      case "investigating":
        return "var(--status-critical)";
      case "identified":
        return "var(--status-high)";
      case "resolving":
        return "var(--status-medium)";
      case "resolved":
        return "var(--status-resolved)";
      default:
        return "var(--text-muted)";
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev.toLowerCase()) {
      case "critical":
        return "var(--status-critical)";
      case "high":
        return "var(--status-high)";
      case "medium":
        return "var(--status-medium)";
      default:
        return "var(--status-low)";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "investigating":
        return "var(--status-critical)";
      case "identified":
        return "var(--status-high)";
      case "monitoring":
        return "var(--accent-secondary)";
      case "resolved":
        return "var(--status-resolved)";
      default:
        return "var(--text-muted)";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[var(--button-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="headline-lg">Overview</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            System status and active incident monitoring.
          </p>
        </div>
        <button
          onClick={() => navigate("/incidents/new")}
          className="sentinel-btn sentinel-btn-primary"
        >
          <Plus size={16} /> NEW INCIDENT
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Incidents */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D97706]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-muted)] text-[10px] tracking-wider font-bold">
              ACTIVE INCIDENTS
            </span>
            <AlertTriangle size={18} className="text-[#F59E0B]" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-white">
              {activeIncidents.length}
            </span>
            <span
              className="text-sm font-semibold text-[#F59E0B]"
            >
              ↑ 12%
            </span>
          </div>
        </div>

        {/* Critical Severity */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#DC2626]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-muted)] text-[10px] tracking-wider font-bold">
              CRITICAL SEVERITY
            </span>
            <AlertCircle
              size={18}
              className="text-[#EF4444]"
            />
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-5xl font-bold text-white"
            >
              {criticalIncidents.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Requires attention
            </span>
          </div>
        </div>

        {/* Assigned To Me */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6366F1]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-muted)] text-[10px] tracking-wider font-bold">
              ASSIGNED TO ME
            </span>
            <UserIcon size={18} className="text-[#818CF8]" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-white">{myIncidents.length}</span>
            <span className="text-xs text-[var(--text-muted)]">
              {myIncidents.length > 0
                ? `${myIncidents.length} overdue`
                : "All clear"}
            </span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#059669]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-muted)] text-[10px] tracking-wider font-bold">
              RESOLVED TODAY
            </span>
            <CheckCircle
              size={18}
              className="text-[#10B981]"
            />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-white">{resolvedToday}</span>
            <span
              className="text-sm font-semibold text-[#10B981]"
            >
              ↑ 5%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        {/* Recent Incidents Table */}
        <div className="glass-panel flex flex-col h-[400px] justify-between overflow-hidden w-full">
          <div className="flex flex-col flex-1 min-h-0">
            <div
              className="px-6 py-5 border-b flex justify-between items-center shrink-0"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h2 className="text-lg font-semibold text-white">Recent Incidents</h2>
              <button
                className="label-caps hover:text-white transition-colors cursor-pointer text-xs text-[#7C3AED] hover:text-[#8B5CF6] font-bold"
                onClick={() => navigate("/incidents")}
              >
                VIEW ALL
              </button>
            </div>

            <div className="p-2 overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th
                      className="px-4 py-3 label-caps text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      ID
                    </th>
                    <th
                      className="px-4 py-3 label-caps text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Title
                    </th>
                    <th
                      className="px-4 py-3 label-caps text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Severity
                    </th>
                    <th
                      className="px-4 py-3 label-caps text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-4 py-3 label-caps text-right text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="cursor-pointer transition-colors hover:bg-(--bg-surface-hover) border-b last:border-0"
                      style={{ borderColor: "var(--border-subtle)" }}
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                    >
                      <td className="px-4 py-4 label-mono text-sm font-semibold text-[#a78bfa]">
                        INC-{incident.id}
                      </td>
                      <td className="px-4 py-4 font-medium text-sm text-white pr-8">
                        {incident.title}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded border bg-black/20 label-caps text-[10px]"
                          style={{
                            borderColor: getSeverityColor(incident.severity),
                            color: getSeverityColor(incident.severity),
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full mr-1.5"
                            style={{
                              backgroundColor: getSeverityColor(
                                incident.severity,
                              ),
                            }}
                          ></span>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm font-medium text-white">
                          <span 
                            className="w-2 h-2 rounded-full mr-2 shrink-0" 
                            style={{ 
                              backgroundColor: getTableStatusColor(incident.status || "Open"),
                              boxShadow: `0 0 6px ${getTableStatusColor(incident.status || "Open")}` 
                            }}
                          ></span>
                          {incident.status || "Open"}
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 label-mono text-right text-xs text-[var(--text-secondary)] whitespace-nowrap"
                      >
                        {(() => {
                          const d = new Date(incident.created_at);
                          const time = d.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                          const day = String(d.getDate()).padStart(2, '0');
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const year = d.getFullYear();
                          return `${time} ${day}-${month}-${year}`;
                        })()}
                      </td>
                    </tr>
                  ))}
                  {paginatedIncidents.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-(--text-muted) text-sm"
                      >
                        No recent incidents.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Frontend Pagination Footer */}
          <div className="px-6 py-4 border-t border-zinc-800/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * 5 + 1} to {Math.min(currentPage * 5, totalItems)} of {totalItems} incidents
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 flex items-center justify-center text-[var(--text-secondary)] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 flex items-center justify-center text-[var(--text-secondary)] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
