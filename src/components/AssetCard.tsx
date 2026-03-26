import React from 'react';
import { motion } from 'framer-motion';
import type { Asset } from '@/contexts/AppDataContext';
import { CreditCard, Globe, Coins, FileText, Package, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

const typeIcons: Record<Asset['type'], React.ElementType> = {
  bank: CreditCard,
  social: Globe,
  crypto: Coins,
  document: FileText,
  other: Package,
};

const typeLabels: Record<Asset['type'], string> = {
  bank: 'Bank Account',
  social: 'Social Media',
  crypto: 'Crypto Wallet',
  document: 'Document',
  other: 'Other',
};

interface AssetCardProps {
  asset: Asset;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const AssetCard = ({ asset, onEdit, onDelete, showActions = true }: AssetCardProps) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const Icon = typeIcons[asset.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">{asset.name}</h3>
            <p className="text-xs text-muted-foreground">{typeLabels[asset.type]}</p>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Edit className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Username</span>
          <span className="font-mono text-xs">{asset.username}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Password</span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-xs">{showPassword ? asset.password : '••••••••'}</span>
            <button onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        {asset.notes && (
          <div>
            <span className="text-muted-foreground">Notes: </span>
            <span className="text-xs">{asset.notes}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AssetCard;
