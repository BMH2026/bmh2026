'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('VI');
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'VI', label: 'Tiếng Việt' },
    { code: 'EN', label: 'English' },
    { code: 'ZH', label: '中文' }
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative z-50" ref={containerRef}>
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-text-primary text-bg-primary shadow-elevated border border-bg-primary/20"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" strokeWidth={1.5} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-40 glass rounded-card overflow-hidden shadow-elevated border border-glass-border text-text-primary"
          >
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-surface ${lang === l.code ? 'font-bold bg-surface text-text-primary' : 'text-text-secondary'}`}
              >
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
