'use client';

import Image from 'next/image';

export function DiningMenu() {
  return (
    <div className="flex flex-col pb-32">
      {/* Item 1 */}
      <div className="w-full h-64 relative">
        <Image 
          src="https://picsum.photos/seed/seafood/800/600" 
          alt="Hải sản Minh Châu" 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="px-8 py-8 bg-bg-primary">
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-2">Hải sản Minh Châu</h2>
        <p className="text-text-secondary leading-relaxed">
          Mực nhảy • Sá sùng<br/>
          • Ghẹ tươi sống
        </p>
      </div>

      <div className="w-full flex justify-center py-4 bg-bg-primary">
        <div className="w-1/2 h-[1px] bg-text-secondary/20" />
      </div>

      {/* Item 2 */}
      <div className="w-full h-64 relative">
        <Image 
          src="https://picsum.photos/seed/bbqbeach/800/600" 
          alt="BBQ Bãi Biển" 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="px-8 py-8 bg-bg-primary">
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-2">Thực Đơn Phong Phú</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Phục vụ theo suất hoặc gọi món tùy theo yêu cầu của quý khách.
        </p>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-2xl font-bold text-accent">
            từ 250.000đ<span className="text-sm font-normal text-text-secondary">/suất</span>
          </p>
          <p className="text-xs text-text-secondary font-sans">
            * Cuối tuần (T6, T7, CN) phụ thu +10%
          </p>
        </div>
      </div>

      <div className="w-full flex justify-center py-4 bg-bg-primary">
        <div className="w-1/2 h-[1px] bg-text-secondary/20" />
      </div>

      {/* Drinks Menu */}
      <div className="px-8 py-8 bg-bg-primary">
        <h2 className="font-heading text-3xl font-bold text-text-primary mb-6">Menu đồ uống</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface p-4 rounded-card shadow-soft border border-glass-border">
            <h3 className="font-bold text-text-primary mb-1">Cafe</h3>
            <p className="text-accent font-bold">25.000đ</p>
          </div>
          <div className="bg-surface p-4 rounded-card shadow-soft border border-glass-border">
            <h3 className="font-bold text-text-primary mb-1">Sinh tố</h3>
            <p className="text-accent font-bold">35.000đ</p>
          </div>
          <div className="bg-surface p-4 rounded-card shadow-soft border border-glass-border">
            <h3 className="font-bold text-text-primary mb-1">Nước ép</h3>
            <p className="text-accent font-bold">30.000đ</p>
          </div>
          <div className="bg-surface p-4 rounded-card shadow-soft border border-glass-border">
            <h3 className="font-bold text-text-primary mb-1">Bia / Nước ngọt</h3>
            <p className="text-accent font-bold">20.000đ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
