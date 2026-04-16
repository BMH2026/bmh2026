/**
 * Data Contract định nghĩa luồng Pricing của Binh Minh Homestay 2026
 * Chuẩn hóa 3 trạng thái: Intent -> Quote -> AvailabilityStatus
 */

export interface BookingIntent {
  startDate: string | null; // ISO 8601
  endDate: string | null;
  pax: {
    adults: number;
    children: number;
  };
  roomId: string | null;
  selectedDiningVouchers: string[];
}

export type AvailabilityStatus = 
  | "PENDING_CHECK" // Chưa gửi server kiểm tra
  | "AVAILABLE"     // Có phòng
  | "SOLD_OUT"      // Hết phòng
  | "REQUIRES_MANUAL_CONFIRMATION"; // Cần nhân viên xác nhận

export interface PricingQuote {
  pricingVersion: string; // ID phiên bản giá (tránh race condition)
  expiresAt: string; // Hạn chót của báo giá này (ISO 8601)
  
  breakdown: {
    basePrice: number;
    weekendSurcharge: number;
    paxSurcharge: number;
    diningTotal: number;
    discounts: number;
  };
  
  liveTotal: number; // Tổng tiền hiển thị
  
  availabilityStatus: AvailabilityStatus;
  
  disclaimer: string; // VD: "Giá mang tính ước lượng cho đến khi xác nhận còn phòng."
}
