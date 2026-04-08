'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle } from 'lucide-react';

export function LongXiFAB() {
  const pathname = usePathname();
  
  // 1. Ẩn Long Xì FAB ở Trang chủ và Trang Chat
  if (pathname === '/' || pathname === '/faq') return null;

  // 3. Hàm getPageContext: Phân tích ngữ cảnh hiện tại để đưa ra MasterChips phù hợp
  const getPageContext = () => {
    switch(pathname) {
      case '/rooms':
        return { message: "Có loại phòng cho 3 người không?", intent: 'room_capacity' };
      case '/dining':
        return { message: "Menu hải sản hnay có gì?", intent: 'seafood_menu' };
      case '/experience':
      case '/explore':
        return { message: "Thuê xe ra Đền Cậu bao nhiêu?", intent: 'tour_pricing' };
      default:
        return { message: "Alo Long Xì ơi!", intent: 'general' };
    }
  };

  const context = getPageContext();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute bottom-24 right-5 z-50 flex flex-col items-end gap-3 pointer-events-none"
      >
        {/* MasterChip (Câu hỏi mồi theo ngữ cảnh bản chất M3E) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-wrap justify-end gap-2"
        >
          <Link href={`/faq?q=${encodeURIComponent(context.message)}`} className="pointer-events-auto">
            <div className="bg-surface/95 backdrop-blur-xl text-text-primary px-4 py-2 rounded-2xl rounded-br-sm shadow-glass text-[13px] font-medium border border-glass-border cursor-pointer active:scale-95 transition-transform flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                {context.message}
              </div>
          </Link>
        </motion.div>

        {/* The FAB itself */}
        <Link href="/faq" className="pointer-events-auto">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-16 h-16 rounded-full p-1 bg-white/40 backdrop-blur-xl shadow-elevated border border-white/50"
          >
            <div className="w-full h-full rounded-full border-2 border-accent/80 overflow-hidden relative shadow-inner">
              <Image src="/longxiavatar.jpg" alt="Long Xì AI" fill className="object-cover" />
            </div>
            
            {/* Online indicator */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            
            {/* Subtle glow */}
            <motion.div 
              animate={{ 
                boxShadow: ["0px 0px 0px 0px rgba(244, 162, 97, 0)", "0px 0px 0px 10px rgba(244, 162, 97, 0.1)", "0px 0px 0px 0px rgba(244, 162, 97, 0)"]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full"
            />
          </motion.div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
