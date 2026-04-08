import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import {
  ROOM_PRICES,
  ROOM_AMENITIES,
  BOOKING_POLICY,
} from "@/lib/constants";

/**
 * GET /api/v1/rooms
 *
 * Kiến trúc 3 tầng:
 *   1. constants.ts   → Giá gốc / fallback (nguồn sự thật không đổi)
 *   2. DB (Supabase)  → Admin ghi đè bất kỳ lúc nào qua Dashboard / Long Xì
 *   3. API này        → Ưu tiên DB nếu key tồn tại, ngược lại fallback về constants
 *
 * Chính sách phụ thu người thêm:
 *   Phòng 1 giường: Standard 1–2 người | người thứ 3: +50% giá/đêm | Max: 3
 *   Phòng 2 giường: Standard 2 người   | người thêm: +25% giá/đêm  | Max: 4
 */

// Helper: đọc giá từ settings DB, fallback về constant nếu chưa set
function dbPrice(
  settings: Record<string, string>,
  key: string,
  fallback: number
): number {
  const raw = settings[key];
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return isNaN(parsed) ? fallback : parsed;
}

// Tiện ích chung tất cả phòng
const SHARED_FEATURES = [
  "Wifi miễn phí",
  "Minibar",
  "Máy sấy tóc",
  "Điều hòa",
  "Phòng tắm riêng",
];

export async function GET() {
  try {
    // Tầng 2: Đọc giá từ Supabase (persistent, admin có thể cập nhật)
    const store = getStore();
    const settings = await store.getSettings();

    // Tầng 3: Build catalog, ưu tiên DB → fallback constants
    const catalog = [
      {
        id: "phi-thuyen-2",
        group: "core",
        name: "Căn Phi Thuyền 2 Giường",
        weekdayPrice: dbPrice(
          settings,
          "pricing_phi_thuyen_2_weekday",
          ROOM_PRICES["phi-thuyen-2"].weekday
        ),
        weekendPrice: dbPrice(
          settings,
          "pricing_phi_thuyen_2_weekend",
          ROOM_PRICES["phi-thuyen-2"].weekend
        ),
        capacityStandard: ROOM_PRICES["phi-thuyen-2"].stdPax,
        capacityMax: ROOM_PRICES["phi-thuyen-2"].maxPax,
        extraPersonFeeRate: ROOM_PRICES["phi-thuyen-2"].extraPaxFeeRate,
        extraPersonNote:
          "Người thêm (tối đa 2 người ghép): +25% giá phòng/đêm/người",
        description:
          "Không gian kính rộng đón ánh sáng tự nhiên. Tĩnh lặng, phù hợp cặp đôi hoặc nhóm nhỏ.",
        features: ["2 Giường 1.6m", "Kính tràn viền", "Ánh sáng tự nhiên", ...SHARED_FEATURES],
        badge: "Phổ biến",
        images: ["https://placehold.co/400x500/003366/87CEEB?text=Phi+Thuyền+2"],
      },
      {
        id: "phi-thuyen-1",
        group: "core",
        name: "Căn Phi Thuyền 1 Giường",
        weekdayPrice: dbPrice(
          settings,
          "pricing_phi_thuyen_1_weekday",
          ROOM_PRICES["phi-thuyen-1"].weekday
        ),
        weekendPrice: dbPrice(
          settings,
          "pricing_phi_thuyen_1_weekend",
          ROOM_PRICES["phi-thuyen-1"].weekend
        ),
        capacityStandard: ROOM_PRICES["phi-thuyen-1"].stdPax,
        capacityMax: ROOM_PRICES["phi-thuyen-1"].maxPax,
        extraPersonFeeRate: ROOM_PRICES["phi-thuyen-1"].extraPaxFeeRate,
        extraPersonNote: "Người thứ 3 (tối đa): +50% giá phòng/đêm",
        description:
          "Khung kính lớn, ánh sáng tự nhiên tràn đầy. Tĩnh lặng, thiết kế mở — lý tưởng cho cặp đôi.",
        features: ["1 Giường 1.6m", "Khung kính lớn", "Ánh sáng tự nhiên", ...SHARED_FEATURES],
        images: ["https://placehold.co/400x500/003366/FFFFFF?text=Phi+Thuyền+1"],
      },
      {
        id: "homestay-2",
        group: "core",
        name: "Homestay 2 Giường",
        weekdayPrice: dbPrice(
          settings,
          "pricing_homestay_2_weekday",
          ROOM_PRICES["homestay-2"].weekday
        ),
        weekendPrice: dbPrice(
          settings,
          "pricing_homestay_2_weekend",
          ROOM_PRICES["homestay-2"].weekend
        ),
        capacityStandard: ROOM_PRICES["homestay-2"].stdPax,
        capacityMax: ROOM_PRICES["homestay-2"].maxPax,
        extraPersonFeeRate: ROOM_PRICES["homestay-2"].extraPaxFeeRate,
        extraPersonNote:
          "Người thêm (tối đa 2 người ghép): +25% giá phòng/đêm/người",
        description:
          "Thiết kế gần gũi, tiện sinh hoạt chung. Dành cho gia đình hoặc nhóm bạn 3–4 người.",
        features: ["2 Giường 1.4m", "Không gian gia đình", "Tiện sinh hoạt chung", ...SHARED_FEATURES],
        images: ["https://placehold.co/400x500/FFD700/003366?text=Homestay+2"],
      },
      {
        id: "homestay-1",
        group: "core",
        name: "Homestay 1 Giường",
        weekdayPrice: dbPrice(
          settings,
          "pricing_homestay_1_weekday",
          ROOM_PRICES["homestay-1"].weekday
        ),
        weekendPrice: dbPrice(
          settings,
          "pricing_homestay_1_weekend",
          ROOM_PRICES["homestay-1"].weekend
        ),
        capacityStandard: ROOM_PRICES["homestay-1"].stdPax,
        capacityMax: ROOM_PRICES["homestay-1"].maxPax,
        extraPersonFeeRate: ROOM_PRICES["homestay-1"].extraPaxFeeRate,
        extraPersonNote: "Người thứ 3 (tối đa): +50% giá phòng/đêm",
        description:
          "Không gian riêng tư, ấm cúng, thiết kế tối giản. Dành cho cặp đôi.",
        features: ["1 Giường 1.4m", "Riêng tư", "Ấm cúng", ...SHARED_FEATURES],
        images: ["https://placehold.co/400x500/87CEEB/003366?text=Homestay+1"],
      },
    ];

    // Giá dịch vụ bổ sung — chỉ các mục có trong phong.pdf (nguồn sự thật)
    const services = {
      speedBoat: dbPrice(settings, "pricing_speed_boat", 220_000),       // 220.000đ/lượt
      portTicket: dbPrice(settings, "pricing_port_ticket", 55_000),       // 55.000đ/người
      electricCarPrivate: dbPrice(settings, "pricing_electric_car_private", 100_000), // 100.000đ/chuyến
      electricCarRetail: dbPrice(settings, "pricing_electric_car_retail", 30_000),    // 30.000đ/người
      tours: {
        denCau: dbPrice(settings, "pricing_tour_den_cau", 1_700_000),
        eoGio: dbPrice(settings, "pricing_tour_eo_gio", 1_500_000),
        doiVoCuc: dbPrice(settings, "pricing_tour_doi_vo_cuc", 1_200_000),
        quanLan: dbPrice(settings, "pricing_tour_quan_lan", 800_000),
        angsana: dbPrice(settings, "pricing_tour_angsana", 700_000),
        songCatTrang: dbPrice(settings, "pricing_tour_song_cat_trang", 500_000),
      },
    };

    return NextResponse.json({
      success: true,
      rooms: catalog,
      services,
      pricingPolicy: {
        weekendDays: "Thứ 6, Thứ 7, Chủ Nhật và Ngày lễ",
        weekendSurcharge: dbPrice(
          settings,
          "pricing_weekend_surcharge",
          BOOKING_POLICY.depositRate
        ),
        depositRate: BOOKING_POLICY.depositRate,
        checkInTime: BOOKING_POLICY.checkInTime,
        checkOutTime: BOOKING_POLICY.checkOutTime,
      },
      propertyPolicies: {
        pool: ROOM_AMENITIES.pool,
        petFriendly: ROOM_AMENITIES.petFriendly,
        wheelchairAccess: ROOM_AMENITIES.wheelchair,
        tv: ROOM_AMENITIES.tv,
        elevator: ROOM_AMENITIES.elevator,
        minibar: ROOM_AMENITIES.minibar,
      },
      notes: [
        "Giá phòng chưa bao gồm tiền ăn.",
        "Cuối tuần (T6, T7, CN, lễ) giá cao hơn ngày thường.",
        "Không có TV và không có thang máy.",
        "Chấp nhận thú cưng.",
        "Có bậc thềm — chưa thân thiện người khuyết tật vận động.",
        "1 bể bơi chung miễn phí cho tất cả khách lưu trú.",
      ],
      // Cho admin biết giá đang từ nguồn nào
      _meta: {
        priceSource: "supabase+fallback",
        settingsCount: Object.keys(settings).length,
      },
    });
  } catch (error) {
    console.error("[GET /api/v1/rooms] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
