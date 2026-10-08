import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
  password_hash: string;
  role: 'citizen' | 'authority';
  locality: string;
  created_at: string;
  // Authority extensions
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
  authority_level: number; // 1 = Staff, 2 = Ward Officer, 3 = Zonal Officer, 4 = Higher Authority, 5 = Super Admin
  mobile: string;
  email: string;
}

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
  status: 'Pending' | 'In Progress' | 'Completed' | 'Not Completed' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  municipality: string;
  ward: string;
  department: string;
  assigned_staff: string;
  assigned_staff_id?: string;
  assigned_department?: string;
  assigned_ward?: string;
  assigned_date?: string;
  assigned_by?: string;
  authority_level: number; // Current handling hierarchy level (1 to 4)
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
  user_id: string; // citizen user id or 'authority'
  complaint_id: string;
  message: string;
  type?: 'status' | 'assignment' | 'escalation' | 'alert' | 'resolution' | 'not_completed';
  action_type?: 'view_resolution' | 'track_complaint';
  action_label?: string;
  read_status: boolean;
  created_at: string;
}

interface DatabaseSchema {
  users: User[];
  authorities: Authority[];
  complaints: Complaint[];
  status_history: StatusHistory[];
  escalations: Escalation[];
  notifications: Notification[];
  complaint_counter: number;
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const citizenHash = bcrypt.hashSync('citizen123', salt);
  const staffHash = bcrypt.hashSync('staff123', salt);
  const wardOfficerHash = bcrypt.hashSync('admin123', salt);
  const zonalHash = bcrypt.hashSync('zonal123', salt);
  const higherHash = bcrypt.hashSync('higher123', salt);
  const superHash = bcrypt.hashSync('super123', salt);

  const initialUsers: User[] = [
    // Citizens
    {
      id: 'usr_c01_rahul',
      name: 'Rahul Patel',
      email: 'rahul.patel@citizen.gov',
      mobile: '+91 98765 43210',
      username: 'rahul_patel',
      password_hash: citizenHash,
      role: 'citizen',
      locality: 'Ward 12 - South Lake Colony',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'usr_c02_ananya',
      name: 'Ananya Sharma',
      email: 'ananya.s@citizen.gov',
      mobile: '+91 98220 12345',
      username: 'ananya_s',
      password_hash: citizenHash,
      role: 'citizen',
      locality: 'Ward 04 - Metro Central',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    // Level 1: Municipal Staff
    {
      id: 'usr_auth_01',
      name: 'Suresh Gaikwad',
      email: 'suresh.staff@metrocorp.gov',
      mobile: '+91 98331 10001',
      username: 'staff_suresh',
      password_hash: staffHash,
      role: 'authority',
      authority_role: 'Municipal Staff',
      authority_level: 1,
      department: 'Rapid Drain Jetting Squad',
      ward: 'Ward 12 - South Lake',
      zone: 'South Zone',
      locality: 'Ward 12 Drainage Depot',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    // Level 2: Ward Officer
    {
      id: 'usr_a01_sharma',
      name: 'Engr. A. K. Verma',
      email: 'officer.verma@metrocorp.gov',
      mobile: '+91 98111 22334',
      username: 'officer_verma',
      password_hash: wardOfficerHash,
      role: 'authority',
      authority_role: 'Ward Officer',
      authority_level: 2,
      department: 'Stormwater Drainage & Flood Management Wing',
      ward: 'Ward 12 - South Lake',
      zone: 'South Zone',
      locality: 'Ward 12 Municipal Office',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    // Level 3: Zonal Officer
    {
      id: 'usr_auth_03',
      name: 'Dr. Ramesh Patil',
      email: 'zonal.patil@metrocorp.gov',
      mobile: '+91 98222 33445',
      username: 'zonal_patil',
      password_hash: zonalHash,
      role: 'authority',
      authority_role: 'Zonal Officer',
      authority_level: 3,
      department: 'Zonal Flood Control & Civil Infrastructure',
      ward: 'All South Zone Wards (Wards 08-14)',
      zone: 'South Zone',
      locality: 'South Zonal Command Center',
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    },
    // Level 4: Higher Authority
    {
      id: 'usr_auth_04',
      name: 'Commissioner M. Deshmukh',
      email: 'commissioner@metrocorp.gov',
      mobile: '+91 98100 99887',
      username: 'comm_deshmukh',
      password_hash: higherHash,
      role: 'authority',
      authority_role: 'Higher Authority',
      authority_level: 4,
      department: 'Executive Disaster Management & Municipal Governance',
      ward: 'Metropolitan City-Wide',
      zone: 'All Metropolitan Zones',
      locality: 'Metro Corporation Secretariat',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    // Super Admin
    {
      id: 'usr_auth_05',
      name: 'Central Control Admin',
      email: 'superadmin@metrocorp.gov',
      mobile: '+91 98000 11223',
      username: 'admin_super',
      password_hash: superHash,
      role: 'authority',
      authority_role: 'Super Admin',
      authority_level: 5,
      department: 'Information & Municipal E-Governance Command',
      ward: 'All Wards',
      zone: 'Metropolitan Headquarters',
      locality: 'Central Municipal Headquarters',
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
  ];

  const initialAuthorities: Authority[] = [
    {
      id: 'auth_01',
      user_id: 'usr_auth_01',
      name: 'Suresh Gaikwad',
      role: 'Municipal Staff',
      department: 'Rapid Drain Jetting Squad',
      ward: 'Ward 12 - South Lake',
      zone: 'South Zone',
      authority_level: 1,
      mobile: '+91 98331 10001',
      email: 'suresh.staff@metrocorp.gov',
    },
    {
      id: 'auth_02',
      user_id: 'usr_a01_sharma',
      name: 'Engr. A. K. Verma',
      role: 'Ward Officer',
      department: 'Stormwater Drainage & Flood Management Wing',
      ward: 'Ward 12 - South Lake',
      zone: 'South Zone',
      authority_level: 2,
      mobile: '+91 98111 22334',
      email: 'officer.verma@metrocorp.gov',
    },
    {
      id: 'auth_03',
      user_id: 'usr_auth_03',
      name: 'Dr. Ramesh Patil',
      role: 'Zonal Officer',
      department: 'Zonal Flood Control & Civil Infrastructure',
      ward: 'Wards 08-14',
      zone: 'South Zone',
      authority_level: 3,
      mobile: '+91 98222 33445',
      email: 'zonal.patil@metrocorp.gov',
    },
    {
      id: 'auth_04',
      user_id: 'usr_auth_04',
      name: 'Commissioner M. Deshmukh',
      role: 'Higher Authority',
      department: 'Executive Disaster Management & Municipal Governance',
      ward: 'Metropolitan City-Wide',
      zone: 'All Zones',
      authority_level: 4,
      mobile: '+91 98100 99887',
      email: 'commissioner@metrocorp.gov',
    },
    {
      id: 'auth_05',
      user_id: 'usr_auth_05',
      name: 'Central Control Admin',
      role: 'Super Admin',
      department: 'Municipal E-Governance Command',
      ward: 'All Wards',
      zone: 'Central Command',
      authority_level: 5,
      mobile: '+91 98000 11223',
      email: 'superadmin@metrocorp.gov',
    },
  ];

  const initialComplaints: Complaint[] = [
    {
      complaint_id: 'WL-2026-000101',
      user_id: 'usr_c01_rahul',
      user_name: 'Rahul Patel',
      user_mobile: '+91 98765 43210',
      user_email: 'rahul.patel@citizen.gov',
      problem_type: 'Waterlogging',
      description: 'Severe knee-deep water accumulation on Main Street near Metro Pillar 142. Cars and two-wheelers are getting stuck since morning rains.',
      latitude: 28.6139,
      longitude: 77.2090,
      address: 'Main Street opposite South Lake Market, Pillar 142, Ward 12',
      citizen_image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      voice_recording: '',
      status: 'Pending',
      priority: 'High',
      municipality: 'Greater Metropolitan Municipal Corporation',
      ward: 'Ward 12 - South Lake',
      department: 'Stormwater Drainage & Flood Management Wing',
      assigned_staff: 'Rapid Response Team B',
      assigned_staff_id: 'auth_01',
      assigned_department: 'Rapid Drain Jetting Squad',
      assigned_ward: 'Ward 12 - South Lake',
      assigned_date: new Date(Date.now() - 1 * 3600000).toISOString(),
      assigned_by: 'Engr. A. K. Verma (Ward Officer)',
      authority_level: 1,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      complaint_id: 'WL-2026-000098',
      user_id: 'usr_c01_rahul',
      user_name: 'Rahul Patel',
      user_mobile: '+91 98765 43210',
      user_email: 'rahul.patel@citizen.gov',
      problem_type: 'Drainage Blockage',
      description: 'Plastic waste and construction debris choking the stormwater inlet near Community Hall. Foul smell and sluggish drainage.',
      latitude: 28.6180,
      longitude: 77.2150,
      address: 'Plot 45, Community Center Cross Road, Ward 12',
      citizen_image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
      voice_recording: '',
      status: 'In Progress',
      priority: 'Medium',
      municipality: 'Greater Metropolitan Municipal Corporation',
      ward: 'Ward 12 - South Lake',
      department: 'Sewerage & Subsurface Pipeline Division',
      assigned_staff: 'Suresh Gaikwad',
      assigned_staff_id: 'auth_01',
      assigned_department: 'Rapid Drain Jetting Squad',
      assigned_ward: 'Ward 12 - South Lake',
      assigned_date: new Date(Date.now() - 20 * 3600000).toISOString(),
      assigned_by: 'Engr. A. K. Verma (Ward Officer)',
      authority_level: 1,
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      complaint_id: 'WL-2026-000091',
      user_id: 'usr_c01_rahul',
      user_name: 'Rahul Patel',
      user_mobile: '+91 98765 43210',
      user_email: 'rahul.patel@citizen.gov',
      problem_type: 'Open/Blocked Drain',
      description: 'Concrete drain cover broken on pedestrian walkway. Risk of pedestrians falling in during cloudy evenings.',
      latitude: 28.6210,
      longitude: 77.2185,
      address: 'Near Government High School Gate 2, Ward 12',
      citizen_image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
      voice_recording: '',
      status: 'Completed',
      priority: 'Medium',
      municipality: 'Greater Metropolitan Municipal Corporation',
      ward: 'Ward 12 - South Lake',
      department: 'Civil Infrastructure & Road Repair',
      assigned_staff: 'Suresh Gaikwad',
      assigned_staff_id: 'auth_01',
      assigned_department: 'Civil Infrastructure & Road Repair',
      assigned_ward: 'Ward 12 - South Lake',
      assigned_date: new Date(Date.now() - 48 * 3600000).toISOString(),
      assigned_by: 'Engr. A. K. Verma',
      authority_level: 2,
      resolution_notes: 'New reinforced heavy-duty concrete cover fitted. Inlet desilted and water flowing smoothly.',
      resolution_action_taken: 'Blocked drainage was cleared, silt suction performed, and heavy-duty precast cover installed.',
      resolution_image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      resolution_completed_by: 'Suresh Gaikwad (Municipal Staff)',
      resolved_at: new Date(Date.now() - 12 * 3600000).toISOString(),
      citizen_rating: 5,
      citizen_feedback: 'Waterlogging was resolved satisfactorily! The blocked drainage was cleared within hours.',
      feedback_submitted_at: new Date(Date.now() - 10 * 3600000).toISOString(),
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      complaint_id: 'WL-2026-000084',
      user_id: 'usr_c01_rahul',
      user_name: 'Rahul Patel',
      user_mobile: '+91 98765 43210',
      user_email: 'rahul.patel@citizen.gov',
      problem_type: 'Road Flooding',
      description: 'Underpass flooded by 4 feet of rain runoff. Traffic diverted. Pump station appears non-operational.',
      latitude: 28.6095,
      longitude: 77.2010,
      address: 'Railway Underbridge 4, South Link Express Corridor',
      citizen_image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      voice_recording: '',
      status: 'Escalated',
      priority: 'Critical',
      municipality: 'Greater Metropolitan Municipal Corporation',
      ward: 'Ward 08 - Railway Corridor',
      department: 'Disaster Management & Emergency Pumping',
      assigned_staff: 'Dr. Ramesh Patil (Zonal Officer)',
      assigned_staff_id: 'auth_03',
      assigned_department: 'Disaster Management & Emergency Pumping',
      assigned_ward: 'Ward 08 - Railway Corridor',
      assigned_date: new Date(Date.now() - 18 * 3600000).toISOString(),
      assigned_by: 'Engr. A. K. Verma (Ward Officer)',
      authority_level: 3,
      escalation_reason: 'Underpass water level crossed safety threshold (>3.5ft). Field staff pump equipment insufficient.',
      created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      complaint_id: 'WL-2026-000078',
      user_id: 'usr_c02_ananya',
      user_name: 'Ananya Sharma',
      user_mobile: '+91 98220 12345',
      user_email: 'ananya.s@citizen.gov',
      problem_type: 'Garbage Blocking Drain',
      description: 'Massive pile of discarded market crates and plastic sacks choking stormwater grates on Station Road.',
      latitude: 28.6289,
      longitude: 77.2180,
      address: 'Commercial Circle Gate 3, Ward 04 - Metro Central',
      citizen_image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80',
      voice_recording: '',
      status: 'Not Completed',
      priority: 'High',
      municipality: 'Greater Metropolitan Municipal Corporation',
      ward: 'Ward 04 - Metro Central',
      department: 'Solid Waste & Sanitation Division',
      assigned_staff: 'Station Road Flying Squad',
      assigned_staff_id: 'auth_01',
      assigned_department: 'Solid Waste & Sanitation Division',
      assigned_ward: 'Ward 04 - Metro Central',
      assigned_date: new Date(Date.now() - 15 * 3600000).toISOString(),
      assigned_by: 'Inspector R. S. Negi',
      authority_level: 1,
      resolution_notes: 'Heavy machinery required to clear submerged concrete debris. Manual labor insufficient.',
      created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ];

  const initialHistory: StatusHistory[] = [
    {
      id: 'hist_01',
      complaint_id: 'WL-2026-000101',
      old_status: 'None',
      new_status: 'Pending',
      changed_by: 'Citizen Portal (QR Scan Ward-12)',
      notes: 'Complaint logged with high priority waterlogging notification.',
      action_type: 'status_change',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'hist_02',
      complaint_id: 'WL-2026-000098',
      old_status: 'Pending',
      new_status: 'In Progress',
      changed_by: 'Engr. A. K. Verma (Ward Officer)',
      notes: 'Assigned to Suresh Gaikwad. Jetting machine crew dispatched.',
      action_type: 'assignment',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: 'hist_03',
      complaint_id: 'WL-2026-000091',
      old_status: 'In Progress',
      new_status: 'Completed',
      changed_by: 'Suresh Gaikwad (Municipal Staff)',
      notes: 'Heavy duty concrete slab installed. Photo proof submitted.',
      action_type: 'status_change',
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
    {
      id: 'hist_04',
      complaint_id: 'WL-2026-000084',
      old_status: 'In Progress',
      new_status: 'Escalated',
      changed_by: 'Engr. A. K. Verma (Ward Officer)',
      notes: 'Escalated to Level 3 (Zonal Officer) due to excessive flood depth.',
      action_type: 'escalation',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'hist_05',
      complaint_id: 'WL-2026-000078',
      old_status: 'In Progress',
      new_status: 'Not Completed',
      changed_by: 'Suresh Gaikwad (Municipal Staff)',
      notes: 'Work paused: Requires JCB excavator to dislodge sunken concrete chunks.',
      action_type: 'status_change',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ];

  const initialEscalations: Escalation[] = [
    {
      id: 'esc_01',
      complaint_id: 'WL-2026-000084',
      from_level: 2,
      to_level: 3,
      from_role: 'Ward Officer',
      to_role: 'Zonal Officer',
      reason: 'Critical water depth exceeding 4ft in railway underpass',
      notes: 'Municipal Ward submersible pumps overwhelmed. Requesting high-capacity diesel centrifugal pumps from Zonal Depot.',
      escalated_by: 'Engr. A. K. Verma',
      escalated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
  ];

  const initialNotifications: Notification[] = [
    {
      id: 'notif_01',
      user_id: 'usr_c01_rahul',
      complaint_id: 'WL-2026-000101',
      message: 'Your complaint WL-2026-000101 has been registered and forwarded to Ward 12 Control Room.',
      type: 'status',
      read_status: false,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'notif_02',
      user_id: 'usr_c01_rahul',
      complaint_id: 'WL-2026-000098',
      message: 'Staff Suresh Gaikwad has been assigned to your complaint WL-2026-000098 (Status: In Progress).',
      type: 'assignment',
      read_status: false,
      created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
    {
      id: 'notif_03',
      user_id: 'usr_c01_rahul',
      complaint_id: 'WL-2026-000084',
      message: 'Your complaint WL-2026-000084 has been escalated to Level 3 (Zonal Officer) for emergency pumping.',
      type: 'escalation',
      read_status: true,
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: 'notif_04',
      user_id: 'authority',
      complaint_id: 'WL-2026-000101',
      message: 'New high priority complaint WL-2026-000101 logged in Ward 12 (Waterlogging on Main St).',
      type: 'alert',
      read_status: false,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
  ];

  return {
    users: initialUsers,
    authorities: initialAuthorities,
    complaints: initialComplaints,
    status_history: initialHistory,
    escalations: initialEscalations,
    notifications: initialNotifications,
    complaint_counter: 103,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure all collections exist in case of previous schema version
        if (
          parsed.users &&
          parsed.complaints &&
          Array.isArray(parsed.authorities) &&
          Array.isArray(parsed.escalations) &&
          Array.isArray(parsed.notifications)
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load database.json, initializing fresh schema:', e);
    }
    const fresh = getInitialDatabase();
    this.saveData(fresh);
    return fresh;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database.json:', e);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- Users ---
  getUsers(): User[] {
    return this.data.users;
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  findUserByUsernameOrEmail(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
  }

  createUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const newUser: User = {
      ...userData,
      id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      created_at: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  // --- Authorities ---
  getAuthorities(): Authority[] {
    return this.data.authorities;
  }

  findAuthorityById(id: string): Authority | undefined {
    return this.data.authorities.find((a) => a.id === id);
  }

  findAuthorityByUserId(userId: string): Authority | undefined {
    return this.data.authorities.find((a) => a.user_id === userId);
  }

  // --- Complaints ---
  getComplaints(userId?: string): Complaint[] {
    if (userId) {
      return this.data.complaints
        .filter((c) => c.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.data.complaints].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  findComplaintById(id: string): Complaint | undefined {
    return this.data.complaints.find((c) => c.complaint_id === id);
  }

  generateNextComplaintId(): string {
    const year = new Date().getFullYear();
    const count = this.data.complaint_counter++;
    this.persist();
    const padded = String(count).padStart(6, '0');
    return `WL-${year}-${padded}`;
  }

  createComplaint(data: Omit<Complaint, 'complaint_id' | 'created_at' | 'updated_at'>): Complaint {
    const complaint_id = this.generateNextComplaintId();
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      ...data,
      complaint_id,
      authority_level: data.authority_level || 1,
      created_at: now,
      updated_at: now,
    };

    this.data.complaints.unshift(newComplaint);

    // Initial Status History
    this.addStatusHistory({
      complaint_id,
      old_status: 'None',
      new_status: newComplaint.status,
      changed_by: `${newComplaint.user_name} (Citizen)`,
      notes: `Complaint logged via Smart Waterlogging Portal. Ward: ${newComplaint.ward || 'General'}`,
      action_type: 'status_change',
    });

    // In-app Notification for citizen
    this.addNotification({
      user_id: newComplaint.user_id,
      complaint_id,
      message: `Your complaint ${complaint_id} (${newComplaint.problem_type}) has been registered and received by the Municipal Control Room.`,
      type: 'status',
    });

    // In-app alert for authority
    this.addNotification({
      user_id: 'authority',
      complaint_id,
      message: `New complaint ${complaint_id} received for ${newComplaint.ward}: ${newComplaint.problem_type} (${newComplaint.priority} Priority).`,
      type: 'alert',
    });

    this.persist();
    return newComplaint;
  }

  // --- Assign Staff ---
  assignComplaint(
    complaintId: string,
    params: {
      staffId: string;
      staffName: string;
      department: string;
      ward: string;
      assignedBy: string;
    }
  ): Complaint | null {
    const complaint = this.findComplaintById(complaintId);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    complaint.assigned_staff = params.staffName;
    complaint.assigned_staff_id = params.staffId;
    complaint.assigned_department = params.department;
    complaint.assigned_ward = params.ward;
    complaint.assigned_by = params.assignedBy;
    complaint.assigned_date = new Date().toISOString();
    complaint.status = 'In Progress'; // Auto advance to In Progress when assigned
    complaint.updated_at = new Date().toISOString();

    // Add Status History
    this.addStatusHistory({
      complaint_id: complaintId,
      old_status: oldStatus,
      new_status: 'In Progress',
      changed_by: params.assignedBy,
      notes: `Assigned to ${params.staffName} (${params.department}). Assigned by ${params.assignedBy}.`,
      action_type: 'assignment',
    });

    // Notify citizen
    this.addNotification({
      user_id: complaint.user_id,
      complaint_id: complaintId,
      message: `Your complaint ${complaintId} has been assigned to staff ${params.staffName} (${params.department}). Status is now 'In Progress'.`,
      type: 'assignment',
    });

    this.persist();
    return complaint;
  }

  // --- Update Status ---
  updateComplaintStatus(
    complaintId: string,
    params: {
      newStatus: Complaint['status'];
      changedBy: string;
      notes: string;
      resolutionImage?: string;
      resolutionActionTaken?: string;
      notCompletedReason?: string;
      notCompletedAction?: string;
      notCompletedImage?: string;
    }
  ): Complaint | null {
    const complaint = this.findComplaintById(complaintId);
    if (!complaint) return null;

    const oldStatus = complaint.status;
    complaint.status = params.newStatus;
    complaint.updated_at = new Date().toISOString();

    if (params.newStatus === 'Completed') {
      complaint.resolution_notes = params.notes;
      complaint.resolution_action_taken =
        params.resolutionActionTaken ||
        params.notes ||
        'Blocked drainage was cleared and accumulated water was removed.';
      if (params.resolutionImage) complaint.resolution_image = params.resolutionImage;
      complaint.resolution_completed_by = params.changedBy;
      complaint.resolved_at = new Date().toISOString();
    } else if (params.newStatus === 'Not Completed') {
      complaint.not_completed_reason = params.notCompletedReason || params.notes || 'Major drainage repair required';
      complaint.not_completed_notes = params.notes;
      complaint.not_completed_action = params.notCompletedAction || 'Escalation to Zonal/Higher Authority recommended';
      if (params.notCompletedImage) complaint.not_completed_image = params.notCompletedImage;
      complaint.resolution_notes = params.notes;
    }

    this.addStatusHistory({
      complaint_id: complaintId,
      old_status: oldStatus,
      new_status: params.newStatus,
      changed_by: params.changedBy,
      notes:
        params.newStatus === 'Completed'
          ? `[Work Completed]: ${complaint.resolution_action_taken}`
          : params.newStatus === 'Not Completed'
          ? `[Not Completed]: ${complaint.not_completed_reason}. Notes: ${params.notes}`
          : params.notes,
      action_type: 'status_change',
    });

    // Notify citizen with actionable links
    if (params.newStatus === 'Completed') {
      this.addNotification({
        user_id: complaint.user_id,
        complaint_id: complaintId,
        message: `Your waterlogging complaint ${complaintId} has been resolved.`,
        type: 'resolution',
        action_type: 'view_resolution',
        action_label: 'View Resolution',
      });
    } else if (params.newStatus === 'Not Completed') {
      this.addNotification({
        user_id: complaint.user_id,
        complaint_id: complaintId,
        message: `Status: Not Completed for complaint ${complaintId}. Reason: "${complaint.not_completed_reason}"`,
        type: 'not_completed',
        action_type: 'track_complaint',
        action_label: 'Track Complaint',
      });
    } else {
      this.addNotification({
        user_id: complaint.user_id,
        complaint_id: complaintId,
        message: `Your complaint ${complaintId} status changed from ${oldStatus} to ${params.newStatus}.`,
        type: 'status',
        action_type: 'track_complaint',
        action_label: 'Track Complaint',
      });
    }

    this.persist();
    return complaint;
  }

  // --- Add Citizen Feedback & Rating ---
  addComplaintFeedback(
    complaintId: string,
    params: {
      rating: number;
      feedback: string;
    }
  ): Complaint | null {
    const complaint = this.findComplaintById(complaintId);
    if (!complaint) return null;

    complaint.citizen_rating = params.rating;
    complaint.citizen_feedback = params.feedback;
    complaint.feedback_submitted_at = new Date().toISOString();
    complaint.updated_at = new Date().toISOString();

    this.addStatusHistory({
      complaint_id: complaintId,
      old_status: complaint.status,
      new_status: complaint.status,
      changed_by: `${complaint.user_name} (Citizen)`,
      notes: `Citizen Rating Submitted: ${params.rating} / 5 Stars — "${params.feedback}"`,
      action_type: 'status_change',
    });

    // Alert municipal control room of citizen satisfaction rating
    this.addNotification({
      user_id: 'authority',
      complaint_id: complaintId,
      message: `Citizen Rating received for ${complaintId}: ${params.rating}★ by ${complaint.user_name}`,
      type: 'alert',
      action_type: 'track_complaint',
      action_label: 'View Grievance',
    });

    this.persist();
    return complaint;
  }

  // --- Escalate Complaint ---
  escalateComplaint(
    complaintId: string,
    params: {
      reason: string;
      notes: string;
      escalatedBy: string;
      targetLevel?: number;
    }
  ): { complaint: Complaint; escalation: Escalation } | null {
    const complaint = this.findComplaintById(complaintId);
    if (!complaint) return null;

    const currentLevel = complaint.authority_level || 1;
    const nextLevel = params.targetLevel || Math.min(currentLevel + 1, 4);

    const levelRoleNames: Record<number, string> = {
      1: 'Municipal Staff',
      2: 'Ward Officer',
      3: 'Zonal Officer',
      4: 'Higher Municipal Authority',
    };

    const fromRole = levelRoleNames[currentLevel] || 'Municipal Staff';
    const toRole = levelRoleNames[nextLevel] || 'Higher Authority';

    const oldStatus = complaint.status;
    complaint.status = 'Escalated';
    complaint.authority_level = nextLevel;
    complaint.escalation_reason = params.reason;
    complaint.priority = 'Critical'; // Escalated issues become Critical priority
    complaint.updated_at = new Date().toISOString();

    const escalation: Escalation = {
      id: 'esc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      complaint_id: complaintId,
      from_level: currentLevel,
      to_level: nextLevel,
      from_role: fromRole,
      to_role: toRole,
      reason: params.reason,
      notes: params.notes,
      escalated_by: params.escalatedBy,
      escalated_at: new Date().toISOString(),
    };

    this.data.escalations.unshift(escalation);

    // Status History
    this.addStatusHistory({
      complaint_id: complaintId,
      old_status: oldStatus,
      new_status: 'Escalated',
      changed_by: params.escalatedBy,
      notes: `Escalated from Level ${currentLevel} (${fromRole}) to Level ${nextLevel} (${toRole}). Reason: ${params.reason}. Notes: ${params.notes}`,
      action_type: 'escalation',
    });

    // Notify citizen
    this.addNotification({
      user_id: complaint.user_id,
      complaint_id: complaintId,
      message: `Your complaint ${complaintId} has been escalated to Level ${nextLevel} (${toRole}). Reason: ${params.reason}`,
      type: 'escalation',
    });

    // Notify authority
    this.addNotification({
      user_id: 'authority',
      complaint_id: complaintId,
      message: `Urgent Escalation: ${complaintId} elevated to Level ${nextLevel} (${toRole}) by ${params.escalatedBy}.`,
      type: 'alert',
    });

    this.persist();
    return { complaint, escalation };
  }

  // --- Update Priority ---
  updatePriority(
    complaintId: string,
    newPriority: Complaint['priority'],
    changedBy: string
  ): Complaint | null {
    const complaint = this.findComplaintById(complaintId);
    if (!complaint) return null;

    const oldPriority = complaint.priority;
    complaint.priority = newPriority;
    complaint.updated_at = new Date().toISOString();

    this.addStatusHistory({
      complaint_id: complaintId,
      old_status: complaint.status,
      new_status: complaint.status,
      changed_by: changedBy,
      notes: `Priority changed from ${oldPriority} to ${newPriority}.`,
      action_type: 'priority_change',
    });

    this.persist();
    return complaint;
  }

  // --- Status History ---
  getStatusHistory(complaintId: string): StatusHistory[] {
    return this.data.status_history
      .filter((h) => h.complaint_id === complaintId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addStatusHistory(record: Omit<StatusHistory, 'id' | 'timestamp'>): StatusHistory {
    const historyItem: StatusHistory = {
      ...record,
      id: 'hist_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
    };
    this.data.status_history.push(historyItem);
    this.persist();
    return historyItem;
  }

  // --- Escalations ---
  getEscalations(complaintId?: string): Escalation[] {
    if (complaintId) {
      return this.data.escalations.filter((e) => e.complaint_id === complaintId);
    }
    return this.data.escalations;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter((n) => n.user_id === userId || (userId.startsWith('usr_auth') && n.user_id === 'authority'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addNotification(notif: Omit<Notification, 'id' | 'read_status' | 'created_at'>): Notification {
    const item: Notification = {
      ...notif,
      id: 'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      read_status: false,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(item);
    this.persist();
    return item;
  }

  markNotificationAsRead(id: string): boolean {
    const item = this.data.notifications.find((n) => n.id === id);
    if (item) {
      item.read_status = true;
      this.persist();
      return true;
    }
    return false;
  }

  // --- Stats ---
  getStats(userId?: string) {
    const complaints = userId
      ? this.data.complaints.filter((c) => c.user_id === userId)
      : this.data.complaints;

    const oneDayAgo = Date.now() - 24 * 3600000;
    const newCount = complaints.filter(
      (c) => new Date(c.created_at).getTime() > oneDayAgo && c.status === 'Pending'
    ).length;

    return {
      total: complaints.length,
      new_complaints: newCount,
      pending: complaints.filter((c) => c.status === 'Pending').length,
      in_progress: complaints.filter((c) => c.status === 'In Progress').length,
      completed: complaints.filter((c) => c.status === 'Completed').length,
      not_completed: complaints.filter((c) => c.status === 'Not Completed').length,
      escalated: complaints.filter((c) => c.status === 'Escalated').length,
    };
  }

  // --- Extended Analytics ---
  getAnalyticsExtended() {
    const complaints = this.data.complaints;
    const stats = this.getStats();

    // 1. Hotspots calculation
    const wardMap: Record<
      string,
      {
        ward: string;
        count: number;
        unresolved: number;
        criticalCount: number;
        lat: number;
        lng: number;
        topProblem: string;
      }
    > = {};

    complaints.forEach((c) => {
      const w = c.ward || 'General Zone';
      if (!wardMap[w]) {
        wardMap[w] = {
          ward: w,
          count: 0,
          unresolved: 0,
          criticalCount: 0,
          lat: c.latitude || 28.6139,
          lng: c.longitude || 77.2090,
          topProblem: c.problem_type,
        };
      }
      wardMap[w].count += 1;
      if (c.status !== 'Completed') wardMap[w].unresolved += 1;
      if (c.priority === 'Critical' || c.priority === 'High') wardMap[w].criticalCount += 1;
    });

    const hotspots = Object.values(wardMap)
      .map((item) => {
        const riskLevel: 'Severe' | 'High' | 'Moderate' =
          item.count >= 3 || item.criticalCount >= 2
            ? 'Severe'
            : item.count >= 2
            ? 'High'
            : 'Moderate';
        return {
          ...item,
          riskLevel,
        };
      })
      .sort((a, b) => b.count - a.count);

    // 2. Timeline trends (last 7 days)
    const trends: { date: string; label: string; count: number; completed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayKey = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      const dayComplaints = complaints.filter((c) => c.created_at.slice(0, 10) === dayKey);
      const dayCompleted = dayComplaints.filter((c) => c.status === 'Completed').length;
      trends.push({
        date: dayKey,
        label: dayLabel,
        count: dayComplaints.length,
        completed: dayCompleted,
      });
    }

    // 3. Completed vs unresolved & Resolution turnaround
    const completedCount = stats.completed;
    const unresolvedCount = stats.total - stats.completed;
    const resolutionRate = stats.total > 0 ? Math.round((completedCount / stats.total) * 100) : 0;

    // Average resolution time in hours
    const completedWithTimestamps = complaints.filter(
      (c) => c.status === 'Completed' && c.resolved_at && c.created_at
    );
    let avgResolutionHours = 3.8;
    if (completedWithTimestamps.length > 0) {
      const totalHours = completedWithTimestamps.reduce((acc, c) => {
        const diff = Math.max(
          1,
          new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()
        );
        return acc + diff / 3600000;
      }, 0);
      avgResolutionHours = Number((totalHours / completedWithTimestamps.length).toFixed(1));
    }

    // Average citizen satisfaction rating
    const ratedComplaints = complaints.filter(
      (c) => typeof c.citizen_rating === 'number' && c.citizen_rating > 0
    );
    let avgRating = 4.9;
    if (ratedComplaints.length > 0) {
      const totalStars = ratedComplaints.reduce((acc, c) => acc + (c.citizen_rating || 5), 0);
      avgRating = Number((totalStars / ratedComplaints.length).toFixed(1));
    }

    return {
      stats,
      hotspots,
      trends,
      resolutionRate,
      avgResolutionHours,
      avgRating,
      completedCount,
      unresolvedCount,
      escalatedCount: stats.escalated,
    };
  }
}

export const db = new Database();
