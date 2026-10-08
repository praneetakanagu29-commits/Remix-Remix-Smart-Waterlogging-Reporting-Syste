import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, RefreshCw, X, Check, AlertCircle, Sparkles, SwitchCamera } from 'lucide-react';

interface Props {
  photo: string;
  onPhotoSelected: (base64Photo: string) => void;
}

const SAMPLE_WATERLOG_PHOTOS = [
  {
    name: 'Flooded Main Road & Traffic',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Blocked Stormwater Drain Culvert',
    url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Open Broken Drain on Pavement',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=900&q=80',
  },
];

export const PhotoCapture: React.FC<Props> = ({ photo, onPhotoSelected }) => {
  const [mode, setMode] = useState<'idle' | 'camera' | 'gallery'>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream on unmount or mode exit
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stream]);

  // Start device camera
  const startCamera = async (facing: 'environment' | 'user') => {
    stopStream();
    setCameraError(null);
    setIsCapturing(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setMode('camera');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Camera permission was denied or device camera is unavailable. You can upload an image from your gallery or choose a sample photo.'
      );
      setMode('idle');
    } finally {
      setIsCapturing(false);
    }
  };

  // Flip camera (front / back)
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Capture frame to Canvas
  const captureFrame = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    stopStream();
    setMode('idle');
    onPhotoSelected(dataUrl);
  };

  // Gallery File Picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onPhotoSelected(result);
        setMode('idle');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When Photo is already taken or selected */}
      {photo && mode !== 'camera' && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-900 group shadow-md">
          <img
            src={photo}
            alt="Complaint site"
            className="w-full h-64 sm:h-72 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-4">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-1 bg-emerald-600/90 text-white rounded-lg text-xs font-semibold backdrop-blur-md flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Evidence Attached
              </span>
              <button
                type="button"
                onClick={() => onPhotoSelected('')}
                className="p-1.5 bg-black/50 hover:bg-rose-600 text-white rounded-full transition-colors"
                title="Remove Photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="flex-1 py-2 px-3 bg-white/90 hover:bg-white text-slate-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Change Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder */}
      {mode === 'camera' && (
        <div className="relative rounded-2xl overflow-hidden border-2 border-teal-500 bg-black aspect-video flex flex-col items-center justify-center shadow-lg">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Camera Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
              title="Switch camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                stopStream();
                setMode('idle');
              }}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
              title="Close camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
            <button
              type="button"
              onClick={captureFrame}
              className="w-16 h-16 rounded-full border-4 border-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-transform flex items-center justify-center shadow-xl"
              title="Click to capture"
            >
              <Camera className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Select Photo Options when no photo is active */}
      {!photo && mode !== 'camera' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Take Photo button */}
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              disabled={isCapturing}
              className="p-5 border-2 border-dashed border-teal-400 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-600 rounded-2xl transition-all flex flex-col items-center text-center group cursor-pointer active:scale-98"
            >
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Take Photo</h4>
              <p className="text-xs text-slate-500 mt-1">
                Open device camera to capture live street flooding
              </p>
            </button>

            {/* Upload Gallery button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-5 border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 rounded-2xl transition-all flex flex-col items-center text-center group cursor-pointer active:scale-98"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Upload from Gallery</h4>
              <p className="text-xs text-slate-500 mt-1">
                Choose an existing waterlogging photo from phone gallery
              </p>
            </button>
          </div>

          {/* Camera Error Display */}
          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* College Project Evaluation Helpers: Sample Photos */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick Test / Sample Waterlogging Images:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_WATERLOG_PHOTOS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onPhotoSelected(sample.url)}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 aspect-video hover:border-teal-500 transition-all text-left"
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1 transition-colors">
                    <span className="text-[10px] font-medium text-white line-clamp-1">
                      {sample.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
