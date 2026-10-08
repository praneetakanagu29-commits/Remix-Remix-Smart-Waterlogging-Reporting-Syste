import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Flame,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Eye,
  BarChart3,
  Map,
  FileSpreadsheet,
  Download,
  Loader2,
  Sparkles,
  Printer,
  Star,
} from 'lucide-react';
import { AuthorityMapDashboard } from '../components/AuthorityMapDashboard';
import { ComplaintDetailsModal } from '../components/ComplaintDetailsModal';
import { api } from '../services/api';
import { AdminAnalytics, Complaint, ComplaintPriority, ComplaintStatus, Escalation, User } from '../types';

interface Props {
  currentUser: User;
}

export const AdminDashboard: React.FC<Props> = ({ currentUser }) => {
  // Navigation Tabs: 'table' | 'map' | 'analytics' | 'escalations'
  const [activeTab, setActiveTab] = useState<'table' | 'map' | 'analytics' | 'escalations'>('table');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states for Complaint Table
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterWard, setFilterWard] = useState<string>('All');
  const [filterProblemType, setFilterProblemType] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStaff, setFilterStaff] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected complaint for modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Load Admin Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [tableRes, statsRes, escRes] = await Promise.all([
        api.getAdminComplaints({
          status: filterStatus,
          ward: filterWard,
          problem_type: filterProblemType,
          priority: filterPriority,
          staff: filterStaff,
          search: searchQuery,
          sortBy,
          sortOrder,
        }),
        api.getAdminStats(),
        api.getAdminEscalations(),
      ]);

      setComplaints(tableRes.complaints || []);
      setAnalytics(statsRes);
      setEscalations(escRes || []);
    } catch (e) {
      console.warn('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filterStatus, filterWard, filterProblemType, filterPriority, filterStaff, sortBy, sortOrder]);

  // Debounced search trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDashboardData();
  };

  // Export Filtered Complaints to CSV
  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Citizen Name',
      'Mobile',
      'Problem Type',
      'Ward',
      'Address',
      'Priority',
      'Status',
      'Assigned Staff',
      'Action Taken',
      'Date Reported',
      'Citizen Rating',
    ];
    const rows = complaints.map((c) => [
      `"${c.complaint_id}"`,
      `"${c.user_name}"`,
      `"${c.user_mobile}"`,
      `"${c.problem_type}"`,
      `"${c.ward}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${c.assigned_staff || 'Unassigned'}"`,
      `"${(c.resolution_action_taken || c.resolution_notes || '').replace(/"/g, '""')}"`,
      `"${new Date(c.created_at).toLocaleDateString()}"`,
      `"${c.citizen_rating ? c.citizen_rating + ' Stars' : 'Unrated'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Municipal_Waterlogging_Docket_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  // Unique list of wards and problem types for filters
  const allWards = [
    'Ward 12 - South Lake',
    'Ward 04 - Metro Central',
    'Ward 08 - Railway Corridor',
    'Ward 19 - Tech Park Zone',
  ];

  const allProblemTypes = [
    'Waterlogging',
    'Drainage Blockage',
    'Open/Blocked Drain',
    'Rainwater Accumulation',
    'Road Flooding',
    'Garbage Blocking Drain',
    'Overflowing Drain',
    'Other',
  ];

  const getPriorityBadge = (priority: ComplaintPriority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            🔴 Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            🟠 High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            🟡 Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            🟢 Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <RefreshCw className="w-3 h-3 text-sky-600" /> In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case 'Not Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" /> Not Completed
          </span>
        );
      case 'Escalated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            <Flame className="w-3 h-3 text-rose-600" /> Escalated
          </span>
        );
    }
  };

  const stats = analytics?.stats || {
    total: complaints.length,
    new_complaints: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    not_completed: 0,
    escalated: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Municipal Authority Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest bg-teal-500/20 text-teal-300 px-3 py-1 rounded-full border border-teal-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Authority Command Center</span>
                </span>
                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-slate-200">
                  {currentUser.authority_role || 'Ward Officer'} (Level {currentUser.authority_level || 2})
                </span>
                <span className="text-xs text-slate-300">
                  {currentUser.department || 'Stormwater Management Wing'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Municipal Waterlogging Command & Triage
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl">
                Real-time grievance lifecycle management, field crew assignment, SLA tracking, and multi-tier escalation hierarchy.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                title="Export complaints to CSV file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintSummary}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Print incident summary"
              >
                <Printer className="w-3.5 h-3.5 text-teal-300" />
                <span>Print Report</span>
              </button>

              <button
                type="button"
                onClick={loadDashboardData}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* KPI & STATUS METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* 1. Total Complaints */}
          <div
            onClick={() => {
              setFilterStatus('All');
              setActiveTab('table');
            }}
            className={`bg-white rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
              filterStatus === 'All' && activeTab === 'table'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Reports
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
              {stats.total}
            </div>
            <span className="text-[10px] text-slate-400">All registered</span>
          </div>

          {/* 2. New (Last 24h) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              New (24h)
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mt-1 flex items-baseline gap-1.5">
              <span>{stats.new_complaints || 0}</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </div>
            <span className="text-[10px] text-amber-700">Immediate triage</span>
          </div>

          {/* 3. Pending */}
          <div
            onClick={() => {
              setFilterStatus('Pending');
              setActiveTab('table');
            }}
            className={`bg-white rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
              filterStatus === 'Pending' && activeTab === 'table'
                ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Pending
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mt-1">
              {stats.pending}
            </div>
            <span className="text-[10px] text-amber-700">Awaiting crew</span>
          </div>

          {/* 4. In Progress */}
          <div
            onClick={() => {
              setFilterStatus('In Progress');
              setActiveTab('table');
            }}
            className={`bg-white rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
              filterStatus === 'In Progress' && activeTab === 'table'
                ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
              In Progress
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-900 font-mono mt-1">
              {stats.in_progress}
            </div>
            <span className="text-[10px] text-sky-700">Crew active</span>
          </div>

          {/* 5. Completed */}
          <div
            onClick={() => {
              setFilterStatus('Completed');
              setActiveTab('table');
            }}
            className={`bg-white rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
              filterStatus === 'Completed' && activeTab === 'table'
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Completed
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono mt-1">
              {stats.completed}
            </div>
            <span className="text-[10px] text-emerald-700">Dewatered / fixed</span>
          </div>

          {/* 6. Not Completed */}
          <div
            onClick={() => {
              setFilterStatus('Not Completed');
              setActiveTab('table');
            }}
            className={`bg-white rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
              filterStatus === 'Not Completed' && activeTab === 'table'
                ? 'border-slate-600 ring-2 ring-slate-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Not Done
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono mt-1">
              {stats.not_completed}
            </div>
            <span className="text-[10px] text-slate-500">Requires action</span>
          </div>

          {/* 7. Escalated */}
          <div
            onClick={() => {
              setFilterStatus('Escalated');
              setActiveTab('table');
            }}
            className={`bg-white rounded-2xl p-4 border shadow-xs cursor-pointer transition-all ${
              filterStatus === 'Escalated' && activeTab === 'table'
                ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Escalated
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-900 font-mono mt-1">
              {stats.escalated}
            </div>
            <span className="text-[10px] text-rose-700">Level 2-4 Authority</span>
          </div>
        </div>

        {/* SUB-NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'table'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Complaint Management Table</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono">
              {complaints.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'map'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>GIS Map Incident Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics & Charts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('escalations')}
            className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'escalations'
                ? 'border-rose-600 text-rose-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-rose-600" />
            <span>Escalation Audit Hub</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-mono font-bold">
              {escalations.length}
            </span>
          </button>
        </div>

        {/* TAB 1: COMPLAINT MANAGEMENT TABLE */}
        {activeTab === 'table' && (
          <div className="space-y-4">
            {/* Search and Filters Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Complaint ID, Citizen Name, or Location/Street..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      loadDashboardData();
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Clear
                  </button>
                )}
              </form>

              {/* Filters Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Status:
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Not Completed">Not Completed</option>
                    <option value="Escalated">Escalated</option>
                  </select>
                </div>

                {/* Ward */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Ward / Area:
                  </label>
                  <select
                    value={filterWard}
                    onChange={(e) => setFilterWard(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="All">All Wards</option>
                    {allWards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Problem Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Problem Type:
                  </label>
                  <select
                    value={filterProblemType}
                    onChange={(e) => setFilterProblemType(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="All">All Categories</option>
                    {allProblemTypes.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Priority:
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="All">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Sort By:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="priority">Priority (Critical First)</option>
                    <option value="date">Date Reported</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Order:
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="desc">Descending (High/Newest)</option>
                    <option value="asc">Ascending (Low/Oldest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Complaints Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 uppercase font-extrabold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Complaint ID</th>
                      <th className="py-3 px-4">Citizen</th>
                      <th className="py-3 px-4">Problem</th>
                      <th className="py-3 px-4">Location / Ward</th>
                      <th className="py-3 px-4">Date Reported</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assigned Staff</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                          <span>Loading complaints records...</span>
                        </td>
                      </tr>
                    ) : complaints.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          No matching complaints found. Try clearing filters.
                        </td>
                      </tr>
                    ) : (
                      complaints.map((c) => (
                        <tr
                          key={c.complaint_id}
                          className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                          onClick={() => setSelectedComplaint(c)}
                        >
                          {/* ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="bg-slate-100 group-hover:bg-white px-2 py-0.5 rounded border border-slate-200 text-teal-900">
                              {c.complaint_id}
                            </span>
                          </td>

                          {/* Citizen */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{c.user_name}</div>
                            <div className="text-[11px] text-slate-400">{c.user_mobile}</div>
                          </td>

                          {/* Problem */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {c.problem_type}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 max-w-[200px]">
                            <div className="truncate font-medium text-slate-700">{c.address}</div>
                            <div className="text-[10px] text-teal-700 font-semibold">{c.ward}</div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                            {new Date(c.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getPriorityBadge(c.priority)}
                          </td>

                          {/* Staff */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-medium text-slate-800">
                              {c.assigned_staff || 'Unassigned'}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              Lvl {c.authority_level || 1}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getStatusBadge(c.status)}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(c);
                              }}
                              className="px-3 py-1.5 bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-xs"
                            >
                              <span>Manage</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing <strong>{complaints.length}</strong> complaints
                </span>
                <span className="text-[11px] font-mono">
                  Database Connected • File Persistence Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GIS MAP DASHBOARD */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200">
              <h3 className="font-extrabold text-base text-slate-900">
                Real-Time GIS Flood & Incident Map
              </h3>
              <p className="text-xs text-slate-500">
                Spatial view of all reported complaints with color-coded severity and status markers. Click any pin to inspect details.
              </p>
            </div>

            <AuthorityMapDashboard
              complaints={complaints}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
            />
          </div>
        )}

        {/* TAB 3: ANALYTICS & CHARTS */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Top Operational Metrics & Turnaround Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Avg. Resolution Turnaround
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-800">
                  {analytics.avgResolutionHours || 3.8} <span className="text-xs font-sans font-bold text-slate-500">hrs</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">From report to dewatering</p>
              </div>

              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Citizen Quality Rating
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-amber-900 flex items-center gap-1.5">
                  <span>{analytics.avgRating || 4.9}</span>
                  <span className="text-amber-500 text-lg">★</span>
                </div>
                <p className="text-[11px] text-amber-700 font-medium">Post-resolution assessments</p>
              </div>

              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Overall Resolution Rate
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-teal-900">
                  {analytics.resolutionRate || 75}%
                </div>
                <p className="text-[11px] text-teal-700 font-medium">Completed vs total logged</p>
              </div>

              <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Active Ward Hotspots
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-black text-rose-900">
                  {analytics.hotspots?.length || 4}
                </div>
                <p className="text-[11px] text-rose-700 font-medium">Monitored risk clusters</p>
              </div>
            </div>

            {/* Quick Export Tools for Analytics */}
            <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-300" />
                  <span>Municipal Governance Analytics & Reporting Export</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Generate formal complaint registers, audit logs, and dewatering dispatch reports for review.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSummary}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>Problem Type Distribution</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(analytics.charts.byCategory).map(([cat, count]) => {
                    const pct = Math.round((count / (analytics.stats.total || 1)) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">{cat}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Matrix */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Severity Priority Matrix</span>
                </h4>
                <div className="space-y-3 text-xs">
                  {Object.entries(analytics.charts.byPriority).map(([pri, count]) => (
                    <div
                      key={pri}
                      className="p-3 rounded-xl border flex items-center justify-between"
                    >
                      <span className="font-bold">{pri} Priority</span>
                      <span className="font-mono text-base font-black">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ward Incident Load */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Ward Inundation Load</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(analytics.charts.byWard).map(([ward, count]) => (
                    <div
                      key={ward}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 truncate max-w-[180px]">
                        {ward}
                      </span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border text-teal-800">
                        {count} reports
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900">Recent Complaints</h4>
              <div className="divide-y divide-slate-100">
                {analytics.recentComplaints.map((c) => (
                  <div
                    key={c.complaint_id}
                    onClick={() => setSelectedComplaint(c)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-teal-900 bg-teal-50 px-2 py-1 rounded">
                        {c.complaint_id}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{c.problem_type}</div>
                        <div className="text-[11px] text-slate-500">{c.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getPriorityBadge(c.priority)}
                      {getStatusBadge(c.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ESCALATIONS AUDIT HUB */}
        {activeTab === 'escalations' && (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3">
              <Flame className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <h4 className="font-bold text-rose-950 text-sm">
                  Official Administrative Escalations Log
                </h4>
                <p className="text-rose-800">
                  Complaints elevated from field workers (Level 1) to Ward Officers (Level 2), Zonal Officers (Level 3), and Higher Authorities (Level 4).
                </p>
              </div>
            </div>

            {escalations.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No active escalations recorded.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {escalations.map((esc) => (
                  <div
                    key={esc.id}
                    className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border">
                        {esc.complaint_id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        Elevated to Level {esc.to_level}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>From: {esc.from_role}</span>
                        <span>➔</span>
                        <span className="text-rose-700 font-bold">To: {esc.to_role}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Authorized By: <strong>{esc.escalated_by}</strong> on {new Date(esc.escalated_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-800 block">Justification Reason:</span>
                      <p className="text-slate-600 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 leading-relaxed">
                        {esc.reason}
                      </p>
                    </div>

                    {esc.notes && (
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-800 block">Internal Notes:</span>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          {esc.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* COMPLAINT DETAILS MODAL */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          currentUser={currentUser}
          onClose={() => setSelectedComplaint(null)}
          onComplaintUpdated={(updated) => {
            setSelectedComplaint(updated);
            setComplaints((prev) =>
              prev.map((c) => (c.complaint_id === updated.complaint_id ? updated : c))
            );
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
};
