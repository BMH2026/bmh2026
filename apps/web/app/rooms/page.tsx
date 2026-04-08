'use client';

import { useState } from 'react';
import { RoomCatalog } from '@/components/RoomCatalog';
import { BookingSheet } from '@/components/BookingSheet';
import { ServicesAccordion } from '@/components/ServicesAccordion';

export default function RoomsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const handleBook = (roomId: string) => {
    setSelectedRoom(roomId);
    setIsBookingOpen(true);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-bg-primary overflow-hidden">
      {/* Sticky Header */}
      <div className="shrink-0 sticky top-0 z-30 glass px-8 py-4 pt-safe-top flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-text-primary">Phòng nghỉ</h1>
      </div>

      {/* Scrollable area: Bento + Services + Footer */}
      <div className="flex-1 overflow-y-auto">
        {/* Room Cards — Bento layout */}
        <RoomCatalog onBook={handleBook} />

        {/* Services & Info — collapsed accordion at bottom */}
        <ServicesAccordion />

        {/* Footer credit */}
        <p className="text-[10px] text-text-secondary/40 text-center py-4 px-8">
          Website được tạo bởi Vân Đồn Solutions ©
        </p>
      </div>

      {/* Booking Wizard Bottom Sheet */}
      <BookingSheet
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        roomId={selectedRoom}
      />
    </div>
  );
}
