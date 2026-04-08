import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";

/**
 * GET /api/v1/services
 * Trả về toàn bộ dịch vụ phi-phòng của BMH:
 *  - Nhóm 2: F&B (Ẩm thực)
 *  - Nhóm 3: Logistics (thu hộ — tàu, cảng, xe điện)
 *  - Nhóm 4: Tour & Khám phá (thu hộ — xe đi tham quan)
 *
 * Giá lấy từ DB Settings (pricing_* keys) với fallback hard-code.
 * Dữ liệu chuẩn: 2026-04-05
 */
export async function GET() {
  try {
    const store = getStore();
    const s = await store.getSettings();

    const services = {
      fnb: [
        {
          id: "breakfast",
          name: "Bữa sáng",
          type: "addon",
          note: "Add-on có tính phí cho phân hệ Homestay",
          price: Number(s.pricing_breakfast) || null, // TBD — chủ cập nhật
          unit: "người/bữa"
        },
        {
          id: "nha-an-tap-the",
          name: "Nhà ăn tập thể",
          type: "inhouse",
          note: "Phục vụ hải sản tươi sống Minh Châu. Giá theo thực đơn ngày.",
          price: null, // Giá theo thực đơn, không cố định
          unit: null
        },
        {
          id: "minibar",
          name: "Đồ uống tại phòng (Minibar)",
          type: "inroom",
          note: "Minibar trang bị sẵn trong tất cả phòng.",
          price: null, // Giá theo mặt hàng tiêu thụ
          unit: null
        }
      ],

      logistics: [
        {
          id: "tau-cao-toc",
          name: "Vé tàu cao tốc",
          price: Number(s.pricing_tau_cao_toc) || 220000,
          unit: "người/lượt",
          paymentNote: "Thanh toán trước 100%",
          freeService: false
        },
        {
          id: "ve-ao-tien",
          name: "Vé qua cảng Ao Tiên",
          price: Number(s.pricing_ve_ao_tien) || 55000,
          unit: "người",
          paymentNote: "Thanh toán trước 100%",
          freeService: false
        },
        {
          id: "xe-dien-bao-chuyen",
          name: "Xe điện đưa đón (Cảng Minh Châu ↔ Homestay) — bao chuyến",
          price: Number(s.pricing_xe_dien_bao_chuyen) || 100000,
          unit: "chuyến",
          paymentNote: "Thanh toán trước 100%",
          freeService: false
        },
        {
          id: "xe-dien-khach-le",
          name: "Xe điện đưa đón (Cảng Minh Châu ↔ Homestay) — khách lẻ",
          price: Number(s.pricing_xe_dien_khach_le) || 30000,
          unit: "người",
          paymentNote: "Thanh toán trước 100%",
          freeService: false
        },
        {
          id: "xe-bai-bien-mien-phi",
          name: "Xe đưa đón tắm biển Robinson & bãi trung tâm Minh Châu",
          price: 0,
          unit: "2 chiều",
          paymentNote: "Hoàn toàn miễn phí",
          freeService: true
        }
      ],

      tours: [
        {
          id: "den-cau",
          name: "Xe đi Đền Cậu (Quan Lạn)",
          price: Number(s.pricing_tour_den_cau) || 1700000,
          unit: "2 chiều",
          paymentNote: "Thu hộ — thanh toán trước 100%"
        },
        {
          id: "eo-gio",
          name: "Xe đi Eo Gió (Quan Lạn)",
          price: Number(s.pricing_tour_eo_gio) || 1500000,
          unit: "2 chiều",
          paymentNote: "Thu hộ — thanh toán trước 100%"
        },
        {
          id: "doi-vo-cuc",
          name: "Xe đi Đồi Vô Cực (Quan Lạn)",
          price: Number(s.pricing_tour_doi_vo_cuc) || 1200000,
          unit: "2 chiều",
          paymentNote: "Thu hộ — thanh toán trước 100%"
        },
        {
          id: "tt-quan-lan",
          name: "Xe đi trung tâm Quan Lạn",
          price: Number(s.pricing_tour_tt_quan_lan) || 800000,
          unit: "2 chiều",
          paymentNote: "Thu hộ — thanh toán trước 100%"
        },
        {
          id: "angsana",
          name: "Xe đi Angsana",
          price: Number(s.pricing_tour_angsana) || 700000,
          unit: "2 chiều",
          paymentNote: "Thu hộ — thanh toán trước 100%"
        },
        {
          id: "song-cat-trang",
          name: "Xe đi Dòng Sông Cát Trắng",
          price: Number(s.pricing_tour_song_cat_trang) || 500000,
          unit: "2 chiều",
          paymentNote: "Thu hộ — thanh toán trước 100%"
        }
      ]
    };

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("[GET /api/v1/services] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
