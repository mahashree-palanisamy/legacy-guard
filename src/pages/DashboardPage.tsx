import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, Activity, Video, Quote, Sparkles, Heart } from 'lucide-react';
import StatCard from '@/components/StatCard';
import Timeline from '@/components/Timeline';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuth } from '@/contexts/AuthContext';

const quotes = [
  { text: "Your legacy is not what you leave behind, but who you impact.", author: "Unknown" },
  { text: "Plan today, protect tomorrow.", author: "Ancient Proverb" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "What we do for ourselves dies with us. What we do for others remains immortal.", author: "Albert Pike" },
  { text: "Your legacy lives beyond time.", author: "Wisdom" },
];

const DashboardPage = () => {
  const { assets, heirs, videos, willContent, activities } = useAppData();
  const { user } = useAuth();

  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="page-container">
      {/* Welcome Banner with Animated Character */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl gradient-primary p-8 mb-8"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-foreground/20 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary-foreground/10 translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-foreground/80" />
              <span className="text-primary-foreground/70 text-sm font-medium">Welcome back</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Hi {user?.name || 'User'}! <span className="animate-wave text-3xl">👋</span>
            </h1>
            <p className="text-primary-foreground/70 text-sm mt-2 max-w-lg">
              Your legacy is safe and secure 💖 Keep your records up to date to protect what matters most.
            </p>
          </div>
          {/* Animated Character */}
          <div className="hidden md:flex flex-col items-center">
            <motion.div
              className="animate-float"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="w-24 h-24 rounded-full gradient-primary border-4 border-primary-foreground/20 flex items-center justify-center text-5xl shadow-lg">
                🧑‍💻
              </div>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-2 px-3 py-1.5 rounded-xl bg-primary-foreground/20 backdrop-blur-sm text-center"
              >
                <p className="text-xs text-primary-foreground font-medium">Your Digital Guardian</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quote of the Day */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-3 right-4 opacity-10">
          <Quote className="w-16 h-16 text-primary" />
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Quote of the Day</p>
            <p className="text-base italic text-foreground leading-relaxed">"{todayQuote.text}"</p>
            <p className="text-xs text-muted-foreground mt-2">— {todayQuote.author}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Assets" value={assets.length} icon={Shield} color="primary" />
        <StatCard title="Total Heirs" value={heirs.length} icon={Users} color="accent" />
        <StatCard title="Legacy Videos" value={videos.length} icon={Video} color="success" />
        <StatCard title="Will Status" value={willContent ? 'Written' : 'Pending'} icon={FileText} color={willContent ? 'success' : 'warning'} />
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-xl bg-primary/10">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Asset Breakdown</h3>
          </div>
          {assets.length > 0 ? (
            <div className="space-y-2">
              {['bank', 'social', 'crypto', 'document', 'other'].map(type => {
                const count = assets.filter(a => a.type === type).length;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{type}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No assets added yet</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-xl bg-secondary/10">
              <Users className="w-4 h-4 text-secondary" />
            </div>
            <h3 className="text-sm font-semibold">Recent Heirs</h3>
          </div>
          {heirs.length > 0 ? (
            <div className="space-y-2">
              {heirs.slice(0, 3).map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{h.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{h.relationship}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No heirs added yet</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-xl bg-success/10">
              <Activity className="w-4 h-4 text-success" />
            </div>
            <h3 className="text-sm font-semibold">Platform Status</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Security</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Face ID</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Registered</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activities</span>
              <span className="font-medium">{activities.length}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="glass-card p-5">
          <Timeline items={activities.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;