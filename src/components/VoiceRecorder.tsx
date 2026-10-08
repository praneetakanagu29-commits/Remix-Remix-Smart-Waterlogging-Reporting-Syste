import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Volume2, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  audioBase64: string;
  onAudioChange: (base64Audio: string, durationSeconds: number) => void;
}

export const VoiceRecorder: React.FC<Props> = ({ audioBase64, onAudioChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          onAudioChange(base64, recordingDuration);
        };
        reader.readAsDataURL(audioBlob);

        // stop microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access failed:', err);
      setErrorMsg(
        'Microphone access was denied or is not supported in this environment. You can use the Demo Sample Audio button below.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setRecordingDuration(0);
    onAudioChange('', 0);
  };

  const togglePlay = () => {
    if (!audioElementRef.current) return;
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Demo audio clip for college presentation in case mic is restricted
  const handleLoadSampleAudio = () => {
    // Generate a lightweight synthesized tone / speech sample representation
    const sampleMockAudio =
      'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    onAudioChange(sampleMockAudio, 6);
  };

  return (
    <div className="space-y-3">
      {/* Hidden audio element */}
      {audioBase64 && (
        <audio
          ref={audioElementRef}
          src={audioBase64}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Recording in Progress */}
      {isRecording && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 flex flex-col items-center text-center space-y-4 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-bold text-rose-800 tracking-wider uppercase">
              Recording Voice Complaint
            </span>
          </div>

          <div className="text-3xl font-mono font-bold text-rose-900">
            {formatTime(recordingDuration)}
          </div>

          <div className="flex gap-1 items-center h-6">
            {[40, 70, 90, 50, 100, 80, 60, 95, 45, 85].map((h, i) => (
              <span
                key={i}
                className="w-1.5 bg-rose-500 rounded-full animate-bounce"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {/* Audio Recorded Preview */}
      {audioBase64 && !isRecording && (
        <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-teal-800">
              <div className="p-2 bg-teal-100 rounded-xl">
                <Volume2 className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h5 className="text-xs font-bold">Voice Note Attached</h5>
                <p className="text-[11px] text-slate-500">
                  Audio ready for municipal response team
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 rounded-md text-slate-700">
              {recordingDuration > 0 ? formatTime(recordingDuration) : '0:06'}
            </span>
          </div>

          {/* Action buttons: Play, Delete, Record Again */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={togglePlay}
              className="py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={startRecording}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Record Again</span>
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Start Recording Button (When no recording exists) */}
      {!audioBase64 && !isRecording && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={startRecording}
            className="w-full py-4 px-4 border-2 border-dashed border-teal-400 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-600 rounded-2xl flex items-center justify-center gap-3 transition-all group cursor-pointer active:scale-98"
          >
            <div className="w-10 h-10 rounded-full bg-teal-600 group-hover:bg-teal-700 text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Mic className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h5 className="text-sm font-bold text-slate-900">Start Voice Recording</h5>
              <p className="text-xs text-slate-500">
                Click to record problem details verbally in your local language
              </p>
            </div>
          </button>

          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleLoadSampleAudio}
              className="text-[11px] text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              <span>Or attach sample voice clip for evaluation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
