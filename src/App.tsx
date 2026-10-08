import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QRSimulatorModal } from './components/QRSimulatorModal';
import { AuthLanding } from './pages/AuthLanding';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { SelectProblem } from './pages/SelectProblem';
import { ReportProblem } from './pages/ReportProblem';
import { CitizenTrackingPage } from './pages/CitizenTrackingPage';
import { api } from './services/api';
import { ProblemType, User } from './types';
import { QrCode, ShieldAlert, Waves, PhoneCall } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<
    'auth' | 'dashboard' | 'select-problem' | 'report' | 'admin-dashboard' | 'tracking'
  >('auth');
  const [selectedProblem, setSelectedProblem] = useState<ProblemType>('Waterlogging');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeWard, setActiveWard] = useState('Ward 12 - South Lake');
  const [activeLocality, setActiveLocality] = useState('South Lake Colony, Sector 14 Metro Junction');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [targetComplaintFromNotif, setTargetComplaintFromNotif] = useState<string | null>(null);
  const [trackingComplaintId, setTrackingComplaintId] = useState<string | null>(null);

  // 1. Detect QR code parameters from URL on boot
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wardParam = params.get('ward');
    const localityParam = params.get('locality');

    if (wardParam) {
      const decodedWard = decodeURIComponent(wardParam).replace(/-/g, ' ');
      setActiveWard(decodedWard);
    }
    if (localityParam) {
      setActiveLocality(decodeURIComponent(localityParam));
    }

    // 2. Check for active login session
    const storedUser = api.getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
      // Route based on role
      if (storedUser.role === 'authority') {
        setCurrentPage('admin-dashboard');
      } else {
        setCurrentPage('dashboard');
      }

      // Silently verify with server
      api
        .getMe()
        .then((freshUser) => {
          setCurrentUser(freshUser);
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
          setCurrentPage('auth');
        });
    } else {
      setCurrentPage('auth');
    }

    setIsAuthChecking(false);
  }, []);

  // Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.locality) {
      setActiveWard(user.locality);
    }
    // Strict RBAC routing: Authority goes to admin dashboard, Citizen goes to citizen dashboard
    if (user.role === 'authority') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleSelectWardFromQR = (wardCode: string, locality: string) => {
    setActiveWard(wardCode);
    setActiveLocality(locality);
  };

  const handleStartReport = () => {
    setCurrentPage('select-problem');
  };

  const handleProblemSelected = (type: ProblemType) => {
    setSelectedProblem(type);
  };

  const handleProceedToForm = () => {
    setCurrentPage('report');
  };

  // Safe navigation with RBAC enforcement
  const handleNavigate = (
    page: 'dashboard' | 'select-problem' | 'report' | 'auth' | 'admin-dashboard' | 'tracking'
  ) => {
    // If a citizen tries to navigate to admin dashboard, block and redirect to dashboard
    if (page === 'admin-dashboard' && currentUser?.role !== 'authority') {
      setCurrentPage('dashboard');
      return;
    }
    setCurrentPage(page);
  };

  // Open dedicated tracking page
  const handleOpenTracking = (complaintId?: string) => {
    if (complaintId) setTrackingComplaintId(complaintId);
    setCurrentPage('tracking');
  };

  // When clicking a notification
  const handleSelectComplaintFromNotif = (complaintId: string) => {
    setTargetComplaintFromNotif(complaintId);
    if (currentUser?.role === 'authority') {
      setCurrentPage('admin-dashboard');
    } else {
      setTrackingComplaintId(complaintId);
      setCurrentPage('tracking');
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-teal-200">
          Smart Waterlogging Reporting System Initializing...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenQRSimulator={() => setIsQRModalOpen(true)}
        activeWard={activeWard}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSelectComplaintFromNotif={handleSelectComplaintFromNotif}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentPage === 'auth' && (
          <AuthLanding
            onLoginSuccess={handleLoginSuccess}
            activeWard={activeWard}
            activeLocality={activeLocality}
            onOpenQRSimulator={() => setIsQRModalOpen(true)}
          />
        )}

        {currentPage === 'dashboard' && currentUser && currentUser.role === 'citizen' && (
          <CitizenDashboard
            user={currentUser}
            onNavigateToReport={handleStartReport}
            activeWard={activeWard}
            onOpenQRSimulator={() => setIsQRModalOpen(true)}
            onNavigateToTracking={handleOpenTracking}
            initialSelectedComplaintId={targetComplaintFromNotif}
            onClearInitialComplaintId={() => setTargetComplaintFromNotif(null)}
          />
        )}

        {currentPage === 'tracking' && (
          <CitizenTrackingPage
            initialComplaintId={trackingComplaintId}
            currentUser={currentUser}
            onBackToDashboard={() => {
              if (currentUser?.role === 'authority') setCurrentPage('admin-dashboard');
              else setCurrentPage(currentUser ? 'dashboard' : 'auth');
            }}
          />
        )}

        {currentPage === 'admin-dashboard' && currentUser && currentUser.role === 'authority' && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {currentPage === 'select-problem' && (
          <SelectProblem
            selectedProblem={selectedProblem}
            onSelectProblem={handleProblemSelected}
            onProceed={handleProceedToForm}
            onBack={() => {
              if (currentUser?.role === 'authority') setCurrentPage('admin-dashboard');
              else setCurrentPage(currentUser ? 'dashboard' : 'auth');
            }}
            activeWard={activeWard}
          />
        )}

        {currentPage === 'report' && currentUser && (
          <ReportProblem
            user={currentUser}
            problemType={selectedProblem}
            activeWard={activeWard}
            onBackToProblemSelect={() => setCurrentPage('select-problem')}
            onGoToDashboard={() => {
              if (currentUser.role === 'authority') setCurrentPage('admin-dashboard');
              else setCurrentPage('dashboard');
            }}
            onResetReport={() => {
              setSelectedProblem('Waterlogging');
              setCurrentPage('select-problem');
            }}
          />
        )}
      </main>

      {/* Floating QR Simulator Trigger Button for Quick Evaluation */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsQRModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-900 to-teal-800 hover:from-blue-950 hover:to-teal-900 text-white rounded-2xl shadow-xl border border-teal-500/40 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Simulate scanning a street QR code for testing different wards"
        >
          <QrCode className="w-4 h-4 text-teal-300" />
          <span className="hidden sm:inline">Simulate QR Scan</span>
          <span className="bg-teal-500/30 text-teal-200 px-1.5 py-0.5 rounded text-[10px]">
            Demo
          </span>
        </button>
      </div>

      {/* QR Simulator Modal */}
      <QRSimulatorModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onSelectWard={handleSelectWardFromQR}
        currentWard={activeWard}
      />

      {/* Municipal Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200">
                Smart Waterlogging Reporting System • Municipal E-Governance Platform
              </p>
              <p className="text-[11px] text-slate-500">
                Connected Citizen Grievance Redressal, Field Crew Triage & Multi-Tier Escalations
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-teal-400">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Toll-Free Control Room: 1800-419-3312</span>
            </span>
            <span>Tagline: “Report. Track. Resolve.”</span>
            <span className="text-slate-500 font-mono">Part 1 & 2 Live</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
