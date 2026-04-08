'use client';

/**
 * AdminSessionsWidget — Live panel showing active room sessions
 * M3E: cards = Level 1 surface, warning chips per M3E color scheme
 * Polls every 60s; staff can terminate or extend from here.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BedDouble, Clock, UserX, Clock4, AlertCircle, RefreshCw } from 'lucide-react';

const ENTER = { duration: 0.28, ease: [0.05, 0.7, 0.1, 1] as const };

interface SessionRow {
  id: string;
  token: string;
  roomType: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  minutesLeft: number;
}

const ROOM_LABELS: Record<string, string> = {
  'phi-thuyen-2': 'Phi Thuyền 2G',
  'phi-thuyen-1': 'Phi Thuyền 1G',
  'homestay-2':   'Nhà Gỗ 2G',
  'homestay-1':   'Nhà Gỗ 1G',
};

function formatCheckout(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

// Cookie-based auth — admin_session cookie is sent automatically (credentials: 'include').
// No adminToken prop needed; secret never leaves the server.
export function AdminSessionsWidget() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/sessions', { credentials: 'include' });
      if (!r.ok) return;
      const { sessions: raw } = await r.json() as { sessions: Array<{
        id: string; token: string; roomType: string; guestName: string;
        checkIn: string; checkOut: string;
      }> };
      const now = Date.now();
      setSessions(raw.map(s => ({
        ...s,
        minutesLeft: Math.max(0, Math.floor((new Date(s.checkOut).getTime() - now) / 60000)),
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    const t = setInterval(fetchSessions, 60_000);
    return () => clearInterval(t);
  }, [fetchSessions]);

  async function terminate(token: string) {
    setActionId(token);
    await fetch('/api/auth/session', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'terminate', token }),
    });
    await fetchSessions();
    setActionId(null);
  }

  async function extend(token: string, currentCheckOut: string) {
    setActionId(token);
    const newCheckOut = new Date(new Date(currentCheckOut).getTime() + 2 * 60 * 60 * 1000).toISOString();
    await fetch('/api/auth/session', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'extend', token, newCheckOut }),
    });
    await fetchSessions();
    setActionId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BedDouble className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <h3 className="font-heading text-sm font-bold text-text-primary">Khách đang lưu trú</h3>
          {sessions.length > 0 && (
            <span className="px-2 py-0.5 bg-accent/15 text-accent text-[0.6875rem] font-sans font-medium rounded-full">
              {sessions.length}
            </span>
          )}
        </div>
        <button onClick={() => { setLoading(true); fetchSessions(); }}
          className="w-8 h-8 flex items-center justify-center rounded-full
                     hover:bg-text-primary/8 active:bg-text-primary/12
                     transition-colors duration-[200ms] text-text-secondary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
        </button>
      </div>

      {/* Session list */}
      <AnimatePresence mode="popLayout">
        {sessions.length === 0 && !loading && (
          <motion.p key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-[0.6875rem] font-sans text-text-secondary/60 text-center py-6"
          >
            Không có khách nào đang ở
          </motion.p>
        )}

        {sessions.map(s => (
          <motion.div key={s.token}
            layout
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.18 } }}
            transition={ENTER}
            className="flex flex-col gap-3 p-4 bg-surface rounded-card border border-[var(--glass-border)]"
          >
            {/* Top row: room + guest */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-text-primary text-sm">
                  {ROOM_LABELS[s.roomType] ?? s.roomType}
                </p>
                <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">{s.guestName}</p>
              </div>

              {/* Time warning chip */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6875rem] font-sans font-medium shrink-0
                ${s.minutesLeft <= 120 ? 'bg-red-500/12 text-red-500'
                  : s.minutesLeft <= 360 ? 'bg-accent/15 text-accent'
                  : 'bg-green-500/12 text-green-600'}`}
              >
                {s.minutesLeft <= 120 && <AlertCircle className="w-3 h-3" strokeWidth={2} />}
                <Clock className="w-3 h-3" strokeWidth={1.5} />
                {s.minutesLeft > 60
                  ? `${Math.floor(s.minutesLeft / 60)}h ${s.minutesLeft % 60}m`
                  : `${s.minutesLeft}m`}
              </div>
            </div>

            {/* Check-out */}
            <p className="text-[0.6875rem] font-sans text-text-secondary/70">
              Check-out: {formatCheckout(s.checkOut)}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => extend(s.token, s.checkOut)}
                disabled={actionId === s.token}
                className="flex-1 flex items-center justify-center gap-1.5
                           min-h-[36px] rounded-button text-[0.6875rem] font-sans font-medium
                           bg-text-primary/8 text-text-primary border border-[var(--glass-border)]
                           hover:bg-text-primary/15 active:bg-text-primary/20
                           disabled:opacity-38 transition-colors duration-[200ms]"
              >
                <Clock4 className="w-3.5 h-3.5" strokeWidth={1.5} />
                +2h
              </button>
              <button
                onClick={() => terminate(s.token)}
                disabled={actionId === s.token}
                className="flex-1 flex items-center justify-center gap-1.5
                           min-h-[36px] rounded-button text-[0.6875rem] font-sans font-medium
                           bg-red-500/10 text-red-500 border border-red-500/20
                           hover:bg-red-500/18 active:bg-red-500/25
                           disabled:opacity-38 transition-colors duration-[200ms]"
              >
                <UserX className="w-3.5 h-3.5" strokeWidth={1.5} />
                Check-out sớm
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
