'use client';

import { motion } from 'motion/react';
import { Zap, Ship, Car, MapPin, CheckCircle2, Phone, Clock } from 'lucide-react';
import { SURCHARGE_SERVICES, TOUR_PACKAGES, BOOKING_POLICY, formatVND } from '@/lib/constants';

export function ComboCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-8 mt-6 mb-8 bg-gradient-to-br from-accent/20 to-bg-secondary rounded-card p-1 shadow-elevated border border-accent/30"
    >
      <div className="bg-surface rounded-[20px] p-5 h-full flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-accent mb-1">
              <Zap className="w-4 h-4" strokeWidth={2} />
              <span className="text-xs font-bold uppercase tracking-wider">Dịch Vụ Nổi Bật</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary leading-tight">
              Tiện ích & Di chuyển
            </h2>
          </div>
        </div>

        <div className="py-3 border-y border-glass-border flex flex-col gap-3 text-sm text-text-primary">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-bold">Miễn phí xe đưa đón tắm biển</p>
              <p className="text-xs text-text-secondary">Bãi Robinson & bãi trung tâm Minh Châu (2 chiều)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Ship className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-bold">Tàu cao tốc & Vé cảng</p>
              <p className="text-xs text-text-secondary">
                Tàu: {formatVND(SURCHARGE_SERVICES.speedBoat)}/lượt • Vé cảng Ao Tiên: {formatVND(SURCHARGE_SERVICES.portTicket)}/người
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Car className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-bold">Xe điện đưa đón cảng</p>
              <p className="text-xs text-text-secondary">
                {formatVND(SURCHARGE_SERVICES.electricCar_Private)}/chuyến (Khách lẻ: {formatVND(SURCHARGE_SERVICES.electricCar_Retail)}/người)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-bold">Xe tham quan (2 chiều)</p>
              <p className="text-xs text-text-secondary">
                {Object.values(TOUR_PACKAGES).map(t => `${t.label}: ${(t.price / 1000).toFixed(0)}k`).join(' • ')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="font-bold">Chính sách nhận/trả phòng</p>
              <p className="text-xs text-text-secondary">
                Nhận phòng sau {BOOKING_POLICY.checkInTime} • Trả phòng trước {BOOKING_POLICY.checkOutTime} • Đặt cọc {BOOKING_POLICY.depositRate * 100}%
              </p>
            </div>
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(`tel:${BOOKING_POLICY.hotline.replace(/\./g, '')}`)}
          className="mt-2 w-full py-3.5 bg-accent text-white rounded-button font-bold flex items-center justify-center gap-2 shadow-md"
        >
          <Phone className="w-5 h-5" strokeWidth={2} />
          Liên hệ đặt xe / vé tàu
        </motion.button>
      </div>
    </motion.div>
  );
}
