import React from 'react';
import { CitizenFAQ } from '../components/CitizenFAQ';
import { User } from '../types';
import { ArrowLeft, BookOpen, FilePlus2, Search } from 'lucide-react';

interface CitizenFAQPageProps {
  currentUser?: User | null;
  onBackToDashboard: () => void;
  onNavigateToReport: () => void;
  onNavigateToTracking: (docketId?: string) => void;
}

export const CitizenFAQPage: React.FC<CitizenFAQPageProps> = ({
  currentUser,
  onBackToDashboard,
  onNavigateToReport,
  onNavigateToTracking,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white border-b border-teal-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-teal-300 bg-teal-950/70 px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Citizen Knowledge Base</span>
                </span>
                <span className="text-xs text-slate-400">
                  Municipal Monsoon Protocol v2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Reporting & Resolution Guidance Center
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl">
                Clear instructions on creating high-impact grievance reports, taking verifiable photo evidence, and tracking municipal field dewatering operations from start to finish.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
              <button
                type="button"
                onClick={onNavigateToReport}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-teal-950/40 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>Report Problem</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main FAQ Component */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <CitizenFAQ
          onNavigateToReport={onNavigateToReport}
          onNavigateToTracking={onNavigateToTracking}
          onBackToDashboard={onBackToDashboard}
          isEmbedded={false}
        />
      </div>
    </div>
  );
};
