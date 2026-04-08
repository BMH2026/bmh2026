'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Cloud, CloudRain, Wind, Waves, Thermometer, Ship, Ticket, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: any;
  vessels: any[];
}

export function StatusModal({ isOpen, onClose, weather, vessels }: StatusModalProps) {
  const [activeTab, setActiveTab] = useState<'weather' | 'transport'>('weather');
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetch('/api/v1/pricing').then(res => res.json()).then(data => setSettings(data.settings || {}));
    }
  }, [isOpen]);

  const WeatherIcon = ({ code, className = "w-6 h-6" }: { code: number, className?: string }) => {
    if (code === 0) return <Sun className={`${className} text-yellow-400`} />;
    if (code <= 3) return <Cloud className={`${className} text-blue-300`} />;
    return <CloudRain className={`${className} text-blue-400`} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-surface/90 backdrop-blur-xl rounded-[32px] shadow-elevated z-[101] overflow-hidden border border-white/20"
          >
            {/* Header / Tabs */}
            <div className="p-6 pb-0 flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${
                    activeTab === 'weather' ? 'bg-text-primary text-bg-primary' : 'text-text-secondary hover:bg-white/10'
                  }`}
                >
                  Thời tiết
                </button>
                <button
                  onClick={() => setActiveTab('transport')}
                  className={`text-sm font-bold transition-all px-4 py-2 rounded-full ${
                    activeTab === 'transport' ? 'bg-text-primary text-bg-primary' : 'text-text-secondary hover:bg-white/10'
                  }`}
                >
                  Tàu & Giá vé
                </button>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-text-primary hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {activeTab === 'weather' ? (
                <div className="space-y-6">
                  {/* Today Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-wider mb-2">
                        <Waves className="w-3 h-3" /> Độ cao sóng
                      </div>
                      <div className="text-2xl font-bold text-text-primary">{weather?.waveHeight || '--'}</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-text-secondary text-[10px] uppercase tracking-wider mb-2">
                        <Thermometer className="w-3 h-3" /> Cảm giác như
                      </div>
                      <div className="text-2xl font-bold text-text-primary">{weather?.temp}°C</div>
                    </div>
                  </div>

                  {/* 10-Day Forecast */}
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Dự báo 10 ngày tới
                    </h3>
                    <div className="space-y-1">
                      {weather?.forecast?.map((day: any, i: number) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-24 text-sm font-medium text-text-primary">
                            {i === 0 ? 'Hôm nay' : format(parseISO(day.date), 'EEEE', { locale: vi })}
                          </div>
                          <div className="flex items-center gap-3">
                            <WeatherIcon code={day.code} />
                            <div className="w-32 text-xs text-text-secondary truncate">{day.condition}</div>
                          </div>
                          <div className="flex items-center gap-2 w-16 justify-end">
                            <span className="text-sm font-bold text-text-primary">{day.maxTemp}°</span>
                            <span className="text-sm font-medium text-text-secondary/50">{day.minTemp}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Boat Schedule */}
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Ship className="w-3 h-3" /> Lịch tàu hôm nay
                    </h3>
                    <div className="space-y-3">
                      {vessels.length > 0 ? (
                        vessels.map((v, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                                <Ship className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-text-primary">{v.operator}</div>
                                <div className="text-[10px] text-text-secondary">{v.direction === 'inbound' ? 'Cảng Ao Tiên → Đảo' : 'Đảo → Cảng Ao Tiên'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-accent font-mono font-bold">
                                <Clock className="w-3 h-3" /> {v.departure}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-text-secondary text-sm font-sans">
                          Chưa có lịch chạy hôm nay
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Ticket className="w-3 h-3" /> Bảng giá tham khảo
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm text-text-secondary">Phòng 2 giường (Đôi)</span>
                        <span className="text-sm font-bold text-text-primary">{Number(settings.pricing_room_2_bed || 1600000).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-sm text-text-secondary">Phòng 1 giường (Đơn)</span>
                        <span className="text-sm font-bold text-text-primary">{Number(settings.pricing_room_1_bed || 1400000).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 pt-0 border-t border-white/5">
              <div className="pt-4 text-[10px] text-center text-text-secondary">
                Website được tạo bởi Vân Đồn Solutions ©
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
