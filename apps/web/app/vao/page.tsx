'use client';

/**
 * /vao — Entry point: 2 luồng
 *  1. Khách có valid room_session cookie  → hiện Room Dashboard (phòng X, check-out lúc Y)
 *  2. Khách không có session:
 *       - Nhập email → Magic Link
 *       - Thông báo quét QR tại lễ tân
 *  3. Nút "Quản lý" (nhỏ, ẩn phía dưới) → Admin PIN entry
 *
 * M3E compliance: design tokens, shape scale, motion curves, state layers, tap targets.
 */

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  BedDouble, Mail, QrCode, LogIn, Eye, EyeOff,
  CheckCircle2, AlertCircle, ArrowRight, Phone,
} from 'lucide-react';

// ─── M3E Motion tokens ────────────────────────────────────────────────────────
const ENTER = { type: 'spring' as const, damping: 26, stiffness: 220, restDelta: 0.001 };
const EXIT  = { duration: 0.18, ease: [0.3, 0, 0.8, 0.15] as const };

// ─── Room type display names ──────────────────────────────────────────────────
const ROOM_LABELS: Record<string, string> = {
  'phi-thuyen-2': 'Phi Thuyền 2 Giường',
  'phi-thuyen-1': 'Phi Thuyền 1 Giường',
  'homestay-2':   'Nhà Gỗ 2 Giường',
  'homestay-1':   'Nhà Gỗ 1 Giường',
};

type SessionInfo = { roomType: string; guestName: string; checkIn: string; checkOut: string };
type PageState = 'loading' | 'guest-loggedin' | 'guest-entry' | 'admin-pin';

export default function VaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [session, setSession] = useState<SessionInfo | null>(null);

  // Guest Magic Link form
  const [email, setEmail] = useState('');
  const [mlStatus, setMlStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Admin PIN form
  const [pin, setPin] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const [pinStatus, setPinStatus] = useState<'idle' | 'checking' | 'error'>('idle');
  const pinRef = useRef<HTMLInputElement>(null);

  // Error from URL params (e.g. expired QR)
  const urlError = searchParams.get('error');
  const isInApp  = searchParams.get('inapp') === '1';
  const inAppToken   = searchParams.get('t');
  const inAppCheckOut = searchParams.get('exp');

  // ── Load current session ──────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        if (data.session) {
          setSession(data.session);
          setPageState('guest-loggedin');
        } else {
          setPageState('guest-entry');
        }
      })
      .catch(() => setPageState('guest-entry'));
  }, []);

  // ── In-app browser: set cookie via POST then redirect ────────────────────
  useEffect(() => {
    if (isInApp && inAppToken && inAppCheckOut) {
      fetch('/api/auth/session?action=set-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inAppToken, checkOut: inAppCheckOut }),
      }).then(() => router.replace('/vao'));
    }
  }, [isInApp, inAppToken, inAppCheckOut, router]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setMlStatus('sending');
    try {
      const r = await fetch('/api/auth/magic-link-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (r.ok) { setMlStatus('sent'); }
      else { setMlStatus('error'); }
    } catch { setMlStatus('error'); }
  }

  async function handleAdminPin(e: React.FormEvent) {
    e.preventDefault();
    setPinStatus('checking');
    try {
      const r = await fetch('/api/auth/session?action=admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (r.ok) { router.push('/admin'); }
      else { setPinStatus('error'); setPin(''); pinRef.current?.focus(); }
    } catch { setPinStatus('error'); }
  }

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    setSession(null);
    setPageState('guest-entry');
  }

  // ── Checkout display ──────────────────────────────────────────────────────
  function formatCheckout(iso: string) {
    return new Date(iso).toLocaleString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden">
      {/* Header */}
      <div className="shrink-0 glass px-5 pt-safe-top py-4 flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text-primary">vào</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-[84px]">
        <AnimatePresence mode="wait">

          {/* ── Loading ──────────────────────────────────────────────────── */}
          {pageState === 'loading' && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </motion.div>
          )}

          {/* ── Guest logged in ───────────────────────────────────────────── */}
          {pageState === 'guest-loggedin' && session && (
            <motion.div key="loggedin"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={ENTER}
              className="px-5 pt-6 flex flex-col gap-4"
            >
              {/* Welcome card — M3E Level 1 surface */}
              <div className="bg-surface rounded-card border border-[var(--glass-border)] p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <BedDouble className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[0.6875rem] font-sans text-text-secondary uppercase tracking-widest">Đang lưu trú</p>
                    <h2 className="font-heading text-lg font-bold text-text-primary">
                      {ROOM_LABELS[session.roomType] ?? session.roomType}
                    </h2>
                  </div>
                </div>

                <div className="h-px bg-text-secondary/15" />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[0.6875rem] font-sans text-text-secondary">Khách</span>
                    <span className="text-sm font-medium text-text-primary">{session.guestName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[0.6875rem] font-sans text-text-secondary">Check-out</span>
                    <span className="text-sm font-medium text-text-primary">{formatCheckout(session.checkOut)}</span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Chat Long Xì', href: '/faq', icon: Phone, color: 'bg-accent/15 text-accent border-accent/25' },
                  { label: 'Đặt tour', href: '/play', icon: ArrowRight, color: 'bg-text-primary/8 text-text-primary border-[var(--glass-border)]' },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    className={`relative overflow-hidden flex items-center justify-center gap-2
                                min-h-[48px] rounded-card border p-4 text-sm font-medium
                                after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                                after:bg-text-primary/0 after:transition-[background-color] after:duration-[15ms]
                                hover:after:bg-text-primary/8 active:after:bg-text-primary/12
                                ${item.color}`}
                  >
                    <item.icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout */}
              <button onClick={handleLogout}
                className="text-[0.6875rem] font-sans text-text-secondary/50 text-center py-2
                           hover:text-text-secondary transition-colors duration-[200ms]"
              >
                Đăng xuất
              </button>
            </motion.div>
          )}

          {/* ── Guest entry (no session) ──────────────────────────────────── */}
          {pageState === 'guest-entry' && (
            <motion.div key="entry"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={ENTER}
              className="px-5 pt-6 flex flex-col gap-4"
            >
              {/* URL error banner */}
              <AnimatePresence>
                {urlError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                    className="flex items-center gap-3 p-4 bg-red-500/10 rounded-card border border-red-500/25"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={1.5} />
                    <p className="text-sm text-text-primary">
                      {urlError === 'qr_expired'   && 'Mã QR đã hết hạn. Vui lòng yêu cầu lễ tân tạo mã mới.'}
                      {urlError === 'link_expired'  && 'Link đã hết hạn. Vui lòng yêu cầu gửi lại.'}
                      {urlError === 'missing_token' && 'Link không hợp lệ. Vui lòng thử lại.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* In-app browser warning */}
              <AnimatePresence>
                {isInApp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                    className="flex flex-col gap-2 p-4 bg-accent/10 rounded-card border border-accent/25"
                  >
                    <p className="text-sm font-bold text-text-primary">Mở bằng trình duyệt hệ thống</p>
                    <p className="text-[0.6875rem] font-sans text-text-secondary leading-relaxed">
                      Bạn đang mở link trong ứng dụng Gmail/Zalo. Để đăng nhập hoạt động đúng, hãy nhấn
                      menu (⋮) → "Mở bằng Chrome/Safari" rồi quay lại trang này.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* QR scan CTA — primary */}
              <div className="flex flex-col items-center gap-3 p-6
                              bg-accent/10 rounded-card border border-accent/25">
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center">
                  <QrCode className="w-7 h-7 text-accent" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="font-heading text-base font-bold text-text-primary">Quét QR tại lễ tân</p>
                  <p className="text-[0.6875rem] font-sans text-text-secondary mt-1 leading-relaxed">
                    Cách nhanh nhất. Nhân viên sẽ hiển thị mã QR khi bạn nhận phòng.
                    Mã có hiệu lực 5 phút.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-text-secondary/15" />
                <span className="text-[0.6875rem] font-sans text-text-secondary/50">hoặc</span>
                <div className="flex-1 h-px bg-text-secondary/15" />
              </div>

              {/* Magic Link form */}
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-heading text-base font-bold text-text-primary mb-1">Nhận link qua email</p>
                  <p className="text-[0.6875rem] font-sans text-text-secondary">
                    Dùng email bạn đã đặt phòng với Bình Minh Homestay.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {mlStatus === 'sent' ? (
                    <motion.div key="sent"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={ENTER}
                      className="flex items-center gap-3 p-4 bg-green-500/10 rounded-card border border-green-500/25"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" strokeWidth={1.5} />
                      <p className="text-sm text-text-primary">
                        Đã gửi link đến <strong>{email}</strong>. Kiểm tra hộp thư và nhấp vào link.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleMagicLink} className="flex flex-col gap-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/60"
                          strokeWidth={1.5} />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          required
                          className="w-full pl-11 pr-4 py-3 min-h-[48px]
                                     bg-surface rounded-input border border-[var(--glass-border)]
                                     text-text-primary text-sm placeholder:text-text-secondary/40
                                     focus:outline-none focus:border-accent
                                     transition-colors duration-[200ms]"
                        />
                      </div>
                      {mlStatus === 'error' && (
                        <p className="text-[0.6875rem] font-sans text-red-500">
                          Có lỗi xảy ra. Kiểm tra email và thử lại.
                        </p>
                      )}
                      <button type="submit" disabled={mlStatus === 'sending'}
                        className="relative overflow-hidden flex items-center justify-center gap-2
                                   min-h-[48px] rounded-button bg-text-primary text-bg-primary
                                   text-sm font-medium font-sans
                                   after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                                   after:bg-bg-primary/0 after:transition-[background-color] after:duration-[15ms]
                                   hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12
                                   disabled:opacity-38 transition-opacity duration-[200ms]"
                      >
                        {mlStatus === 'sending' ? (
                          <div className="w-4 h-4 rounded-full border-2 border-bg-primary/40 border-t-bg-primary animate-spin" />
                        ) : (
                          <><Mail className="w-4 h-4" strokeWidth={1.5} />Gửi link đăng nhập</>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin entry — discrete, below fold */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setPageState('admin-pin')}
                  className="flex items-center gap-1.5 text-[0.6875rem] font-sans text-text-secondary/40
                             hover:text-text-secondary/70 transition-colors duration-[200ms]"
                >
                  <LogIn className="w-3 h-3" strokeWidth={1.5} />
                  Quản lý
                </button>
              </div>

              <p className="text-[0.6875rem] font-sans text-text-secondary/40 text-center pb-2">
                Website được tạo bởi Vân Đồn Solutions ©
              </p>
            </motion.div>
          )}

          {/* ── Admin PIN ─────────────────────────────────────────────────── */}
          {pageState === 'admin-pin' && (
            <motion.div key="admin"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: EXIT }}
              transition={ENTER}
              className="px-5 pt-6 flex flex-col gap-4"
            >
              <button onClick={() => setPageState('guest-entry')}
                className="self-start text-[0.6875rem] font-sans text-text-secondary/60
                           hover:text-text-secondary transition-colors"
              >
                ← Quay lại
              </button>

              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-xl font-bold text-text-primary">Bảng điều khiển</h2>
                <p className="text-[0.6875rem] font-sans text-text-secondary">Chỉ dành cho nhân viên Bình Minh.</p>
              </div>

              <form onSubmit={handleAdminPin} className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    ref={pinRef}
                    type={pinVisible ? 'text' : 'password'}
                    value={pin}
                    onChange={e => { setPin(e.target.value); setPinStatus('idle'); }}
                    placeholder="Mã PIN"
                    autoComplete="current-password"
                    inputMode="numeric"
                    required
                    className="w-full pl-4 pr-12 py-3 min-h-[48px]
                               bg-surface rounded-input border border-[var(--glass-border)]
                               text-text-primary text-sm placeholder:text-text-secondary/40
                               focus:outline-none focus:border-accent
                               transition-colors duration-[200ms]"
                  />
                  <button type="button" onClick={() => setPinVisible(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8
                               flex items-center justify-center rounded-full
                               text-text-secondary/60 hover:text-text-secondary
                               hover:bg-text-primary/8 transition-colors duration-[200ms]"
                  >
                    {pinVisible
                      ? <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                      : <Eye    className="w-4 h-4" strokeWidth={1.5} />
                    }
                  </button>
                </div>

                {pinStatus === 'error' && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-[0.6875rem] font-sans text-red-500"
                  >
                    PIN không đúng. Nhiều lần sai sẽ bị khoá 15 phút.
                  </motion.p>
                )}

                <button type="submit" disabled={pinStatus === 'checking'}
                  className="relative overflow-hidden flex items-center justify-center gap-2
                             min-h-[48px] rounded-button bg-text-primary text-bg-primary
                             text-sm font-medium font-sans
                             after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                             after:bg-bg-primary/0 after:transition-[background-color] after:duration-[15ms]
                             hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12
                             disabled:opacity-38 transition-opacity duration-[200ms]"
                >
                  {pinStatus === 'checking'
                    ? <div className="w-4 h-4 rounded-full border-2 border-bg-primary/40 border-t-bg-primary animate-spin" />
                    : <><LogIn className="w-4 h-4" strokeWidth={1.5} />Vào bảng quản lý</>
                  }
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
