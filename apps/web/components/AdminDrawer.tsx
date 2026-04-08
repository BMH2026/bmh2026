'use client';

/**
 * AdminDrawer — M3E Side Sheet (hamburger ≡)
 * Trượt từ phải sang, phủ lên toàn màn hình (modal side sheet).
 * Chứa các tính năng thứ cấp không cần truy cập nhanh:
 *   - Biểu đồ doanh thu (AdminChart)
 *   - Cập nhật kiến thức AI (QuickKnowledgeUpdate)
 *   - Quản lý đặt phòng (booking list)
 *   - Quản lý lịch tàu
 *   - Đăng xuất
 *
 * M3E motion:
 *   Enter: spring(damping 28, stiffness 260) — emphasized-decelerate
 *   Exit:  cubic-bezier(0.3,0,0.8,0.15) 180ms — emphasized-accelerate
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, BarChart3, Zap, CalendarDays, Ship, LogOut,
  ChevronRight, BookOpen,
} from 'lucide-react';
import { AdminChart } from '@/components/AdminChart';
import { QuickKnowledgeUpdate } from '@/components/QuickKnowledgeUpdate';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type DrawerView = 'menu' | 'chart' | 'knowledge' | 'bookings' | 'vessels';

const SHEET_ENTER  = { type: 'spring' as const, damping: 28, stiffness: 260, restDelta: 0.001 };
const SHEET_EXIT   = { ease: [0.3, 0, 0.8, 0.15] as const, duration: 0.18 };
const BACKDROP_IN  = { ease: [0.05, 0.7, 0.1, 1] as const, duration: 0.28 };
const BACKDROP_OUT = { ease: [0.3, 0, 0.8, 0.15] as const, duration: 0.18 };

// ── Menu items ─────────────────────────────────────────────────────────────────
const MENU_ITEMS: Array<{
  id: DrawerView;
  icon: React.ElementType;
  label: string;
  sub: string;
}> = [
  { id: 'chart',     icon: BarChart3,    label: 'Biểu đồ doanh thu',        sub: 'Ngày / Tuần / Tháng' },
  { id: 'knowledge', icon: Zap,          label: 'Cập nhật kiến thức AI',     sub: 'Dán từ Zalo, tự động bóc tách' },
  { id: 'bookings',  icon: CalendarDays, label: 'Quản lý đặt phòng',         sub: 'Xem tất cả đơn đặt' },
  { id: 'vessels',   icon: Ship,         label: 'Lịch tàu',                   sub: 'Cập nhật giờ tàu hôm nay' },
];

// ── Sub-view: Booking list placeholder ────────────────────────────────────────
function BookingListView() {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-[0.6875rem] font-sans text-text-secondary/60 text-center py-12">
        Chức năng quản lý đặt phòng đang phát triển.
      </p>
    </div>
  );
}

// ── Sub-view: Vessel schedule placeholder ─────────────────────────────────────
function VesselScheduleView() {
  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-[0.6875rem] font-sans text-text-secondary/60 text-center py-12">
        Chức năng cập nhật lịch tàu đang phát triển.
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function AdminDrawer({ isOpen, onClose }: Props) {
  const [view, setView] = useState<DrawerView>('menu');

  function handleClose() {
    setView('menu'); // reset về menu khi đóng
    onClose();
  }

  const viewTitle: Record<DrawerView, string> = {
    menu:      'Menu',
    chart:     'Biểu đồ doanh thu',
    knowledge: 'Cập nhật kiến thức AI',
    bookings:  'Quản lý đặt phòng',
    vessels:   'Lịch tàu',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: BACKDROP_IN }}
            exit={{ opacity: 0, transition: BACKDROP_OUT }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {/* ── Side Sheet ────────────────────────────────────────────────── */}
          <motion.div
            key="sheet"
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: SHEET_ENTER }}
            exit={{ x: '100%', transition: SHEET_EXIT }}
            className="fixed top-0 right-0 bottom-0 z-50
                       w-[min(88vw,360px)] flex flex-col
                       bg-bg-primary shadow-[−4px_0_32px_rgba(0,0,0,0.18)]"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4
                            border-b border-[var(--glass-border)]">
              {view !== 'menu' && (
                <button
                  onClick={() => setView('menu')}
                  className="flex items-center gap-1 text-[0.6875rem] font-sans font-medium
                             text-text-secondary active:text-text-primary transition-colors"
                >
                  ← Menu
                </button>
              )}
              <h2 className={`font-heading font-bold text-text-primary text-base
                              ${view === 'menu' ? '' : 'flex-1 text-center'}`}>
                {viewTitle[view]}
              </h2>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-full
                           bg-text-primary/8 text-text-secondary
                           active:bg-text-primary/15 transition-colors duration-[150ms]"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">

                {/* ── Menu list ─────────────────────────────────────────── */}
                {view === 'menu' && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0, transition: { ease: [0.05,0.7,0.1,1], duration: 0.22 } }}
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.12 } }}
                    className="flex flex-col py-3"
                  >
                    {MENU_ITEMS.map(({ id, icon: Icon, label, sub }) => (
                      <button
                        key={id}
                        onClick={() => setView(id)}
                        className="flex items-center gap-4 px-5 py-4
                                   active:bg-text-primary/8 transition-colors duration-[150ms]
                                   border-b border-[var(--glass-border)] last:border-0"
                      >
                        <div className="w-10 h-10 rounded-[12px] bg-text-primary/8
                                        flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-sans font-medium text-sm text-text-primary">{label}</p>
                          <p className="font-sans text-[0.6875rem] text-text-secondary/70 mt-0.5">{sub}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-secondary/40" strokeWidth={1.5} />
                      </button>
                    ))}

                    {/* Đăng xuất */}
                    <button
                      onClick={async () => {
                        await fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' });
                        window.location.href = '/vao';
                      }}
                      className="flex items-center gap-4 px-5 py-4 mt-2
                                 active:bg-red-500/8 transition-colors duration-[150ms]"
                    >
                      <div className="w-10 h-10 rounded-[12px] bg-red-500/10
                                      flex items-center justify-center shrink-0">
                        <LogOut className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-sans font-medium text-sm text-red-500">Đăng xuất</p>
                        <p className="font-sans text-[0.6875rem] text-text-secondary/60 mt-0.5">
                          Thoát khỏi khu vực admin
                        </p>
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* ── Chart ─────────────────────────────────────────────── */}
                {view === 'chart' && (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0, transition: { ease: [0.05,0.7,0.1,1], duration: 0.22 } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="p-4"
                  >
                    <AdminChart />
                  </motion.div>
                )}

                {/* ── Knowledge Update ──────────────────────────────────── */}
                {view === 'knowledge' && (
                  <motion.div
                    key="knowledge"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0, transition: { ease: [0.05,0.7,0.1,1], duration: 0.22 } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="p-4"
                  >
                    <QuickKnowledgeUpdate />
                  </motion.div>
                )}

                {/* ── Bookings ──────────────────────────────────────────── */}
                {view === 'bookings' && (
                  <motion.div
                    key="bookings"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0, transition: { ease: [0.05,0.7,0.1,1], duration: 0.22 } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="p-4"
                  >
                    <BookingListView />
                  </motion.div>
                )}

                {/* ── Vessels ───────────────────────────────────────────── */}
                {view === 'vessels' && (
                  <motion.div
                    key="vessels"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0, transition: { ease: [0.05,0.7,0.1,1], duration: 0.22 } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    className="p-4"
                  >
                    <VesselScheduleView />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
