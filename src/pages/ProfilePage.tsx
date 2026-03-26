import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Mail, Shield, Camera, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';

const FACE_KEY = 'pdcp_registered_face';

const ProfilePage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const registeredFace = localStorage.getItem(FACE_KEY);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage your account details</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary/30">
              {registeredFace ? (
                <img src={registeredFace} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-foreground" />
                </div>
              )}
            </div>
            <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
            <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-xs font-medium gradient-primary text-primary-foreground">
              <Shield className="w-3 h-3" /> {user?.role || 'OWNER'}
            </span>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2">
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-primary" /> Account Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input defaultValue={user?.name || ''} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input defaultValue={user?.email || ''} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" readOnly />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Role</label>
                <input defaultValue={user?.role || 'OWNER'} className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm" readOnly />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Registered Face</label>
                {registeredFace ? (
                  <div className="flex items-center gap-3">
                    <img src={registeredFace} alt="Registered face" className="w-16 h-16 rounded-xl object-cover border border-border" />
                    <span className="text-sm text-success font-medium">✓ Face registered</span>
                  </div>
                ) : (
                  <p className="text-sm text-warning">No face registered yet</p>
                )}
              </div>
            </div>

            <button
              onClick={() => toast.success('Profile updated successfully!')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;