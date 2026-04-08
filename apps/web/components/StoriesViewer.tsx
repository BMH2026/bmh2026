'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function StoriesViewer({ 
  isOpen, 
  onClose,
  initialStoryIndex = 0
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialStoryIndex?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setCurrentIndex(initialStoryIndex);
      setProgress(0);
    }
  }

  const stories = [
    { id: 1, title: 'Bãi Robinson', image: 'https://picsum.photos/seed/robinson/1080/1920' },
    { id: 2, title: 'BBQ Tối', image: 'https://picsum.photos/seed/bbq/1080/1920' },
    { id: 3, title: 'Bình Minh', image: 'https://picsum.photos/seed/sunrise/1080/1920' },
    { id: 4, title: 'Câu Mực', image: 'https://picsum.photos/seed/squid/1080/1920' },
  ];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const duration = 15000; // 15 seconds per story
    const interval = 100; // Update every 100ms
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0;
          } else {
            onClose();
            return 0;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, stories.length, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col"
        >
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-4 pt-safe-top">
            {stories.map((_, idx) => (
              <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ 
                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4 pt-safe-top mt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50 bg-accent flex items-center justify-center text-bg-primary">
                <Zap className="w-5 h-5" strokeWidth={2} />
              </div>
              <span className="text-white font-medium text-sm drop-shadow-md">{stories[currentIndex].title}</span>
            </div>
            <button onClick={onClose} className="p-2 text-white active:scale-95">
              <X className="w-6 h-6 drop-shadow-md" strokeWidth={1.5} />
            </button>
          </div>

          {/* Image */}
          <div className="relative flex-1 w-full h-full">
            <Image 
              src={stories[currentIndex].image} 
              alt={stories[currentIndex].title}
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40" />
          </div>

          {/* Tap Areas */}
          <div className="absolute inset-0 z-40 flex">
            <div 
              className="w-1/3 h-full" 
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(c => c - 1);
                  setProgress(0);
                }
              }}
            />
            <div 
              className="w-2/3 h-full" 
              onClick={() => {
                if (currentIndex < stories.length - 1) {
                  setCurrentIndex(c => c + 1);
                  setProgress(0);
                } else {
                  onClose();
                }
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
