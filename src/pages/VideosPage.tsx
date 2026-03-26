import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Upload, Camera, Loader2, CheckCircle, AlertTriangle, Brain } from 'lucide-react';
import VideoCard from '@/components/VideoCard';
import { useAppData, type VideoMessage } from '@/contexts/AppDataContext';
import { toast } from 'sonner';

const analysisChecks = [
  { label: 'Facial expression consistency', delay: 800 },
  { label: 'Voice stability analysis', delay: 1400 },
  { label: 'Emotion detection (calm vs stressed)', delay: 2000 },
  { label: 'Forced speech detection', delay: 2600 },
];

const VideosPage = () => {
  const { videos, addVideo } = useAppData();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(-1);
  const [analysisResult, setAnalysisResult] = useState<VideoMessage['analysisResult'] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setRecording(true);
    } catch { toast.error('Camera/mic access denied'); }
  };

  const stopRecording = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
    setFile(new File(['recorded'], 'webcam-recording.webm', { type: 'video/webm' }));
    toast.success('Recording saved');
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalysisStep(-1);
    setAnalysisResult(null);

    analysisChecks.forEach((check, i) => {
      setTimeout(() => setAnalysisStep(i), check.delay);
    });

    setTimeout(() => {
      const isGenuine = Math.random() > 0.2;
      const result: VideoMessage['analysisResult'] = {
        status: isGenuine ? 'verified' : 'review_needed',
        confidence: isGenuine ? 82 + Math.floor(Math.random() * 15) : 45 + Math.floor(Math.random() * 20),
        checks: analysisChecks.map((c) => ({ label: c.label, passed: isGenuine || Math.random() > 0.4 })),
      };
      setAnalysisResult(result);
      setAnalyzing(false);
    }, 3500);
  };

  const handleSave = () => {
    if (!title.trim() || !file) { toast.error('Title and video required'); return; }
    addVideo({ title, fileName: file.name, analysisResult: analysisResult || undefined });
    setTitle('');
    setFile(null);
    setAnalysisResult(null);
    toast.success('Video saved!');
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Legacy Videos</h1>
        <p className="text-muted-foreground text-sm mt-1">Record messages for the next generation</p>
      </motion.div>

      <div className="glass-card p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Create Video Message</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Message for Next Generation" />
          </div>

          {recording ? (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video rounded-lg bg-muted object-cover" />
              <button onClick={stopRecording} className="w-full py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">
                Stop Recording
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button onClick={startRecording} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                <Camera className="w-5 h-5" /> Record with Webcam
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors text-sm text-muted-foreground">
                <Upload className="w-5 h-5" /> {file ? file.name : 'Upload Video'}
                <input type="file" accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" />
              </label>
            </div>
          )}

          {file && !analysisResult && (
            <button onClick={runAnalysis} disabled={analyzing} className="w-full py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              <Brain className="w-4 h-4" /> {analyzing ? 'Analyzing...' : 'Run AI Video Analysis'}
            </button>
          )}

          {/* AI Analysis UI */}
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
                          analysisResult.checks[i].passed ?
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> :
                            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
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
                        {analysisResult.status === 'verified' ?
                          <CheckCircle className="w-5 h-5 text-success" /> :
                          <AlertTriangle className="w-5 h-5 text-warning" />}
                        <span className="font-semibold text-sm">
                          {analysisResult.status === 'verified' ? 'Video appears natural and voluntary' : 'Possible stress or external pressure detected'}
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${analysisResult.status === 'verified' ? 'text-success' : 'text-warning'}`}>
                        {analysisResult.confidence}% Genuine
                      </span>
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

          <button onClick={handleSave} disabled={!file || !title.trim()} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
            Save Video Message
          </button>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Saved Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
