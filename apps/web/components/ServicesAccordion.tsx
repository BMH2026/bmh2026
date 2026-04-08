'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Ship, Car, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { SURCHARGE_SERVICES, TOUR_PACKAGES, BOOKING_POLICY, formatVND } from '@/lib/constants';

export function ServicesAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-8 mt-6 mb-4">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-surface border border-glass-border rounded-card text-text-secondary active:scale-[0.98] transition-transform"
      >
        <span className="text-sm font-medium text-text-primary">Dịch vụ & Chi phí di chuyển</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 shrink-0" strokeWidth={2} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.28, ease: [0.2, 0, 0, 1] } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: [0.3, 0, 0.8, 0.15] } }}
            className="overflow-hidden"
          >
            <div className="border border-t-0 border-glass-border rounded-b-card px-4 pb-4 pt-3 bg-surface flex flex-col gap-4">

              {/* Dịch vụ di chuyển */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-bold text-text-primary">Miễn phí xe đưa đón tắm biển</p>
                    <p className="text-xs text-text-secondary">Bãi Robinson & bãi trung tâm Minh Châu (2 chiều)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Ship className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-bold text-text-primary">Tàu cao tốc & Vé cảng</p>
                    <p className="text-xs text-text-secondary">
                      {formatVND(SURCHARGE_SERVICES.speedBoat)}/lượt • Vé cảng Ao Tiên: {formatVND(SURCHARGE_SERVICES.portTicket)}/người
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Car className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="font-bold text-text-primary">Xe điện đưa đón cảng</p>
                    <p className="text-xs text-text-secondary">
                      {formatVND(SURCHARGE_SERVICES.electricCar_Private)}/chuyến (khách lẻ: {formatVND(SURCHARGE_SERVICES.electricCar_Retail)}/người)
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-glass-border" />

              {/* Tour */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
                  <p className="font-bold text-sm text-text-primary">Xe tham quan (2 chiều)</p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {Object.values(TOUR_PACKAGES).map((tour, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">{tour.label}</span>
                      <span className="text-xs font-bold text-text-primary">
                        {(tour.price / 1_000_000).toFixed(1).replace('.0', '')}tr
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-glass-border" />

              {/* Check-in policy */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="font-bold text-sm text-text-primary">Chính sách nhận & trả phòng</p>
                  <p className="text-xs text-text-secondary">
                    Nhận phòng sau {BOOKING_POLICY.checkInTime} • Trả phòng trước {BOOKING_POLICY.checkOutTime} • Đặt cọc {BOOKING_POLICY.depositRate * 100}%
                  </p>
                  <p className="text-xs text-text-secondary/60 mt-1">
                    {BOOKING_POLICY.note}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
