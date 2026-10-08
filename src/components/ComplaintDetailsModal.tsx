import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Building2,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Flame,
  Volume2,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Check,
  Upload,
  Layers,
  Camera,
  Image as ImageIcon,
  Star,
  Trash2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { StatusTimeline } from './StatusTimeline';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { api } from '../services/api';
import { Authority, Complaint, ComplaintPriority, ComplaintStatus, User as UserType } from '../types';

interface Props {
  complaint: Complaint;
  currentUser: UserType;
  onClose: () => void;
  onComplaintUpdated: (updated: Complaint) => void;
}

export const ComplaintDetailsModal: React.FC<Props> = ({
  complaint: initialComplaint,
  currentUser,
  onClose,
  onComplaintUpdated,
}) => {
  const [complaint, setComplaint] = useState<Complaint>(initialComplaint);
  const [history, setHistory] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Active Action Tab: 'view' | 'assign' | 'status' | 'escalate' | 'priority'
  const [activeTab, setActiveTab] = useState<'view' | 'assign' | 'status' | 'escalate' | 'priority'>('view');

  // Assign staff form
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [customDepartment, setCustomDepartment] = useState(complaint.department || '');
  const [isAssigning, setIsAssigning] = useState(false);

  // Status update form
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [resolutionActionTaken, setResolutionActionTaken] = useState(
    complaint.resolution_action_taken || 'Blocked drainage was cleared and accumulated water was removed.'
  );
  const [resolutionProof, setResolutionProof] = useState(complaint.resolution_image || '');
  const [notCompletedReason, setNotCompletedReason] = useState(
    complaint.not_completed_reason || 'Major drainage repair required'
  );
  const [notCompletedNotes, setNotCompletedNotes] = useState(complaint.not_completed_notes || '');
  const [notCompletedAction, setNotCompletedAction] = useState(
    complaint.not_completed_action || 'Escalate to Zonal Officer for heavy machinery deployment.'
  );
  const [notCompletedPhoto, setNotCompletedPhoto] = useState(complaint.not_completed_image || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Camera states for resolution photo
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Escalation form
  const [escalationReason, setEscalationReason] = useState('Critical water accumulation exceeding standard drainage capacity');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  // Priority form
  const [selectedPriority, setSelectedPriority] = useState<ComplaintPriority>(complaint.priority);
  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const levelRoleNames: Record<number, string> = {
    1: 'Municipal Staff (Level 1)',
    2: 'Ward Officer (Level 2)',
    3: 'Zonal Officer (Level 3)',
    4: 'Higher Municipal Authority (Level 4)',
  };

  const nextLevel = Math.min((complaint.authority_level || 1) + 1, 4);

  // Load audit history & staff on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingHistory(true);
      try {
        const [complaintData, authList] = await Promise.all([
          api.getComplaintById(complaint.complaint_id),
          api.getAuthorities(),
        ]);
        setComplaint(complaintData.complaint);
        setHistory(complaintData.history || []);
        setAuthorities(authList);
        if (authList.length > 0) {
          setSelectedStaffId(authList[0].id);
        }
      } catch (e) {
        console.warn('Failed to load complaint modal data:', e);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadData();
  }, [complaint.complaint_id]);

  // Handle Assign Staff
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setIsAssigning(true);

    const staffObj = authorities.find((a) => a.id === selectedStaffId) || authorities[0];
    if (!staffObj) {
      setActionError('Please select a staff member.');
      setIsAssigning(false);
      return;
    }

    try {
      const res = await api.assignComplaint(complaint.complaint_id, {
        staffId: staffObj.id,
        staffName: staffObj.name,
        department: customDepartment || staffObj.department,
        ward: complaint.ward,
      });
      setComplaint(res.complaint);
      onComplaintUpdated(res.complaint);
      setActionSuccess(`Assigned to ${staffObj.name}. Status transitioned to In Progress.`);
      setActiveTab('view');
      // Reload history
      const fresh = await api.getComplaintById(complaint.complaint_id);
      setHistory(fresh.history || []);
    } catch (err: any) {
      setActionError(err.message || 'Failed to assign staff.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Camera Handlers for Resolution Proof
  const startCamera = async () => {
    setActionError(null);
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      setActionError('Camera permission denied or camera device unavailable. You can upload an image from your gallery instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setResolutionProof(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'resolution' | 'notCompleted') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'resolution') setResolutionProof(reader.result);
        else setNotCompletedPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Handle Status Update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    // Validation for Completed
    if (newStatus === 'Completed') {
      if (!resolutionActionTaken.trim()) {
        setActionError('Action Taken description is required to mark the grievance as Completed.');
        return;
      }
      if (!resolutionProof.trim()) {
        setActionError('A resolution photograph is strictly required to verify completed municipal work.');
        return;
      }
    }

    // Validation for Not Completed
    if (newStatus === 'Not Completed') {
      if (!notCompletedReason.trim()) {
        setActionError('Please specify the reason why the problem could not be completed.');
        return;
      }
    }

    setIsUpdatingStatus(true);

    try {
      const res = await api.updateComplaintStatus(complaint.complaint_id, {
        status: newStatus,
        notes:
          newStatus === 'Completed'
            ? resolutionActionTaken
            : newStatus === 'Not Completed'
            ? notCompletedNotes || notCompletedReason
            : statusNotes || `Status updated to ${newStatus}.`,
        resolutionImage: resolutionProof,
        resolutionActionTaken: resolutionActionTaken.trim(),
        notCompletedReason: notCompletedReason.trim(),
        notCompletedAction: notCompletedAction.trim(),
        notCompletedImage: notCompletedPhoto,
      });

      setComplaint(res.complaint);
      onComplaintUpdated(res.complaint);
      stopCamera();

      if (newStatus === 'Completed') {
        setActionSuccess(`Complaint marked as COMPLETED! Verified resolution notification sent to citizen.`);
      } else if (newStatus === 'Not Completed') {
        setActionSuccess(`Status recorded as NOT COMPLETED. Reason and recommended next steps logged.`);
      } else {
        setActionSuccess(`Complaint status updated to ${newStatus}.`);
      }

      setActiveTab('view');
      const fresh = await api.getComplaintById(complaint.complaint_id);
      setHistory(fresh.history || []);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Escalation
  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setIsEscalating(true);

    try {
      const res = await api.escalateComplaint(complaint.complaint_id, {
        reason: escalationReason,
        notes: escalationNotes || 'Escalated due to specialized machinery requirement.',
        targetLevel: nextLevel,
      });
      setComplaint(res.complaint);
      onComplaintUpdated(res.complaint);
      setActionSuccess(`Complaint escalated to Level ${nextLevel} (${levelRoleNames[nextLevel]}).`);
      setActiveTab('view');
      const fresh = await api.getComplaintById(complaint.complaint_id);
      setHistory(fresh.history || []);
    } catch (err: any) {
      setActionError(err.message || 'Failed to escalate complaint.');
    } finally {
      setIsEscalating(false);
    }
  };

  // Handle Priority Update
  const handleUpdatePriority = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setIsUpdatingPriority(true);

    try {
      const res = await api.updateComplaintPriority(complaint.complaint_id, selectedPriority);
      setComplaint(res.complaint);
      onComplaintUpdated(res.complaint);
      setActionSuccess(`Priority updated to ${selectedPriority}.`);
      setActiveTab('view');
      const fresh = await api.getComplaintById(complaint.complaint_id);
      setHistory(fresh.history || []);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update priority.');
    } finally {
      setIsUpdatingPriority(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-white/10 px-3 py-1 rounded-xl border border-white/10 text-teal-300">
              {complaint.complaint_id}
            </span>
            <div>
              <h3 className="font-extrabold text-base leading-tight flex items-center gap-2">
                <span>{complaint.problem_type}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  Level {complaint.authority_level || 1}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {complaint.ward} • {complaint.address}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'view' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview & Timeline
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'assign' ? 'bg-teal-600 text-white shadow-xs' : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              Assign Staff
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'status' ? 'bg-sky-600 text-white shadow-xs' : 'text-sky-700 hover:bg-sky-50'
              }`}
            >
              Update Status
            </button>
            <button
              onClick={() => setActiveTab('escalate')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'escalate' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              🔺 Escalate Complaint
            </button>
            <button
              onClick={() => setActiveTab('priority')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === 'priority' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Priority ({complaint.priority})
            </button>
          </div>

          {/* Current Status Pill */}
          <span
            className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
              complaint.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : complaint.status === 'In Progress'
                ? 'bg-sky-100 text-sky-800'
                : complaint.status === 'Escalated'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            ● {complaint.status}
          </span>
        </div>

        {/* Notices */}
        {actionSuccess && (
          <div className="mx-6 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW & TIMELINE */}
          {activeTab === 'view' && (
            <div className="space-y-6">
              {/* Top Meta Columns: Citizen Info & Current Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Citizen Information */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider block text-[10px]">
                    Citizen Information
                  </span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-bold text-slate-900 text-sm">{complaint.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{complaint.user_mobile}</span>
                  </div>
                  {complaint.user_email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{complaint.user_email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Locality: {complaint.ward}</span>
                  </div>
                </div>

                {/* Assignment & Hierarchy Level */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <span className="font-extrabold text-slate-500 uppercase tracking-wider block text-[10px]">
                    Municipal Assignment & Hierarchy
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Current Authority Level:</span>
                    <span className="font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded text-[11px]">
                      Level {complaint.authority_level || 1} — {levelRoleNames[complaint.authority_level || 1]}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Assigned Staff:</span>
                    <span className="font-bold text-slate-900">
                      {complaint.assigned_staff || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-medium text-slate-700">{complaint.department}</span>
                  </div>
                  {complaint.assigned_by && (
                    <div className="flex justify-between items-center text-[11px] text-slate-500 border-t pt-1">
                      <span>Assigned By:</span>
                      <span>{complaint.assigned_by}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence: Photo & Voice Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo Preview */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Citizen Photo Evidence
                  </span>
                  {complaint.citizen_image ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 h-52 bg-slate-900">
                      <img
                        src={complaint.citizen_image}
                        alt={complaint.problem_type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-52 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                      No photo attached
                    </div>
                  )}
                </div>

                {/* Voice Note & Location Summary */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Audio & Geolocation
                  </span>

                  {complaint.voice_recording ? (
                    <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-teal-900 text-xs font-bold">
                        <Volume2 className="w-4 h-4 text-teal-700" />
                        <span>Citizen Voice Recording</span>
                      </div>
                      <audio src={complaint.voice_recording} controls className="w-full h-8" />
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500">
                      No voice recording attached
                    </div>
                  )}

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>{complaint.address}</span>
                    </div>
                    <div className="font-mono text-slate-500 text-[11px] pl-5">
                      Lat: {complaint.latitude} | Lng: {complaint.longitude}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Problem Description
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </div>
              </div>

              {/* Resolution Proof & Before/After Comparison if Completed */}
              {complaint.status === 'Completed' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-emerald-950">
                            Problem Resolved & Certified
                          </h4>
                          <span className="text-[11px] text-emerald-700">
                            Field remediation completed and verified by municipal crew
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-600 text-white text-[11px] font-black rounded-xl">
                        VERIFIED COMPLETED
                      </span>
                    </div>

                    {/* Action Taken & Completion Officer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Action Taken by Staff:
                        </span>
                        <p className="text-slate-800 font-bold leading-relaxed">
                          "{complaint.resolution_action_taken || complaint.resolution_notes || 'Drainage cleared and stormwater drained'}"
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Sign-off & Timeline:
                        </span>
                        <div className="text-slate-800 font-semibold">
                          Completed By: <strong>{complaint.resolution_completed_by || complaint.assigned_staff || 'Municipal Crew'}</strong>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Date: {new Date(complaint.resolved_at || complaint.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Before & After Interactive Evidence Component */}
                    <BeforeAfterViewer
                      beforeImage={complaint.citizen_image}
                      afterImage={complaint.resolution_image || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'}
                      actionTaken={complaint.resolution_action_taken}
                      completedBy={complaint.resolution_completed_by || complaint.assigned_staff}
                      completedAt={complaint.resolved_at || complaint.updated_at}
                    />

                    {/* Citizen Satisfaction Rating if submitted */}
                    {complaint.citizen_rating && (
                      <div className="bg-white border border-amber-300 rounded-2xl p-4 text-xs space-y-1.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-amber-950 flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span>Citizen Satisfaction Rating</span>
                          </span>
                          <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                            {'★'.repeat(complaint.citizen_rating)} {complaint.citizen_rating} / 5 Stars
                          </span>
                        </div>
                        {complaint.citizen_feedback && (
                          <p className="text-slate-700 italic pl-5">
                            "{complaint.citizen_feedback}"
                          </p>
                        )}
                        {complaint.feedback_submitted_at && (
                          <span className="text-[10px] text-slate-400 pl-5 block">
                            Logged on: {new Date(complaint.feedback_submitted_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Not Completed Warning Card if Not Completed */}
              {complaint.status === 'Not Completed' && (
                <div className="bg-slate-100 border-2 border-slate-300 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-slate-600" />
                      <h4 className="font-black text-slate-900 text-sm">Status: Not Completed</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEscalationReason(complaint.not_completed_reason || 'Drainage repair beyond field crew capacity');
                        setActiveTab('escalate');
                      }}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Escalate Complaint Now</span>
                    </button>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-rose-700 uppercase tracking-wider block text-[10px]">
                        Reason for Incompletion:
                      </span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">
                        "{complaint.not_completed_reason || 'Major drainage repair required.'}"
                      </p>
                    </div>

                    {complaint.not_completed_notes && (
                      <p className="text-slate-600 border-t pt-1.5">
                        {complaint.not_completed_notes}
                      </p>
                    )}

                    {complaint.not_completed_action && (
                      <div className="text-[11px] text-teal-800 font-semibold bg-teal-50 p-2 rounded-xl border border-teal-100">
                        Recommended Next Action: <strong>{complaint.not_completed_action}</strong>
                      </div>
                    )}

                    {complaint.not_completed_image && (
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">Supporting Obstacle Photo:</span>
                        <img
                          src={complaint.not_completed_image}
                          alt="Obstacle"
                          className="h-36 rounded-xl object-cover border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visual Status Timeline & History Audit */}
              <div className="border-t border-slate-200 pt-5">
                <StatusTimeline complaint={complaint} history={history} />
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGN STAFF */}
          {activeTab === 'assign' && (
            <form onSubmit={handleAssignStaff} className="space-y-4 max-w-xl mx-auto">
              <div className="border-b pb-3">
                <h4 className="font-extrabold text-base text-slate-900">
                  Assign Municipal Staff / Field Crew
                </h4>
                <p className="text-xs text-slate-500">
                  Select an authorized crew member or jetting unit. The citizen will automatically receive an in-app notification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Staff Member / Unit:
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    const s = authorities.find((a) => a.id === e.target.value);
                    if (s) setCustomDepartment(s.department);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  {authorities.map((auth) => (
                    <option key={auth.id} value={auth.id}>
                      {auth.name} — {auth.role} ({auth.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Wing / Department:
                </label>
                <input
                  type="text"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800 space-y-1">
                <span className="font-bold">Assignment Audit Note:</span>
                <p>
                  Will record <strong>Assigned By: {currentUser.name} ({currentUser.authority_role || 'Officer'})</strong> at current timestamp.
                  Status will advance from '{complaint.status}' to 'In Progress'.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: UPDATE STATUS */}
          {activeTab === 'status' && (
            <form onSubmit={handleUpdateStatus} className="space-y-5 max-w-xl mx-auto">
              <div className="border-b pb-3">
                <h4 className="font-extrabold text-base text-slate-900">
                  {newStatus === 'Completed'
                    ? 'Resolution Workflow — Mark as Completed'
                    : newStatus === 'Not Completed'
                    ? 'Unresolved Incident — Mark as Not Completed'
                    : 'Update Complaint Status'}
                </h4>
                <p className="text-xs text-slate-500">
                  {newStatus === 'Completed'
                    ? 'Action Taken and verified Resolution Photo are mandatory before marking complete.'
                    : newStatus === 'Not Completed'
                    ? 'State reasons and recommended escalation to deploy heavy machinery or municipal resources.'
                    : 'Transition grievance lifecycle status across municipal department records.'}
                </p>
              </div>

              {/* Status Selector Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Target Status:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Pending', 'In Progress', 'Completed', 'Not Completed'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setNewStatus(st);
                        if (st === 'Completed' && !resolutionActionTaken) {
                          setResolutionActionTaken('Blocked drainage was cleared and accumulated water was removed.');
                        }
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        newStatus === st
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                            : st === 'Not Completed'
                            ? 'bg-slate-800 text-white border-slate-800 shadow-md ring-2 ring-slate-500/20'
                            : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'Completed' && '✓ '}
                      {st === 'Not Completed' && '✕ '}
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* === BRANCH A: COMPLETED RESOLUTION WORKFLOW === */}
              {newStatus === 'Completed' && (
                <div className="space-y-4 bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-300">
                  <div className="flex items-center gap-2 text-emerald-950 font-black text-xs border-b border-emerald-200 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Resolution Verification Requirements</span>
                  </div>

                  {/* 1. Action Taken Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Action Taken by Municipal Staff <span className="text-rose-600">*</span>:
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionActionTaken}
                      onChange={(e) => setResolutionActionTaken(e.target.value)}
                      placeholder="e.g. Blocked drainage was cleared and accumulated water was removed using high-capacity suction jetting unit."
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <p className="text-[11px] text-emerald-800 mt-1">
                      Explain the remediation action taken. This will be visible to the reporting citizen on their resolution page.
                    </p>
                  </div>

                  {/* 2. Resolution Photo with Camera & Gallery */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Resolution Photo (Post-Fix Proof) <span className="text-rose-600">*</span>:
                    </label>

                    {/* Camera live preview if active */}
                    {isCameraActive && (
                      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-video mb-3 shadow-md">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={capturePhotoFromCamera}
                            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-emerald-700"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resolution Photo Preview if captured */}
                    {resolutionProof && !isCameraActive ? (
                      <div className="space-y-2">
                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 aspect-video bg-black shadow-sm group">
                          <img
                            src={resolutionProof}
                            alt="Resolution Proof"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                            AFTER (FIXED)
                          </div>
                          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={startCamera}
                              className="px-2.5 py-1 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retake</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setResolutionProof('')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      !isCameraActive && (
                        <div className="space-y-2">
                          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-300 text-center space-y-2.5">
                            <Camera className="w-8 h-8 text-emerald-600 mx-auto" />
                            <div className="text-xs text-emerald-950 font-bold">
                              Municipal Staff MUST upload a photograph showing problem after it has been fixed
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                              {/* Take Photo button */}
                              <button
                                type="button"
                                onClick={startCamera}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Take Photo</span>
                              </button>

                              {/* Upload from Gallery button */}
                              <label className="px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Upload from Gallery</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, 'resolution')}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Quick high-res testing proof presets */}
                          <div className="pt-1 text-[11px] text-emerald-900">
                            <span className="font-semibold block mb-1">Quick Sample Verified Resolution Photos:</span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setResolutionProof(
                                    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'
                                  )
                                }
                                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-semibold cursor-pointer text-[10px]"
                              >
                                + Dewatered Clear Asphalt Road
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setResolutionProof(
                                    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
                                  )
                                }
                                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-semibold cursor-pointer text-[10px]"
                              >
                                + Desilted Drain Grating
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setResolutionProof(
                                    'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80'
                                  )
                                }
                                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-semibold cursor-pointer text-[10px]"
                              >
                                + Replaced Concrete Culvert Slab
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* 3. Automatic Completion Date & Completed By audit stamp */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Completed By Staff:</span>
                      <strong className="text-slate-900">{currentUser.name} ({currentUser.authority_role || 'Staff'})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Completion Timestamp:</span>
                      <strong className="text-emerald-900 font-mono">{new Date().toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* === BRANCH B: NOT COMPLETED WORKFLOW === */}
              {newStatus === 'Not Completed' && (
                <div className="space-y-4 bg-slate-100 p-4 rounded-2xl border-2 border-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-slate-600" />
                      <span>Not Completed Grievance Record</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEscalationReason(notCompletedReason);
                        setActiveTab('escalate');
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Flame className="w-3 h-3" />
                      <span>Escalate to Higher Authority Now</span>
                    </button>
                  </div>

                  {/* 1. Reason selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Reason Problem Could Not Be Fixed <span className="text-rose-600">*</span>:
                    </label>
                    <select
                      value={notCompletedReason}
                      onChange={(e) => setNotCompletedReason(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-500"
                      required
                    >
                      <option value="Major drainage repair required">
                        Major drainage repair required
                      </option>
                      <option value="Requires heavy excavator / JCB machinery from Central Depot">
                        Requires heavy excavator / JCB machinery from Central Depot
                      </option>
                      <option value="Collapsed underground brick sewer structure endangering road">
                        Collapsed underground brick sewer structure endangering road
                      </option>
                      <option value="Severe water accumulation exceeding ward dewatering pump capacity">
                        Severe water accumulation exceeding ward dewatering pump capacity
                      </option>
                      <option value="Underground utility conflict (Water mains / High-tension cable)">
                        Underground utility conflict (Water mains / High-tension cable)
                      </option>
                    </select>
                  </div>

                  {/* 2. Detailed Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Detailed Field Notes & Observations <span className="text-rose-600">*</span>:
                    </label>
                    <textarea
                      rows={3}
                      value={notCompletedNotes}
                      onChange={(e) => setNotCompletedNotes(e.target.value)}
                      placeholder="Specify the physical hurdles: e.g. Silt depth exceeds manual shovel dredging; 600mm trunk line requires hydraulic backhoe and municipal engineering squad."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      required
                    />
                  </div>

                  {/* 3. Recommended Next Action */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Recommended Next Action:
                    </label>
                    <input
                      type="text"
                      value={notCompletedAction}
                      onChange={(e) => setNotCompletedAction(e.target.value)}
                      placeholder="e.g. Escalate to Level 3 Zonal Officer for heavy machinery deployment."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>

                  {/* 4. Optional Supporting Obstacle Photograph */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Optional Supporting Photograph (Obstacle / Machinery Need):
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-50">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Photo Proof</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'notCompleted')}
                        />
                      </label>
                      {notCompletedPhoto && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Photo Attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* === BRANCH C: GENERAL PROGRESS / PENDING NOTES === */}
              {newStatus !== 'Completed' && newStatus !== 'Not Completed' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Field Progress Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="e.g. Crew arrived on site at 10:15 AM with 10HP suction pump set; clearing inlet channel."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              )}

              {/* Modal Form Submission Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setActiveTab('view');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className={`px-6 py-2.5 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                    newStatus === 'Completed'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : newStatus === 'Not Completed'
                      ? 'bg-slate-800 hover:bg-slate-900'
                      : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : newStatus === 'Completed' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>
                    {newStatus === 'Completed'
                      ? 'Submit Resolution & Mark Completed'
                      : newStatus === 'Not Completed'
                      ? 'Record as Not Completed'
                      : 'Save Status Transition'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ESCALATE COMPLAINT */}
          {activeTab === 'escalate' && (
            <form onSubmit={handleEscalate} className="space-y-4 max-w-xl mx-auto">
              <div className="border-b pb-3">
                <h4 className="font-extrabold text-base text-rose-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  <span>Escalate Complaint to Higher Authority</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Forward unresolved or severe flooding incidents up the municipal administrative ladder.
                </p>
              </div>

              {/* Hierarchy Stepper Visual */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-2">
                <span className="font-extrabold text-rose-950 uppercase tracking-wider block text-[10px]">
                  Administrative Escalation Path
                </span>
                <div className="flex items-center justify-between text-center gap-1">
                  <div className={`p-2 rounded-xl flex-1 ${complaint.authority_level === 1 ? 'bg-slate-200 font-bold' : 'bg-white'}`}>
                    Level 1: Staff
                  </div>
                  <span>↓</span>
                  <div className={`p-2 rounded-xl flex-1 ${complaint.authority_level === 2 ? 'bg-slate-200 font-bold' : nextLevel === 2 ? 'bg-rose-600 text-white font-bold animate-pulse' : 'bg-white'}`}>
                    Level 2: Ward Officer
                  </div>
                  <span>↓</span>
                  <div className={`p-2 rounded-xl flex-1 ${complaint.authority_level === 3 ? 'bg-slate-200 font-bold' : nextLevel === 3 ? 'bg-rose-600 text-white font-bold animate-pulse' : 'bg-white'}`}>
                    Level 3: Zonal Officer
                  </div>
                  <span>↓</span>
                  <div className={`p-2 rounded-xl flex-1 ${nextLevel === 4 ? 'bg-rose-600 text-white font-bold animate-pulse' : 'bg-white'}`}>
                    Level 4: Higher Authority
                  </div>
                </div>
                <p className="text-[11px] text-rose-800 font-semibold pt-1">
                  Target Destination: <strong>Level {nextLevel} — {levelRoleNames[nextLevel]}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Escalation Justification Reason:
                </label>
                <select
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="Critical water accumulation exceeding standard drainage capacity">
                    Critical water accumulation exceeding standard drainage capacity
                  </option>
                  <option value="Specialized high-capacity dewatering pumps required from central depot">
                    Specialized high-capacity dewatering pumps required from central depot
                  </option>
                  <option value="Structural damage or collapsed culvert slab endangering traffic">
                    Structural damage or collapsed culvert slab endangering traffic
                  </option>
                  <option value="Inter-departmental jurisdiction conflict requiring Commissioner intervention">
                    Inter-departmental jurisdiction conflict requiring Commissioner intervention
                  </option>
                  <option value="Unresolved beyond SLA threshold (48 hours overdue)">
                    Unresolved beyond SLA threshold (48 hours overdue)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Administrative Escalation Notes:
                </label>
                <textarea
                  rows={3}
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  placeholder="Detail field conditions, equipment needed, and recommended emergency action..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isEscalating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                  <span>Authorize Escalation to Level {nextLevel}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: PRIORITY UPDATE */}
          {activeTab === 'priority' && (
            <form onSubmit={handleUpdatePriority} className="space-y-4 max-w-xl mx-auto">
              <div className="border-b pb-3">
                <h4 className="font-extrabold text-base text-slate-900">Update Incident Priority</h4>
                <p className="text-xs text-slate-500">
                  Set urgency to triage field response and alert emergency squads.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['Low', 'Medium', 'High', 'Critical'] as ComplaintPriority[]).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setSelectedPriority(pr)}
                    className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                      selectedPriority === pr
                        ? pr === 'Critical'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-103'
                          : pr === 'High'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-103'
                          : 'bg-teal-600 text-white border-teal-600 shadow-md scale-103'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">
                      {pr === 'Critical' ? '🔴' : pr === 'High' ? '🟠' : pr === 'Medium' ? '🟡' : '🟢'}
                    </span>
                    <span>{pr}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPriority}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isUpdatingPriority ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Priority</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">
            Logged: {new Date(complaint.created_at).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
