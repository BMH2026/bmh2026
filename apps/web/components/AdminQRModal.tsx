'use client';

/**
 * AdminQRModal — Tạo QR check-in cho khách
 * M3E: Modal = Level 2 surface (glass-panel), motion = spring enter / fast exit
 * QR image: api.qrserver.com (no npm, no bundle cost)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, X, Timer, CheckCircle2 } from 'lucide-react';

// ─── M3E Motion ───────────────────────────────────────────────────────────────
const MODAL_ENTER = { type: 'spring' as const, damping: 32, stiffness: 320, restDelta: 0.001 };
const MODAL_EXIT  = { duration: 0.22, ease: [0.3, 0, 0.8, 0.15] as const };
const BACKDROP_ENTER = { duration: 0.3, ease: [0.05, 0.7, 0.1, 1] as const };

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pre-filled from the booking being checked in */
  defaultData?: {
    bookingId: string;
    roomType: string;
    guestName: string;
    guestEmail?: string;
    checkOut: string;
  };
  // adminToken removed — auth via admin_session cookie (credentials: 'include')
}

const ROOM_LABELS: Record<string, string> = {
  'phi-thuyen-2': 'Phi Thuyền 2 Giường',
  'phi-thuyen-1': 'Phi Thuyền 1 Giường',
  'homestay-2':   'Nhà Gỗ 2 Giường',
  'homestay-1':   'Nhà Gỗ 1 Giường',
};

const QR_TTL_SECONDS = 300; // 5 minutes

export function AdminQRModal({ isOpen, onClose, defaultData }: QRModalProps) {
  const [step, setStep] = useState<'form' | 'qr'>('form');
  const [form, setForm] = useState({
    bookingId: defaultData?.bookingId ?? '',
    roomType:  defaultData?.roomType  ?? 'phi-thuyen-2',
    guestName: defaultData?.guestName ?? '',
    guestEmail: defaultData?.guestEmail ?? '',
    checkOut:  defaultData?.checkOut  ?? '',
  });
  const [qrUrl, setQrUrl] = useState('');
  const [validateUrl, setValidateUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(QR_TTL_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || step !== 'qr') return;
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(secs);
      if (secs === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, step]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const generateQR = useCallback(async () => {
    if (!form.bookingId || !form.guestName || !form.checkOut) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth/qr', {
        method: 'POST',
        credentials: 'include',          // sends admin_session cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error('Tạo QR thất bại');
      const data = await r.json();
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&ecc=M&data=${encodeURIComponent(data.validateUrl)}`;
      setQrUrl(qrImageUrl);
      setValidateUrl(data.validateUrl);
      setExpiresAt(new Date(data.expiresAt));
      setTimeLeft(QR_TTL_SECONDS);
      setStep('qr');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [form]);

  function handleClose() {
    setStep('form');
    setQrUrl('');
    setError('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — M3E Level 2, emphasized-decelerate enter */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={BACKDROP_ENTER}
            className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal — spring enter, fast accelerate exit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16, transition: MODAL_EXIT }}
            transition={MODAL_ENTER}
            className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm
                       bg-[var(--glass-bg)] backdrop-blur-2xl
                       border border-[var(--glass-border)]
                       rounded-card overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-accent" strokeWidth={1.5} />
                <h3 className="font-heading text-base font-bold text-text-primary">
                  {step === 'form' ? 'Tạo QR Check-in' : 'Mã QR cho khách quét'}
                </h3>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full
                           hover:bg-text-primary/8 active:bg-text-primary/12
                           transition-colors duration-[200ms] text-text-secondary"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* ── Form step ──────────────────────────────────────────────── */}
              {step === 'form' && (
                <motion.div key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-5 flex flex-col gap-3"
                >
                  {[
                    { key: 'bookingId', label: 'Booking ID (UUID)', placeholder: 'xxxxxxxx-xxxx-...' },
                    { key: 'guestName', label: 'Tên khách',         placeholder: 'Nguyễn Văn A' },
                    { key: 'guestEmail', label: 'Email (tùy chọn)', placeholder: 'guest@email.com' },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <label className="text-[0.6875rem] font-sans font-medium text-text-secondary">{f.label}</label>
                      <input
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="px-3 py-2 min-h-[44px] bg-surface rounded-input
                                   border border-[var(--glass-border)] text-text-primary text-sm
                                   placeholder:text-text-secondary/40 focus:outline-none focus:border-accent
                                   transition-colors duration-[200ms]"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1">
                    <label className="text-[0.6875rem] font-sans font-medium text-text-secondary">Loại phòng</label>
                    <select
                      value={form.roomType}
                      onChange={e => setForm(p => ({ ...p, roomType: e.target.value }))}
                      className="px-3 py-2 min-h-[44px] bg-surface rounded-input
                                 border border-[var(--glass-border)] text-text-primary text-sm
                                 focus:outline-none focus:border-accent transition-colors duration-[200ms]"
                    >
                      {Object.entries(ROOM_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[0.6875rem] font-sans font-medium text-text-secondary">Check-out (ISO)</label>
                    <input
                      type="datetime-local"
                      value={form.checkOut ? form.checkOut.slice(0, 16) : ''}
                      onChange={e => setForm(p => ({ ...p, checkOut: new Date(e.target.value).toISOString() }))}
                      className="px-3 py-2 min-h-[44px] bg-surface rounded-input
                                 border border-[var(--glass-border)] text-text-primary text-sm
                                 focus:outline-none focus:border-accent transition-colors duration-[200ms]"
                    />
                  </div>

                  {error && <p className="text-[0.6875rem] font-sans text-red-500">{error}</p>}

                  <button onClick={generateQR} disabled={loading}
                    className="relative overflow-hidden flex items-center justify-center gap-2
                               min-h-[48px] rounded-button bg-accent text-bg-primary
                               text-sm font-medium font-sans mt-1
                               after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                               after:bg-bg-primary/0 after:transition-[background-color] after:duration-[15ms]
                               hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12
                               disabled:opacity-38 transition-opacity duration-[200ms]"
                  >
                    {loading
                      ? <div className="w-4 h-4 rounded-full border-2 border-bg-primary/40 border-t-bg-primary animate-spin" />
                      : <><QrCode className="w-4 h-4" strokeWidth={1.5} />Tạo mã QR</>
                    }
                  </button>
                </motion.div>
              )}

              {/* ── QR step ────────────────────────────────────────────────── */}
              {step === 'qr' && (
                <motion.div key="qr"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1] }}
                  className="p-5 flex flex-col items-center gap-4"
                >
                  {/* Countdown */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans font-medium
                    ${timeLeft > 60 ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>
                    <Timer className="w-4 h-4" strokeWidth={1.5} />
                    {timeLeft > 0 ? `Hết hạn sau ${formatTime(timeLeft)}` : 'Mã đã hết hạn'}
                  </div>

                  {/* QR image */}
                  {timeLeft > 0 ? (
                    <div className="p-3 bg-white rounded-card border border-[var(--glass-border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} alt="QR Check-in" width={248} height={248} className="rounded-md" />
                    </div>
                  ) : (
                    <div className="w-[248px] h-[248px] bg-surface rounded-card border border-[var(--glass-border)]
                                    flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-text-secondary font-sans">Mã đã hết hạn</p>
                    </div>
                  )}

                  {/* Guest info */}
                  <div className="w-full p-3 bg-surface rounded-button border border-[var(--glass-border)]
                                  flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
                    <div>
                      <p className="text-sm font-bold text-text-primary">{form.guestName}</p>
                      <p className="text-[0.6875rem] font-sans text-text-secondary">
                        {ROOM_LABELS[form.roomType] ?? form.roomType}
                      </p>
                    </div>
                  </div>

                  {/* Regenerate */}
                  <button onClick={generateQR} disabled={loading}
                    className="text-[0.6875rem] font-sans text-accent hover:underline
                               disabled:opacity-38 transition-opacity duration-[200ms]"
                  >
                    {timeLeft === 0 ? 'Tạo mã mới' : 'Tạo lại'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
