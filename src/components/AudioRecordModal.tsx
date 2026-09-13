import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/audio';

interface AudioRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (data: { filename: string; duration: string; durationSeconds: number; transcript: string }) => void;
}

export const AudioRecordModal: React.FC<AudioRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState('Seminar_Voice_Memo.wav');
  const [memoTranscript, setMemoTranscript] = useState(
    'Observation: Evaluating prompt robustness against zero-day edge cases requires counterfactual validation rather than historical reward maximization.'
  );

  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      setRecordingSeconds(0);
      setRecordedBlob(null);
      setAudioUrl(null);
      startRecording();
    } else {
      stopRecording();
    }
    return () => stopRecording();
  }, [isOpen]);

  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setRecordedBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } else {
        setIsRecording(true);
      }
    } catch (err) {
      console.warn('Microphone access denied or unavailable, using simulation:', err);
      setIsRecording(true);
    }

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleSave = () => {
    stopRecording();
    onSaveRecord({
      filename,
      duration: formatTime(recordingSeconds || 42),
      durationSeconds: recordingSeconds || 42,
      transcript: memoTranscript,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1b1b1d] border border-[#ffb68c]/40 rounded-xl p-6 max-w-md w-full shadow-2xl animate-fade-in text-[#e4e2e4]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2c]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[22px]">
              mic
            </span>
            <h3 className="font-headline-md text-lg text-[#ffb68c] font-bold">
              Record Voice Memo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#a38c80] hover:text-[#e4e2e4] p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Audio Visualizer Animation */}
        <div className="bg-[#131315] rounded-xl p-5 mb-4 flex flex-col items-center justify-center border border-[#2a2a2c]">
          <div className="flex items-center gap-1.5 h-16 justify-center w-full">
            {[20, 36, 52, 28, 44, 58, 24, 48, 32, 54, 40, 22, 46, 30].map((h, i) => (
              <div
                key={i}
                style={{
                  height: isRecording
                    ? `${Math.max(8, (h + Math.sin(Date.now() / 200 + i) * 20)) % 60}px`
                    : '12px',
                }}
                className={`w-1.5 rounded-full transition-all duration-100 ${
                  isRecording ? 'bg-[#ffb68c]' : 'bg-[#353437]'
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 font-label-md text-sm text-[#dbc1b4]">
            {isRecording && (
              <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping" />
            )}
            <span>{isRecording ? 'Recording in progress...' : 'Recording complete'}</span>
            <span className="font-bold text-[#ffb68c]">
              {formatTime(recordingSeconds)}
            </span>
          </div>
        </div>

        {/* Filename & Transcript Inputs */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-[11px] font-label-sm uppercase text-[#a38c80] mb-1">
              File Identifier
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full bg-[#131315] border border-[#2a2a2c] text-xs font-label-md text-[#e4e2e4] px-3 py-2 rounded focus:outline-none focus:border-[#ffb68c]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-label-sm uppercase text-[#a38c80] mb-1">
              Synchronized Transcript / Note
            </label>
            <textarea
              value={memoTranscript}
              onChange={(e) => setMemoTranscript(e.target.value)}
              rows={3}
              className="w-full bg-[#131315] border border-[#2a2a2c] text-xs font-body-md text-[#dbc1b4] p-2.5 rounded focus:outline-none focus:border-[#ffb68c]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-[#93000a] text-[#ffdad6] hover:bg-[#690005] rounded-lg font-label-md text-xs flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">stop</span>
              <span>Pause / Finish</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-[#2a2a2c] text-[#e4e2e4] hover:text-[#ffb68c] rounded-lg font-label-md text-xs flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">mic</span>
              <span>Re-record</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-label-md text-[#a38c80] hover:text-[#e4e2e4]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#d97736] hover:bg-[#f9ba78] text-[#532200] font-label-md font-semibold text-xs rounded-lg shadow-md transition-colors"
            >
              Attach to Notebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
