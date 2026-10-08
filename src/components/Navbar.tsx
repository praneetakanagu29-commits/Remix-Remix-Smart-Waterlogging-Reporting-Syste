import React, { useState, useEffect } from 'react';
import {
  Waves,
  ShieldAlert,
  QrCode,
  User,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  PhoneCall,
  MapPin,
  Bell,
  ShieldCheck,
  Building,
  Search,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface Props {
  currentUser: UserType | null;
  onLogout: () => void;
  onOpenQRSimulator: () => void;
  activeWard: string;
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'select-problem' | 'report' | 'auth' | 'admin-dashboard' | 'tracking') => void;
  onSelectComplaintFromNotif?: (complaintId: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onLogout,
  onOpenQRSimulator,
  activeWard,
  currentPage,
  onNavigate,
  onSelectComplaintFromNotif,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll unread notifications periodically if user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const checkNotifs = async () => {
      try {
        const data = await api.getNotifications();
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // quiet ignore
      }
    };

    checkNotifs();
    const interval = setInterval(checkNotifs, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const isAuthority = currentUser?.role === 'authority';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Municipal Top Advisory Strip */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Greater Municipal Corporation • Monsoon Flood Monitoring Wing
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-3 h-3 text-teal-400" />
              <span>
                24x7 Control Room:{' '}
                <strong className="text-white font-mono">1800-419-3312</strong>
              </span>
            </div>
            <button
              onClick={onOpenQRSimulator}
              className="text-teal-300 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
            >
              <QrCode className="w-3 h-3" />
              <span>Simulate QR Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand & Logo */}
        <div
          onClick={() => {
            if (!currentUser) onNavigate('auth');
            else if (isAuthority) onNavigate('admin-dashboard');
            else onNavigate('dashboard');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-teal-600 to-emerald-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <Waves className="w-5 h-5 text-teal-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                Smart Waterlogging Reporting System
              </h1>
            </div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-teal-700">
              Report. Track. Resolve.
            </p>
          </div>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active QR Ward pill */}
          <button
            onClick={onOpenQRSimulator}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Click to simulate scanning a physical street QR code"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span className="truncate max-w-[150px] font-semibold">
              {activeWard || 'Ward 12 - South Lake'}
            </span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-1.5 py-0.5 rounded">
              QR Tag
            </span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Navigation based on Role */}
              {isAuthority ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('admin-dashboard')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'admin-dashboard'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Command</span>
                  </button>

                  <button
                    onClick={() => onNavigate('select-problem')}
                    className="hidden sm:flex px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Test Report Flow</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'dashboard'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => onNavigate('tracking')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 'tracking'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span>Track Grievance</span>
                  </button>

                  <button
                    onClick={() => onNavigate('select-problem')}
                    className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Problem</span>
                  </button>
                </div>
              )}

              {/* Notification Bell Button */}
              <button
                type="button"
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User badge & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-teal-700">
                    {currentUser.authority_role
                      ? `${currentUser.authority_role} (Lvl ${currentUser.authority_level || 1})`
                      : 'Citizen'}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Notification Center Drawer */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onSelectComplaint={onSelectComplaintFromNotif}
        onNotificationRead={() => {
          api.getNotifications().then((d) => setUnreadCount(d.unreadCount || 0));
        }}
      />
    </header>
  );
};
