import React, { useState } from 'react';
import {
  Waves,
  AlertTriangle,
  Droplets,
  Construction,
  Trash2,
  CloudRain,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { ProblemType } from '../types';

interface Props {
  selectedProblem: ProblemType | '';
  onSelectProblem: (problem: ProblemType) => void;
  onProceed: () => void;
  onBack: () => void;
  activeWard: string;
}

interface CategoryOption {
  type: ProblemType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
  color: string;
  badge?: string;
}

const PROBLEM_CATEGORIES: CategoryOption[] = [
  {
    type: 'Waterlogging',
    title: 'Waterlogging',
    description: 'Standing stormwater inundating streets, intersections, and public walkways.',
    icon: Waves,
    isPrimary: true,
    color: 'from-blue-600 to-teal-600',
    badge: 'Primary Category • Most Frequent',
  },
  {
    type: 'Road Flooding',
    title: 'Road Flooding',
    description: 'Deep road submergence hindering vehicular movement or submerging vehicles.',
    icon: CloudRain,
    color: 'from-blue-700 to-indigo-700',
    badge: 'High Traffic Impact',
  },
  {
    type: 'Drainage Blockage',
    title: 'Drainage Blockage',
    description: 'Subsurface conduits or culverts choked by mud, silt, or construction debris.',
    icon: Construction,
    color: 'from-amber-600 to-orange-700',
  },
  {
    type: 'Open/Blocked Drain',
    title: 'Open / Blocked Drain',
    description: 'Missing concrete slab or uncovered stormwater trench creating pedestrian hazard.',
    icon: AlertTriangle,
    color: 'from-rose-600 to-amber-700',
    badge: 'Immediate Safety Hazard',
  },
  {
    type: 'Rainwater Accumulation',
    title: 'Rainwater Accumulation',
    description: 'Stagnant rain pools in residential localities, parks, or school compounds.',
    icon: Droplets,
    color: 'from-cyan-600 to-blue-600',
  },
  {
    type: 'Garbage Blocking Drain',
    title: 'Garbage Blocking Drain',
    description: 'Plastic bags, household trash, or plant waste accumulated at drainage grates.',
    icon: Trash2,
    color: 'from-emerald-600 to-teal-700',
  },
  {
    type: 'Overflowing Drain',
    title: 'Overflowing Drain',
    description: 'Sewer or roadside gutter water spilling out onto roads with foul odor.',
    icon: Waves,
    color: 'from-purple-600 to-indigo-700',
  },
  {
    type: 'Other',
    title: 'Other Drainage Issue',
    description: 'Unusual flooding, pump failure, or structural damage not listed above.',
    icon: HelpCircle,
    color: 'from-slate-600 to-slate-800',
  },
];

export const SelectProblem: React.FC<Props> = ({
  selectedProblem,
  onSelectProblem,
  onProceed,
  onBack,
  activeWard,
}) => {
  const [currentSelected, setCurrentSelected] = useState<ProblemType>(
    (selectedProblem as ProblemType) || 'Waterlogging'
  );

  const handleCardClick = (type: ProblemType) => {
    setCurrentSelected(type);
    onSelectProblem(type);
  };

  const handleContinue = () => {
    onSelectProblem(currentSelected);
    onProceed();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-200 flex items-center gap-1.5">
              <span>Step 1: Select Problem</span>
            </span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-500 font-medium">Step 2: Details & Evidence</span>
            <span className="text-slate-400">→</span>
            <span className="text-slate-500 font-medium">Step 3: Review & Submit</span>
          </div>
        </div>

        {/* Headline Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Reporting for {activeWard || 'Ward 12 - South Lake'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What problem are you experiencing?
          </h2>

          <p className="text-xs sm:text-sm text-slate-600">
            Select the category that best matches the issue. This routes your report directly to the
            specialized municipal response crew.
          </p>
        </div>

        {/* 8 FIXED SELECTABLE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROBLEM_CATEGORIES.map((item) => {
            const isSelected = currentSelected === item.type;
            const Icon = item.icon;

            return (
              <div
                key={item.type}
                onClick={() => handleCardClick(item.type)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  item.isPrimary
                    ? isSelected
                      ? 'bg-gradient-to-b from-blue-50 to-teal-50 border-2 border-teal-600 shadow-lg ring-4 ring-teal-500/20 scale-102'
                      : 'bg-white border-2 border-teal-400/80 shadow-md hover:border-teal-600 hover:shadow-lg'
                    : isSelected
                    ? 'bg-teal-50/70 border-2 border-teal-600 shadow-md ring-2 ring-teal-500/20 scale-102'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Primary or Special Badge */}
                {item.badge && (
                  <div className="mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.isPrimary
                          ? 'bg-teal-600 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Icon & Selection Indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${item.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-slate-50'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4 fill-teal-600 text-white" />}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                {/* Bottom hint */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`font-semibold ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                    {isSelected ? 'Selected Category' : 'Click to select'}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'text-teal-600 translate-x-1' : 'text-slate-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Proceed Action Strip */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Selected Problem:</span>
              <span className="text-base font-extrabold text-slate-900">
                {currentSelected}
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleContinue}
              className="flex-1 sm:flex-none px-7 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Continue to Photo & Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
