import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Trash2, LogOut, Palette, Database, Shield } from 'lucide-react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { isDark, toggle } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const clearAllData = () => {
    const keys = ['pdcp_token', 'pdcp_user', 'pdcp_registered_face', 'pdcp_recorded_videos', 'pdcp_assets', 'pdcp_heirs', 'pdcp_will', 'pdcp_activities'];
    keys.forEach(k => localStorage.removeItem(k));
    toast.success('All data cleared successfully');
    logout();
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Customize your experience</p>
      </motion.div>

      <div className="space-y-4 mt-6 max-w-2xl">
        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Appearance</h3>
                <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 transition-colors text-sm"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-info/10">
                <Database className="w-5 h-5 text-info" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Data Storage</h3>
                <p className="text-xs text-muted-foreground">All data stored locally in your browser</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Active</span>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/10">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Face Biometrics</h3>
                <p className="text-xs text-muted-foreground">Face verification required at login</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Enabled</span>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 border-destructive/20">
          <h3 className="font-semibold text-sm text-destructive mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button
              onClick={clearAllData}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All Data
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;