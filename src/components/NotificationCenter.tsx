import React, { useEffect, useState } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Flame,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Notification } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint?: (complaintId: string) => void;
  onNotificationRead?: () => void;
}

export const NotificationCenter: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectComplaint,
  onNotificationRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.warn('Mark read failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 mt-14 sm:mt-12 mr-0 sm:mr-4">
        {/* Header */}
        <div className="p-4.5 bg-gradient-to-r from-blue-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Bell className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Municipal In-App Alerts</h4>
              <p className="text-[11px] text-teal-200">
                Live lifecycle updates, assignments & escalations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No Notifications Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                You will receive alerts here whenever complaints are assigned, escalated, or updated.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.read_status;
              const isEscalation = n.type === 'escalation' || n.message.includes('escalated');
              const isAssignment = n.type === 'assignment' || n.message.includes('assigned');
              const isCompleted = n.message.includes('Completed');

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (onSelectComplaint && n.complaint_id) {
                      onSelectComplaint(n.complaint_id);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    isUnread
                      ? 'bg-teal-50/60 border-teal-200 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isEscalation
                        ? 'bg-rose-100 text-rose-700'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isAssignment
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-teal-100 text-teal-700'
                    }`}
                  >
                    {isEscalation ? (
                      <Flame className="w-4 h-4" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isAssignment ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      {n.complaint_id && (
                        <span className="font-mono font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {n.complaint_id}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {n.message}
                    </p>

                    <div className="flex justify-between items-center pt-1.5 text-[11px]">
                      {n.complaint_id && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectComplaint) {
                              onSelectComplaint(n.complaint_id);
                              onClose();
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer shadow-2xs transition-colors ${
                            n.action_type === 'view_resolution' || n.type === 'resolution'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-teal-600 hover:bg-teal-700 text-white'
                          }`}
                        >
                          {n.action_label || (n.type === 'resolution' ? 'View Resolution' : 'Track Grievance')}
                        </button>
                      )}

                      {isUnread ? (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="text-teal-700 hover:text-teal-900 font-bold text-[10px] flex items-center gap-1 hover:underline ml-auto"
                        >
                          <Check className="w-3 h-3" /> Mark as read
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px] ml-auto">Read</span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <span className="text-[11px] text-slate-500">
            Real-time synchronization with Municipal Central Server
          </span>
        </div>
      </div>
    </div>
  );
};
