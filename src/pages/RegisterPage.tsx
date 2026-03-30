import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, Check, X, Camera, CheckCircle, Download, Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const getStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-destructive', 'bg-warning', 'bg-primary', 'bg-success'];

const FACE_KEY = 'pdcp_registered_face';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedFace, setCapturedFace] = useState<string | null>(null);
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(password);

  const startCamera = useCallback(async () => {
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

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedFace(dataUrl);
    localStorage.setItem(FACE_KEY, dataUrl);
    stopCamera();
    toast.success('Face captured and registered successfully!');
  }, [stopCamera]);

  const downloadFace = () => {
    if (!capturedFace) return;
    const link = document.createElement('a');
    link.href = capturedFace;
    link.download = 'registered-face.jpg';
    link.click();
  };

  const sendOtp = async () => {
    if (!email) { toast.error('Please enter your email first'); return; }
    setSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email },
      });
      if (error) throw error;
      setOtpSent(true);
      if (data?.demo_otp) setDemoOtp(data.demo_otp);
      if (data?.expiresAt) setOtpExpiresAt(data.expiresAt);
      toast.success('OTP sent to your email!');
    } catch (err) {
      console.error('OTP error:', err);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    if (Date.now() > otpExpiresAt) {
      toast.error('OTP has expired. Please request a new one.');
      setOtpSent(false);
      setOtp('');
      return;
    }
    if (otp === demoOtp) {
      setOtpVerified(true);
      toast.success('Email verified successfully!');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (strength < 2) { toast.error('Password is too weak'); return; }
    if (!capturedFace) { toast.error('Please capture your face for registration'); return; }
    if (!otpVerified) { toast.error('Please verify your email with OTP first'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch { toast.error('Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card-elevated p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Secure your digital legacy</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" placeholder="John Doe" required />
              </div>
            </div>

            {/* Email + OTP */}
            <div className="space-y-2">
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setOtpSent(false); setOtpVerified(false); }} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" placeholder="you@example.com" required />
              </div>
              
              {!otpVerified ? (
                !otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={!email || sendingOtp}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    {sendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground placeholder:tracking-normal"
                        placeholder="Enter OTP"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
                      >
                        Verify
                      </button>
                    </div>
                    {demoOtp && (
                      <p className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded text-center">
                        Demo OTP: <span className="font-mono font-bold text-primary">{demoOtp}</span>
                      </p>
                    )}
                    <button type="button" onClick={sendOtp} disabled={sendingOtp} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Resend OTP
                    </button>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-xs text-success font-medium">Email verified ✓</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{strengthLabels[strength - 1] || 'Too short'}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" placeholder="••••••••" required />
                {confirm && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {password === confirm ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-destructive" />}
                  </span>
                )}
              </div>
            </div>

            {/* Face Registration */}
            <div className="space-y-2">
              <label className="text-sm font-medium block">Face Registration <span className="text-destructive">*</span></label>
              <canvas ref={canvasRef} className="hidden" />
              {showCamera ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    <button type="button" onClick={capturePhoto} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                      📸 Capture Face
                    </button>
                    <button type="button" onClick={stopCamera} className="px-4 py-2 rounded-lg bg-destructive/80 text-destructive-foreground text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : capturedFace ? (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-success/30">
                    <img src={capturedFace} alt="Registered face" className="w-full aspect-video object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-success/90 text-success-foreground text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Registered
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={startCamera} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                      Retake Photo
                    </button>
                    <button type="button" onClick={downloadFace} className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={startCamera} className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-sm text-muted-foreground">
                  <Camera className="w-5 h-5" />
                  Open Camera to Register Face
                </button>
              )}
            </div>

            <button type="submit" disabled={loading || !capturedFace || !otpVerified} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
