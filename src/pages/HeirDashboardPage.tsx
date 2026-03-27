import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Video, FileText, Lock, Heart } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import AssetCard from '@/components/AssetCard';
import VideoCard from '@/components/VideoCard';

const HeirDashboardPage = () => {
  const { assets, videos, willContent } = useAppData();

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="section-title">Heir Dashboard</h1>
        </div>

        {/* Emotional message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-5 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/10"
        >
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">You are viewing the legacy of your loved one 💖</span>
          </div>
          <p className="text-xs text-muted-foreground">Access to inherited digital assets has been granted. All content is read-only.</p>
        </motion.div>
      </motion.div>

      {/* Assigned Assets */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" /> Assigned Assets
        </h2>
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((a) => <AssetCard key={a.id} asset={a} showActions={false} />)}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">No assets assigned to you.</div>
        )}
      </div>

      {/* Video Messages */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-accent" /> Video Messages
        </h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-muted-foreground text-sm">No video messages available.</div>
        )}
      </div>

      {/* Will Content */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-warning" /> Digital Will
        </h2>
        <div className="glass-card p-6">
          {willContent ? (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{willContent}</pre>
          ) : (
            <p className="text-muted-foreground text-sm text-center">No will document available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeirDashboardPage;
