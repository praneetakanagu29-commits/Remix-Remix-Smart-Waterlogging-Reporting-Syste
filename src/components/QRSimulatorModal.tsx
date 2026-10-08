import React, { useState } from 'react';
import { QrCode, X, CheckCircle, ExternalLink, MapPin, Building2, PhoneCall } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectWard: (wardCode: string, locality: string) => void;
  currentWard: string;
}

const SAMPLE_WARDS = [
  {
    id: 'WARD-12',
    name: 'Ward 12 - South Lake',
    locality: 'South Lake Colony, Sector 14 Metro Junction',
    officer: 'Engr. A. K. Verma (Drainage Div)',
    phone: '1800-419-3312',
    color: 'from-blue-600 to-cyan-700',
    qrSeed: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://sws.gov.in/?ward=Ward-12-SouthLake&locality=South%20Lake%20Colony',
  },
  {
    id: 'WARD-04',
    name: 'Ward 04 - Metro Central',
    locality: 'Old City Commercial Market & Bus Terminal',
    officer: 'Insp. R. S. Negi (Sanitation Wing)',
    phone: '1800-419-3304',
    color: 'from-teal-600 to-emerald-700',
    qrSeed: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://sws.gov.in/?ward=Ward-04-MetroCentral&locality=Old%20Market%20Circle',
  },
  {
    id: 'WARD-08',
    name: 'Ward 08 - Railway Corridor',
    locality: 'Railway Underpass 4 & Cantonment Sub-division',
    officer: 'Officer M. K. Singhania (Flood Squad)',
    phone: '1800-419-3308',
    color: 'from-amber-600 to-orange-700',
    qrSeed: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://sws.gov.in/?ward=Ward-08-RailwayCorridor&locality=Railway%20Underpass%204',
  },
  {
    id: 'WARD-19',
    name: 'Ward 19 - Tech Park Zone',
    locality: 'Silicon Outer Ring Road & IT Boulevard',
    officer: 'Supt. S. K. Nambiar (Stormwater Wing)',
    phone: '1800-419-3319',
    color: 'from-indigo-600 to-blue-800',
    qrSeed: 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://sws.gov.in/?ward=Ward-19-TechParkZone&locality=Silicon%20Outer%20Ring%20Road',
  },
];

export const QRSimulatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectWard,
  currentWard,
}) => {
  const [selected, setSelected] = useState<string>(currentWard || 'Ward 12 - South Lake');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-teal-800 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <QrCode className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Municipal QR Code Portal</h3>
              <p className="text-xs text-teal-100">
                Simulate scanning physical public QR boards installed in flood-prone zones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 flex items-start gap-3">
            <div className="p-1 bg-teal-600 text-white rounded-full mt-0.5">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-teal-950 mb-1">
                How QR-Based Reporting Works:
              </p>
              <p>
                In a real deployment, citizens find waterproof QR signboards on streetlight poles,
                underpasses, and drainage junctions. Scanning immediately opens this portal pre-tagged
                with the specific <strong>Ward Code</strong>, <strong>Jurisdiction</strong>, and{' '}
                <strong>Zonal Helpline</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_WARDS.map((ward) => {
              const isSelected = selected === ward.name;
              return (
                <div
                  key={ward.id}
                  onClick={() => setSelected(ward.name)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ward.id}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-teal-700">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-600" /> Selected
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{ward.name}</h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="line-clamp-1">{ward.locality}</span>
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{ward.officer}</span>
                    </p>
                  </div>

                  {/* QR Image preview & scan simulation button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <img
                      src={ward.qrSeed}
                      alt={`QR Code for ${ward.name}`}
                      className="w-16 h-16 rounded-lg border border-slate-200 bg-white p-1 shrink-0"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWard(ward.name, ward.locality);
                        onClose();
                      }}
                      className="w-full text-xs font-semibold py-2 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Simulate Scan</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Selected Ward: <strong className="text-slate-800">{selected}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const ward = SAMPLE_WARDS.find((w) => w.name === selected) || SAMPLE_WARDS[0];
                onSelectWard(ward.name, ward.locality);
                onClose();
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm"
            >
              Confirm & Apply Ward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
