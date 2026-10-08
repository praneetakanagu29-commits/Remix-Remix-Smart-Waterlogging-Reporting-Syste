export type AuthorityRole =
  | 'Municipal Staff'
  | 'Ward Officer'
  | 'Zonal Officer'
  | 'Higher Authority'
  | 'Super Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  role: 'citizen' | 'authority';
  locality: string;
  created_at: string;
  // Authority details
  authority_role?: AuthorityRole;
  authority_level?: number;
  department?: string;
  ward?: string;
  zone?: string;
}

export interface Authority {
  id: string;
  user_id: string;
  name: string;
  role: AuthorityRole;
  department: string;
  ward: string;
  zone: string;
  authority_level: number;
  mobile: string;
  email: string;
}

export type ComplaintStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Not Completed'
  | 'Escalated';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Complaint {
  complaint_id: string;
  user_id: string;
  user_name: string;
  user_mobile: string;
  user_email?: string;
  problem_type: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  citizen_image: string;
  voice_recording: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  municipality: string;
  ward: string;
  department: string;
  assigned_staff: string;
  assigned_staff_id?: string;
  assigned_department?: string;
  assigned_ward?: string;
  assigned_date?: string;
  assigned_by?: string;
  authority_level: number;
  // Resolution fields
  resolution_notes?: string;
  resolution_action_taken?: string;
  resolution_image?: string;
  resolution_completed_by?: string;
  resolved_at?: string;
  // Citizen Feedback fields
  citizen_rating?: number;
  citizen_feedback?: string;
  feedback_submitted_at?: string;
  // Not completed fields
  not_completed_reason?: string;
  not_completed_notes?: string;
  not_completed_action?: string;
  not_completed_image?: string;
  // Escalation fields
  escalation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  complaint_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  notes: string;
  timestamp: string;
  action_type?: 'status_change' | 'assignment' | 'escalation' | 'priority_change';
}

export interface Escalation {
  id: string;
  complaint_id: string;
  from_level: number;
  to_level: number;
  from_role: string;
  to_role: string;
  reason: string;
  notes: string;
  escalated_by: string;
  escalated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  complaint_id: string;
  message: string;
  type?: 'status' | 'assignment' | 'escalation' | 'alert' | 'resolution' | 'not_completed';
  action_type?: 'view_resolution' | 'track_complaint';
  action_label?: string;
  read_status: boolean;
  created_at: string;
}

export interface Hotspot {
  ward: string;
  count: number;
  unresolved: number;
  criticalCount: number;
  lat: number;
  lng: number;
  topProblem: string;
  riskLevel: 'Severe' | 'High' | 'Moderate';
}

export interface TrendPoint {
  date: string;
  label: string;
  count: number;
  completed: number;
}

export interface Stats {
  total: number;
  new_complaints?: number;
  pending: number;
  in_progress: number;
  completed: number;
  not_completed: number;
  escalated: number;
}

export interface AdminAnalytics {
  stats: Stats;
  charts: {
    byCategory: Record<string, number>;
    byWard: Record<string, number>;
    byPriority: Record<string, number>;
  };
  hotspots?: Hotspot[];
  trends?: TrendPoint[];
  resolutionRate?: number;
  avgResolutionHours?: number;
  avgRating?: number;
  completedCount?: number;
  unresolvedCount?: number;
  escalatedCount?: number;
  recentComplaints: Complaint[];
}

export interface WardInfo {
  id: string;
  code: string;
  locality: string;
  officer: string;
  helpline: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export type ProblemType =
  | 'Waterlogging'
  | 'Drainage Blockage'
  | 'Open/Blocked Drain'
  | 'Rainwater Accumulation'
  | 'Road Flooding'
  | 'Garbage Blocking Drain'
  | 'Overflowing Drain'
  | 'Other';

export interface ComplaintDraft {
  problem_type: ProblemType | '';
  photo: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  voice_audio_base64: string;
  voice_duration_seconds: number;
  ward: string;
  priority: ComplaintPriority;
}
