import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Flame,
  Layers,
  MapPin,
  Calendar,
  Volume2,
  ChevronRight,
  Bell,
  RefreshCw,
  Eye,
  X,
  Building,
  PhoneCall,
  Loader2,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  HelpCircle,
  BookOpen,
  FileText,
} from 'lucide-react';
import { StatusTimeline } from '../components/StatusTimeline';
import { CitizenFAQ } from '../components/CitizenFAQ';
import { api } from '../services/api';
import { Complaint, Stats, User } from '../types';

interface Props {
  user: User;
  onNavigateToReport: () => void;
  activeWard: string;
  onOpenQRSimulator: () => void;
  onNavigateToTracking?: (complaintId?: string) => void;
  onNavigateToFAQ?: () => void;
  initialSelectedComplaintId?: string | null;
  onClearInitialComplaintId?: () => void;
}

export const CitizenDashboard: React.FC<Props> = ({
  user,
  onNavigateToReport,
  activeWard,
  onOpenQRSimulator,
  onNavigateToTracking,
  onNavigateToFAQ,
  initialSelectedComplaintId,
  onClearInitialComplaintId,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [trackDocketInput, setTrackDocketInput] = useState('');
  const [dashboardView, setDashboardView] = useState<'complaints' | 'faq'>('complaints');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    not_completed: 0,
    escalated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintHistory, setComplaintHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [fetchedComplaints, fetchedStats] = await Promise.all([
        api.getComplaints(),
        api.getStats(),
      ]);
      setComplaints(fetchedComplaints);
      setStats(fetchedStats);

      // If initial complaint is passed from notification
      if (initialSelectedComplaintId) {
        const found = fetchedComplaints.find((c) => c.complaint_id === initialSelectedComplaintId);
        if (found) {
          openComplaintModal(found);
          if (onClearInitialComplaintId) onClearInitialComplaintId();
        }
      }
    } catch (err) {
      console.warn('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [initialSelectedComplaintId]);

  const openComplaintModal = async (c: Complaint) => {
    setSelectedComplaint(c);
    setLoadingHistory(true);
    try {
      const data = await api.getComplaintById(c.complaint_id);
      setSelectedComplaint(data.complaint);
      setComplaintHistory(data.history || []);
    } catch (err) {
      console.warn('Failed to fetch history:', err);
      setComplaintHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter complaints based on status
  const filteredComplaints = complaints.filter((c) => {
    if (activeFilter === 'All') return true;
    return c.status === activeFilter;
  });

  const getStatusBadge = (status: Complaint['status']) => {
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

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-teal-300 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-500/30">
                  Citizen Portal Active
                </span>
                <span className="text-xs text-slate-300">
                  Registered Zone: <strong>{user.locality || activeWard}</strong>
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user.name}!
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl">
                Track real-time resolution of your waterlogging complaints, monitor municipal dewatering
                deployments, and report new drainage hazards.
              </p>
            </div>

            {/* Prominent Action Button: Report New Problem & Track by ID */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quick Docket ID Search */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/20 backdrop-blur-md">
                <input
                  type="text"
                  placeholder="Track Docket ID (e.g. WL-2026-000101)"
                  className="px-3 py-1.5 bg-transparent text-white placeholder-teal-200/70 text-xs font-mono focus:outline-none w-44 sm:w-52 uppercase"
                  value={trackDocketInput}
                  onChange={(e) => setTrackDocketInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onNavigateToTracking?.(trackDocketInput.trim() || undefined);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => onNavigateToTracking?.(trackDocketInput.trim() || undefined)}
                  className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Track
                </button>
              </div>

              <button
                type="button"
                onClick={onOpenQRSimulator}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
              >
                <span>Current QR Ward:</span>
                <span className="text-teal-300 font-bold underline">
                  {activeWard || 'Ward 12'}
                </span>
              </button>

              <button
                type="button"
                onClick={onNavigateToReport}
                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-teal-900/40 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-slate-950" />
                <span>Report New Problem</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-8">
        {/* ATTRACTIVE STATUS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Total Reports */}
          <div
            onClick={() => setActiveFilter('All')}
            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
              activeFilter === 'All'
                ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md scale-102'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total
              </span>
              <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">All reports</div>
          </div>

          {/* 2. Pending */}
          <div
            onClick={() => setActiveFilter('Pending')}
            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
              activeFilter === 'Pending'
                ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md scale-102'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Pending
              </span>
              <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono">
              {stats.pending}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">In triage queue</div>
          </div>

          {/* 3. In Progress */}
          <div
            onClick={() => setActiveFilter('In Progress')}
            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
              activeFilter === 'In Progress'
                ? 'border-sky-600 ring-2 ring-sky-500/20 shadow-md scale-102'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                In Progress
              </span>
              <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-sky-900 font-mono">
              {stats.in_progress}
            </div>
            <div className="text-[11px] text-sky-700 mt-1">Crew dispatched</div>
          </div>

          {/* 4. Completed */}
          <div
            onClick={() => setActiveFilter('Completed')}
            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
              activeFilter === 'Completed'
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md scale-102'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Completed
              </span>
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
              {stats.completed}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Dewatered / fixed</div>
          </div>

          {/* 5. Not Completed */}
          <div
            onClick={() => setActiveFilter('Not Completed')}
            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
              activeFilter === 'Not Completed'
                ? 'border-slate-600 ring-2 ring-slate-500/20 shadow-md scale-102'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Not Done
              </span>
              <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
              {stats.not_completed}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Awaiting review</div>
          </div>

          {/* 6. Escalated */}
          <div
            onClick={() => setActiveFilter('Escalated')}
            className={`bg-white rounded-2xl p-4 border shadow-sm transition-all cursor-pointer ${
              activeFilter === 'Escalated'
                ? 'border-rose-600 ring-2 ring-rose-500/20 shadow-md scale-102'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Escalated
              </span>
              <div className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-900 font-mono">
              {stats.escalated}
            </div>
            <div className="text-[11px] text-rose-700 mt-1">Level 2-4 Authority</div>
          </div>
        </div>

        {/* NOTIFICATIONS & MONSOON ADVISORY */}
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 border border-teal-200 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-sm shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-teal-950">
                  Municipal Monsoon Advisory & Notifications
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-200 text-teal-900">
                  Live
                </span>
              </div>
              <p className="text-xs text-teal-900/90 mt-1">
                Heavy rainfall forecast over South Lake (Ward 12) & Railway Corridor (Ward 08).
                High-capacity 50HP dewatering pump sets on standby at Central Depot.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchDashboardData}
              className="px-3 py-2 bg-white hover:bg-teal-50 text-teal-800 text-xs font-semibold rounded-xl border border-teal-200 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* MY COMPLAINTS SECTION */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">My Complaints</h3>
              <p className="text-xs text-slate-500">
                Detailed record of all waterlogging and drainage reports filed under your account
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {['All', 'Pending', 'In Progress', 'Completed', 'Escalated'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === f
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Complaints List / Table */}
          {loading ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <span className="text-xs font-medium">Fetching registered complaints...</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  No {activeFilter !== 'All' ? activeFilter : ''} Complaints Found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Have you observed flooded streets or choked drains in your vicinity? Report now to
                  alert municipal engineers.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToReport}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File First Complaint</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredComplaints.map((c) => (
                <div
                  key={c.complaint_id}
                  onClick={() => openComplaintModal(c)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 shadow-sm hover:shadow-md transition-all p-4.5 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Header: ID & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                        {c.complaint_id}
                      </span>
                      {getStatusBadge(c.status)}
                    </div>

                    {/* Image Thumbnail if available */}
                    {c.citizen_image && (
                      <div className="relative rounded-xl overflow-hidden h-36 bg-slate-100 border border-slate-200">
                        <img
                          src={c.citizen_image}
                          alt={c.problem_type}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-md">
                          {c.problem_type}
                        </div>
                      </div>
                    )}

                    {!c.citizen_image && (
                      <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-900">
                          {c.problem_type}
                        </span>
                      </div>
                    )}

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Location & Ward */}
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{c.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium text-slate-700">
                          {c.ward || 'Ward 12 - South Lake'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTracking?.(c.complaint_id);
                      }}
                      className="text-teal-700 hover:text-teal-900 font-bold group-hover:translate-x-1 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{c.status === 'Completed' ? 'View Resolution' : 'Track Progress'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COMPLAINT DETAILS & VISUAL TIMELINE MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md">
                  {selectedComplaint.complaint_id}
                </span>
                <div>
                  <h4 className="font-bold text-base leading-tight">
                    {selectedComplaint.problem_type}
                  </h4>
                  <span className="text-xs text-teal-200">
                    {selectedComplaint.ward || 'Municipal Zone'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image if available */}
              {selectedComplaint.citizen_image && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-black">
                  <img
                    src={selectedComplaint.citizen_image}
                    alt={selectedComplaint.problem_type}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Status and Department metadata */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Current Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Assigned Staff & Wing:</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {selectedComplaint.assigned_staff || 'Pending Assignment'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedComplaint.department}
                  </span>
                </div>
              </div>

              {/* Address & Coordinates */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Exact Location:</span>
                </div>
                <p className="text-slate-800 font-medium pl-5.5">{selectedComplaint.address}</p>
                <div className="text-[11px] text-slate-500 font-mono pl-5.5">
                  Lat: {selectedComplaint.latitude} | Lng: {selectedComplaint.longitude}
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complaint Description
                </h5>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Voice note playback */}
              {selectedComplaint.voice_recording && (
                <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 space-y-2">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-teal-700" />
                    <span>Voice Recording Attached:</span>
                  </span>
                  <audio
                    src={selectedComplaint.voice_recording}
                    controls
                    className="w-full h-8"
                  />
                </div>
              )}

              {/* Resolution Proof if Completed */}
              {selectedComplaint.status === 'Completed' && selectedComplaint.resolution_notes && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolution Confirmed by Municipal Staff:</span>
                  </span>
                  <p className="text-emerald-900">{selectedComplaint.resolution_notes}</p>
                  {selectedComplaint.resolution_image && (
                    <img
                      src={selectedComplaint.resolution_image}
                      alt="Resolution Proof"
                      className="h-44 rounded-xl border border-emerald-200 object-cover mt-1"
                    />
                  )}
                </div>
              )}

              {/* Visual Status Timeline & Escalation Tracking */}
              <div className="border-t border-slate-200 pt-4">
                <StatusTimeline complaint={selectedComplaint} history={complaintHistory} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-xs">
              <span className="text-slate-500">
                Created: {new Date(selectedComplaint.created_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const id = selectedComplaint.complaint_id;
                    setSelectedComplaint(null);
                    onNavigateToTracking?.(id);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>
                    {selectedComplaint.status === 'Completed'
                      ? 'Open Resolution & Rating Page'
                      : 'Open Full Tracking Page'}
                  </span>
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
