-- Migration 0007: Chuẩn hoá key giá phòng trong app_settings
-- Lý do: migration 0004 dùng key sai (pricing_room_2_bed) và giá sai thực tế.
-- Migration này upsert lại đúng 8 key weekday/weekend khớp với constants.ts.
-- Giá gốc (constants.ts 2026-04-05):
--   Phi Thuyền 2G: 1.300.000đ (ngày thường) | 1.500.000đ (cuối tuần)
--   Phi Thuyền 1G: 1.200.000đ | 1.400.000đ
--   Homestay 2G:   1.200.000đ | 1.400.000đ
--   Homestay 1G:   1.000.000đ | 1.200.000đ

insert into app_settings (setting_key, setting_value, description) values
  ('pricing_phi_thuyen_2_weekday', '1300000', 'Phi Thuyền 2 giường — Ngày thường (T2–T5)'),
  ('pricing_phi_thuyen_2_weekend', '1500000', 'Phi Thuyền 2 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_phi_thuyen_1_weekday', '1200000', 'Phi Thuyền 1 giường — Ngày thường (T2–T5)'),
  ('pricing_phi_thuyen_1_weekend', '1400000', 'Phi Thuyền 1 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_homestay_2_weekday',   '1200000', 'Homestay 2 giường — Ngày thường (T2–T5)'),
  ('pricing_homestay_2_weekend',   '1400000', 'Homestay 2 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_homestay_1_weekday',   '1000000', 'Homestay 1 giường — Ngày thường (T2–T5)'),
  ('pricing_homestay_1_weekend',   '1200000', 'Homestay 1 giường — Cuối tuần (T6, T7, CN, Lễ)'),
  ('pricing_weekend_surcharge',    '200000',  'Phụ thu cuối tuần so với ngày thường (đ/đêm)'),
  ('pricing_speed_boat',           '220000',  'Vé tàu cao tốc 1 lượt/người'),
  ('pricing_port_ticket',          '55000',   'Vé cảng Ao Tiên 1 lượt/người'),
  ('pricing_electric_car_private', '100000',  'Xe điện bao chuyến từ cảng Minh Châu'),
  ('pricing_electric_car_retail',  '30000',   'Xe điện khách lẻ từ cảng Minh Châu'),
  ('pricing_combo',                '3065000', 'Combo 3N2D Phi Thuyền / khách'),
  ('pricing_tour_den_cau',         '1700000', 'Tour xe Đền Cậu — 2 chiều'),
  ('pricing_tour_eo_gio',          '1500000', 'Tour xe Eo Gió — 2 chiều'),
  ('pricing_tour_doi_vo_cuc',      '1200000', 'Tour xe Đồi Vô Cực — 2 chiều'),
  ('pricing_tour_quan_lan',        '800000',  'Tour xe Quan Lạn — 2 chiều'),
  ('pricing_tour_angsana',         '700000',  'Tour xe Angsana — 2 chiều'),
  ('pricing_tour_song_cat_trang',  '500000',  'Tour xe Dòng Sông Cát Trắng — 2 chiều')
on conflict (setting_key) do update
  set setting_value = excluded.setting_value,
      description = excluded.description,
      updated_at = now();

-- Xoá các key cũ sai schema (tên không nhất quán từ migration 0004)
delete from app_settings where setting_key in (
  'pricing_room_2_bed',
  'pricing_room_1_bed',
  'pricing_homestay_2_bed',
  'pricing_homestay_1_bed',
  'pricing_holiday_multiplier'
);
