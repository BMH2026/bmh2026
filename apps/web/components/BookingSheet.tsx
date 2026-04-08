'use client';

import { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronLeft, Ship, Car, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ROOM_PRICES,
  BOOKING_POLICY,
  SURCHARGE_SERVICES,
  calculateRoomTotal,
  calculateDeposit,
  formatVND,
} from '@/lib/constants';

type RoomId = keyof typeof ROOM_PRICES;

const ROOM_NAMES: Record<string, string> = {
  'phi-thuyen-2': 'Căn Phi Thuyền (2 giường)',
  'phi-thuyen-1': 'Căn Phi Thuyền (1 giường)',
  'homestay-2': 'Nhà Gỗ Homestay (2 giường)',
  'homestay-1': 'Nhà Gỗ Homestay (1 giường)',
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getDayLabel(date: Date): string {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
}

export function BookingSheet({
  isOpen,
  onClose,
  roomId,
}: {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
}) {
  const validRoomId = (roomId && roomId in ROOM_PRICES ? roomId : 'phi-thuyen-1') as RoomId;
  const maxPax = ROOM_PRICES[validRoomId].maxPax;

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState<Date>(addDays(new Date(), 3));
  const [nights, setNights] = useState(2);
  const [guestCount, setGuestCount] = useState<number>(ROOM_PRICES[validRoomId].stdPax || 2);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [addBoat, setAddBoat] = useState(false);
  const [addCar, setAddCar] = useState(false);
  const [boatPax, setBoatPax] = useState(2);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setGuestName('');
      setPhone('');
      setAddBoat(false);
      setAddCar(false);
      setConsent(false);
      setSubmitted(false);
      setGuestCount(ROOM_PRICES[validRoomId].stdPax || 2);
    }
  }, [isOpen, validRoomId]);

  const checkOut = addDays(checkIn, nights);
  const roomTotal = calculateRoomTotal(validRoomId, checkIn, checkOut);
  const deposit = calculateDeposit(roomTotal);
  const boatTotal = addBoat ? SURCHARGE_SERVICES.speedBoat * 2 * boatPax : 0; // khứ hồi = 2 × 220.000đ/lượt
  const carTotal = addCar ? SURCHARGE_SERVICES.electricCar_Private : 0;
  const servicesTotal = boatTotal + carTotal;
  const payNow = deposit + servicesTotal;
  const payAtReception = roomTotal - deposit;

  const canProceed1 = nights >= 1 && nights <= 14 && guestCount >= 1 && guestCount <= maxPax;
  const canProceed2 = guestName.trim().length >= 2 && phone.trim().length >= 9 && consent;

  const handleSubmit = async () => {
    if (!canProceed2) return;
    setSubmitted(true);
    try {
      await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName, phone,
          checkInDate: checkIn.toISOString().slice(0, 10),
          checkOutDate: checkOut.toISOString().slice(0, 10),
          roomType: validRoomId,
          guestCount,
          note: `Thêm tàu: ${addBoat ? `${boatPax} người` : 'Không'} | Xe điện: ${addCar ? 'Có' : 'Không'}`,
          consentVersion: 'v1.0',
        }),
      });
    } catch (_) { /* Fallback gracefully */ }
    setStep(3);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — M3 emphasized enter, accelerate exit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, ease: [0.05, 0.7, 0.1, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.18, ease: [0.3, 0, 0.8, 0.15] } }}
            className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet — spring enter (emphasized-decelerate), fast exit */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { type: 'spring', damping: 32, stiffness: 320, restDelta: 0.001 } }}
            exit={{ y: '100%', transition: { duration: 0.22, ease: [0.3, 0, 0.8, 0.15] } }}
            className="fixed bottom-0 left-0 right-0 h-[88vh] bg-bg-primary rounded-t-[28px] z-50 flex flex-col overflow-hidden"
          >
            {/* Drag handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0" onClick={onClose}>
              <div className="w-10 h-1.5 bg-text-secondary/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 flex justify-between items-center border-b border-text-secondary/10 shrink-0">
              <div>
                <p className="text-xs text-text-secondary">{ROOM_NAMES[validRoomId]}</p>
                <h2 className="font-heading text-xl font-bold text-text-primary">
                  {step === 1 ? 'Chọn ngày' : step === 2 ? 'Thông tin & Dịch vụ' : 'Thanh toán'}
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="relative overflow-hidden p-2 -mr-1 text-text-secondary flex items-center justify-center min-h-[44px] min-w-[44px] after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-5 py-3 flex gap-1.5 shrink-0">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                    s <= step ? 'bg-accent' : 'bg-text-secondary/15'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-2">

              {/* ── Step 1: Chọn ngày ── */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                  {/* Check-in date */}
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                      Ngày nhận phòng
                    </label>
                    <div className="bg-surface border border-glass-border rounded-card p-4">
                      <input
                        type="date"
                        value={checkIn.toISOString().slice(0, 10)}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setCheckIn(new Date(e.target.value))}
                        className="w-full bg-transparent text-text-primary text-lg font-heading outline-none min-h-[44px]"
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        {getDayLabel(checkIn)}, {formatDate(checkIn)} • Nhận phòng sau {BOOKING_POLICY.checkInTime}
                      </p>
                    </div>
                  </div>

                  {/* Số đêm */}
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                      Số đêm nghỉ
                    </label>
                    <div className="flex items-center gap-4 bg-surface border border-glass-border rounded-card p-4">
                      <button
                        onClick={() => setNights((n) => Math.max(1, n - 1))}
                        disabled={nights <= 1}
                        className="relative w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-primary disabled:opacity-[0.38] disabled:cursor-not-allowed overflow-hidden after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px]"
                      >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="font-heading text-3xl font-bold text-text-primary">{nights}</span>
                        <span className="text-text-secondary ml-1 text-sm">đêm</span>
                      </div>
                      <button
                        onClick={() => setNights((n) => Math.min(14, n + 1))}
                        disabled={nights >= 14}
                        className="relative w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-primary disabled:opacity-[0.38] disabled:cursor-not-allowed overflow-hidden after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px]"
                      >
                        <ChevronRight className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mt-1.5 text-center">
                      Trả phòng: {getDayLabel(checkOut)} {formatDate(checkOut)} trước {BOOKING_POLICY.checkOutTime}
                    </p>
                  </div>

                  {/* Guest count */}
                  <div>
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 block">
                      Số lượng người
                    </label>
                    <div className="flex items-center gap-4 bg-surface border border-glass-border rounded-card p-4">
                      <button
                        onClick={() => setGuestCount((n) => Math.max(1, n - 1))}
                        disabled={guestCount <= 1}
                        className="relative w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-primary disabled:opacity-[0.38] disabled:cursor-not-allowed overflow-hidden after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px]"
                      >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="font-heading text-3xl font-bold text-text-primary">{guestCount}</span>
                        <span className="text-text-secondary ml-1 text-sm">khách</span>
                      </div>
                      <button
                        onClick={() => setGuestCount((n) => Math.min(maxPax, n + 1))}
                        disabled={guestCount >= maxPax}
                        className="relative w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-primary disabled:opacity-[0.38] disabled:cursor-not-allowed overflow-hidden after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12 before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:min-w-[44px] before:min-h-[44px]"
                      >
                        <ChevronRight className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {/* Price preview */}
                  <div className="bg-accent/5 border border-accent/20 rounded-card p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Tổng tiền phòng</span>
                      <span className="font-bold text-text-primary">{formatVND(roomTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Đặt cọc ngay (30%)</span>
                      <span className="font-bold text-accent">{formatVND(deposit)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Thanh toán khi nhận phòng</span>
                      <span className="font-bold text-text-primary">{formatVND(payAtReception)}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Thông tin + Upsell ── */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
                  {/* Guest info */}
                  <div className="bg-surface border border-glass-border rounded-card p-4 flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Họ và tên *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-4 py-3 min-h-[48px] rounded-input bg-bg-secondary border-none outline-none focus:ring-2 focus:ring-accent/50 text-text-primary placeholder:text-text-secondary/50"
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại *"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 min-h-[48px] rounded-input bg-bg-secondary border-none outline-none focus:ring-2 focus:ring-accent/50 text-text-primary placeholder:text-text-secondary/50"
                    />
                  </div>

                  {/* Upsell: tàu */}
                  <div className="bg-surface border border-glass-border rounded-card p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setAddBoat(!addBoat)}
                        className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          addBoat ? 'bg-accent border-accent' : 'border-text-secondary/30'
                        }`}
                      >
                        {addBoat && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                      </button>
                      <div className="flex-1 cursor-pointer" onClick={() => setAddBoat(!addBoat)}>
                        <div className="flex items-center gap-2">
                          <Ship className="w-4 h-4 text-accent" strokeWidth={1.5} />
                          <p className="font-bold text-sm text-text-primary">Thêm vé tàu cao tốc khứ hồi</p>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{formatVND(SURCHARGE_SERVICES.speedBoat * 2)}/người</p>
                      </div>
                    </div>
                    {addBoat && (
                      <div className="flex items-center gap-4 mt-3 pl-9">
                        <span className="text-sm text-text-secondary">Số người:</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setBoatPax((p) => Math.max(1, p - 1))} 
                            className="relative overflow-hidden w-11 h-11 rounded-full bg-bg-secondary text-text-primary flex items-center justify-center after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
                          >
                            –
                          </button>
                          <span className="font-bold text-text-primary w-6 text-center">{boatPax}</span>
                          <button 
                            onClick={() => setBoatPax((p) => Math.min(8, p + 1))} 
                            className="relative overflow-hidden w-11 h-11 rounded-full bg-bg-secondary text-text-primary flex items-center justify-center after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-bold text-accent ml-auto">{formatVND(boatPax * SURCHARGE_SERVICES.speedBoat * 2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Upsell: xe điện */}
                  <div className="bg-surface border border-glass-border rounded-card p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => setAddCar(!addCar)}
                        className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                          addCar ? 'bg-accent border-accent' : 'border-text-secondary/30'
                        }`}
                      >
                        {addCar && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
                      </button>
                      <div className="cursor-pointer" onClick={() => setAddCar(!addCar)}>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-accent" strokeWidth={1.5} />
                          <p className="font-bold text-sm text-text-primary">Xe điện đón tại cảng Minh Châu</p>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{formatVND(SURCHARGE_SERVICES.electricCar_Private)}/chuyến</p>
                      </div>
                    </div>
                  </div>

                  {/* Price updated */}
                  {(addBoat || addCar) && (
                    <div className="bg-accent/5 border border-accent/20 rounded-card p-3 flex justify-between items-center">
                      <span className="text-sm text-text-secondary">Tổng thanh toán ngay</span>
                      <span className="font-heading font-bold text-accent text-lg">{formatVND(payNow)}</span>
                    </div>
                  )}

                  {/* Consent */}
                  <div className="flex items-start gap-3 mt-2">
                    <button
                      onClick={() => setConsent(!consent)}
                      className={`w-6 h-6 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        consent ? 'bg-text-primary border-text-primary' : 'border-text-secondary/40'
                      }`}
                    >
                      {consent && <Check className="w-3 h-3 text-bg-primary" strokeWidth={2.5} />}
                    </button>
                    <p className="text-xs text-text-secondary cursor-pointer" onClick={() => setConsent(!consent)}>
                      Tôi đồng ý với chính sách đặt phòng và xác nhận thông tin cá nhân được lưu trữ để xử lý đặt phòng.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Thanh toán ── */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col gap-4"
                >
                  {/* Summary */}
                  <div className="bg-surface border border-glass-border rounded-card p-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between font-medium">
                      <span className="text-text-secondary">Phòng</span>
                      <span className="text-text-primary">{ROOM_NAMES[validRoomId]}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Khách</span>
                      <span className="text-text-primary">{guestCount} người</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Nhận phòng</span>
                      <span className="text-text-primary">{getDayLabel(checkIn)} {formatDate(checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Trả phòng</span>
                      <span className="text-text-primary">{getDayLabel(checkOut)} {formatDate(checkOut)}</span>
                    </div>
                    <div className="border-t border-glass-border my-1" />
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Cọc phòng (30%)</span>
                      <span className="font-bold text-text-primary">{formatVND(deposit)}</span>
                    </div>
                    {servicesTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Dịch vụ (100%)</span>
                        <span className="font-bold text-text-primary">{formatVND(servicesTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-heading text-base border-t border-glass-border pt-2 mt-1">
                      <span className="font-bold text-text-primary">Chuyển khoản ngay</span>
                      <span className="font-bold text-accent text-lg">{formatVND(payNow)}</span>
                    </div>
                    <p className="text-[0.6875rem] text-text-secondary/60">
                      Còn lại thanh toán khi nhận phòng: {formatVND(payAtReception)} (chưa có tiền ăn)
                    </p>
                  </div>

                  {/* QR placeholder */}
                  <div className="bg-surface border border-glass-border rounded-card p-5 flex flex-col items-center gap-3">
                    <p className="text-sm font-bold text-text-primary">Quét QR để đặt cọc</p>
                    <div className="w-48 h-48 bg-bg-secondary rounded-xl flex items-center justify-center text-text-secondary/40 text-xs text-center">
                      [QR chuyển khoản]<br />
                      Đang tải...
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-text-secondary">Hoặc chuyển khoản theo thông tin:</p>
                      <p className="text-sm font-bold text-text-primary mt-1">STK: 19034521638016</p>
                      <p className="text-xs text-text-secondary">Techcombank • Binh Minh Homestay</p>
                      <p className="text-xs text-accent font-medium mt-1">Nội dung: {guestName} {phone.slice(-4)}</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary text-center min-h-[44px] flex items-center justify-center">
                    Sau khi chuyển khoản, chúng tôi sẽ xác nhận qua <span className="font-bold ml-1">{BOOKING_POLICY.hotline}</span>
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-5 pb-8 pt-3 border-t border-text-secondary/10 shrink-0">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceed1}
                  className="relative overflow-hidden w-full min-h-[48px] py-4 bg-text-primary text-bg-primary rounded-button font-bold text-base disabled:opacity-[0.38] after:content-[''] after:absolute after:inset-0 after:bg-bg-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12"
                >
                  Tiếp tục →
                </button>
              )}
              {step === 2 && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed2}
                    className="relative overflow-hidden w-full min-h-[48px] py-4 bg-text-primary text-bg-primary rounded-button font-bold text-base disabled:opacity-[0.38] after:content-[''] after:absolute after:inset-0 after:bg-bg-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-bg-primary/8 active:after:bg-bg-primary/12"
                  >
                    Xác nhận & Đến thanh toán →
                  </button>
                  <button onClick={() => setStep(1)} className="relative overflow-hidden text-sm text-text-secondary text-center min-h-[44px] after:content-[''] after:absolute after:inset-0 after:bg-text-primary/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-text-primary/8 active:after:bg-text-primary/12">
                    ← Quay lại chọn ngày
                  </button>
                </div>
              )}
              {step === 3 && (
                <button
                  onClick={onClose}
                  className="relative overflow-hidden w-full min-h-[48px] py-4 bg-accent text-white rounded-button font-bold text-base after:content-[''] after:absolute after:inset-0 after:bg-white/0 after:transition-[opacity] after:duration-[15ms] hover:after:bg-white/10 active:after:bg-white/20"
                >
                  Đã chuyển khoản <Check className="w-4 h-4 inline-block ml-1" strokeWidth={2.5} />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
