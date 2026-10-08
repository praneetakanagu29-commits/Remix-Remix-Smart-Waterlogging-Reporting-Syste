import React from 'react';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  AlertTriangle,
  UserCheck,
  Flame,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Complaint, StatusHistory } from '../types';

interface Props {
  complaint: Complaint;
  history?: StatusHistory[];
}

export const StatusTimeline: React.FC<Props> = ({ complaint, history = [] }) => {
  const isEscalated = complaint.status === 'Escalated' || complaint.authority_level > 1;
  const isCompleted = complaint.status === 'Completed';
  const isNotCompleted = complaint.status === 'Not Completed';
  const isInProgress = complaint.status === 'In Progress' || isCompleted || isNotCompleted;
  const isAssigned = Boolean(complaint.assigned_staff && complaint.assigned_staff !== 'Pending Staff Assignment');

  const levelRoleNames: Record<number, string> = {
    1: 'Municipal Staff',
    2: 'Ward Officer',
    3: 'Zonal Officer',
    4: 'Higher Municipal Authority',
  };

  return (
    <div className="space-y-4">
      {/* Visual Step Progress Tracker */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Lifecycle Progression
        </h5>

        <div className="relative flex items-center justify-between text-xs">
          {/* Background Connecting Line */}
          <div className="absolute left-6 right-6 top-4 -translate-y-1/2 h-1 bg-slate-200 z-0" />
          <div
            className={`absolute left-6 top-4 -translate-y-1/2 h-1 z-0 transition-all duration-500 ${
              isCompleted
                ? 'bg-emerald-500 right-6'
                : isEscalated
                ? 'bg-rose-500 w-3/4'
                : isInProgress
                ? 'bg-sky-500 w-1/2'
                : isAssigned
                ? 'bg-teal-500 w-1/4'
                : 'bg-teal-500 w-8'
            }`}
          />

          {/* Step 1: Submitted */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800 mt-1.5 text-[11px]">Submitted</span>
            <span className="text-[10px] text-slate-400">Citizen Logged</span>
          </div>

          {/* Step 2: Assigned */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${
                isAssigned ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {isAssigned ? <UserCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <span className={`font-bold mt-1.5 text-[11px] ${isAssigned ? 'text-teal-900' : 'text-slate-400'}`}>
              Assigned
            </span>
            <span className="text-[10px] text-slate-400">
              {complaint.assigned_staff ? complaint.assigned_staff.split(' ')[0] : 'Pending'}
            </span>
          </div>

          {/* Step 3: In Progress */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${
                isInProgress ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${complaint.status === 'In Progress' ? 'animate-spin' : ''}`} />
            </div>
            <span className={`font-bold mt-1.5 text-[11px] ${isInProgress ? 'text-sky-900' : 'text-slate-400'}`}>
              In Progress
            </span>
            <span className="text-[10px] text-slate-400">Field Work</span>
          </div>

          {/* Step 4: Resolved or Escalated */}
          {isEscalated ? (
            <div className="relative z-10 flex flex-col items-center text-center max-w-[90px]">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold shadow-md animate-pulse">
                <Flame className="w-4 h-4" />
              </div>
              <span className="font-bold text-rose-700 mt-1.5 text-[11px]">Escalated</span>
              <span className="text-[10px] font-bold text-rose-600">
                Lvl {complaint.authority_level}
              </span>
            </div>
          ) : isNotCompleted ? (
            <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold shadow-sm">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 mt-1.5 text-[11px]">Not Done</span>
              <span className="text-[10px] text-slate-400">Action Needed</span>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm transition-colors ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className={`font-bold mt-1.5 text-[11px] ${isCompleted ? 'text-emerald-900' : 'text-slate-400'}`}>
                Completed
              </span>
              <span className="text-[10px] text-slate-400">Dewatered</span>
            </div>
          )}
        </div>
      </div>

      {/* Escalation Notification Banner if escalated */}
      {isEscalated && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
          <div className="p-2 bg-rose-600 text-white rounded-xl shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h6 className="font-extrabold text-rose-900 flex items-center gap-2">
              <span>Escalated to Level {complaint.authority_level} ({levelRoleNames[complaint.authority_level] || 'Higher Authority'})</span>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] uppercase font-bold">
                Active Priority: {complaint.priority}
              </span>
            </h6>
            {complaint.escalation_reason && (
              <p className="text-rose-800 font-medium">
                <strong>Reason:</strong> {complaint.escalation_reason}
              </p>
            )}
            <p className="text-rose-700/90 text-[11px]">
              This complaint exceeded standard field capacity and has been prioritized for direct intervention by the {levelRoleNames[complaint.authority_level]}.
            </p>
          </div>
        </div>
      )}

      {/* Audit History Log */}
      <div>
        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
          Official Audit History & Timeline Log
        </h5>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No timeline events recorded yet.</p>
        ) : (
          <div className="border-l-2 border-teal-500/80 ml-3 space-y-4 py-1">
            {history.map((item, idx) => {
              const isEscalationEvent = item.action_type === 'escalation' || item.new_status === 'Escalated';
              const isCompletionEvent = item.new_status === 'Completed';

              return (
                <div key={item.id || idx} className="relative pl-6 text-xs">
                  {/* Dot */}
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                      isEscalationEvent
                        ? 'bg-rose-600'
                        : isCompletionEvent
                        ? 'bg-emerald-600'
                        : item.action_type === 'assignment'
                        ? 'bg-teal-600'
                        : 'bg-blue-600'
                    }`}
                  />

                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold text-slate-900">
                      {isEscalationEvent
                        ? '🔺 Escalated to Higher Authority'
                        : item.action_type === 'assignment'
                        ? '👤 Staff Assigned'
                        : `Status: ${item.new_status}`}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                    Authorized By: <span className="text-slate-800 font-bold">{item.changed_by}</span>
                  </div>

                  {item.notes && (
                    <div className="mt-1 p-2 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 text-xs">
                      {item.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
