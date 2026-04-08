'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin, Ship, Ticket, Sparkles,
  CheckCircle2, Car, ChevronRight, Phone,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SURCHARGE_SERVICES, TOUR_PACKAGES, BOOKING_POLICY, formatVND } from '@/lib/constants';

// ─── M3E Motion tokens ────────────────────────────────────────────────────────
const TAB_ENTER  = { duration: 0.28, ease: [0.05, 0.7, 0.1, 1] as const };
const TAB_EXIT   = { duration: 0.18, ease: [0.3, 0, 0.8, 0.15] as const };
const CHIP_SPRING = { type: 'spring' as const, stiffness: 350, damping: 30 };

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'tham-quan',  label: 'tham quan', icon: MapPin   },
  { id: 'di-chuyen',  label: 'di chuyển', icon: Ship     },
  { id: 've',         label: 'vé',         icon: Ticket   },
  { id: 'dich-vu',    label: 'dịch vụ',   icon: Sparkles },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Brand footer line (dùng trong mọi tab content) ──────────────────────────
function BrandLine() {
  return (
    <p className="text-[0.6875rem] font-sans text-text-secondary/40 text-center py-3 px-4">
      Website được tạo bởi Vân Đồn Solutions ©
    </p>
  );
}

// ─── Tab content: Tham quan ───────────────────────────────────────────────────
function ThamQuan() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative w-full h-44 shrink-0">
        <Image
          src="https://picsum.photos/seed/island-tour/800/400"
          alt="Tour khám phá đảo"
          fill className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5">
          <p className="text-[0.6875rem] font-sans text-white/70 uppercase tracking-widest mb-1">tour</p>
          <h2 className="font-heading text-2xl font-bold text-white">Khám phá Quan Lạn</h2>
        </div>
      </div>

      <div className="px-5 pt-4 pb-2 flex flex-col gap-4">
        <p className="text-sm text-text-secondary leading-relaxed">
          Thuê xe đi tham quan các điểm nổi bật quanh đảo.
          Giá trọn gói 2 chiều, có tài xế — chỉ cần ngồi tận hưởng.
        </p>

        {/* Tour grid — M3E card với state layer */}
        <div className="grid grid-cols-2 gap-3">
          {Object.values(TOUR_PACKAGES).map((tour) => (
            <Link
              key={tour.label}
              href={`/faq?q=${encodeURIComponent(`Đặt xe đi ${tour.label}`)}`}
              className="relative overflow-hidden flex flex-col gap-2 p-4
                         bg-surface rounded-card border border-[var(--glass-border)]
                         after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                         after:bg-text-primary/0 after:transition-[background-color] after:duration-[15ms]
                         hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
            >
              <div className="flex items-start justify-between gap-1">
                <p className="font-bold text-text-primary text-sm leading-snug">{tour.label}</p>
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading text-base font-bold text-accent">
                  {(tour.price / 1_000_000).toFixed(1).replace('.0', '')}tr
                </p>
                <p className="text-[0.6875rem] font-sans text-text-secondary">2 chiều / xe</p>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-[0.6875rem] font-sans text-text-secondary/60 text-center">
          Giá trọn gói 2 chiều — thu hộ đối tác xe • Thanh toán trước 100%
        </p>

        <Link
          href={`/faq?q=${encodeURIComponent('Gợi ý tour hôm nay')}`}
          className="flex items-center justify-center gap-2 min-h-[48px] px-6
                     bg-accent/15 text-accent text-sm font-medium rounded-full
                     border border-accent/30 active:scale-95 transition-transform duration-[150ms]"
        >
          Long Xì gợi ý tour phù hợp <ChevronRight className="w-4 h-4" />
        </Link>

        <BrandLine />
      </div>
    </div>
  );
}

// ─── Tab content: Di chuyển ───────────────────────────────────────────────────
function DiChuyen() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative w-full h-40 shrink-0">
        <Image
          src="https://picsum.photos/seed/speedboat/800/400"
          alt="Tàu cao tốc"
          fill className="object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5">
          <p className="text-[0.6875rem] font-sans text-white/70 uppercase tracking-widest mb-1">di chuyển</p>
          <h2 className="font-heading text-2xl font-bold text-white">Hành trình đến đảo</h2>
        </div>
      </div>

      <div className="px-5 pt-4 pb-2 flex flex-col gap-4">
        {/* Journey infographic */}
        <div className="flex items-center gap-1 text-[0.6875rem] font-sans text-text-secondary overflow-x-auto no-scrollbar">
          {['Hà Nội', '→', 'Tàu', '→', 'Ao Tiên', '→', 'Minh Châu', '→', 'BMH'].map((s, i) => (
            <span key={i}
              className={s === '→' ? 'text-text-secondary/40 shrink-0' :
                'shrink-0 px-2.5 py-1 bg-surface rounded-full border border-[var(--glass-border)] font-medium text-text-primary'}
            >{s}</span>
          ))}
        </div>

        {/* FREE highlight */}
        <div className="flex items-center gap-3 p-4
                        bg-green-500/10 rounded-card border border-green-500/25">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="font-bold text-text-primary text-sm">Xe tắm biển miễn phí</p>
            <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">
              Robinson & bãi trung tâm Minh Châu — 2 chiều
            </p>
          </div>
          <span className="text-sm font-bold text-green-500 font-sans shrink-0">FREE</span>
        </div>

        {/* Paid transport */}
        {[
          {
            icon: Ship,
            label: 'Tàu cao tốc',
            sub: '1 lượt / người',
            price: formatVND(SURCHARGE_SERVICES.speedBoat),
            note: `Khứ hồi: ${formatVND(SURCHARGE_SERVICES.speedBoat * 2)}`,
          },
          {
            icon: Car,
            label: 'Xe điện bao chuyến',
            sub: 'Cảng Minh Châu ↔ Homestay',
            price: formatVND(SURCHARGE_SERVICES.electricCar_Private),
            note: `Khách lẻ: ${formatVND(SURCHARGE_SERVICES.electricCar_Retail)}/người`,
          },
        ].map((item) => (
          <div key={item.label}
            className="flex items-center gap-3 p-4
                       bg-surface rounded-card border border-[var(--glass-border)]"
          >
            <item.icon className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text-primary text-sm">{item.label}</p>
              <p className="text-[0.6875rem] font-sans text-text-secondary">{item.sub}</p>
              {item.note && (
                <p className="text-[0.6875rem] font-sans text-text-secondary/60 mt-0.5">{item.note}</p>
              )}
            </div>
            <p className="text-sm font-bold text-accent font-sans shrink-0">{item.price}</p>
          </div>
        ))}

        <p className="text-[0.6875rem] font-sans text-text-secondary/60 text-center">
          Thanh toán trước 100% • Thu hộ đối tác vận chuyển
        </p>

        <Link
          href={`/faq?q=${encodeURIComponent('Tôi cần đặt vé tàu và xe điện')}`}
          className="flex items-center justify-center gap-2 min-h-[48px] px-6
                     bg-accent/15 text-accent text-sm font-medium rounded-full
                     border border-accent/30 active:scale-95 transition-transform duration-[150ms]"
        >
          Đặt trọn gói qua Long Xì <ChevronRight className="w-4 h-4" />
        </Link>

        <BrandLine />
      </div>
    </div>
  );
}

// ─── Tab content: Vé ─────────────────────────────────────────────────────────
function Ve() {
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-6 pb-2 flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-text-primary">Vé & cảng</h2>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            Các loại vé bắt buộc khi di chuyển đến Minh Châu và trong đảo.
          </p>
        </div>

        {/* Vé cảng Ao Tiên */}
        <div className="flex items-center gap-4 p-5
                        bg-surface rounded-card border border-[var(--glass-border)]">
          <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5 text-accent" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary text-base">Vé cảng Ao Tiên</p>
            <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">
              Bắt buộc • 1 lượt / người • Mua tại cổng cảng
            </p>
          </div>
          <p className="text-lg font-bold text-accent font-sans shrink-0">
            {formatVND(SURCHARGE_SERVICES.portTicket)}
          </p>
        </div>

        {/* Miễn phí xe tắm biển */}
        <div className="flex items-center gap-4 p-5
                        bg-green-500/10 rounded-card border border-green-500/25">
          <div className="w-11 h-11 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary text-base">Xe tắm biển</p>
            <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">
              Robinson & bãi Minh Châu — 2 chiều • Bình Minh Homestay tặng
            </p>
          </div>
          <span className="text-sm font-bold text-green-500 font-sans shrink-0">FREE</span>
        </div>

        {/* Policy note */}
        <div className="p-4 bg-bg-secondary/50 rounded-card border border-[var(--glass-border)]">
          <p className="text-sm font-bold text-text-primary mb-2">Chính sách check-in</p>
          <div className="flex flex-col gap-1.5">
            {[
              [`Nhận phòng sau`, BOOKING_POLICY.checkInTime],
              [`Trả phòng trước`, BOOKING_POLICY.checkOutTime],
              [`Đặt cọc`, `30% tổng giá trị đặt phòng`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[0.6875rem] font-sans text-text-secondary">{label}</span>
                <span className="text-[0.6875rem] font-sans font-medium text-text-primary">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <BrandLine />
      </div>
    </div>
  );
}

// ─── Tab content: Dịch vụ khác ───────────────────────────────────────────────
function DichVu() {
  return (
    <div className="flex flex-col">
      <div className="px-5 pt-6 pb-2 flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-text-primary">Dịch vụ khác</h2>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            Liên hệ trực tiếp để được tư vấn các dịch vụ theo yêu cầu.
          </p>
        </div>

        {/* Hotline card */}
        <div className="flex items-center gap-4 p-5
                        bg-accent/10 rounded-card border border-accent/25">
          <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-accent" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-text-primary text-base">Hotline Mr. Hoàng</p>
            <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">
              Tư vấn 24/7 — tiếng Việt
            </p>
          </div>
          <a
            href={`tel:${BOOKING_POLICY.hotline.replace(/\./g, '')}`}
            className="min-h-[44px] px-4 flex items-center
                       bg-accent text-bg-primary text-sm font-medium font-sans
                       rounded-full active:scale-95 transition-transform duration-[150ms]"
          >
            Gọi
          </a>
        </div>

        {/* Coming soon services */}
        {[
          { label: 'BBQ tại bãi Robinson', sub: 'Đặt trước 1 ngày — theo yêu cầu' },
          { label: 'Sinh nhật & kỷ niệm',  sub: 'Trang trí phòng, bánh, nến' },
          { label: 'Chụp ảnh kỷ niệm',     sub: 'Photographer local — bình minh Robinson' },
          { label: 'Kayak & lặn biển',      sub: 'Đang phát triển — Sprint 2' },
        ].map((item) => (
          <div key={item.label}
            className="flex items-center justify-between gap-3 p-4
                       bg-surface rounded-card border border-[var(--glass-border)]"
          >
            <div className="flex-1">
              <p className="font-bold text-text-primary text-sm">{item.label}</p>
              <p className="text-[0.6875rem] font-sans text-text-secondary mt-0.5">{item.sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-secondary/40 shrink-0" strokeWidth={1.5} />
          </div>
        ))}

        <BrandLine />
      </div>
    </div>
  );
}

// ─── Page root ─────────────────────────────────────────────────────────────────
export default function PlayPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tham-quan');

  const tabContent: Record<TabId, React.ReactNode> = {
    'tham-quan': <ThamQuan />,
    'di-chuyen': <DiChuyen />,
    've':        <Ve />,
    'dich-vu':   <DichVu />,
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden">

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="shrink-0 glass px-5 pt-safe-top">
        <div className="flex items-center justify-between pt-4 pb-3">
          <h1 className="font-heading text-xl font-bold text-text-primary">chơi</h1>
          <LanguageSwitcher />
        </div>

        {/* M3E Secondary tab chips — scrollable horizontal strip */}
        <div className="flex gap-2 pb-3 overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 shrink-0 px-4 py-2
                            rounded-full font-sans text-sm font-medium
                            border transition-colors duration-[200ms]
                            min-h-[36px]
                            after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
                            after:bg-text-primary/0 after:transition-[background-color] after:duration-[15ms]
                            hover:after:bg-text-primary/8 active:after:bg-text-primary/12
                            ${active
                              ? 'bg-text-primary text-bg-primary border-transparent'
                              : 'bg-text-primary/8 text-text-primary border-[var(--glass-border)]'}`}
              >
                {/* Active indicator — shared layoutId for smooth slide */}
                {active && (
                  <motion.span
                    layoutId="tab-chip-bg"
                    className="absolute inset-0 rounded-[inherit] bg-text-primary -z-10"
                    transition={CHIP_SPRING}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" strokeWidth={1.5} />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable content area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-[84px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={activeTab ? TAB_ENTER : TAB_EXIT}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
