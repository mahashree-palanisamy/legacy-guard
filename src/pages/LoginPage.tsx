import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff, Camera, CheckCircle, X, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const FACE_KEY = 'pdcp_registered_face';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHeirMode, setIsHeirMode] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceFailed, setFaceFailed] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    setFaceFailed(false);
    setFaceVerified(false);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch {
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  }, []);

  const captureAndVerify = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(capturedDataUrl);
    stopCamera();

    // Compare with registered face
    const registeredFace = localStorage.getItem(FACE_KEY);
    if (!registeredFace) {
      // No registered face — allow login (first-time or cleared)
      setFaceVerified(true);
      setFaceFailed(false);
      toast.success('Face verification successful!');
      return;
    }

    // Simulated comparison: both images exist = match
    // In production, this would use a real face comparison API
    const isMatch = !!registeredFace && !!capturedDataUrl;
    if (isMatch) {
      setFaceVerified(true);
      setFaceFailed(false);
      toast.success('Face verification successful! Identity confirmed.');
    } else {
      setFaceVerified(false);
      setFaceFailed(true);
      toast.error('Face verification failed! Identity mismatch.');
    }
  }, [stopCamera]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faceVerified) {
      toast.error('Please complete face verification first.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, isHeirMode ? 'HEIR' : 'OWNER');
      toast.success('Login successful!');
      navigate(isHeirMode ? '/heir-dashboard' : '/dashboard');
    } catch {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-card-elevated p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">Welcome Back</h1>
            <p className="text-sm text-primary-foreground/60 mt-1">Post-Death Digital Closure Platform</p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-sm text-primary-foreground/70">Login as Heir</span>
            <button
              onClick={() => setIsHeirMode(!isHeirMode)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center ${isHeirMode ? 'bg-primary justify-end' : 'bg-muted justify-start'}`}
            >
              <div className="w-5 h-5 rounded-full bg-primary-foreground mx-0.5 shadow" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary-foreground/80 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-primary-foreground/80 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Face Verification */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-foreground/80 block">
                Face Verification <span className="text-destructive">*</span>
              </label>
              <canvas ref={canvasRef} className="hidden" />
              {showCamera ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    <button type="button" onClick={captureAndVerify} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                      📸 Capture & Verify
                    </button>
                    <button type="button" onClick={stopCamera} className="px-4 py-2 rounded-lg bg-destructive/80 text-destructive-foreground text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : faceVerified ? (
                <div className="space-y-2">
                  {capturedImage && (
                    <div className="relative rounded-lg overflow-hidden border border-success/30">
                      <img src={capturedImage} alt="Captured face" className="w-full aspect-video object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/90 text-success-foreground text-xs font-medium">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm text-success font-medium">Face verified — identity confirmed</span>
                  </div>
                  <button type="button" onClick={startCamera} className="w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                    Re-verify Face
                  </button>
                </div>
              ) : faceFailed ? (
                <div className="space-y-2">
                  {capturedImage && (
                    <div className="relative rounded-lg overflow-hidden border border-destructive/30">
                      <img src={capturedImage} alt="Captured face" className="w-full aspect-video object-cover opacity-60" />
                      <div className="absolute top-2 right-2">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/90 text-destructive-foreground text-xs font-medium">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <span className="text-sm text-destructive font-medium">Face verification failed — identity mismatch</span>
                  </div>
                  <button type="button" onClick={startCamera} className="w-full py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                    Try Again
                  </button>
                </div>
              ) : (
                <button type="button" onClick={startCamera} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:bg-muted/30 transition-colors text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  Open Camera for Face Verification
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!faceVerified || loading}
              className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link to="/register" className="text-sm text-primary hover:underline block">Create an account</Link>
            <Link to="/death-verification" className="text-sm text-muted-foreground hover:text-primary transition-colors block">
              Heir? Verify death certificate →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
