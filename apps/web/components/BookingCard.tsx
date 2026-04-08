'use client';

import { motion } from 'motion/react';

interface BookingCardProps {
  status: 'new' | 'deposited' | 'staying' | 'completed';
  guestName: string;
  dates: string;
  room: string;
}

export function BookingCard({ status, guestName, dates, room }: BookingCardProps) {
  const isNew = status === 'new';
  const isDeposited = status === 'deposited';

  return (
    <div className="bg-surface rounded-card p-5 shadow-soft border border-glass-border">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${
          isNew ? 'bg-red-500' : 
          isDeposited ? 'bg-gray-400' : 
          status === 'staying' ? 'bg-green-500' : 'bg-text-primary'
        }`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${
          isNew ? 'text-red-500' : 
          isDeposited ? 'text-gray-500' : 
          status === 'staying' ? 'text-green-500' : 'text-text-primary'
        }`}>
          {isNew ? 'ĐƠN MỚI' : isDeposited ? 'ĐÃ CỌC' : status === 'staying' ? 'ĐANG Ở' : 'HOÀN TẤT'}
        </span>
      </div>

      <h3 className="font-heading text-xl font-bold text-text-primary mb-1">{guestName}</h3>
      <p className="text-sm text-text-secondary mb-4">{dates} • {room}</p>

      {isNew && (
        <div className="grid grid-cols-2 gap-3">
          <motion.button whileTap={{ scale: 0.95 }} className="py-3 bg-green-500 text-white rounded-button font-bold">
            duyệt
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="py-3 bg-red-500/20 text-red-600 rounded-button font-bold">
            từ chối
          </motion.button>
        </div>
      )}

      {isDeposited && (
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.95 }} className="flex-1 py-3 bg-bg-secondary/50 text-text-primary rounded-button font-medium">
            gọi khách
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="flex-1 py-3 bg-bg-secondary/50 text-text-primary rounded-button font-medium">
            xem chi tiết
          </motion.button>
        </div>
      )}
    </div>
  );
}
