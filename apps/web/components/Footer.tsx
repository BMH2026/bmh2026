import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <div className="text-text-secondary/60 text-center py-8 mt-auto px-4 flex flex-col gap-3">
      <div>
        <h3 className="font-heading font-bold text-text-primary text-lg">Bình Minh Homestay</h3>
        <p className="text-xs font-sans mt-1">&quot;Dịch vụ đến từ trái tim&quot;</p>
      </div>
      
      <div className="flex flex-col gap-1.5 text-xs mt-2">
        <a href="https://maps.app.goo.gl/Y6R1aL7sh94VeRvR7" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 hover:text-accent transition-colors">
          <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
          Thôn Nam Hải, Minh Châu, Vân Đồn
        </a>
        <a href="tel:0965312678" className="flex items-center justify-center gap-1.5 hover:text-accent transition-colors">
          <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
          0965312678 (Mr Hoàng)
        </a>
        <a href="mailto:Sunriseminhchau@gmail.com" className="flex items-center justify-center gap-1.5 hover:text-accent transition-colors">
          <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
          Sunriseminhchau@gmail.com
        </a>
      </div>

      <div className="text-[10px] mt-4 opacity-50">
        All designed by Vân Đồn Solutions ©
      </div>
    </div>
  );
}
