import React, { useState } from 'react';
import { Camera, CheckCircle2, AlertTriangle, ArrowLeftRight, Maximize2 } from 'lucide-react';

interface Props {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  actionTaken?: string;
  completedBy?: string;
  completedAt?: string;
}

export const BeforeAfterViewer: React.FC<Props> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE: Citizen Report Photo',
  afterLabel = 'AFTER: Municipal Resolution Photo',
  actionTaken,
  completedBy,
  completedAt,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'slider'>('side-by-side');

  if (!beforeImage && !afterImage) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>Visual Evidence Verification</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Before & After Comparison
            </span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Compare the initial waterlogged hazard with the post-remediation street condition
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side by Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              viewMode === 'slider'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>Interactive Split</span>
          </button>
        </div>
      </div>

      {/* SIDE BY SIDE MODE */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{beforeLabel}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Reported by Citizen</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-900 shadow-inner group">
              {beforeImage ? (
                <img
                  src={beforeImage}
                  alt="Before waterlogging"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Camera className="w-6 h-6 mb-1 opacity-50" />
                  <span>No Initial Photo Attached</span>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                BEFORE
              </div>
            </div>
          </div>

          {/* After Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{afterLabel}</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Verified by Municipality</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/60 aspect-video bg-slate-900 shadow-md group">
              {afterImage ? (
                <img
                  src={afterImage}
                  alt="After remediation"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Camera className="w-6 h-6 mb-1 opacity-50" />
                  <span>Resolution Photo Pending</span>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                AFTER (RESOLVED)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE SPLIT SLIDER MODE */}
      {viewMode === 'slider' && beforeImage && afterImage && (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-300 aspect-video bg-slate-900 select-none shadow-md">
            {/* After image base */}
            <img
              src={afterImage}
              alt="After resolution"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold shadow-md z-10">
              AFTER (Fixed)
            </div>

            {/* Before image clipped */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-white shadow-2xl"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={beforeImage}
                alt="Before waterlogging"
                className="absolute inset-y-0 left-0 max-w-none h-full object-cover"
                style={{ width: '100%', minWidth: '100%' }}
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 text-white text-[11px] font-bold backdrop-blur-xs">
                BEFORE (Flooded)
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute inset-y-0 flex items-center justify-center pointer-events-none -translate-x-1/2"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-teal-600 flex items-center justify-center text-xs font-bold">
                ⬌
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 pt-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px]">Slide to compare:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="flex-1 accent-teal-600 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-700 text-xs w-10 text-right">
              {sliderPos}%
            </span>
          </div>
        </div>
      )}

      {/* Action Taken & Completion Metadata */}
      {(actionTaken || completedBy || completedAt) && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2">
          {actionTaken && (
            <div>
              <span className="font-bold text-emerald-950 uppercase tracking-wider block text-[10px] mb-0.5">
                Municipal Action Taken:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                "{actionTaken}"
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-100 text-[11px] text-slate-600">
            {completedBy && (
              <div>
                Completed By:{' '}
                <strong className="text-slate-900 font-bold">{completedBy}</strong>
              </div>
            )}
            {completedAt && (
              <div>
                Completed On:{' '}
                <span className="font-mono text-slate-700">
                  {new Date(completedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
