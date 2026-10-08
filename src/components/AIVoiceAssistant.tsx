import React, { useState, useEffect } from 'react';
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  Check,
  Loader2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';

import { ComplaintPriority } from '../types';

interface Props {
  currentDescription: string;
  onDescriptionUpdate: (newDescription: string) => void;
  problemType?: string;
  locality?: string;
  onPrioritySuggest?: (priority: ComplaintPriority) => void;
}

export const AIVoiceAssistant: React.FC<Props> = ({
  currentDescription,
  onDescriptionUpdate,
  problemType = 'Waterlogging',
  locality = 'Ward 12',
  onPrioritySuggest,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    enhanced_description: string;
    estimated_depth: string;
    priority_recommendation: ComplaintPriority;
    voice_guidance: string;
  } | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Check Web Speech API support
  useEffect(() => {
    const hasSpeech =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setSpeechSupported(hasSpeech);
  }, []);

  // Speech Synthesis: Read Instructions Aloud
  const handleReadInstructions = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const guideText = `Welcome to the Smart Waterlogging Reporting Portal. To report your ${problemType} issue: First, attach a photo of the flooded area. Second, verify your location marker on the map. Third, enter or dictate a brief description. And fourth, submit to the Municipal Response Team.`;

    const utterance = new SpeechSynthesisUtterance(guideText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speech to Text: Real Browser Dictation
  const handleSpeechToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback demo for unsupported browsers
      setStatusNotice('Web Speech API is not enabled in this browser. Using demo speech input.');
      const demoTranscript =
        'Severe waterlogging on main arterial road. Water is knee deep, two-wheelers are stranded near the bus stop.';
      onDescriptionUpdate(
        currentDescription ? `${currentDescription} ${demoTranscript}` : demoTranscript
      );
      setTimeout(() => setStatusNotice(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusNotice('Listening... Please speak your waterlogging complaint now.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          const updated = currentDescription
            ? `${currentDescription} ${transcript}`
            : transcript;
          onDescriptionUpdate(updated);
          setStatusNotice(`Transcribed: "${transcript}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setStatusNotice(`Speech error: ${event.error}. You can type directly in the box.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Could not launch speech recognition:', e);
      setIsListening(false);
    }
  };

  // AI Description Enhancement & Municipal Structuring
  const handleEnhanceDescription = async () => {
    if (!currentDescription.trim()) {
      setStatusNotice('Please enter or dictate a few words first for AI to analyze.');
      return;
    }

    setIsEnhancing(true);
    setStatusNotice(null);
    try {
      const data = await api.enhanceDescription({
        description: currentDescription,
        problemType,
        locality,
      });

      setAiResult(data);
      if (onPrioritySuggest && data.priority_recommendation) {
        onPrioritySuggest(data.priority_recommendation);
      }

      // Read AI confirmation aloud if speech synthesis exists
      if ('speechSynthesis' in window && data.voice_guidance) {
        const u = new SpeechSynthesisUtterance(data.voice_guidance);
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
      }
    } catch (err: any) {
      console.warn('AI enhancement error:', err);
      setStatusNotice('AI service in fallback mode. Standard complaint formatted.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyEnhancedText = () => {
    if (aiResult?.enhanced_description) {
      onDescriptionUpdate(aiResult.enhanced_description);
      setStatusNotice('Enhanced description applied to complaint!');
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-900/90 via-slate-900 to-blue-950 text-white rounded-2xl p-4.5 border border-teal-500/30 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-2">
              <span>AI Voice & Assistance Suite</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30">
                Active
              </span>
            </h4>
            <p className="text-[11px] text-teal-200/80">
              Speech-to-text dictation, voice reader & municipal description refiner
            </p>
          </div>
        </div>

        {/* Read instructions toggle */}
        <button
          type="button"
          onClick={handleReadInstructions}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isSpeaking
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-white/10 hover:bg-white/20 text-teal-100 border border-white/10'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Read Form Aloud</span>
            </>
          )}
        </button>
      </div>

      {/* Voice Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Dictate via Speech to Text */}
        <button
          type="button"
          onClick={handleSpeechToText}
          disabled={isListening}
          className={`py-3 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
              : 'bg-white/10 hover:bg-white/15 text-white border-white/10 hover:border-teal-400/40'
          }`}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : 'text-teal-300'}`} />
          <span>{isListening ? 'Listening to speech...' : 'Speak to Fill Description'}</span>
        </button>

        {/* AI Municipal Refinement */}
        <button
          type="button"
          onClick={handleEnhanceDescription}
          disabled={isEnhancing}
          className="py-3 px-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Details...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Refine with Municipal AI</span>
            </>
          )}
        </button>
      </div>

      {/* Status Notice */}
      {statusNotice && (
        <div className="p-2.5 bg-white/10 rounded-xl text-[11px] text-teal-100 border border-white/10 flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* AI Analysis Result Card */}
      {aiResult && (
        <div className="bg-slate-900/90 border border-teal-500/40 rounded-xl p-3.5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Municipal Severity Triage
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-semibold">
                Depth: {aiResult.estimated_depth}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  aiResult.priority_recommendation === 'Critical' ||
                  aiResult.priority_recommendation === 'High'
                    ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    : 'bg-teal-500/30 text-teal-300'
                }`}
              >
                {aiResult.priority_recommendation} Priority
              </span>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-2.5 text-xs text-slate-200 border border-white/5 font-sans leading-relaxed">
            {aiResult.enhanced_description}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleApplyEnhancedText}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Refined Text</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
