import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, User, Complaint } from './server/db';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'smart-waterlog-secret-key-2026';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Initialize Gemini client if API key is present
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({});
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI client:', err);
  }
}

const app = express();
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Auth Token Helper
function generateToken(user: User) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: user.username,
      locality: user.locality,
      authority_role: user.authority_role,
      authority_level: user.authority_level,
      department: user.department,
      ward: user.ward,
      zone: user.zone,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      res.status(403).json({ error: 'Session expired or invalid token.' });
      return;
    }
    (req as any).user = decodedUser;
    next();
  });
}

// RBAC Middleware: Require Municipal Authority
function requireAuthority(req: Request, res: Response, next: () => void) {
  const user = (req as any).user;
  if (!user || user.role !== 'authority') {
    res.status(403).json({
      error: 'Access denied. Municipal Authority credentials required to access this resource.',
    });
    return;
  }
  next();
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// 1. Unified Login (Citizen or Authority)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Please enter username/email and password.' });
    return;
  }

  const user = db.findUserByUsernameOrEmail(identifier);
  if (!user) {
    res.status(401).json({ error: 'Invalid username/email or password.' });
    return;
  }

  // Check role if specified
  if (role && user.role !== role) {
    res.status(403).json({
      error: `This account is registered as ${user.role}. Please select the ${
        user.role === 'authority' ? 'Authority' : 'Citizen'
      } login tab.`,
    });
    return;
  }

  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) {
    res.status(401).json({ error: 'Invalid username/email or password.' });
    return;
  }

  const token = generateToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      role: user.role,
      locality: user.locality,
      authority_role: user.authority_role,
      authority_level: user.authority_level,
      department: user.department,
      ward: user.ward,
      zone: user.zone,
      created_at: user.created_at,
    },
  });
});

// 2. Citizen Registration
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, mobile, email, username, password, confirmPassword, locality } = req.body;

  if (!name || !mobile || !email || !username || !password || !confirmPassword || !locality) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const existing = db.findUserByUsernameOrEmail(username);
  if (existing) {
    res.status(409).json({ error: 'Username or email is already registered.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const newUser = db.createUser({
    name: name.trim(),
    mobile: mobile.trim(),
    email: email.trim().toLowerCase(),
    username: username.trim().toLowerCase(),
    password_hash,
    role: 'citizen',
    locality: locality.trim(),
  });

  const token = generateToken(newUser);
  res.status(201).json({
    message: 'Citizen registered successfully',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      username: newUser.username,
      role: newUser.role,
      locality: newUser.locality,
      created_at: newUser.created_at,
    },
  });
});

// 3. Current User Verification
app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = db.findUserById((req as any).user.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    username: user.username,
    role: user.role,
    locality: user.locality,
    authority_role: user.authority_role,
    authority_level: user.authority_level,
    department: user.department,
    ward: user.ward,
    zone: user.zone,
    created_at: user.created_at,
  });
});

// ==========================================
// COMPLAINT ENDPOINTS (CITIZEN & PUBLIC)
// ==========================================

// Get Complaints (Citizen sees their own, Authority sees all)
app.get('/api/complaints', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const isCitizen = user.role === 'citizen';
  const complaints = db.getComplaints(isCitizen ? user.id : undefined);
  res.json({ complaints });
});

// Get Single Complaint & Status History
app.get('/api/complaints/:id', (req: Request, res: Response) => {
  const complaint = db.findComplaintById(req.params.id);
  if (!complaint) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }
  const history = db.getStatusHistory(complaint.complaint_id);
  const escalations = db.getEscalations(complaint.complaint_id);
  res.json({ complaint, history, escalations });
});

// Citizen Submit Complaint
app.post('/api/complaints', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    problem_type,
    description,
    latitude,
    longitude,
    address,
    citizen_image,
    voice_recording,
    ward,
    priority,
  } = req.body;

  if (!problem_type) {
    res.status(400).json({ error: 'Problem type is required.' });
    return;
  }

  if (!description || description.trim().length === 0) {
    res.status(400).json({ error: 'Description is required.' });
    return;
  }

  let department = 'Stormwater Drainage & Flood Management Wing';
  if (problem_type === 'Drainage Blockage' || problem_type === 'Garbage Blocking Drain') {
    department = 'Sewerage & Solid Waste Desilting Wing';
  } else if (problem_type === 'Open/Blocked Drain') {
    department = 'Civil Infrastructure & Road Safety Division';
  } else if (problem_type === 'Road Flooding' || problem_type === 'Waterlogging') {
    department = 'Emergency Dewatering & Rapid Flood Response Unit';
  }

  const assignedStaff = 'Pending Staff Assignment';

  const newComplaint = db.createComplaint({
    user_id: user.id,
    user_name: user.name,
    user_mobile: user.mobile || '+91 98765 00000',
    user_email: user.email,
    problem_type,
    description: description.trim(),
    latitude: Number(latitude) || 28.6139,
    longitude: Number(longitude) || 77.2090,
    address: address || 'South Lake Colony, Ward 12',
    citizen_image: citizen_image || '',
    voice_recording: voice_recording || '',
    status: 'Pending',
    priority: priority || (problem_type === 'Road Flooding' ? 'High' : 'Medium'),
    municipality: 'Greater Metropolitan Municipal Corporation',
    ward: ward || user.locality || 'Ward 12 - South Lake',
    department,
    assigned_staff: assignedStaff,
    authority_level: 1,
  });

  res.status(201).json({
    message: 'Complaint submitted successfully',
    complaint: newComplaint,
  });
});

// Citizen Submit Resolution Feedback & Rating
app.post('/api/complaints/:id/feedback', authenticateToken, (req: Request, res: Response) => {
  const { rating, feedback } = req.body;
  const ratingNum = Number(rating);

  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    return;
  }

  const updated = db.addComplaintFeedback(req.params.id, {
    rating: ratingNum,
    feedback: feedback ? String(feedback).trim() : 'Waterlogging problem was resolved satisfactorily.',
  });

  if (!updated) {
    res.status(404).json({ error: 'Complaint not found.' });
    return;
  }

  res.json({
    message: 'Thank you! Your resolution verification and feedback have been officially recorded.',
    complaint: updated,
  });
});

// ==========================================
// MUNICIPAL AUTHORITY & ADMIN ENDPOINTS
// ==========================================

// List Available Municipal Staff & Authorities
app.get('/api/authorities', authenticateToken, requireAuthority, (_req: Request, res: Response) => {
  const authorities = db.getAuthorities();
  res.json({ authorities });
});

// Admin Filtered Complaints Table Search
app.get('/api/admin/complaints', authenticateToken, requireAuthority, (req: Request, res: Response) => {
  const {
    status,
    ward,
    problem_type,
    priority,
    staff,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query as Record<string, string>;

  let complaints = db.getComplaints();

  // Filters
  if (status && status !== 'All') {
    complaints = complaints.filter((c) => c.status === status);
  }
  if (ward && ward !== 'All') {
    complaints = complaints.filter((c) => c.ward.toLowerCase().includes(ward.toLowerCase()));
  }
  if (problem_type && problem_type !== 'All') {
    complaints = complaints.filter((c) => c.problem_type === problem_type);
  }
  if (priority && priority !== 'All') {
    complaints = complaints.filter((c) => c.priority === priority);
  }
  if (staff && staff !== 'All') {
    complaints = complaints.filter((c) => c.assigned_staff.toLowerCase().includes(staff.toLowerCase()));
  }

  // Free text search by ID, Citizen, Location/Address
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    complaints = complaints.filter(
      (c) =>
        c.complaint_id.toLowerCase().includes(q) ||
        c.user_name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  // Sorting
  const priorityWeight: Record<string, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  complaints.sort((a, b) => {
    if (sortBy === 'priority') {
      const wA = priorityWeight[a.priority] || 0;
      const wB = priorityWeight[b.priority] || 0;
      return sortOrder === 'asc' ? wA - wB : wB - wA;
    }
    if (sortBy === 'status') {
      return sortOrder === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    // Default by date
    const tA = new Date(a.created_at).getTime();
    const tB = new Date(b.created_at).getTime();
    return sortOrder === 'asc' ? tA - tB : tB - tA;
  });

  res.json({ complaints, total: complaints.length });
});

// Admin Assign Complaint to Staff Member
app.post(
  '/api/admin/complaints/:id/assign',
  authenticateToken,
  requireAuthority,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const { staffId, staffName, department, ward } = req.body;

    if (!staffName) {
      res.status(400).json({ error: 'Please select a staff member to assign.' });
      return;
    }

    const updated = db.assignComplaint(req.params.id, {
      staffId: staffId || 'staff_custom',
      staffName,
      department: department || 'Stormwater Drainage Rapid Team',
      ward: ward || 'Ward 12 - South Lake',
      assignedBy: `${user.name} (${user.authority_role || 'Authority'})`,
    });

    if (!updated) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    res.json({
      message: `Complaint ${req.params.id} successfully assigned to ${staffName}`,
      complaint: updated,
    });
  }
);

// Admin Update Status (Pending, In Progress, Completed, Not Completed, Escalated)
app.post(
  '/api/admin/complaints/:id/status',
  authenticateToken,
  requireAuthority,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const {
      status,
      notes,
      resolutionImage,
      resolutionActionTaken,
      notCompletedReason,
      notCompletedAction,
      notCompletedImage,
    } = req.body;

    if (!status) {
      res.status(400).json({ error: 'New status is required.' });
      return;
    }

    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Not Completed', 'Escalated'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of ${validStatuses.join(', ')}` });
      return;
    }

    // Strict validation for Completed: requires Action Taken and Resolution Photo
    if (status === 'Completed') {
      if (!resolutionActionTaken || !resolutionActionTaken.trim()) {
        res.status(400).json({
          error: 'Action Taken description is required to mark problem as Completed.',
        });
        return;
      }
      if (!resolutionImage || !resolutionImage.trim()) {
        res.status(400).json({
          error: 'Resolution photograph proof is required to verify completed work.',
        });
        return;
      }
    }

    // Strict validation for Not Completed: requires reason
    if (status === 'Not Completed') {
      if (!notCompletedReason || !notCompletedReason.trim()) {
        res.status(400).json({
          error: 'A reason is required when marking complaint as Not Completed.',
        });
        return;
      }
    }

    const updated = db.updateComplaintStatus(req.params.id, {
      newStatus: status,
      changedBy: `${user.name} (${user.authority_role || 'Authority'})`,
      notes: notes || resolutionActionTaken || `Status updated to ${status} by municipal officer.`,
      resolutionImage,
      resolutionActionTaken,
      notCompletedReason,
      notCompletedAction,
      notCompletedImage,
    });

    if (!updated) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    res.json({
      message: `Status updated to ${status}`,
      complaint: updated,
    });
  }
);

// Admin Escalate Complaint (Level 1 -> 2 -> 3 -> 4)
app.post(
  '/api/admin/complaints/:id/escalate',
  authenticateToken,
  requireAuthority,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const { reason, notes, targetLevel } = req.body;

    if (!reason || reason.trim().length === 0) {
      res.status(400).json({ error: 'Escalation reason is required.' });
      return;
    }

    const result = db.escalateComplaint(req.params.id, {
      reason: reason.trim(),
      notes: notes || 'Complaint requires higher administrative intervention or heavy machinery.',
      escalatedBy: `${user.name} (${user.authority_role || 'Authority'})`,
      targetLevel: targetLevel ? Number(targetLevel) : undefined,
    });

    if (!result) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    res.json({
      message: `Complaint escalated to Level ${result.escalation.to_level} (${result.escalation.to_role})`,
      complaint: result.complaint,
      escalation: result.escalation,
    });
  }
);

// Admin Update Priority (Low, Medium, High, Critical)
app.post(
  '/api/admin/complaints/:id/priority',
  authenticateToken,
  requireAuthority,
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const { priority } = req.body;

    if (!priority || !['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
      res.status(400).json({ error: 'Priority must be Low, Medium, High, or Critical.' });
      return;
    }

    const updated = db.updatePriority(
      req.params.id,
      priority as Complaint['priority'],
      `${user.name} (${user.authority_role || 'Authority'})`
    );

    if (!updated) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    res.json({
      message: `Priority updated to ${priority}`,
      complaint: updated,
    });
  }
);

// Admin Dashboard Analytics & Charts Data
app.get('/api/admin/stats', authenticateToken, requireAuthority, (_req: Request, res: Response) => {
  const analytics = db.getAnalyticsExtended();
  const complaints = db.getComplaints();

  // Category distribution
  const byCategory: Record<string, number> = {};
  // Ward distribution
  const byWard: Record<string, number> = {};
  // Priority distribution
  const byPriority: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  complaints.forEach((c) => {
    byCategory[c.problem_type] = (byCategory[c.problem_type] || 0) + 1;
    byWard[c.ward] = (byWard[c.ward] || 0) + 1;
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
  });

  res.json({
    stats: analytics.stats,
    charts: {
      byCategory,
      byWard,
      byPriority,
    },
    hotspots: analytics.hotspots,
    trends: analytics.trends,
    resolutionRate: analytics.resolutionRate,
    completedCount: analytics.completedCount,
    unresolvedCount: analytics.unresolvedCount,
    escalatedCount: analytics.escalatedCount,
    recentComplaints: complaints.slice(0, 5),
  });
});

// Admin Escalations Audit Log
app.get('/api/admin/escalations', authenticateToken, requireAuthority, (_req: Request, res: Response) => {
  const escalations = db.getEscalations();
  res.json({ escalations });
});

// ==========================================
// NOTIFICATIONS API
// ==========================================
app.get('/api/notifications', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const notifications = db.getNotifications(user.id);
  const unreadCount = notifications.filter((n) => !n.read_status).length;
  res.json({ notifications, unreadCount });
});

app.put('/api/notifications/:id/read', authenticateToken, (req: Request, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id);
  res.json({ success });
});

// Citizen & Common Stats
app.get('/api/stats', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const isCitizen = user.role === 'citizen';
  const stats = db.getStats(isCitizen ? user.id : undefined);
  res.json({ stats });
});

// Wards List
app.get('/api/wards', (_req: Request, res: Response) => {
  const wards = [
    {
      id: 'WARD-12',
      code: 'Ward 12 - South Lake',
      locality: 'South Lake Colony, Metro Sector 14',
      officer: 'Engr. A. K. Verma',
      helpline: '1800-419-3312',
      coordinates: { lat: 28.6139, lng: 77.2090 },
    },
    {
      id: 'WARD-04',
      code: 'Ward 04 - Metro Central',
      locality: 'Old Market & Commercial Circle',
      officer: 'Inspector R. S. Negi',
      helpline: '1800-419-3304',
      coordinates: { lat: 28.6289, lng: 77.2180 },
    },
    {
      id: 'WARD-08',
      code: 'Ward 08 - Railway Corridor',
      locality: 'Cantonment Underpass & Depot Road',
      officer: 'Officer M. K. Singhania',
      helpline: '1800-419-3308',
      coordinates: { lat: 28.6095, lng: 77.2010 },
    },
    {
      id: 'WARD-19',
      code: 'Ward 19 - Tech Park Zone',
      locality: 'Silicon Outer Ring Road & IT Corridor',
      officer: 'Supt. Engr. S. K. Nambiar',
      helpline: '1800-419-3319',
      coordinates: { lat: 28.6350, lng: 77.2250 },
    },
  ];
  res.json({ wards });
});

// AI Description Assistance
app.post('/api/ai/enhance-description', async (req: Request, res: Response) => {
  const { description, problemType, locality } = req.body;

  if (!description && !problemType) {
    res.status(400).json({ error: 'Please provide description or problem type.' });
    return;
  }

  if (geminiClient && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are an AI assistant for a municipal Waterlogging and Drainage Reporting system.
A citizen reported:
Problem Category: "${problemType || 'Waterlogging'}"
Locality: "${locality || 'Urban Ward'}"
Draft Description / Voice transcript: "${description || 'Water is logged on the road'}"

Provide a clean JSON response with:
1. "enhanced_description": A clear, professional, concise municipal complaint text summarizing affected road, water depth, safety hazard, and landmark.
2. "estimated_depth": Estimated water level (e.g. "Ankle deep (~6 in)", "Knee deep (~1.5 ft)", "Waist deep (>3 ft)", "Unspecified").
3. "priority_recommendation": One of ["Low", "Medium", "High", "Critical"].
4. "voice_guidance": A 1-sentence friendly voice instruction to read aloud to the citizen confirming their report.

Return ONLY valid JSON matching this structure.`;

      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        res.json({
          success: true,
          ai_assisted: true,
          ...parsed,
        });
        return;
      }
    } catch (err) {
      console.warn('Gemini enhancement fallback triggered:', err);
    }
  }

  const isSevere = /deep|waist|knee|flood|submerged|stuck|car|bus|electric|wire|danger/i.test(description || '');
  const priority = isSevere ? 'High' : 'Medium';
  const depth = /waist/i.test(description || '')
    ? 'Waist deep (>3 ft)'
    : /knee/i.test(description || '')
    ? 'Knee deep (~1.5 ft)'
    : /ankle/i.test(description || '')
    ? 'Ankle deep (~6 in)'
    : 'Moderate water accumulation (~1 ft)';

  const enhanced = description
    ? `[Report Verified]: ${description.trim()}. Observed in ${locality || 'local area'} causing traffic slow down and pedestrian inconvenience. Recommended for municipal drainage crew inspection.`
    : `Severe ${problemType} observed near ${locality || 'main road junction'}. Water accumulation is obstructing pedestrian movement and vehicular traffic. Immediate desilting/pumping required.`;

  res.json({
    success: true,
    ai_assisted: false,
    enhanced_description: enhanced,
    estimated_depth: depth,
    priority_recommendation: priority,
    voice_guidance: `Your ${problemType} report for ${locality || 'this ward'} has been formatted for the municipal emergency squad.`,
  });
});

// ==========================================
// VITE OR STATIC SERVER SETUP
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Waterlogging System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
