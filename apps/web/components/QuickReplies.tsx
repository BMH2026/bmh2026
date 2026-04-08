'use client';

import { motion } from 'motion/react';
import { BedDouble, Ship, Clock, Tent, Utensils } from 'lucide-react';

const replies = [
  { label: 'giá phòng?', icon: BedDouble },
  { label: 'vé tàu?', icon: Ship },
  { label: 'check-in mấy giờ?', icon: Clock },
  { label: 'bãi robinson', icon: Tent },
  { label: 'ăn gì?', icon: Utensils },
];

export function QuickReplies({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 w-full">
      {replies.map((reply) => {
        const Icon = reply.icon;
        return (
          <button
            key={reply.label}
            onClick={() => onSelect(reply.label)}
            className="relative shrink-0 flex items-center gap-1.5 h-[32px] px-4 rounded-[8px] border border-text-primary/20 bg-surface text-text-primary text-sm font-medium transition-all after:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:min-w-[44px] before:min-h-[44px]"
          >
            <Icon className="w-[18px] h-[18px] text-accent" strokeWidth={1.5} />
            {reply.label}
          </button>
        );
      })}
    </div>
  );
}
