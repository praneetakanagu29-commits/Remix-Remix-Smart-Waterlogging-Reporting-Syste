import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  MapPin,
  FileText,
  Mic,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Volume2,
  Clock,
  Send,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { PhotoCapture } from '../components/PhotoCapture';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { AIVoiceAssistant } from '../components/AIVoiceAssistant';
import { SubmissionSuccess } from '../components/SubmissionSuccess';
import { api } from '../services/api';
import { Complaint, ComplaintDraft, ProblemType, User } from '../types';

interface Props {
  user: User;
  problemType: ProblemType;
  activeWard: string;
  onBackToProblemSelect: () => void;
  onGoToDashboard: () => void;
  onResetReport: () => void;
}

export const ReportProblem: React.FC<Props> = ({
  user,
  problemType,
  activeWard,
  onBackToProblemSelect,
  onGoToDashboard,
  onResetReport,
}) => {
  // Wizard state: 'form' | 'review' | 'success'
  const [currentStep, setCurrentStep] = useState<'form' | 'review' | 'success'>('form');

  // Draft form data
  const [draft, setDraft] = useState<ComplaintDraft>({
    problem_type: problemType,
    photo: '',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'South Lake Colony, Ward 12 - Near Metro Pillar 142',
    description: '',
    voice_audio_base64: '',
    voice_duration_seconds: 0,
    ward: activeWard || 'Ward 12 - South Lake',
    priority: 'Medium',
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Quick depth indicator tags helper
  const depthPresets = [
    'Ankle deep (~6 in)',
    'Knee deep (~1.5 ft)',
    'Waist deep (>3 ft)',
    'Submerged vehicles / impassable',
  ];

  const handleAddDepthTag = (tag: string) => {
    const textToAdd = `Water level observed is ${tag}. `;
    if (!draft.description.includes(tag)) {
      setDraft((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description} ${textToAdd}` : textToAdd,
      }));
    }
  };

  // Validation before going to Review
  const validateFormAndProceedToReview = () => {
    const errors: string[] = [];
    if (!draft.description.trim()) {
      errors.push('Please provide a brief description of the waterlogging problem.');
    }
    if (!draft.address.trim()) {
      errors.push('Please verify the location address on the map.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 400, behavior: 'smooth' });
      return;
    }

    setFormErrors([]);
    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit to Backend Database
  const handleSubmitComplaint = async () => {
    setIsSubmitting(true);
    setFormErrors([]);

    try {
      const response = await api.submitComplaint({
        problem_type: draft.problem_type,
        description: draft.description,
        latitude: draft.latitude,
        longitude: draft.longitude,
        address: draft.address,
        citizen_image: draft.photo,
        voice_recording: draft.voice_audio_base64,
        ward: draft.ward,
        priority: draft.priority,
      });

      setSubmittedComplaint(response.complaint);
      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormErrors([err.message || 'Submission failed. Please check network and retry.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 'success' && submittedComplaint) {
    return (
      <SubmissionSuccess
        complaint={submittedComplaint}
        onGoToDashboard={onGoToDashboard}
        onReportAnother={onResetReport}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={currentStep === 'review' ? () => setCurrentStep('form') : onBackToProblemSelect}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 'review' ? 'Edit Details' : 'Change Problem Type'}</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">1. Select Problem</span>
            <span className="text-slate-400">→</span>
            <span
              className={`px-3 py-1 rounded-full border font-bold ${
                currentStep === 'form'
                  ? 'bg-teal-100 text-teal-800 border-teal-200'
                  : 'text-slate-500 border-transparent'
              }`}
            >
              2. Details & Evidence
            </span>
            <span className="text-slate-400">→</span>
            <span
              className={`px-3 py-1 rounded-full border font-bold ${
                currentStep === 'review'
                  ? 'bg-teal-100 text-teal-800 border-teal-200'
                  : 'text-slate-500 border-transparent'
              }`}
            >
              3. Review & Submit
            </span>
          </div>
        </div>

        {/* Selected Category Highlight Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
              Active Complaint Form
            </span>
            <h2 className="text-xl sm:text-2xl font-black">{draft.problem_type}</h2>
            <p className="text-xs text-teal-100">
              Jurisdiction:{' '}
              <strong className="text-white">{draft.ward || 'Ward 12 - South Lake'}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToProblemSelect}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
          >
            Change Type
          </button>
        </div>

        {/* FORM STEP */}
        {currentStep === 'form' && (
          <div className="space-y-6">
            {/* Validation errors notification */}
            {formErrors.length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Please resolve the following before proceeding to review:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* SECTION 1: PHOTO */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 1: Photograph / Visual Evidence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Take photo using your device camera or upload from phone gallery
                    </p>
                  </div>
                </div>

                {draft.photo && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Attached
                  </span>
                )}
              </div>

              <PhotoCapture
                photo={draft.photo}
                onPhotoSelected={(photoBase64) =>
                  setDraft((prev) => ({ ...prev, photo: photoBase64 }))
                }
              />
            </div>

            {/* SECTION 2: LOCATION & MAP */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Step 2: Location & Interactive Map
                  </h3>
                  <p className="text-xs text-slate-500">
                    Detect your GPS position or move the map marker manually to the exact waterlogging spot
                  </p>
                </div>
              </div>

              <InteractiveMap
                latitude={draft.latitude}
                longitude={draft.longitude}
                address={draft.address}
                wardName={draft.ward}
                onLocationChange={(lat, lng, address) =>
                  setDraft((prev) => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                    address,
                  }))
                }
              />
            </div>

            {/* SECTION 3: DESCRIPTION */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Step 3: Describe the Problem
                  </h3>
                  <p className="text-xs text-slate-500">
                    Specify the waterlogging depth, duration, affected road, and nearby landmark
                  </p>
                </div>
              </div>

              {/* Quick Depth Helper Tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Quick depth tags:</span>
                {depthPresets.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddDepthTag(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={draft.description}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Describe the waterlogging depth, affected road, nearby landmark, duration, and other important information."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-inner"
                required
              />
            </div>

            {/* SECTION 4: VOICE RECORDING */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Step 4: Voice Recording (Optional)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record your voice explaining the issue using browser MediaRecorder API
                  </p>
                </div>
              </div>

              <VoiceRecorder
                audioBase64={draft.voice_audio_base64}
                onAudioChange={(audioBase64, durationSec) =>
                  setDraft((prev) => ({
                    ...prev,
                    voice_audio_base64: audioBase64,
                    voice_duration_seconds: durationSec,
                  }))
                }
              />
            </div>

            {/* SECTION 5: AI VOICE ASSISTANCE */}
            <div className="space-y-2">
              <AIVoiceAssistant
                currentDescription={draft.description}
                problemType={draft.problem_type}
                locality={draft.ward}
                onDescriptionUpdate={(newDesc) =>
                  setDraft((prev) => ({ ...prev, description: newDesc }))
                }
                onPrioritySuggest={(p) => setDraft((prev) => ({ ...prev, priority: p }))}
              />
            </div>

            {/* PROCEED TO REVIEW BUTTON */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={validateFormAndProceedToReview}
                className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Proceed to Review Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* REVIEW STEP BEFORE SUBMISSION */}
        {currentStep === 'review' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Step 3: Verification
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    Review Complaint Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Carefully verify all captured information before submitting to the Municipal Corporation.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    Priority: {draft.priority}
                  </span>
                </div>
              </div>

              {/* Review Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Review */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Uploaded Photograph
                  </span>
                  {draft.photo ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-900">
                      <img
                        src={draft.photo}
                        alt="Waterlogging evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 h-56 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <Camera className="w-8 h-8 mb-1" />
                      <span className="text-xs">No photograph attached</span>
                      <span className="text-[11px] text-slate-400">
                        (Photo is optional but highly recommended)
                      </span>
                    </div>
                  )}
                </div>

                {/* Location Review */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Verified Location & Coordinates
                  </span>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {draft.address}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Ward: {draft.ward || 'General Zone'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600">
                      <div>Lat: {draft.latitude.toFixed(6)}°</div>
                      <div>Lng: {draft.longitude.toFixed(6)}°</div>
                    </div>
                  </div>

                  {/* Submission Date / Citizen info */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reporting Citizen:</span>
                      <span className="font-bold text-slate-800">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Citizen Mobile:</span>
                      <span className="font-mono text-slate-800">{user.mobile || '+91 98765 43210'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time:</span>
                      <span className="font-semibold text-slate-800">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Review */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Problem Description
                </span>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {draft.description}
                </div>
              </div>

              {/* Voice Note Review */}
              {draft.voice_audio_base64 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Attached Voice Note
                  </span>
                  <div className="bg-teal-50 rounded-2xl p-3 border border-teal-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-teal-800 text-xs font-semibold">
                      <Volume2 className="w-4 h-4 text-teal-700" />
                      <span>Audio recording attached for field engineer</span>
                    </div>
                    <audio
                      src={draft.voice_audio_base64}
                      controls
                      className="h-8 max-w-[200px]"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Edit Form
                </button>

                <button
                  type="button"
                  onClick={handleSubmitComplaint}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting to Municipal Database...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Complaint</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
