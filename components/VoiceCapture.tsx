'use client';

import { useState, useRef, useEffect } from 'react';
import { transcribeAudio } from '@/app/actions';

type RecordingMode = 'manual' | 'periodic' | 'continuous';

interface VoiceCaptureProps {
  onTranscriptionComplete: (result: { text: string; recommendations: any[] }) => void;
}

export default function VoiceCapture({ onTranscriptionComplete }: VoiceCaptureProps) {
  const [mode, setMode] = useState<RecordingMode>('manual');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Request microphone permission
  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsEnabled(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      alert('Microphone access is required for voice capture');
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    const hasPermission = isEnabled || (await requestPermission());
    if (!hasPermission) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await handleTranscription(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Auto-stop for periodic mode (30 seconds)
      if (mode === 'periodic') {
        setTimeout(() => {
          stopRecording();
        }, 30000);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Handle transcription
  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const result = await transcribeAudio(formData);

      if (result.success && 'text' in result && result.text) {
        onTranscriptionComplete({
          text: result.text,
          recommendations: result.recommendations || [],
        });
      } else {
        setError('Failed to transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('An error occurred during transcription. Please check your internet connection and try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Setup periodic recording
  useEffect(() => {
    if (mode === 'periodic' && isEnabled) {
      // Record every 10 minutes
      periodicTimerRef.current = setInterval(() => {
        startRecording();
      }, 600000); // 10 minutes

      return () => {
        if (periodicTimerRef.current) {
          clearInterval(periodicTimerRef.current);
        }
      };
    }
  }, [mode, isEnabled]);

  // Setup continuous recording
  useEffect(() => {
    if (mode === 'continuous' && isEnabled && !isRecording) {
      startRecording();
    } else if (mode !== 'continuous' && isRecording && mode !== 'manual') {
      stopRecording();
    }
  }, [mode, isEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Capture</h3>

      {/* Recording Mode Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recording Mode
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setMode('periodic')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'periodic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Periodic
          </button>
          <button
            onClick={() => setMode('continuous')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'continuous'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Continuous
          </button>
        </div>

        {/* Mode descriptions */}
        <p className="text-xs text-gray-500 mt-2">
          {mode === 'manual' && 'Tap to record when you want'}
          {mode === 'periodic' && 'Records 30-second clips every 10 minutes'}
          {mode === 'continuous' && 'Always listening (battery intensive)'}
        </p>
      </div>

      {/* Recording Controls */}
      {mode === 'manual' && (
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700'
            } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <rect x="6" y="6" width="8" height="8" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {isRecording && (
            <div className="text-center">
              <div className="text-2xl font-mono text-gray-900">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-500">Recording...</div>
            </div>
          )}

          {isTranscribing && (
            <div className="text-sm text-gray-600">Transcribing...</div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg
                  className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-900">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="flex-shrink-0 text-red-600 hover:text-red-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Periodic/Continuous Mode Status */}
      {(mode === 'periodic' || mode === 'continuous') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {mode === 'periodic' ? 'Periodic Recording' : 'Continuous Recording'}
            </span>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {isEnabled && isRecording && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm text-red-900 font-medium">
                  Recording: {formatTime(recordingTime)}
                </span>
              </div>
            </div>
          )}

          {isEnabled && !isRecording && mode === 'periodic' && (
            <div className="text-sm text-gray-500">
              Next recording in ~10 minutes
            </div>
          )}

          {isTranscribing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-900">Processing audio...</div>
            </div>
          )}

          {mode === 'continuous' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="text-xs text-orange-900">
                Warning: Continuous mode uses significant battery and data
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
