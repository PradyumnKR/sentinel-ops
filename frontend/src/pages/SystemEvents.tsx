import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import { History, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityLog {
  id: number;
  incident_id: number;
  performed_by: number;
  activity_type: string;
  message: string;
  old_value: string;
  new_value: string;
  created_at: string;
}

export const SystemEvents: React.FC = () => {
  const { addToast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get<ActivityLog[]>("/incidents/recent?limit=1000");
        setLogs(response.data);
      } catch (error) {
        addToast("Failed to load activity logs.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [addToast]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, sortBy]);

  const activityStyles: Record<string, { color: string; label: string; bg: string }> = {
    incident_created: { color: "#10b981", label: "INCIDENT_CREATED", bg: "rgba(16, 185, 129, 0.1)" },
    incident_updated: { color: "#f59e0b", label: "INCIDENT_UPDATED", bg: "rgba(245, 158, 11, 0.1)" },
    comment_added: { color: "#a78bfa", label: "COMMENT_ADDED", bg: "rgba(167, 139, 250, 0.1)" },
    status_changed: { color: "#ef4444", label: "STATUS_CHANGED", bg: "rgba(239, 68, 68, 0.1)" },
  };

  const getActivityStyle = (type: string) =>
    activityStyles[type] || {
      color: "var(--text-muted)",
      label: type.toUpperCase(),
      bg: "rgba(255, 255, 255, 0.05)"
    };

  const formatTimestamp = (dateString: string) => {
    const d = new Date(dateString);
    const time = d.toLocaleTimeString('en-US', { hour12: false });
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${time} ${day}-${month}-${year}`;
  };

  const activityTypes = Array.from(new Set(logs.map(log => log.activity_type)));

  // Filter & Sort
  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `inc-${log.incident_id}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === "all" || log.activity_type === selectedType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  // Paginate
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center shadow-inner">
          <History className="text-[#8B5CF6]" size={20} />
        </div>
        <div>
          <h1 className="headline-lg tracking-tight">System Events</h1>
          <p className="text-[var(--text-secondary)] mt-1 text-sm">
            Real-time audit log of security actions, incident updates, and comment events.
          </p>
        </div>
      </div>

      {/* Filters Area */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center gap-4 justify-between border-zinc-800/80 bg-zinc-950/20">
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text"
            className="sentinel-input bg-[var(--input-bg)] border-zinc-800"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search logs or Incident ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-grow md:flex-initial">
            <select
              className="sentinel-input bg-[var(--input-bg)] border-zinc-800 appearance-none cursor-pointer min-w-[160px]"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Event Types</option>
              {activityTypes.map(type => (
                <option key={type} value={type}>
                  {getActivityStyle(type).label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-grow md:flex-initial">
            <select
              className="sentinel-input bg-[var(--input-bg)] border-zinc-800 appearance-none cursor-pointer min-w-[140px]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Card */}
      <div className="glass-panel flex flex-col border-zinc-800/80 overflow-hidden bg-zinc-950/10 min-h-[300px]">
        <div className="p-6 flex-1">
          <div className="relative border-l border-zinc-800/80 ml-2 pl-6 space-y-6">
            {paginatedLogs.map((event) => {
              const style = getActivityStyle(event.activity_type);
              return (
                <div 
                  className="relative group transition-all duration-200" 
                  key={event.id}
                >
                  {/* Timeline dot */}
                  <span
                    className="absolute -left-[29px] top-2.5 w-2 h-2 rounded-full ring-4 ring-[#09090b] transition-transform duration-200 group-hover:scale-125"
                    style={{ backgroundColor: style.color, boxShadow: `0 0 6px ${style.color}` }}
                  ></span>

                  {/* Log body */}
                  <div className="flex flex-col gap-1.5 p-3 rounded bg-zinc-900/10 border border-transparent hover:border-zinc-850 hover:bg-zinc-900/30 transition-all">
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded text-[10px]"
                          style={{ color: style.color, backgroundColor: style.bg }}
                        >
                          {style.label}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          INC-{event.incident_id}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {formatTimestamp(event.created_at)}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans font-medium">
                      {event.message}
                    </span>
                  </div>
                </div>
              );
            })}

            {paginatedLogs.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] pl-2">No matching activity logs found.</p>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800/85 flex items-center justify-between bg-zinc-950/20">
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} logs
            </span>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
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
                className="w-8 h-8 rounded border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-850 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
