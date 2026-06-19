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
  const resolvedToday = incidents.filter((i) => i.status === "Resolved").length; // Mock logic

  const recentIncidents = [...incidents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

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
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--status-high)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-primary)]">
              ACTIVE INCIDENTS
            </span>
            <AlertTriangle size={18} style={{ color: "var(--status-high)" }} />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold">
              {activeIncidents.length}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--status-high)" }}
            >
              ↑ 12%
            </span>
          </div>
        </div>

        {/* Critical Severity */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--status-critical)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-primary)]">
              CRITICAL SEVERITY
            </span>
            <AlertCircle
              size={18}
              style={{ color: "var(--status-critical)" }}
            />
          </div>
          <div className="flex items-baseline gap-3">
            <span
              className="text-4xl font-semibold"
              style={{ color: "var(--status-critical)" }}
            >
              {criticalIncidents.length}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              Requires attention
            </span>
          </div>
        </div>

        {/* Assigned To Me */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-primary)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-primary)]">
              ASSIGNED TO ME
            </span>
            <UserIcon size={18} style={{ color: "var(--text-primary)" }} />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold">{myIncidents.length}</span>
            <span className="text-sm text-[var(--text-secondary)]">
              {myIncidents.length > 0
                ? `${myIncidents.length} overdue`
                : "All clear"}
            </span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="glass-panel p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--status-resolved)]"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="label-caps text-[var(--text-primary)]">
              RESOLVED TODAY
            </span>
            <CheckCircle
              size={18}
              style={{ color: "var(--status-resolved)" }}
            />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold">{resolvedToday}</span>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--status-resolved)" }}
            >
              ↑ 5%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table */}
        <div className="lg:col-span-2 glass-panel flex flex-col h-full">
          <div
            className="px-6 py-5 border-b flex justify-between items-center"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h2 className="text-lg font-medium">Recent Incidents</h2>
            <button
              className="label-caps hover:text-white transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => navigate("/incidents")}
            >
              VIEW ALL
            </button>
          </div>

          <div className="flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th
                    className="px-4 py-3 label-caps"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ID
                  </th>
                  <th
                    className="px-4 py-3 label-caps"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Title
                  </th>
                  <th
                    className="px-4 py-3 label-caps"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Severity
                  </th>
                  <th
                    className="px-4 py-3 label-caps"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 label-caps text-right"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="cursor-pointer transition-colors hover:bg-(--bg-surface-hover) border-b last:border-0"
                    style={{ borderColor: "var(--border-subtle)" }}
                    onClick={() => navigate(`/incidents/${incident.id}`)}
                  >
                    <td className="px-4 py-4 label-mono text-(--text-secondary)">
                      INC-{incident.id}
                    </td>
                    <td className="px-4 py-4 font-medium text-sm pr-8">
                      {incident.title}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full label-caps border bg-black/20"
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
                    <td
                      className="px-4 py-4 text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {incident.status || "Open"}
                    </td>
                    <td
                      className="px-4 py-4 label-mono text-right"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {new Date(incident.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
                {recentIncidents.length === 0 && (
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

        {/* System Events Panel */}
        <div className="glass-panel flex flex-col h-full">
          <div
            className="px-6 py-5 border-b flex justify-between items-center"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h2 className="text-lg font-medium">System Events</h2>
            <History size={16} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            <div
              className="relative border-l ml-3 pl-6 space-y-8"
              style={{ borderColor: "var(--border-strong)" }}
            >
              {recentActivity.map((event) => {
                const style = getActivityStyle(event.activity_type);
                return (
                  <div className="relative" key={event.id}>
                    <span
                      className="absolute -left-7.25 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-(--bg-surface)"
                      style={{ backgroundColor: style.color }}
                    ></span>
                    <div className="flex flex-col">
                      <span
                        className="terminal-text"
                        style={{ color: style.color }}
                      >
                        {style.label}
                      </span>
                      <span
                        className="text-sm mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {event.message}{" "}
                        <span style={{ color: "var(--text-muted)" }}>
                          · INC-{event.incident_id}
                        </span>
                      </span>
                      <span
                        className="label-caps mt-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {event.timeAgoText}
                      </span>
                    </div>
                  </div>
                );
              })}

              {recentActivity.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
