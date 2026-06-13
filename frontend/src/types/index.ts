export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  location: string;
  created_by: number;
  assigned_to: number | null;
  closed_by: number | null;
  ai_summary: string | null;
  ai_severity: string | null;
  ai_recommended_action: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface Comment {
  id: number;
  incident_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ActivityLog {
  id: number;
  incident_id: number;
  performed_by: number;
  activity_type: string;
  old_value: string | null;
  new_value: string | null;
  message: string | null;
  created_at: string;
  user?: User;
}
