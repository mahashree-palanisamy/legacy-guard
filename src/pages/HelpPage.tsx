import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Shield, Video, Users, FileText, Camera, Upload, Heart } from 'lucide-react';

const sections = [
  {
    icon: Camera,
    title: 'Face Registration & Verification',
    content: 'During registration, your face is captured and stored securely. At every login, a live photo is compared against your registered face to verify your identity. Login is blocked if verification fails.'
  },
  {
    icon: Shield,
    title: 'Managing Digital Assets',
    content: 'Add all your digital accounts — bank accounts, social media, crypto wallets, documents, and more. Each asset is encrypted and stored locally. You can assign heirs to specific assets.'
  },
  {
    icon: Users,
    title: 'Heir Management',
    content: 'Add your loved ones as heirs with their name, email, and relationship. You can assign specific assets to each heir. They will only gain access after the death verification process.'
  },
  {
    icon: Video,
    title: 'Legacy Video Messages',
    content: 'Record video messages for your heirs using your webcam, or upload pre-recorded videos. Each video undergoes AI authenticity analysis to verify it was recorded voluntarily.'
  },
  {
    icon: FileText,
    title: 'Digital Will',
    content: 'Write your digital will using the built-in text editor. You can update it anytime. Your will is stored securely and will be shared with your heirs when the time comes.'
  },
  {
    icon: Upload,
    title: 'Death Verification Process',
    content: 'Heirs can access the platform by uploading a death certificate on the Death Verification page. After verification, they gain access to assigned assets, video messages, and the digital will.'
  },
];

const HelpPage = () => (
  <div className="page-container">
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-1">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h1 className="section-title">Help & Guide</h1>
      </div>
      <p className="text-muted-foreground text-sm mt-1">Learn how to use the platform</p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 mt-6 gradient-primary"
    >
      <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 text-primary-foreground" />
        <div>
          <h2 className="font-bold text-primary-foreground">Your Legacy Matters</h2>
          <p className="text-primary-foreground/70 text-sm">This platform helps you securely organize your digital life for your loved ones.</p>
        </div>
      </div>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {sections.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          className="glass-card p-5"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default HelpPage;