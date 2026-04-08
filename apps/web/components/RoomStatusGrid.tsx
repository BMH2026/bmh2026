'use client';

/**
 * RoomStatusGrid — Sơ đồ phòng 16 căn, mirror vật lý thực tế.
 * Layout: hàng 0 = PT1/PT2 (wide), hàng 1-4 = 4×4 grid, (1,1)-(1,2) = bể bơi.
 *
 * Trạng thái màu (M3E color tokens):
 *   occupied   → xanh lá  — đang có khách (active session)
 *   checkout   → đỏ       — check-out hôm nay
 *   checkin    → vàng     — check-in hôm nay
 *   empty      → xám mờ   — trống / sẵn sàng
 *   cleaning   → xanh dương — đang dọn
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Waves } from 'lucide-react';
import { ROOM_INVENTORY, type RoomUnit } from '@/lib/constants';

// ── Kiểu dữ liệu ─────────────────────────────────────────────────────────────
export type RoomStatus = 'occupied' | 'checkout' | 'checkin' | 'empty' | 'cleaning';

export interface RoomStatusData {
  roomId: string;
  status: RoomStatus;
  guestName?: string;
  checkOut?: string;   // ISO string
}

interface Props {
  onRoomTap?: (room: RoomUnit, status: RoomStatusData | undefined) => void;
}

// ── Màu sắc theo trạng thái ───────────────────────────────────────────────────
const STATUS_STYLE: Record<RoomStatus, { bg: string; text: string; dot: string; label: string }> = {
  occupied:  { bg: 'bg-green-500/15 border-green-500/40',  text: 'text-green-600',  dot: 'bg-green-500',  label: 'Đang ở'       },
  checkout:  { bg: 'bg-red-500/15 border-red-500/40',      text: 'text-red-500',    dot: 'bg-red-500',    label: 'Trả phòng'    },
  checkin:   { bg: 'bg-amber-400/15 border-amber-400/40',  text: 'text-amber-500',  dot: 'bg-amber-400',  label: 'Nhận phòng'   },
  empty:     { bg: 'bg-text-primary/5 border-[var(--glass-border)]', text: 'text-text-secondary/50', dot: 'bg-text-secondary/30', label: 'Trống' },
  cleaning:  { bg: 'bg-sky-500/12 border-sky-500/30',      text: 'text-sky-500',    dot: 'bg-sky-500',    label: 'Dọn phòng'    },
};

// ── Legend ────────────────────────────────────────────────────────────────────
const LEGEND: Array<{ status: RoomStatus }> = [
  { status: 'occupied' },
  { status: 'checkin' },
  { status: 'checkout' },
  { status: 'empty' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
// Map room → status data
function buildStatusMap(data: RoomStatusData[]): Map<string, RoomStatusData> {
  return new Map(data.map(d => [d.roomId, d]));
}

// Cells trong hàng 1, cột 1 và 2 là bể bơi
function isPool(row: number, col: number): boolean {
  return row === 1 && (col === 1 || col === 2);
}

// ── Room Cell ─────────────────────────────────────────────────────────────────
function RoomCell({
  room,
  statusData,
  onTap,
}: {
  room: RoomUnit;
  statusData: RoomStatusData | undefined;
  onTap: () => void;
}) {
  const status = statusData?.status ?? 'empty';
  const s = STATUS_STYLE[status];
  const isWide = !!room.colSpan; // PT1 / PT2

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onTap}
      className={`
        relative flex flex-col items-center justify-center rounded-[14px] border
        transition-colors duration-[200ms] select-none
        ${s.bg}
        ${isWide ? 'h-12' : 'h-[52px]'}
        after:absolute after:inset-0 after:rounded-[14px]
        after:bg-text-primary/0 hover:after:bg-text-primary/[0.04]
        active:after:bg-text-primary/[0.08] after:transition-colors after:duration-[150ms]
      `}
      style={
        isWide
          ? { gridColumn: `span 2` }
          : undefined
      }
    >
      {/* Status dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} mb-0.5`} />
      {/* Room number */}
      <span className={`text-[0.6875rem] font-sans font-bold leading-none ${s.text}`}>
        {room.id}
      </span>
      {/* Guest name (occupied) */}
      {statusData?.guestName && (
        <span className="text-[0.5rem] font-sans text-text-secondary/60 leading-none mt-0.5 truncate max-w-full px-1">
          {statusData.guestName.split(' ').slice(-1)[0]}
        </span>
      )}
    </motion.button>
  );
}

// ── Pool Cell ─────────────────────────────────────────────────────────────────
function PoolCell() {
  return (
    <div className="flex items-center justify-center h-[52px] rounded-[14px]
                    bg-sky-400/8 border border-sky-400/20">
      <Waves className="w-3.5 h-3.5 text-sky-400/50" strokeWidth={1.5} />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function RoomStatusGrid({ onRoomTap }: Props) {
  const [statusData, setStatusData] = useState<RoomStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/rooms/status', { credentials: 'include' });
      if (r.ok) {
        const { rooms } = await r.json() as { rooms: RoomStatusData[] };
        setStatusData(rooms);
      }
    } catch {
      // fail-open: keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 90_000); // refresh mỗi 90s
    return () => clearInterval(t);
  }, [fetchStatus]);

  const statusMap = buildStatusMap(statusData);

  // Build grid: 5 hàng × 4 cột
  // Hàng 0: PT1 (col 0-1 wide) + PT2 (col 2-3 wide)
  // Hàng 1: 101 | pool | pool | 201
  // Hàng 2-4: 4 rooms each

  const rows: Array<Array<RoomUnit | 'pool' | null>> = [[], [], [], [], []];

  for (const room of ROOM_INVENTORY) {
    rows[room.row][room.col] = room;
    if (room.colSpan === 2) {
      rows[room.row][room.col + 1] = null; // occupied slot (wide room), skip render
    }
  }

  // Fill pool slots
  for (let c = 0; c < 4; c++) {
    if (isPool(1, c)) rows[1][c] = 'pool';
    // Đảm bảo null không nhầm với pool
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Legend */}
      <div className="flex items-center gap-3 px-0.5 mb-1">
        {LEGEND.map(({ status }) => (
          <div key={status} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[status].dot}`} />
            <span className="text-[0.5625rem] font-sans text-text-secondary/60">
              {STATUS_STYLE[status].label}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-1.5"
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-[52px] rounded-[14px] bg-text-primary/5 animate-pulse" />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-4 gap-1.5"
          >
            {rows.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                if (cell === null) return null; // slot dùng bởi wide room, không render
                if (cell === 'pool') return <PoolCell key={`pool-${rowIdx}-${colIdx}`} />;
                const room = cell as RoomUnit;
                return (
                  <RoomCell
                    key={room.id}
                    room={room}
                    statusData={statusMap.get(room.id)}
                    onTap={() => onRoomTap?.(room, statusMap.get(room.id))}
                  />
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
