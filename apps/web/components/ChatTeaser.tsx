'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Ticket, BedDouble, CarFront, Send } from 'lucide-react';

export function ChatTeaser() {
  const router = useRouter();

  const handleChatClick = (query?: string) => {
    if (query) {
      router.push(`/faq?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/faq');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* M3 Suggestion Chips (Replaced sparkles) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-1">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => handleChatClick('vé tàu?')}
          className="shrink-0 flex items-center gap-1.5 h-11 px-4 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/10 text-[11px] font-semibold text-[#FEF7FF] hover:bg-white/20 transition-all shadow-sm"
        >
          <Ticket className="w-3.5 h-3.5 text-accent" strokeWidth={2} /> vé tàu?
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => handleChatClick('giá phòng?')}
          className="shrink-0 flex items-center gap-1.5 h-11 px-4 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/10 text-[11px] font-semibold text-[#FEF7FF] hover:bg-white/20 transition-all shadow-sm"
        >
          <BedDouble className="w-3.5 h-3.5 text-accent" strokeWidth={2} /> giá phòng?
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => handleChatClick('đặt xe điện')}
          className="shrink-0 flex items-center gap-1.5 h-11 px-4 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/10 text-[11px] font-semibold text-[#FEF7FF] hover:bg-white/20 transition-all shadow-sm"
        >
          <CarFront className="w-3.5 h-3.5 text-accent" strokeWidth={2} /> đặt xe điện
        </motion.button>
      </div>

      {/* M3 Search-style Input Teaser */}
      <motion.button 
        whileTap={{ scale: 0.98 }}
        onClick={() => handleChatClick()}
        className="w-full h-14 bg-white/10 backdrop-blur-lg rounded-[28px] px-6 flex items-center justify-between ring-1 ring-white/10 hover:bg-white/20 transition-all shadow-xl shadow-black/10 group"
      >
        <span className="text-[#FEF7FF]/70 text-[13px] font-medium tracking-tight">hỏi Long Xì AI bất cứ điều gì...</span>
        <div className="w-10 h-10 rounded-full bg-[#FEF7FF] flex items-center justify-center text-[#1a4a3e] shadow-md transition-transform group-hover:scale-105 active:scale-90">
          <Send className="w-4.5 h-4.5" strokeWidth={2.5} />
        </div>
      </motion.button>
    </div>
  );
}
