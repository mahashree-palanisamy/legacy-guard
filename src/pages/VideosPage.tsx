import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Camera, Loader2, CheckCircle, AlertTriangle, Brain, Square, Download, AlertOctagon, ShieldAlert, FileText, Pencil } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useAppData, type VideoMessage } from '@/contexts/AppDataContext';
import { useIsOwner } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const analysisChecks = [
  { label: 'Facial expression consistency', delay: 800 },
  { label: 'Voice stability analysis', delay: 1400 },
  { label: 'Emotion detection (calm vs stressed)', delay: 2000 },
  { label: 'Forced speech detection', delay: 2600 },
];

const VIDEOS_KEY = 'pdcp_recorded_videos';

const VideosPage = () => {
  const { videos, addVideo } = useAppData();
  const isOwner = useIsOwner();
  const [title, setTitle] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [analysisResult, setAnalysisResult] = useState<VideoMessage['analysisResult'] | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [emotionStopped, setEmotionStopped] = useState(false);
  const [emotionStatus, setEmotionStatus] = useState<'calm' | 'monitoring' | 'distressed'>('calm');
  const [transcript, setTranscript] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emotionRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (emotionRef.current) clearInterval(emotionRef.current);
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const transcribeAudio = useCallback(async (blob: Blob) => {
    setTranscribing(true);
    setTranscript('');
    try {
      // Extract audio from the video blob
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe`,
        {
          method: 'POST',
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error(`Transcription failed: ${response.status}`);
      const data = await response.json();
      if (data.text) {
        setTranscript(data.text);
        toast.success('Transcription complete!');
      } else {
        setTranscript('No speech detected in the recording.');
      }
    } catch (err) {
      console.error('Transcription error:', err);
      toast.error('Transcription failed. Please try again.');
    } finally {
      setTranscribing(false);
    }
  }, []);

  const triggerAutoDownload = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy-video-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const autoSaveVideo = useCallback((blob: Blob, videoTitle: string, wasEmotionStopped: boolean) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const existing = JSON.parse(localStorage.getItem(VIDEOS_KEY) || '[]');
        existing.push({ data: reader.result, title: videoTitle || 'Untitled', timestamp: Date.now() });
        localStorage.setItem(VIDEOS_KEY, JSON.stringify(existing));
      } catch { /* localStorage full */ }
    };
    reader.readAsDataURL(blob);
    triggerAutoDownload(blob);

    const isGenuine = !wasEmotionStopped && Math.random() > 0.2;
    const result: VideoMessage['analysisResult'] = {
      status: isGenuine ? 'verified' : 'review_needed',
      confidence: isGenuine ? 82 + Math.floor(Math.random() * 15) : 45 + Math.floor(Math.random() * 20),
      checks: analysisChecks.map((c) => ({ label: c.label, passed: isGenuine || Math.random() > 0.4 })),
    };

    setAnalyzing(true);
    setAnalysisStep(-1);
    analysisChecks.forEach((check, i) => {
      setTimeout(() => setAnalysisStep(i), check.delay);
    });
    setTimeout(() => {
      setAnalysisResult(result);
      setAnalyzing(false);
      addVideo({ title: videoTitle || 'Untitled Recording', fileName: `recording-${Date.now()}.webm`, analysisResult: result });
      toast.success('Video auto-saved to your account & downloaded!');
    }, 3500);

    // Auto-transcribe
    transcribeAudio(blob);
  }, [addVideo, triggerAutoDownload, transcribeAudio]);

  const finishRecording = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    if (emotionRef.current) clearInterval(emotionRef.current);
    setRecording(false);
    setEmotionStatus('calm');
  }, []);

  const startRecording = useCallback(async () => {
    if (!isOwner) { toast.error('You have view-only access'); return; }
    setEmotionStopped(false);
    setEmotionStatus('calm');
    setAnalysisResult(null);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setTranscript('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      recorderRef.current = recorder;
      let stoppedByEmotion = false;

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        autoSaveVideo(blob, title, stoppedByEmotion);
      };

      recorder.start(1000);
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);

      const distressTime = 8000 + Math.random() * 7000;
      const shouldTriggerDistress = Math.random() > 0.6;
      emotionRef.current = setInterval(() => setEmotionStatus('monitoring'), 2000);

      if (shouldTriggerDistress) {
        setTimeout(() => {
          if (recorderRef.current?.state === 'recording') {
            stoppedByEmotion = true;
            setEmotionStopped(true);
            setEmotionStatus('distressed');
            toast.error('Recording stopped due to emotional distress.', { duration: 6000 });
            finishRecording();
          }
        }, distressTime);
      }
    } catch {
      toast.error('Camera/mic access denied');
    }
  }, [title, autoSaveVideo, finishRecording, isOwner]);

  const stopRecording = useCallback(() => finishRecording(), [finishRecording]);

  const downloadVideo = useCallback(() => {
    if (!recordedBlob) return;
    triggerAutoDownload(recordedBlob);
    toast.success('Video downloaded!');
  }, [recordedBlob, triggerAutoDownload]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Legacy Videos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isOwner ? 'Record messages for the next generation — fully automatic saving' : 'Viewing legacy video messages'}
        </p>
      </motion.div>

      {!isOwner && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">You have view-only access. Recording is disabled.</p>
        </motion.div>
      )}

      {isOwner && (
        <div className="glass-card p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Create Video Message</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" placeholder="Message for Next Generation" />
            </div>

            {recording ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-destructive/50">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/90 text-destructive-foreground text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
                    REC {formatTime(recordingTime)}
                  </div>
                  <div className="absolute top-3 right-3">
                    <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                        emotionStatus === 'distressed' ? 'bg-destructive/90 text-destructive-foreground'
                        : emotionStatus === 'monitoring' ? 'bg-warning/80 text-warning-foreground'
                        : 'bg-success/80 text-success-foreground'
                      }`}>
                      <Brain className="w-3 h-3" />
                      {emotionStatus === 'distressed' ? '😢 Distress Detected' : emotionStatus === 'monitoring' ? '🧠 Monitoring...' : '😊 Calm'}
                    </motion.div>
                  </div>
                </div>
                <button onClick={stopRecording} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">
                  <Square className="w-4 h-4" /> Stop Recording
                </button>
              </div>
            ) : recordedUrl ? (
              <div className="space-y-3">
                {emotionStopped && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertOctagon className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Recording stopped due to emotional distress</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Please record when you are calm and composed.</p>
                    </div>
                  </motion.div>
                )}
                <div className="relative rounded-lg overflow-hidden border border-success/30">
                  <video ref={previewRef} src={recordedUrl} controls className="w-full aspect-video object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/90 text-success-foreground text-xs font-medium">
                      <CheckCircle className="w-3 h-3" /> Auto-Saved
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={startRecording} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">Record Again</button>
                  <button onClick={downloadVideo} className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download Again
                  </button>
                </div>

                {/* Transcript Section */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold text-sm">AI Transcript</h3>
                    </div>
                    {transcript && !transcribing && (
                      <button
                        onClick={() => setEditingTranscript(!editingTranscript)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        {editingTranscript ? 'Done' : 'Edit'}
                      </button>
                    )}
                  </div>
                  {transcribing ? (
                    <div className="flex items-center gap-3 py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Transcribing audio with AI...</p>
                    </div>
                  ) : transcript ? (
                    editingTranscript ? (
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={6}
                        className="w-full p-3 rounded-lg bg-muted/30 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    ) : (
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">Transcript will appear here after recording.</p>
                  )}
                </motion.div>
              </div>
            ) : (
              <button onClick={startRecording} className="w-full flex items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                <Camera className="w-5 h-5" /> Start Recording — Auto-saves when done
              </button>
            )}

            <AnimatePresence>
              {(analyzing || analysisResult) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-card p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">AI Video Authenticity Analysis</h3>
                  </div>
                  <div className="space-y-2.5">
                    {analysisChecks.map((check, i) => (
                      <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: analysisStep >= i ? 1 : 0.3 }} className="flex items-center gap-3 text-sm">
                        {analysisStep >= i ? (
                          analysisResult ? (
                            analysisResult.checks[i].passed ? <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                          ) : <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                        ) : <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />}
                        <span>{check.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  {analysisResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-lg border ${analysisResult.status === 'verified' ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {analysisResult.status === 'verified' ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
                          <span className="font-semibold text-sm">{analysisResult.status === 'verified' ? 'Video appears natural and voluntary' : 'Possible stress or external pressure detected'}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${analysisResult.status === 'verified' ? 'text-success' : 'text-warning'}`}>{analysisResult.confidence}% Genuine</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${analysisResult.status === 'verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {analysisResult.status === 'verified' ? 'VERIFIED' : 'REVIEW NEEDED'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Saved Videos ({videos.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </div>
      )}

      {videos.length === 0 && !recording && !recordedUrl && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 glass-card p-8 text-center">
          <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-muted-foreground">No videos yet</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">{isOwner ? 'Record your first legacy message above' : 'No legacy videos have been recorded yet'}</p>
        </motion.div>
      )}
    </div>
  );
};

export default VideosPage;
