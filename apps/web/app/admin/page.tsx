'use client';

/**
 * Admin Dashboard — single-page bento layout.
 * Không scroll trên page shell (h-[100dvh] overflow-hidden).
 *
 * Layout (top → bottom):
 *   ~52px  Header: BMH logo | theme toggle | refresh | Check-in QR | ≡ Hamburger
 *   flex-1  Bento grid (4 zone):
 *             Zone 1: Room Grid 16 phòng — full width
 *             Zone 2: 4 KPI tiles (2×2) — arrivals, departures, revenue, sessions
 *             Zone 3: Ferry Banner — full width
 *             Zone 4: Pending Bookings Banner — full width
 *   84px   Bottom nav (MobileNav handles itself)
 *
 * M3E: spring(damping 26, stiffness 220) enter | cubic-bezier(0.3,0,0.8,0.15) exit
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  QrCode, Menu, Ship, Users, TrendingUp,
  BedDouble, ArrowDownToLine, ArrowUpFromLine,
  Sun, Moon, AlertCircle, RefreshCw,
} from 'lucide-react';

import { AdminQRModal }        from '@/components/AdminQRModal';
import { AdminDrawer }         from '@/components/AdminDrawer';
import { RoomStatusGrid }      from '@/components/RoomStatusGrid';
import { AdminSessionsWidget } from '@/components/AdminSessionsWidget';
import type { RoomUnit }       from '@/lib/constants';
import type { RoomStatusData } from '@/components/RoomStatusGrid';

// ── Motion tokens (M3E emphasized-decelerate) ─────────────────────────────────
const ENTER = { type: 'spring' as const, damping: 26, stiffness: 220, restDelta: 0.001 };

// ── Types ─────────────────────────────────────────────────────────────────────
interface TodayMetrics {
  arrivalsToday:      number;
  departuresToday:    number;
  revenueToday:       number;      // VNĐ
  activeSessionCount: number;
  nextVesselTime:     string | null;
  nextVesselName:     string | null;
  pendingBookings:    number;
}

// ── KPI Bento Cell ────────────────────────────────────────────────────────────
function KpiCell({
  icon: Icon, label, value, sub, accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`
      flex flex-col justify-between p-3 rounded-[20px] border min-h-[72px]
      ${accent
        ? 'bg-text-primary text-bg-primary border-transparent'
        : 'bg-surface text-text-primary border-[var(--glass-border)]'}
    `}>
      <div className={`flex items-center gap-1.5
                       ${accent ? 'text-bg-primary/70' : 'text-text-secondary'}`}>
        <Icon className="w-3 h-3" strokeWidth={1.5} />
        <span className="text-[0.5625rem] font-sans font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div>
        <p className={`font-heading font-bold text-lg leading-none
                       ${accent ? 'text-bg-primary' : 'text-text-primary'}`}>
          {value}
        </p>
        {sub && (
          <p className={`text-[0.5rem] font-sans mt-0.5
                         ${accent ? 'text-bg-primary/55' : 'text-text-secondary/55'}`}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Ferry Banner ──────────────────────────────────────────────────────────────
function FerryBanner({ time, name }: { time: string | null; name: string | null }) {
  return (
    <div className="col-span-2 flex items-center gap-3
                    bg-text-primary/6 border border-[var(--glass-border)]
                    rounded-[20px] px-4 py-3 min-h-[56px]">
      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
        <Ship className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.5rem] font-sans text-text-secondary/70 uppercase tracking-wider">
          Chuyến tàu tiếp theo
        </p>
        <p className="font-heading font-bold text-text-primary text-sm leading-tight">
          {time ?? '—'}
          {name && <span className="text-text-secondary font-normal text-xs ml-1.5">{name}</span>}
        </p>
      </div>
      {!time && (
        <span className="text-[0.5rem] font-sans text-text-secondary/40 shrink-0">Chưa cập nhật</span>
      )}
    </div>
  );
}

// ── Pending Bookings Banner ───────────────────────────────────────────────────
function PendingBanner({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="col-span-2 flex items-center gap-2.5
                      bg-green-500/8 border border-green-500/20
                      rounded-[20px] px-4 py-3 min-h-[48px]">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
        <p className="text-[0.6875rem] font-sans font-medium text-green-600">
          Không có đơn nào chờ duyệt
        </p>
      </div>
    );
  }
  return (
    <div className="col-span-2 flex items-center justify-between
                    bg-red-500/10 border border-red-500/25
                    rounded-[20px] px-4 py-3 min-h-[48px]">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.5} />
        <p className="text-[0.6875rem] font-sans font-medium text-red-500">
          {count} đơn chờ duyệt
        </p>
      </div>
      <span className="px-2 py-0.5 bg-red-500 text-white text-[0.6rem]
                       font-sans font-bold rounded-full min-w-[18px] text-center">
        {count}
      </span>
    </div>
  );
}

// ── Room Detail Bottom Sheet ──────────────────────────────────────────────────
function RoomSheet({
  room, status, onClose,
}: {
  room: RoomUnit;
  status: RoomStatusData | undefined;
  onClose: () => void;
}) {
  const SHEET_ENTER = { type: 'spring' as const, damping: 32, stiffness: 300 };
  const SHEET_EXIT  = { ease: [0.3, 0, 0.8, 0.15] as const, duration: 0.18 };

  const typeLabel = {
    'phi-thuyen-1': 'Phi Thuyền 1 giường',
    'phi-thuyen-2': 'Phi Thuyền 2 giường',
    'homestay-1':   'Nhà Gỗ 1 giường',
    'homestay-2':   'Nhà Gỗ 2 giường',
  }[room.type] ?? room.type;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: SHEET_ENTER }}
        exit={{ y: '100%', transition: SHEET_EXIT }}
        className="fixed bottom-0 left-0 right-0 z-50
                   bg-bg-primary rounded-t-[28px] p-5
                   shadow-[0_-8px_32px_rgba(0,0,0,0.18)]"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 bg-text-primary/20 rounded-full mx-auto mb-5" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-text-primary text-xl">Phòng {room.id}</h3>
            <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">{typeLabel}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[0.6rem] font-sans font-medium
            ${!status || status.status === 'empty'   ? 'bg-text-primary/8 text-text-secondary'
            : status.status === 'occupied'            ? 'bg-green-500/15 text-green-600'
            : status.status === 'checkout'            ? 'bg-red-500/12 text-red-500'
            : status.status === 'checkin'             ? 'bg-amber-400/15 text-amber-500'
            :                                           'bg-sky-500/12 text-sky-500'}`}>
            {!status || status.status === 'empty' ? 'Trống'
             : status.status === 'occupied'  ? 'Đang ở'
             : status.status === 'checkout'  ? 'Trả phòng hôm nay'
             : status.status === 'checkin'   ? 'Nhận phòng hôm nay'
             : 'Đang dọn'}
          </span>
        </div>
        {status?.guestName && (
          <div className="bg-surface border border-[var(--glass-border)] rounded-[16px] p-4 mb-4">
            <p className="text-[0.55rem] font-sans text-text-secondary/70 uppercase tracking-wider mb-1">Khách</p>
            <p className="font-heading font-bold text-text-primary">{status.guestName}</p>
            {status.checkOut && (
              <p className="text-[0.6875rem] font-sans text-text-secondary mt-1">
                Check-out: {new Date(status.checkOut).toLocaleString('vi-VN', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
        )}
        <button
          onClick={onClose}
          className="w-full min-h-[48px] bg-text-primary text-bg-primary
                     rounded-[16px] font-sans font-medium text-sm
                     active:scale-[0.98] transition-transform duration-[150ms]"
        >
          Đóng
        </button>
      </motion.div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [theme, setTheme]           = useState<'admin-dark' | 'admin-light'>('admin-dark');
  const [qrOpen, setQrOpen]         = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    room: RoomUnit; status: RoomStatusData | undefined;
  } | null>(null);
  const [metrics, setMetrics]             = useState<TodayMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [sessionsOpen, setSessionsOpen]   = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchMetrics = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/metrics', { credentials: 'include' });
      if (r.ok) {
        const data = await r.json();
        setMetrics({
          arrivalsToday:      data.arrivalsToday      ?? 0,
          departuresToday:    data.departuresToday     ?? 0,
          revenueToday:       data.revenueToday        ?? 0,
          activeSessionCount: data.activeSessionCount  ?? 0,
          nextVesselTime:     data.nextVesselTime      ?? null,
          nextVesselName:     data.nextVesselName      ?? null,
          pendingBookings:    data.bookings_pending    ?? 0,
        });
      }
    } catch { /* fail-open */ }
    finally { setMetricsLoading(false); }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const t = setInterval(fetchMetrics, 120_000);
    return () => clearInterval(t);
  }, [fetchMetrics]);

  function formatRevenue(vnd: number) {
    if (vnd >= 1_000_000) return `${(vnd / 1_000_000).toFixed(1)}tr`;
    if (vnd >= 1_000)     return `${(vnd / 1_000).toFixed(0)}k`;
    return `${vnd}đ`;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden transition-colors duration-500">

      {/* ── Modals & Drawers ─────────────────────────────────────────────── */}
      <AdminQRModal isOpen={qrOpen} onClose={() => setQrOpen(false)} />
      <AdminDrawer  isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Room detail sheet */}
      <AnimatePresence>
        {selectedRoom && (
          <RoomSheet
            key="room-sheet"
            room={selectedRoom.room}
            status={selectedRoom.status}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </AnimatePresence>

      {/* Sessions overlay */}
      <AnimatePresence>
        {sessionsOpen && (
          <>
            <motion.div
              key="sess-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSessionsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.div
              key="sess-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', damping: 32, stiffness: 300 } }}
              exit={{ y: '100%', transition: { ease: [0.3,0,0.8,0.15] as const, duration: 0.18 } }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-bg-primary
                         rounded-t-[28px] p-5 max-h-[80dvh] overflow-y-auto
                         shadow-[0_-8px_32px_rgba(0,0,0,0.15)]"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <div className="w-10 h-1 bg-text-primary/20 rounded-full mx-auto mb-5" />
              <AdminSessionsWidget />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-lg font-bold text-text-primary tracking-tight">BMH</h1>
          <button
            onClick={() => setTheme(t => t === 'admin-dark' ? 'admin-light' : 'admin-dark')}
            className="w-7 h-7 flex items-center justify-center rounded-full
                       bg-text-primary/8 text-text-secondary
                       active:bg-text-primary/15 transition-colors duration-[150ms]"
          >
            {theme === 'admin-dark'
              ? <Sun  className="w-3.5 h-3.5" strokeWidth={1.5} />
              : <Moon className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMetricsLoading(true); fetchMetrics(); }}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-text-primary/8 text-text-secondary
                       active:bg-text-primary/15 transition-colors duration-[150ms]"
            aria-label="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${metricsLoading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setQrOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[36px]
                       bg-accent text-bg-primary rounded-full
                       text-[0.6875rem] font-sans font-medium
                       active:scale-95 transition-transform duration-[150ms]"
          >
            <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />
            Check-in
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full
                       bg-text-primary/8 text-text-primary
                       active:bg-text-primary/15 transition-colors duration-[150ms]"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Bento Grid — NO overflow-y-auto on this container ────────────── */}
      <main className="flex-1 px-3 pb-[88px] flex flex-col gap-2 min-h-0 overflow-hidden">

        {/* Zone 1 — Room Grid */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: ENTER }}
          className="bg-surface border border-[var(--glass-border)] rounded-[22px] p-3 shrink-0"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              <span className="text-[0.6875rem] font-sans font-bold text-text-primary">Sơ đồ phòng</span>
            </div>
            <span className="text-[0.5rem] font-sans text-text-secondary/40">Nhấn để xem chi tiết</span>
          </div>
          <RoomStatusGrid
            onRoomTap={(room, status) => setSelectedRoom({ room, status })}
          />
        </motion.section>

        {/* Zone 2 — 4 KPI tiles */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { ...ENTER, delay: 0.05 } }}
          className="grid grid-cols-2 gap-2 shrink-0"
        >
          <KpiCell
            icon={ArrowDownToLine}
            label="Đến hôm nay"
            value={metricsLoading ? '…' : (metrics?.arrivalsToday ?? 0)}
            sub="khách nhận phòng"
          />
          <KpiCell
            icon={ArrowUpFromLine}
            label="Về hôm nay"
            value={metricsLoading ? '…' : (metrics?.departuresToday ?? 0)}
            sub="phòng trả"
          />
          <KpiCell
            icon={TrendingUp}
            label="Doanh thu hôm nay"
            value={metricsLoading ? '…' : formatRevenue(metrics?.revenueToday ?? 0)}
            accent
          />
          {/* Sessions tile — tappable */}
          <button
            onClick={() => setSessionsOpen(true)}
            className="flex flex-col justify-between p-3 rounded-[20px] min-h-[72px]
                       bg-surface border border-[var(--glass-border)] text-left
                       active:bg-text-primary/8 transition-colors duration-[150ms]"
          >
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Users className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-[0.5625rem] font-sans font-medium uppercase tracking-wider">
                Đang lưu trú
              </span>
            </div>
            <div>
              <p className="font-heading font-bold text-lg text-text-primary leading-none">
                {metricsLoading ? '…' : (metrics?.activeSessionCount ?? 0)}
              </p>
              <p className="text-[0.5rem] font-sans text-text-secondary/55 mt-0.5">nhấn để xem</p>
            </div>
          </button>
        </motion.div>

        {/* Zone 3 — Ferry Banner */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { ...ENTER, delay: 0.09 } }}
          className="grid grid-cols-2 gap-2 shrink-0"
        >
          <FerryBanner
            time={metrics?.nextVesselTime ?? null}
            name={metrics?.nextVesselName ?? null}
          />
        </motion.div>

        {/* Zone 4 — Pending Bookings Banner */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0, transition: { ...ENTER, delay: 0.13 } }}
          className="grid grid-cols-2 gap-2 shrink-0"
        >
          <PendingBanner count={metricsLoading ? 0 : (metrics?.pendingBookings ?? 0)} />
        </motion.div>

      </main>
    </div>
  );
}
