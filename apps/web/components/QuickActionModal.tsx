'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  confirmColor?: string;
  largeSubtitle?: boolean;
}

export function QuickActionModal({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  icon, 
  confirmLabel, 
  onConfirm,
  confirmColor = "bg-accent",
  largeSubtitle = false
}: QuickActionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
          />

          {/* M3 Modal Container */}
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 32, stiffness: 320, restDelta: 0.001 } }}
            exit={{ opacity: 0, scale: 0.96, y: 16, transition: { duration: 0.16, ease: [0.3, 0, 0.8, 0.15] } }}
            className="relative w-full max-w-[360px] bg-bg-secondary/60 backdrop-blur-xl rounded-[28px] border border-text-primary/5 overflow-hidden p-6 text-center ring-1 ring-text-primary/10"
          >
            {/* M3 Iconic Container */}
            <div className={`w-12 h-12 rounded-2xl ${confirmColor}/10 flex items-center justify-center mx-auto mb-6 text-text-primary`}>
              {icon}
            </div>

            <h3 className="font-heading font-bold text-2xl text-text-primary mb-3 tracking-tight">
              {title}
            </h3>
            <p className={`${largeSubtitle ? 'text-2xl font-bold text-text-primary' : 'text-base text-text-primary/70'} mb-8 leading-snug whitespace-pre-line tracking-tight px-2`}>
              {subtitle}
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`relative overflow-hidden w-full py-4 rounded-full font-bold text-bg-primary transition-all after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12 ${confirmColor}`}
              >
                {confirmLabel}
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 rounded-full font-bold text-text-primary/60 hover:bg-text-primary/8 transition-colors"
                type="button"
              >
                để sau
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
