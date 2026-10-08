import {
  AdminAnalytics,
  Authority,
  Complaint,
  Escalation,
  Notification,
  Stats,
  User,
  WardInfo,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('sws_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(identifier: string, password: string, role?: 'citizen' | 'authority') {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to log in');
    }
    if (data.token) {
      localStorage.setItem('sws_token', data.token);
      localStorage.setItem('sws_user', JSON.stringify(data.user));
    }
    return data as { token: string; user: User };
  },

  async register(formData: {
    name: string;
    mobile: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    locality: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    if (data.token) {
      localStorage.setItem('sws_token', data.token);
      localStorage.setItem('sws_user', JSON.stringify(data.user));
    }
    return data as { token: string; user: User };
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to verify session');
    }
    return data as User;
  },

  logout() {
    localStorage.removeItem('sws_token');
    localStorage.removeItem('sws_user');
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem('sws_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Wards
  async getWards(): Promise<WardInfo[]> {
    const res = await fetch(`${API_BASE}/wards`);
    const data = await res.json();
    return data.wards || [];
  },

  // Complaints (Citizen & General)
  async getComplaints(): Promise<Complaint[]> {
    const res = await fetch(`${API_BASE}/complaints`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaints');
    return data.complaints || [];
  },

  async getComplaintById(
    id: string
  ): Promise<{ complaint: Complaint; history: any[]; escalations?: Escalation[] }> {
    const res = await fetch(`${API_BASE}/complaints/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch complaint');
    return data;
  },

  async getStats(): Promise<Stats> {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
    return data.stats;
  },

  async submitComplaint(payload: {
    problem_type: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    citizen_image: string;
    voice_recording: string;
    ward: string;
    priority?: string;
  }): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit complaint');
    }
    return data;
  },

  // ==========================================
  // PART 2: ADMIN & MUNICIPALITY APIS
  // ==========================================

  async getAuthorities(): Promise<Authority[]> {
    const res = await fetch(`${API_BASE}/authorities`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch authorities');
    return data.authorities || [];
  },

  async getAdminComplaints(filters?: {
    status?: string;
    ward?: string;
    problem_type?: string;
    priority?: string;
    staff?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val) query.append(key, val);
      });
    }
    const res = await fetch(`${API_BASE}/admin/complaints?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin complaints');
    return data;
  },

  async assignComplaint(
    complaintId: string,
    payload: {
      staffId: string;
      staffName: string;
      department?: string;
      ward?: string;
    }
  ): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(
      `${API_BASE}/admin/complaints/${encodeURIComponent(complaintId)}/assign`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to assign complaint');
    return data;
  },

  async submitFeedback(
    complaintId: string,
    rating: number,
    feedback: string
  ): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(
      `${API_BASE}/complaints/${encodeURIComponent(complaintId)}/feedback`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, feedback }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');
    return data;
  },

  async updateComplaintStatus(
    complaintId: string,
    payload: {
      status: string;
      notes: string;
      resolutionImage?: string;
      resolutionActionTaken?: string;
      notCompletedReason?: string;
      notCompletedAction?: string;
      notCompletedImage?: string;
    }
  ): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(
      `${API_BASE}/admin/complaints/${encodeURIComponent(complaintId)}/status`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update complaint status');
    return data;
  },

  async escalateComplaint(
    complaintId: string,
    payload: {
      reason: string;
      notes: string;
      targetLevel?: number;
    }
  ): Promise<{ message: string; complaint: Complaint; escalation: Escalation }> {
    const res = await fetch(
      `${API_BASE}/admin/complaints/${encodeURIComponent(complaintId)}/escalate`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to escalate complaint');
    return data;
  },

  async updateComplaintPriority(
    complaintId: string,
    priority: string
  ): Promise<{ message: string; complaint: Complaint }> {
    const res = await fetch(
      `${API_BASE}/admin/complaints/${encodeURIComponent(complaintId)}/priority`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ priority }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update priority');
    return data;
  },

  async getAdminStats(): Promise<AdminAnalytics> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data;
  },

  async getAdminEscalations(): Promise<Escalation[]> {
    const res = await fetch(`${API_BASE}/admin/escalations`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch escalations');
    return data.escalations || [];
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return data;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.success;
  },

  // AI Voice & Description Enhancement
  async enhanceDescription(payload: {
    description: string;
    problemType?: string;
    locality?: string;
  }) {
    const res = await fetch(`${API_BASE}/ai/enhance-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'AI enhancement unavailable');
    }
    return data as {
      success: boolean;
      ai_assisted: boolean;
      enhanced_description: string;
      estimated_depth: string;
      priority_recommendation: 'Low' | 'Medium' | 'High' | 'Critical';
      voice_guidance: string;
    };
  },
};
