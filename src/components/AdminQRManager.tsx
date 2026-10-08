import React, { useState } from 'react';
import {
  QrCode,
  Printer,
  Download,
  ExternalLink,
  MapPin,
  Building2,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface Props {
  onSimulateWardScan: (wardCode: string, locality: string) => void;
}

export const AdminQRManager: React.FC<Props> = ({ onSimulateWardScan }) => {
  const [wardCode, setWardCode] = useState('Ward 15 — Main Road');
  const [localityName, setLocalityName] = useState('Main Road Commercial Corridor & Underpass');
  const [officerInCharge, setOfficerInCharge] = useState('Engr. P. S. Kulkarni (Zonal Drainage Wing)');
  const [helpline, setHelpline] = useState('1800-419-3315');

  // Build target QR code URL
  const baseUrl = window.location.origin || 'https://sws.gov.in';
  const targetUrl = `${baseUrl}/?ward=${encodeURIComponent(
    wardCode.replace(/\s+/g, '-')
  )}&locality=${encodeURIComponent(localityName)}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    targetUrl
  )}`;

  const handlePrint = () => {
    window.print();
  };

  const handleQuickPreset = (wCode: string, loc: string, off: string, phone: string) => {
    setWardCode(wCode);
    setLocalityName(loc);
    setOfficerInCharge(off);
    setHelpline(phone);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-600" />
              <span>Municipal Physical QR Signboard Generator</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Generate, customize, and print waterproof on-site QR placards for lamp posts, flooded intersections, and culvert markers.
              When scanned by citizens on mobile, complaints are automatically tagged to the specified ward and dispatched to the local squad.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Signboard</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 mt-4 text-xs">
          <span className="text-slate-500 font-semibold text-[11px]">Quick Ward Templates:</span>
          <button
            type="button"
            onClick={() =>
              handleQuickPreset(
                'Ward 15 — Main Road',
                'Main Road Commercial Corridor & Underpass',
                'Engr. P. S. Kulkarni (Drainage Wing)',
                '1800-419-3315'
              )
            }
            className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg font-medium border border-slate-200"
          >
            Ward 15 — Main Road
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickPreset(
                'Ward 12 — South Lake',
                'South Lake Colony, Sector 14 Metro Junction',
                'Engr. A. K. Verma (Ward Officer)',
                '1800-419-3312'
              )
            }
            className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg font-medium border border-slate-200"
          >
            Ward 12 — South Lake
          </button>
          <button
            type="button"
            onClick={() =>
              handleQuickPreset(
                'Ward 08 — Railway Corridor',
                'Railway Underbridge 4 & Cantonment Sub-division',
                'Dr. Ramesh Patil (Zonal Flood Squad)',
                '1800-419-3308'
              )
            }
            className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg font-medium border border-slate-200"
          >
            Ward 08 — Railway Corridor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 border-b pb-2">
            Configure Area & Signboard Metadata
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ward Name / Number:
            </label>
            <input
              type="text"
              value={wardCode}
              onChange={(e) => setWardCode(e.target.value)}
              placeholder="e.g. Ward 15 — Main Road"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Locality / Street Landmark:
            </label>
            <input
              type="text"
              value={localityName}
              onChange={(e) => setLocalityName(e.target.value)}
              placeholder="e.g. Near Underpass Cross Road, Sector 15"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Designated Officer / Wing:
            </label>
            <input
              type="text"
              value={officerInCharge}
              onChange={(e) => setOfficerInCharge(e.target.value)}
              placeholder="e.g. Engr. P. S. Kulkarni"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Emergency Ward Helpline:
            </label>
            <input
              type="text"
              value={helpline}
              onChange={(e) => setHelpline(e.target.value)}
              placeholder="e.g. 1800-419-3315"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Target URL Preview */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-600 block text-[10px] uppercase">
              Embedded Scanned Target URL:
            </span>
            <p className="font-mono text-[11px] text-teal-800 break-all bg-white p-2 rounded border">
              {targetUrl}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onSimulateWardScan(wardCode, localityName)}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Test Simulated Scan with this Ward</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Printable Signboard Placard Preview Column */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>Official Print-Ready Street Signboard Placard:</span>
            <span className="text-[11px] text-teal-700">Preview Mode (Standard A4 Placard)</span>
          </div>

          {/* The Physical Signboard Container */}
          <div
            id="printable-signboard"
            className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-slate-900 shadow-xl space-y-6 text-center text-slate-900 relative overflow-hidden"
          >
            {/* Top Emblem Bar */}
            <div className="bg-slate-900 text-white p-3 rounded-2xl flex items-center justify-center gap-3">
              <Building2 className="w-6 h-6 text-teal-400" />
              <div className="text-left">
                <div className="font-black text-xs sm:text-sm tracking-wider uppercase">
                  GREATER METROPOLITAN MUNICIPAL CORPORATION
                </div>
                <div className="text-[10px] text-teal-300 font-bold uppercase tracking-widest">
                  STORM WATER DRAINAGE & RAPID FLOOD CONTROL DIVISION
                </div>
              </div>
            </div>

            {/* Placard Title */}
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block">
                CITIZEN PUBLIC GRIEVANCE SIGNBOARD
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                SMART WATERLOGGING REPORTING SYSTEM
              </h2>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                “Report. Track. Resolve.”
              </p>
            </div>

            {/* Prominent QR Code in Center */}
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="p-3 bg-white border-4 border-slate-900 rounded-3xl shadow-lg inline-block">
                <img
                  src={qrImageUrl}
                  alt={`QR Code for ${wardCode}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                />
              </div>
              <p className="text-xs font-black text-slate-900 bg-amber-100 border border-amber-300 px-4 py-1.5 rounded-xl uppercase tracking-wide">
                📱 SCAN WITH SMARTPHONE CAMERA TO REPORT NOW
              </p>
            </div>

            {/* Ward Details Grid */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Municipal Jurisdiction:
                </span>
                <span className="font-black text-slate-900 text-sm block">{wardCode}</span>
                <span className="text-slate-600 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{localityName}</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Zonal Officer & Support:
                </span>
                <span className="font-bold text-slate-800 block text-xs">{officerInCharge}</span>
                <span className="text-slate-900 font-black text-xs flex items-center gap-1 mt-0.5 text-teal-800">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Helpline: {helpline}</span>
                </span>
              </div>
            </div>

            {/* 3 Step Guide Footer on Board */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-[10px] text-slate-600">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="font-black text-slate-900 block">1. SCAN QR</span>
                <span>Opens instant portal pre-tagged to this ward</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="font-black text-slate-900 block">2. ATTACH PHOTO</span>
                <span>Camera photo & voice note upload</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="font-black text-slate-900 block">3. TRACK LIVE</span>
                <span>Receive SMS/In-app resolution proof</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
