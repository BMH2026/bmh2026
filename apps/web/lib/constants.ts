/**
 * BINH MINH HOMESTAY — BUSINESS CONSTANTS
 * Source of truth: Bảng giá chính thức từ chủ homestay (phong.pdf, xác nhận 2026-04-05)
 * Mọi thay đổi giá/chính sách PHẢI được cập nhật tại đây trước.
 * Last updated: 2026-04-08 — Xoá COMBO_PACKAGES & speedBoatReturn (không có trong phong.pdf)
 */

// ─── CHÍNH SÁCH ĐẶT PHÒNG ───────────────────────────────────────────────────
export const BOOKING_POLICY = {
  checkInTime: '14:00',        // Nhận phòng sau 14:00
  checkOutTime: '12:00',       // Trả phòng trước 12:00 ← xác nhận từ bảng giá PDF
  depositRate: 0.30,           // Đặt cọc 30% tổng giá trị phòng
  hotline: '0965.312.678',     // Hotline Mr. Hoàng
  email: 'sunriseminhchau@gmail.com',
  note: 'Giá phòng chưa bao gồm tiền ăn',
} as const;

// ─── GIÁ & SỨC CHỨA PHÒNG ──────────────────────────────────────────────────
export const ROOM_PRICES = {
  'phi-thuyen-2': { 
    weekday: 1_300_000, weekend: 1_500_000,
    beds: 2, stdPax: 2, maxPax: 4, extraPaxFeeRate: 0.25 
  },  // Phi Thuyền 2 giường: Mỗi giường max 2 (tổng 4), phí 25% giá phòng
  'phi-thuyen-1': { 
    weekday: 1_200_000, weekend: 1_400_000,
    beds: 1, stdPax: 2, maxPax: 3, extraPaxFeeRate: 0.50 
  },  // Phi Thuyền 1 giường: Standard 2, max 3, thêm 1 chịu 50%
  'homestay-2': { 
    weekday: 1_200_000, weekend: 1_400_000,
    beds: 2, stdPax: 2, maxPax: 4, extraPaxFeeRate: 0.25 
  },  // Nhà Gỗ 2 giường
  'homestay-1': { 
    weekday: 1_000_000, weekend: 1_200_000,
    beds: 1, stdPax: 2, maxPax: 3, extraPaxFeeRate: 0.50 
  },  // Nhà Gỗ 1 giường
} as const;

// Giá cuối tuần = giá ngày thường + 200.000đ/đêm (quy tắc chung)
export const WEEKEND_SURCHARGE_PER_NIGHT = 200_000;

// Cuối tuần bao gồm: Thứ 6, Thứ 7, Chủ Nhật và Ngày lễ
export const WEEKEND_DAYS = [5, 6, 0] as const; // 0=Sun, 5=Fri, 6=Sat

// ─── TIỆN ÍCH PHÒNG & KHUÔN VIÊN ──────────────────────────────────────────
export const ROOM_AMENITIES = {
  wifi: true,
  ac: true,            // Máy điều hòa
  hairDryer: true,     // Máy sấy tóc
  privateBath: true,   // Phòng tắm riêng
  tv: false,           // Không có TV
  elevator: false,     // Không có thang máy
  minibar: true,       // Minibar đầy đủ
  pool: true,          // 1 bể bơi chung công cộng free (toàn khu)
  petFriendly: true,   // Chấp nhận thú cưng
  wheelchair: false,   // Không thân thiện với xe lăn (do có bậc thềm)
} as const;

// ─── DỊCH VỤ PHỤ THU (VNĐ) ──────────────────────────────────────────────────
// Nguồn: phong.pdf (bảng giá chính thức). Chỉ liệt kê đúng những gì có trong PDF.
export const SURCHARGE_SERVICES = {
  speedBoat: 220_000,           // Vé tàu cao tốc 1 lượt/người (phong.pdf: "220.000k/lượt")
  portTicket: 55_000,           // Vé vào cảng Ao Tiên (phong.pdf: "55k/người")
  electricCar_Private: 100_000, // Xe điện bao chuyến cảng Minh Châu ↔ Homestay (phong.pdf: "100k/chuyến")
  electricCar_Retail: 30_000,   // Xe điện khách lẻ (phong.pdf: "30k/người")
  beachTransfer: 0,             // Miễn phí: xe đưa tắm biển Robinson & trung tâm Minh Châu (2 chiều)
} as const;

// ─── GIÁ TOUR THAM QUAN (VNĐ – xe 2 chiều) ───────────────────────────────────
export const TOUR_PACKAGES = {
  denCau:          { label: 'Đền Cậu',           price: 1_700_000 },
  eoGio:           { label: 'Eo Gió',             price: 1_500_000 },
  doiVoCuc:        { label: 'Đồi Vô Cực',         price: 1_200_000 },
  quanLan:         { label: 'Quan Lạn',           price: 800_000  },
  angsana:         { label: 'Angsana',            price: 700_000  },
  dongSongCatTrang:{ label: 'Dòng Sông Cát Trắng',price: 500_000  },
} as const;

// ─── THÔNG TIN ĐIỂM ĐẾN ─────────────────────────────────────────────────────
export const PROPERTY_INFO = {
  name: 'Binh Minh Homestay',
  island: 'Minh Châu',
  district: 'Vân Đồn',
  province: 'Quảng Ninh',
  highlight: 'Nằm bên Bãi Robinson – bãi biển hoang sơ và đẹp nhất Minh Châu. Đón bình minh sớm nhất đảo.',
  nearestPort: 'Cảng quốc tế Ao Tiên',
  onIslandPort: 'Cảng Minh Châu',
} as const;

// ─── SƠ ĐỒ PHÒNG (ROOM INVENTORY) ───────────────────────────────────────────
// Nguồn: sơ đồ vị trí phòng thực tế, xác nhận 2026-04-08
// 16 phòng, 4 loại. Grid 4 cột × 5 hàng. Hàng 0 = PT1/PT2 (wide).
// Hàng 1, cột 1–2 = bể bơi (null).

export type RoomType = keyof typeof ROOM_PRICES;

export interface RoomUnit {
  id: string;          // số phòng hiển thị (e.g. "101", "PT1")
  type: RoomType;
  row: number;         // 0–4
  col: number;         // 0–3
  colSpan?: 2;         // chỉ PT1 và PT2 (wide, chiếm 2 cột)
}

export const ROOM_INVENTORY: readonly RoomUnit[] = [
  // ── Hàng 0: Phi Thuyền (wide, chiếm 2 cột mỗi căn) ──────────────────────
  { id: 'PT1', type: 'phi-thuyen-1', row: 0, col: 0, colSpan: 2 },
  { id: 'PT2', type: 'phi-thuyen-2', row: 0, col: 2, colSpan: 2 },

  // ── Hàng 1: 101 | bể bơi | bể bơi | 201 ─────────────────────────────────
  { id: '101', type: 'homestay-1',   row: 1, col: 0 },
  { id: '201', type: 'homestay-2',   row: 1, col: 3 },

  // ── Hàng 2 ────────────────────────────────────────────────────────────────
  { id: '102', type: 'homestay-1',   row: 2, col: 0 },
  { id: '208', type: 'homestay-2',   row: 2, col: 1 },
  { id: '205', type: 'homestay-2',   row: 2, col: 2 },
  { id: '202', type: 'homestay-2',   row: 2, col: 3 },

  // ── Hàng 3 ────────────────────────────────────────────────────────────────
  { id: '103', type: 'homestay-1',   row: 3, col: 0 },
  { id: '209', type: 'homestay-2',   row: 3, col: 1 },
  { id: '206', type: 'homestay-2',   row: 3, col: 2 },
  { id: '203', type: 'homestay-2',   row: 3, col: 3 },

  // ── Hàng 4 ────────────────────────────────────────────────────────────────
  { id: '104', type: 'homestay-1',   row: 4, col: 0 },
  { id: '210', type: 'homestay-2',   row: 4, col: 1 },
  { id: '207', type: 'homestay-2',   row: 4, col: 2 },
  { id: '204', type: 'homestay-2',   row: 4, col: 3 },
] as const;

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

/** Tính giá phòng theo ngày (trả về giá/đêm) */
export function getRoomPricePerNight(
  roomId: keyof typeof ROOM_PRICES,
  date: Date
): number {
  const dow = date.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const isWeekend = (WEEKEND_DAYS as readonly number[]).includes(dow);
  return isWeekend
    ? ROOM_PRICES[roomId].weekend
    : ROOM_PRICES[roomId].weekday;
}

/** Tính tổng tiền phòng cho khoảng ngày */
export function calculateRoomTotal(
  roomId: keyof typeof ROOM_PRICES,
  checkIn: Date,
  checkOut: Date
): number {
  let total = 0;
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    total += getRoomPricePerNight(roomId, cur);
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

/** Tính số tiền cọc = 30% tổng tiền phòng */
export function calculateDeposit(roomTotal: number): number {
  return Math.round(roomTotal * BOOKING_POLICY.depositRate);
}

/** Format tiền VNĐ */
export function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN') + 'đ';
}
