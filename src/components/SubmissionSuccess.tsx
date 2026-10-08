import React from 'react';
import {
  CheckCircle,
  MapPin,
  Calendar,
  Building2,
  ShieldCheck,
  FileText,
  Printer,
  ArrowRight,
  PlusCircle,
  LayoutDashboard,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Complaint } from '../types';

interface Props {
  complaint: Complaint;
  onGoToDashboard: () => void;
  onReportAnother: () => void;
}

export const SubmissionSuccess: React.FC<Props> = ({
  complaint,
  onGoToDashboard,
  onReportAnother,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Animated Success Badge */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-200 shadow-xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Grievance Registered Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Complaint Docket Generated
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Your waterlogging grievance has been logged and assigned to the municipal rapid flood
              response team.
            </p>
          </div>

          {/* Prominent Unique Complaint ID Card */}
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950 text-white rounded-2xl p-5 shadow-lg space-y-2">
            <div className="text-xs text-teal-300 font-bold uppercase tracking-wider">
              Official Tracking Docket Number
            </div>
            <div className="text-2xl sm:text-4xl font-mono font-black tracking-wider text-white">
              {complaint.complaint_id}
            </div>
            <div className="text-[11px] text-slate-300">
              Keep this ID handy for future SMS/Helpline follow-ups with Municipal Ward Control
            </div>
          </div>

          {/* Structured Details Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 text-left space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Problem Category:</span>
              <span className="font-bold text-slate-900 text-sm">{complaint.problem_type}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <Clock className="w-3 h-3 text-amber-600" />
                {complaint.status} — Initial Triage
              </span>
            </div>

            <div className="flex justify-between items-start pb-2 border-b border-slate-200 gap-4">
              <span className="text-slate-500 font-medium shrink-0">Exact Location:</span>
              <span className="font-medium text-slate-800 text-right">
                {complaint.address}
                <span className="block font-mono text-[11px] text-slate-400">
                  Lat: {complaint.latitude} | Lng: {complaint.longitude}
                </span>
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Submission Timestamp:</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(complaint.created_at).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Assigned Authority:</span>
              <span className="font-bold text-teal-800 flex items-center gap-1 text-right">
                <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {complaint.municipality}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Responsible Wing:</span>
              <span className="font-semibold text-slate-800 text-right">
                {complaint.department || 'Stormwater Drainage & Flood Management Wing'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onGoToDashboard}
              className="py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>View in My Complaints</span>
            </button>

            <button
              type="button"
              onClick={onReportAnother}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Another Problem</span>
            </button>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Acknowledgment Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
