import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff, Camera, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isHeirMode, setIsHeirMode] = useState(false);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch {
      toast.error('Camera access denied. Please allow camera permissions.');
    }
  }, []);

  const captureAndVerify = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setShowCamera(false);
    setCameraVerified(true);
    toast.success('Camera verification successful!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cameraVerified) {
      toast.error('Please complete camera verification first.');
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

            {/* Camera Verification */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-foreground/80 block">Camera Verification</label>
              {showCamera ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    <button type="button" onClick={captureAndVerify} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                      Capture & Verify
                    </button>
                    <button type="button" onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setShowCamera(false); }} className="px-4 py-2 rounded-lg bg-destructive/80 text-destructive-foreground text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : cameraVerified ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm text-success font-medium">Camera verified</span>
                </div>
              ) : (
                <button type="button" onClick={startCamera} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:bg-muted/30 transition-colors text-sm text-muted-foreground">
                  <Camera className="w-4 h-4" />
                  Open Camera for Verification
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!cameraVerified || loading}
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
