import React from 'react';
import { motion } from 'framer-motion';
import type { VideoMessage } from '@/contexts/AppDataContext';
import { Video, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface VideoCardProps {
  video: VideoMessage;
}

const VideoCard = ({ video }: VideoCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card overflow-hidden"
  >
    <div className="aspect-video bg-muted flex items-center justify-center">
      <Video className="w-10 h-10 text-muted-foreground/30" />
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-sm">{video.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{video.fileName}</p>
      <p className="text-xs text-muted-foreground">{new Date(video.createdAt).toLocaleDateString()}</p>

      {video.analysisResult && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {video.analysisResult.status === 'verified' ? (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-medium text-warning">
                <AlertTriangle className="w-3.5 h-3.5" /> Review Needed
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {video.analysisResult.confidence}% confidence
            </span>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);

export default VideoCard;
