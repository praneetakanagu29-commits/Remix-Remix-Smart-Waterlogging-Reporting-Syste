import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Flame,
  Volume2,
  VolumeX,
  ArrowLeft,
  Camera,
  AlertTriangle,
  User,
  Phone,
  ShieldAlert,
  Loader2,
  Check,
  Sparkles,
  Star,
  ThumbsUp,
  Send,
} from 'lucide-react';
import L from 'leaflet';
import { BeforeAfterViewer } from '../components/BeforeAfterViewer';
import { api } from '../services/api';
import { Complaint, ComplaintStatus, User as UserType } from '../types';

interface Props {
  initialComplaintId?: string | null;
  currentUser: UserType | null;
  onBackToDashboard: () => void;
}

export const CitizenTrackingPage: React.FC<Props> = ({
  initialComplaintId,
  currentUser,
  onBackToDashboard,
}) => {
  const [searchInput, setSearchInput] = useState(initialComplaintId || 'WL-2026-000101');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Citizen Rating & Feedback state
  const [ratingStars, setRatingStars] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('The waterlogging problem was resolved promptly and effectively.');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  // Map container reference
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const fetchComplaintDetails = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.getComplaintById(idToFetch.trim().toUpperCase());
      setComplaint(data.complaint);
      setHistory(data.history || []);
    } catch (err: any) {
      setErrorMsg(err.message || `No grievance record found with tracking ID "${idToFetch}".`);
      setComplaint(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialComplaintId) {
      setSearchInput(initialComplaintId);
      fetchComplaintDetails(initialComplaintId);
    } else {
      fetchComplaintDetails('WL-2026-000101');
    }
  }, [initialComplaintId]);

  // Map setup
  useEffect(() => {
    if (!complaint || !mapContainerRef.current) return;

    const lat = Number(complaint.latitude) || 28.6139;
    const lng = Number(complaint.longitude) || 77.2090;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng]).addTo(map);
      marker.bindPopup(`<strong>${complaint.problem_type}</strong><br/>${complaint.address}`).openPopup();

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        markerRef.current.bindPopup(`<strong>${complaint.problem_type}</strong><br/>${complaint.address}`).openPopup();
      }
    }
  }, [complaint]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaintDetails(searchInput);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setIsSubmittingRating(true);
    setRatingSuccessMsg(null);
    try {
      const res = await api.submitFeedback(complaint.complaint_id, ratingStars, feedbackComment);
      setComplaint(res.complaint);
      setRatingSuccessMsg('Thank you! Your verification feedback and quality rating have been officially recorded.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // AI Voice assistance: Read complaint status aloud
  const handleReadStatusAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!complaint) return;

    window.speechSynthesis.cancel();
    let textToSpeak = `Complaint ID ${complaint.complaint_id} for ${complaint.problem_type} at ${complaint.address}. Current status is: ${complaint.status}. `;

    if (complaint.status === 'Completed') {
      textToSpeak += `The issue has been resolved. Action taken: ${complaint.resolution_action_taken || 'Remediation completed by municipal crew'}.`;
    } else if (complaint.status === 'In Progress') {
      textToSpeak += `Field work has started. Assigned to: ${complaint.assigned_staff || 'Municipal drainage squad'}.`;
    } else if (complaint.status === 'Escalated') {
      textToSpeak += `This issue has been escalated to Level ${complaint.authority_level} authority for emergency equipment deployment.`;
    } else if (complaint.status === 'Not Completed') {
      textToSpeak += `Status is not completed. Reason: ${complaint.not_completed_reason || 'Specialized machinery required'}.`;
    } else {
      textToSpeak += 'The municipal control room has received your report and is assigning field staff.';
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>🟠 PENDING — Awaiting Field Crew</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-sky-100 text-sky-800 border border-sky-300 shadow-xs">
            <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
            <span>🟠 IN PROGRESS — Work Active</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-emerald-100 text-emerald-900 border-2 border-emerald-400 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>🟢 COMPLETED — Problem Resolved</span>
          </span>
        );
      case 'Not Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold bg-slate-100 text-slate-800 border border-slate-300 shadow-xs">
            <XCircle className="w-4 h-4 text-slate-600" />
            <span>⚫ NOT COMPLETED — Additional Action Required</span>
          </span>
        );
      case 'Escalated':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black bg-rose-100 text-rose-900 border-2 border-rose-400 shadow-xs animate-pulse">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>🟣 ESCALATED — Level {complaint?.authority_level || 2} Authority Intervention</span>
          </span>
        );
    }
  };

  // 5 Step Visual Progress Tracker
  const isReceived = Boolean(complaint);
  const isAssigned = Boolean(
    complaint && complaint.assigned_staff && complaint.assigned_staff !== 'Pending Staff Assignment'
  );
  const isWorkStarted = Boolean(
    complaint &&
      (complaint.status === 'In Progress' ||
        complaint.status === 'Completed' ||
        complaint.status === 'Not Completed' ||
        complaint.status === 'Escalated')
  );
  const isResolved = complaint?.status === 'Completed';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Search Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors w-fit cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          {/* Search Box by ID */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Complaint ID (e.g. WL-2026-000101)"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Grievance Not Found</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className="text-xs font-semibold text-slate-500">
              Querying municipal docket records...
            </p>
          </div>
        ) : complaint ? (
          <div className="space-y-6">
            {/* Main Docket Status Banner */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-teal-300 bg-teal-950/60 px-3 py-0.5 rounded-full border border-teal-500/30">
                      Docket Tracking ID
                    </span>
                    <span className="text-xs text-slate-400">
                      Logged: {new Date(complaint.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-white">
                    {complaint.complaint_id}
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-teal-100">
                    {complaint.problem_type} • {complaint.ward}
                  </p>
                </div>

                {/* Voice Status Reader */}
                <button
                  type="button"
                  onClick={handleReadStatusAloud}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto cursor-pointer ${
                    isSpeaking
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Stop Voice Reader</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-teal-300" />
                      <span>Read Status Aloud</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Badge Display */}
              <div className="pt-2 flex items-center gap-3">
                <span className="text-xs text-slate-300 font-bold">Current Resolution Status:</span>
                {getStatusBadge(complaint.status)}
              </div>
            </div>

            {/* 5-STEP LIFECYCLE TIMELINE REQUIRED BY SPEC */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Municipal Action Lifecycle & Milestones
                </h4>
                <span className="text-xs text-teal-700 font-bold">5-Stage Verification</span>
              </div>

              <div className="relative flex items-center justify-between text-xs pt-2">
                {/* Connecting Track Line */}
                <div className="absolute left-6 right-6 top-5 -translate-y-1/2 h-1 bg-slate-100 z-0" />
                <div
                  className={`absolute left-6 top-5 -translate-y-1/2 h-1 z-0 transition-all duration-500 ${
                    isResolved
                      ? 'bg-emerald-500 right-6'
                      : isWorkStarted
                      ? 'bg-sky-500 w-3/4'
                      : isAssigned
                      ? 'bg-teal-500 w-1/2'
                      : isReceived
                      ? 'bg-teal-500 w-1/4'
                      : 'bg-teal-500 w-8'
                  }`}
                />

                {/* 1. Report Submitted */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    ✓
                  </div>
                  <span className="font-bold text-slate-800 mt-1.5 text-[11px]">Report Submitted</span>
                  <span className="text-[10px] text-slate-400">Step 1</span>
                </div>

                {/* 2. Municipality Received */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[85px]">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    ✓
                  </div>
                  <span className="font-bold text-slate-800 mt-1.5 text-[11px]">Municipality Received</span>
                  <span className="text-[10px] text-slate-400">Step 2</span>
                </div>

                {/* 3. Staff Assigned */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-xs ${
                      isAssigned ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isAssigned ? '✓' : '3'}
                  </div>
                  <span className={`font-bold mt-1.5 text-[11px] ${isAssigned ? 'text-teal-900' : 'text-slate-400'}`}>
                    Staff Assigned
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[70px]">
                    {complaint.assigned_staff ? complaint.assigned_staff.split(' ')[0] : 'Pending'}
                  </span>
                </div>

                {/* 4. Work Started */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-xs ${
                      isWorkStarted ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isWorkStarted ? '✓' : '4'}
                  </div>
                  <span className={`font-bold mt-1.5 text-[11px] ${isWorkStarted ? 'text-sky-900' : 'text-slate-400'}`}>
                    Work Started
                  </span>
                  <span className="text-[10px] text-slate-400">Field Active</span>
                </div>

                {/* 5. Problem Resolved */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[85px]">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-xs ${
                      isResolved
                        ? 'bg-emerald-600 text-white'
                        : complaint.status === 'Escalated'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isResolved ? '✓' : complaint.status === 'Escalated' ? '🔺' : '○'}
                  </div>
                  <span
                    className={`font-bold mt-1.5 text-[11px] ${
                      isResolved
                        ? 'text-emerald-900'
                        : complaint.status === 'Escalated'
                        ? 'text-rose-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {isResolved
                      ? 'Problem Resolved'
                      : complaint.status === 'Escalated'
                      ? 'Escalated'
                      : 'Resolution Pending'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isResolved ? 'Completed' : 'Stage 5'}
                  </span>
                </div>
              </div>
            </div>

            {/* RESOLUTION SECTION (IF COMPLETED) */}
            {complaint.status === 'Completed' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-emerald-950">
                          Official Resolution Certificate & Verification
                        </h3>
                        <p className="text-xs text-emerald-800">
                          Work completed and verified by Greater Municipal Corporation field inspectors
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs">
                      VERIFIED RESOLUTION
                    </span>
                  </div>

                  {/* Problem Report & Action Taken */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                      <span className="font-extrabold text-slate-500 uppercase tracking-wider block text-[10px]">
                        Problem Report (Original Description)
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        "{complaint.description}"
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-1.5">
                      <span className="font-extrabold text-emerald-800 uppercase tracking-wider block text-[10px]">
                        Action Taken by Municipal Squad
                      </span>
                      <p className="text-emerald-950 leading-relaxed font-bold">
                        "{complaint.resolution_action_taken || complaint.resolution_notes || 'Drainage cleared and stormwater drained using high-capacity pumping'}"
                      </p>
                    </div>
                  </div>

                  {/* Before / After Evidence Photo Component */}
                  <BeforeAfterViewer
                    beforeImage={complaint.citizen_image}
                    afterImage={complaint.resolution_image || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'}
                    actionTaken={complaint.resolution_action_taken}
                    completedBy={complaint.resolution_completed_by || complaint.assigned_staff}
                    completedAt={complaint.resolved_at || complaint.updated_at}
                  />

                  {/* Officer Sign-off Footer */}
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Completed By Staff / Squad:</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {complaint.resolution_completed_by || complaint.assigned_staff || 'Municipal Rapid Squad'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Completed On Date & Time:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {new Date(complaint.resolved_at || complaint.updated_at).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Responsible Wing:</span>
                      <span className="font-semibold text-teal-800">{complaint.department}</span>
                    </div>
                  </div>

                  {/* CITIZEN RATING & FEEDBACK SYSTEM REQUIRED BY SPEC */}
                  <div className="bg-white rounded-2xl border-2 border-emerald-300 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>Citizen Feedback & Resolution Assessment</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Was the waterlogging resolved satisfactorily? Your feedback assesses municipal crew quality.
                        </p>
                      </div>

                      {complaint.citizen_rating && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-full flex items-center gap-1 w-fit">
                          <Check className="w-3.5 h-3.5 text-amber-700" />
                          <span>Feedback Recorded: {complaint.citizen_rating} / 5 ★</span>
                        </span>
                      )}
                    </div>

                    {ratingSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{ratingSuccessMsg}</span>
                      </div>
                    )}

                    {complaint.citizen_rating ? (
                      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-4 h-4 ${
                                  s <= (complaint.citizen_rating || 5)
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-amber-950 text-sm">
                            {complaint.citizen_rating === 5
                              ? 'Excellent Resolution'
                              : complaint.citizen_rating === 4
                              ? 'Very Good'
                              : complaint.citizen_rating === 3
                              ? 'Satisfactory'
                              : 'Needs Improvement'}
                          </span>
                        </div>

                        {complaint.citizen_feedback && (
                          <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-amber-100 font-medium">
                            "{complaint.citizen_feedback}"
                          </p>
                        )}

                        <span className="text-[10px] text-slate-400 block">
                          Submitted on {complaint.feedback_submitted_at ? new Date(complaint.feedback_submitted_at).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
                        {/* 1-5 Star Interactive Selector */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1.5">
                            How would you rate the municipal resolution quality?
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setRatingStars(s)}
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                                title={`${s} Stars`}
                              >
                                <Star
                                  className={`w-6 h-6 transition-transform hover:scale-110 ${
                                    s <= (hoverRating || ratingStars)
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="font-bold text-slate-700 ml-2 font-mono text-sm">
                              {ratingStars} of 5 Stars
                            </span>
                          </div>
                        </div>

                        {/* Feedback comment input */}
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Citizen Comments / Observations:
                          </label>
                          <textarea
                            rows={2}
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Was the waterlogging resolved satisfactorily? Any lingering stagnant water?"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                          />
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="submit"
                            disabled={isSubmittingRating}
                            className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            {isSubmittingRating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Submit Resolution Rating</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* NOT COMPLETED SECTION (IF NOT COMPLETED) */}
            {complaint.status === 'Not Completed' && (
              <div className="bg-slate-100 border-2 border-slate-300 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <XCircle className="w-5 h-5 text-slate-600" />
                  <h4 className="font-extrabold text-base">Status: Not Completed</h4>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-rose-700 block text-[11px] uppercase">
                    Reason Stated by Staff:
                  </span>
                  <p className="text-slate-900 font-bold text-sm">
                    "{complaint.not_completed_reason || 'Major drainage repair required.'}"
                  </p>
                  {complaint.resolution_notes && (
                    <p className="text-slate-600 pt-1 border-t">{complaint.resolution_notes}</p>
                  )}
                  {complaint.not_completed_action && (
                    <div className="pt-2 text-[11px] text-teal-800 font-semibold">
                      Recommended Next Action: <strong>{complaint.not_completed_action}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ESCALATED SECTION (IF ESCALATED) */}
            {complaint.status === 'Escalated' && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5 text-rose-900">
                  <Flame className="w-5 h-5 text-rose-600 animate-pulse" />
                  <h4 className="font-black text-base">
                    Grievance Escalated to Level {complaint.authority_level || 2} Higher Authority
                  </h4>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-200 space-y-2 text-xs">
                  <span className="font-bold text-rose-800 block text-[11px] uppercase">
                    Escalation Justification:
                  </span>
                  <p className="text-slate-900 font-bold">
                    "{complaint.escalation_reason || 'High water depth required zonal heavy equipment.'}"
                  </p>
                  <p className="text-rose-700 text-[11px]">
                    This complaint has been flagged for prioritized administrative review and rapid deployment of emergency 50HP pump sets.
                  </p>
                </div>
              </div>
            )}

            {/* LOCATION MAP & PHYSICAL EVIDENCE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Interactive Location Map */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Reported Incident Location</span>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden border border-slate-200">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">{complaint.address}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Lat: {complaint.latitude} | Lng: {complaint.longitude}
                  </span>
                </div>
              </div>

              {/* Citizen Original Evidence */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-teal-600" /> Citizen Attached Photograph
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
                  {complaint.citizen_image ? (
                    <img
                      src={complaint.citizen_image}
                      alt={complaint.problem_type}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      No citizen photo attached
                    </div>
                  )}
                </div>

                {complaint.voice_recording && (
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-900 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-teal-700" />
                      <span>Citizen Audio Note</span>
                    </span>
                    <audio src={complaint.voice_recording} controls className="h-7 max-w-[160px]" />
                  </div>
                )}
              </div>
            </div>

            {/* AUDIT LOG TIMELINE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">
                Official Municipal Audit Trail
              </h4>
              <div className="border-l-2 border-teal-500 ml-2 space-y-4 py-1">
                {history.map((h, i) => (
                  <div key={h.id || i} className="relative pl-5 text-xs">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-bold text-slate-900">
                        {h.new_status === 'Completed'
                          ? '✅ Complaint Marked Completed'
                          : h.new_status === 'Escalated'
                          ? '🔺 Escalated to Higher Authority'
                          : h.action_type === 'assignment'
                          ? '👤 Staff Assigned'
                          : `Status Changed: ${h.new_status}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Actor: {h.changed_by}
                    </div>
                    {h.notes && (
                      <p className="mt-1 p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-700">
                        {h.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
