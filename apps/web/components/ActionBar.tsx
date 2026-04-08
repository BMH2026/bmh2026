'use client';

import { Phone, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { QuickActionModal } from './QuickActionModal';

export function ActionBar() {
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [fbBadge, setFbBadge] = useState(3);

  useEffect(() => {
    // Random badge 1-9 on mount
    setFbBadge(Math.floor(Math.random() * 9) + 1);
  }, []);
  return (
    <>
      <div className="absolute right-[max(1rem,10vw)] top-[38%] z-50 flex flex-col items-center gap-6">
        {/* Facebook Link */}
        <motion.a 
          href="https://www.facebook.com/sunrise.minhchau/"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.9 }} 
          className="relative group"
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FEF7FF] transition-all hover:bg-white/20 ring-1 ring-white/10">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-[#FFB4AB] text-[#690005] text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full border border-white shadow-sm flex items-center justify-center transform translate-x-1/4 -translate-y-1/4"
          >
            {fbBadge}
          </motion.div>
        </motion.a>
        
        {/* Phone Button */}
        <motion.button 
          onClick={() => setIsPhoneOpen(true)}
          whileTap={{ scale: 0.9 }} 
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FEF7FF] transition-all hover:bg-white/20 ring-1 ring-white/10">
            <Phone className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </motion.button>

        {/* Map Button */}
        <motion.button 
          onClick={() => setIsLocationOpen(true)}
          whileTap={{ scale: 0.9 }} 
        >
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FEF7FF] transition-all hover:bg-white/20 ring-1 ring-white/10">
            <MapPin className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </motion.button>
      </div>

      {/* Modals placed outside the flex container to ensure top-layer positioning */}
      <QuickActionModal 
        key="phone-modal"
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        title="Gọi Mr. Hoàng - Quản lý"
        subtitle="+84 965 312 678"
        largeSubtitle={true}
        icon={<Phone className="w-8 h-8" />}
        confirmLabel="Gọi ngay"
        onConfirm={() => window.location.href = "tel:+84965312678"}
        confirmColor="bg-text-primary"
      />

      <QuickActionModal 
        key="location-modal"
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        title="Bình Minh Homestay"
        subtitle={"Thôn Nam Hải - Đảo Minh Châu\nĐặc khu Vân Đồn - Quảng Ninh"}
        icon={<MapPin className="w-8 h-8" />}
        confirmLabel="Google Map"
        onConfirm={() => window.open("https://maps.app.goo.gl/5w5fUoaQGwvefgyC7", "_blank")}
        confirmColor="bg-accent"
      />
    </>
  );
}
