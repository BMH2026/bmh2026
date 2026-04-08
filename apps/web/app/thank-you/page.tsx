'use client';

/**
 * /thank-you — Auto-kick landing page
 * Shown when a room session expires (TTL reached or terminated by staff).
 * Middleware redirects here + clears the room_session cookie.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Sun, Heart, Star } from 'lucide-react';

const ENTER = { type: 'spring' as const, damping: 26, stiffness: 220, restDelta: 0.001 };

export default function ThankYouPage() {
  // Clear any lingering cookie client-side as belt-and-suspenders
  useEffect(() => {
    fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-bg-primary overflow-hidden px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={ENTER}
        className="flex flex-col items-center gap-6 text-center max-w-xs"
      >
        {/* Icon cluster */}
        <motion.div
          initial={{ rotate: -10, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ ...ENTER, delay: 0.15 }}
          className="relative w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full bg-accent/20 flex items-center justify-center">
            <Sun className="w-10 h-10 text-accent" strokeWidth={1.5} />
          </div>
          <motion.div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ ...ENTER, delay: 0.3 }}
          >
            <Heart className="w-4 h-4 text-red-400" strokeWidth={1.5} />
          </motion.div>
          <motion.div className="absolute -bottom-1 -left-2 w-8 h-8 rounded-full bg-bg-primary flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ ...ENTER, delay: 0.45 }}
          >
            <Star className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.2 }}
          className="flex flex-col gap-2"
        >
          <h1 className="font-heading text-2xl font-bold text-text-primary leading-tight">
            Cảm ơn bạn đã ở cùng Bình Minh!
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Phiên lưu trú của bạn đã kết thúc. Đảo Minh Châu luôn đón bạn quay lại.
          </p>
        </motion.div>

        {/* Divider */}
        <div className="w-16 h-px bg-text-secondary/20" />

        {/* Quote */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ ...ENTER, delay: 0.4 }}
          className="text-[0.6875rem] font-sans text-text-secondary/60 leading-relaxed"
        >
          "Cứ để đất liền đợi chúng ta..."
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTER, delay: 0.5 }}
          className="flex flex-col gap-3 w-full"
        >
          <Link href="/"
            className="relative overflow-hidden flex items-center justify-center
                       min-h-[48px] rounded-button bg-accent text-bg-primary
                       text-sm font-medium font-sans
                       after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                       after:bg-bg-primary/0 after:transition-[background-color] after:duration-[15ms]
                       hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12"
          >
            Về trang chủ
          </Link>
          <a href="tel:0965312678"
            className="text-[0.6875rem] font-sans text-text-secondary/60 text-center
                       hover:text-accent transition-colors duration-[200ms]"
          >
            Đặt phòng lần sau: 0965.312.678
          </a>
        </motion.div>
      </motion.div>

      {/* Brand footer */}
      <p className="absolute bottom-4 text-[0.6rem] font-sans text-text-secondary/30">
        Website được tạo bởi Vân Đồn Solutions ©
      </p>
    </div>
  );
}
