'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Users, BedDouble, BedSingle, Wifi, Wind, X, Check, PawPrint } from 'lucide-react';
import { formatVND } from '@/lib/constants';
import { useRooms, ApiRoom } from '@/lib/hooks/useRooms';

// M3 Expressive — enter slow/decelerate, exit fast/accelerate
const ENTER_SPRING = { type: 'spring' as const, damping: 30, stiffness: 300, restDelta: 0.001 };
const EXPAND_EASE  = { duration: 0.28, ease: [0.2, 0, 0, 1] as const };   // M3 emphasized
const EXIT_EASE    = { duration: 0.18, ease: [0.3, 0, 0.8, 0.15] as const }; // M3 emphasized-accelerate

export function RoomCatalog({ onBook }: { onBook: (roomId: string) => void }) {
  const { rooms, isLoading } = useRooms();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 1. Sort trước khi render bento: Đắt nhất lên đầu làm Hero
  const sortedRooms = useMemo(() => 
    [...rooms].sort((a, b) => (b.weekdayPrice || 0) - (a.weekdayPrice || 0)),
  [rooms]);

  if (isLoading) {
    return <BentoSkeleton />;
  }

  if (sortedRooms.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-3">
      {sortedRooms.map((room, index) => (
        <RoomTile
          key={room.id}
          room={room}
          index={index}
          isExpanded={expandedId === room.id}
          onToggle={() => setExpandedId(expandedId === room.id ? null : room.id)}
          onBook={() => onBook(room.id)}
        />
      ))}
    </div>
  );
}

function BentoSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 animate-pulse">
      <div className="col-span-2 aspect-[4/3] bg-bg-secondary/60 rounded-card" />
      <div className="aspect-square bg-bg-secondary/60 rounded-card" />
      <div className="aspect-square bg-bg-secondary/60 rounded-card" />
      <div className="col-span-2 h-[120px] bg-bg-secondary/60 rounded-card" />
    </div>
  );
}

function RoomTile({ 
  room, 
  index, 
  isExpanded, 
  onToggle, 
  onBook 
}: { 
  room: ApiRoom; 
  index: number; 
  isExpanded: boolean; 
  onToggle: () => void;
  onBook: () => void;
}) {
  const tileRef = useRef<HTMLDivElement>(null);

  // 4. Scroll-to-expanded sau expand
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        tileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  // Determine variant
  let variant: 'hero' | 'medium' | 'wide' = 'wide';
  if (index === 0) variant = 'hero';
  else if (index === 1 || index === 2) variant = 'medium';

  const bedCountLabel = room.features.find(f => f.toLowerCase().includes('giường')) || '1 Giường';

  const bedIcon = bedCountLabel.includes('2')
    ? <BedDouble className="w-3.5 h-3.5" strokeWidth={1.5} />
    : <BedSingle className="w-3.5 h-3.5" strokeWidth={1.5} />;

  return (
    <div
      ref={tileRef}
      className={`
        relative flex flex-col bg-bg-secondary/40 backdrop-blur border border-text-primary/5 rounded-card overflow-hidden
        ${variant === 'hero' || variant === 'wide' || isExpanded ? 'col-span-2' : 'col-span-1'}
      `}
    >
      {/* State Layer overlay - M3 Pattern */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer overflow-hidden rounded-[inherit] after:content-[''] after:absolute after:inset-0 after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
        onClick={onToggle}
      />

      {/* --- Preview State (Luôn hiện) --- */}
      <div className={`flex ${variant === 'wide' && !isExpanded ? 'flex-row h-32' : 'flex-col'}`}>
        {/* Image Container */}
        <div className={`relative bg-text-primary/10 overflow-hidden shrink-0 ${
          variant === 'hero' ? 'h-[170px]' :
          variant === 'medium' ? 'h-[105px]' :
          variant === 'wide' && !isExpanded ? 'w-[40%] h-full' : 'aspect-[16/9]'
        }`}>
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Gradients & Badges - Chỉ hiện ở Hero hoặc khi Expand */}
          {(variant === 'hero' || isExpanded) && (
            <>
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-text-primary/60 via-text-primary/20 to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3 flex gap-2">
                {room.badge && (
                  <span className="px-2 py-0.5 bg-accent text-white text-[10px] font-sans font-bold rounded-full uppercase tracking-wider">
                    {room.badge}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-bg-primary/80 backdrop-blur text-text-primary text-[10px] font-sans font-bold rounded-full flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-accent" strokeWidth={1.5} /> Bể bơi chung
                </span>
              </div>
            </>
          )}
        </div>

        {/* Content Preview */}
        <div className={`p-4 flex flex-col justify-between flex-1 ${variant === 'wide' && !isExpanded ? 'gap-1' : 'gap-2'}`}>
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className={`font-heading font-bold text-text-primary leading-tight ${
                variant === 'hero' || isExpanded ? 'text-xl' : 'text-base'
              }`}>
                {room.name}
              </h3>
              {!isExpanded && (
                <div className="flex items-center gap-2 mt-1 opacity-60">
                   <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
                    {bedIcon} {bedCountLabel.split(' ')[0]}G
                   </div>
                   <div className="w-1 h-1 rounded-full bg-text-primary/20" />
                   <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-tighter">
                    <Users className="w-3 h-3" /> {room.capacityMax}N
                   </div>
                </div>
              )}
            </div>
            {isExpanded && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="relative z-20 w-8 h-8 rounded-full bg-bg-secondary flex items-center justify-center text-text-primary/60 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isExpanded && (
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="font-heading font-bold text-accent text-lg">
                {formatVND(room.weekdayPrice).split('đ')[0]}
              </span>
              <span className="text-[10px] text-text-secondary">/đêm</span>
            </div>
          )}
        </div>
      </div>

      {/* --- Detail Section (Expand-in-place) --- */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: EXPAND_EASE }}
            exit={{ height: 0, opacity: 0, transition: EXIT_EASE }}
            className="overflow-hidden bg-bg-primary border-t border-text-primary/5"
          >
            <div className="p-5 flex flex-col gap-5">
              {/* Description */}
              {room.description && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {room.description}
                </p>
              )}

              {/* Price Table */}
              <div className="bg-bg-secondary/30 rounded-[20px] p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Thứ 2 - Thứ 5</span>
                  <span className="font-heading font-bold text-text-primary">{formatVND(room.weekdayPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">T6 - CN, Lễ</span>
                  <span className="font-heading font-bold text-accent">{formatVND(room.weekendPrice)}</span>
                </div>
                {room.extraPersonNote && (
                   <div className="pt-2 border-t border-text-primary/5 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-[0.6875rem] font-sans text-text-secondary leading-relaxed">
                      {room.extraPersonNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Amenities Micro-pills — M3 Expressive: màu sắc phân biệt thị giác */}
              <div className="flex flex-wrap gap-2">
                {/* Giường — accent (primary brand) */}
                <span className="px-3 py-1.5 bg-accent/15 text-accent text-[0.6875rem] font-sans font-bold rounded-full flex items-center gap-1.5">
                  {bedIcon} {bedCountLabel}
                </span>
                {/* Sức chứa — teal (capacity context) */}
                <span className="px-3 py-1.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 text-[0.6875rem] font-sans font-bold rounded-full flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" strokeWidth={1.5} /> {room.capacityMax} người
                </span>
                {/* Bể bơi chung — blue (water) */}
                <span className="px-3 py-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[0.6875rem] font-sans font-bold rounded-full flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" strokeWidth={1.5} /> Bể bơi chung
                </span>
                {/* Điều hòa — muted (utility) */}
                <span className="px-3 py-1.5 bg-text-primary/8 text-text-primary/70 text-[0.6875rem] font-sans font-bold rounded-full flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5" strokeWidth={1.5} /> Điều hòa
                </span>
                {/* Wifi — purple (tech) */}
                <span className="px-3 py-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[0.6875rem] font-sans font-bold rounded-full flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5" strokeWidth={1.5} /> Wifi
                </span>
                {/* Thú cưng — green (friendly) */}
                <span className="px-3 py-1.5 bg-green-500/10 text-green-700 dark:text-green-400 text-[0.6875rem] font-sans font-bold rounded-full flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5" strokeWidth={1.5} /> Thú cưng
                </span>
              </div>

              {/* CTA 48px */}
              <button
                onClick={(e) => { e.stopPropagation(); onBook(); }}
                className="relative z-20 w-full min-h-[48px] py-4 bg-text-primary text-bg-primary rounded-button font-bold text-base tracking-widest uppercase flex justify-center items-center overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-bg-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12"
              >
                Chốt luôn!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
