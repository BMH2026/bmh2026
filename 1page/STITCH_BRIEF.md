# Stitch Design Brief — Bình Minh Homestay One-Page Booking App
*Version 1.0 — 2026-04-13 | Hand this file directly to Google Stitch as a prompt*

---

## PART 1 — ZOOM OUT: Product Context

**What this is:**
A single-page mobile-first web app for "Bình Minh Homestay" — a small boutique island homestay located on Minh Châu island, Vân Đồn district, Quảng Ninh province, Vietnam. The page simulates a beautiful, interactive service invoice. Guests scroll from top to bottom and progressively build their own bill by selecting rooms, meals, and activities. Everything stays on one page — no navigation, no back button.

**Brand meaning:**
"Bình Minh" means Dawn / Sunrise in Vietnamese. The visual language should feel like a warm tropical sunrise over the ocean — golden, coral, soft amber, peaceful but alive. NOT a cold corporate invoice. Think: a handwritten café receipt redesigned by a modern hospitality brand.

**Target user:**
Vietnamese domestic tourists, 25–45 years old, booking a 2–4 day island vacation. Mobile phone users. They want to see prices clearly, choose services visually, and confirm quickly without reading walls of text.

**Core UX metaphor:**
The entire page IS the invoice. Sections are "line item groups". Guests tap colorful pills to open popup modals, review details and photos, then tap "Thêm vào hoá đơn" (Add to bill). The running total updates live at the bottom of each section and in a persistent summary section near the bottom of the page.

---

## PART 2 — ZOOM IN: Visual Style & Design System

### Color Palette
- **Primary:** Warm coral-orange `#FF6B35` — CTAs, selected pills, accents
- **Secondary:** Soft amber/gold `#F4A833` — highlights, weather widget, pricing numbers
- **Background:** Warm off-white `#FFF8F2` — page background, gives paper/receipt feel
- **Surface:** Pure white `#FFFFFF` — cards, modals, section containers
- **Text primary:** Deep charcoal `#1A1A1A`
- **Text secondary:** Warm gray `#7A6A5A`
- **Border/divider:** Light sand `#EDE0D4`
- **Success/confirm:** Soft teal `#2DC4A6`
- **Section headers:** Muted terracotta `#C4693A`

### Typography
- **Font:** Plus Jakarta Sans (Google Font) — clean, modern, excellent Vietnamese diacritics support
- **Heading sizes:** H1 = 22px bold, H2 = 18px semibold, H3 = 15px semibold
- **Body:** 14px regular, line-height 1.6
- **Price numbers:** 18px bold, amber color `#F4A833`
- **Labels/pills:** 13px medium, uppercase tracking

### Overall Aesthetic
- Flat design with very subtle warm shadows (`box-shadow: 0 2px 8px rgba(255,107,53,0.08)`)
- Rounded corners everywhere: cards 16px, pills 100px (fully rounded), modals 24px
- Warm, paper-textured feel — NOT Material Design, NOT Neumorphic
- Icons: Lucide React icon set (outline style, 20px, coral color)
- All imagery: coastal/ocean photography — blue water, white sand, tropical vegetation

---

## PART 3 — PAGE LAYOUT (Top to Bottom)

Design the full one-page layout with these 8 sections in exact order:

---

### SECTION 1 — Header / Legal Entity Block
**Height:** Compact, ~80px
**Layout:** Left: Bình Minh Homestay logo (stylized sunrise + wave mark) + name. Right: hotline number as tap-to-call link + language toggle pill (🇻🇳 VI | 🇬🇧 EN).
**Below logo:** One line of gray text: "Minh Châu, Vân Đồn, Quảng Ninh" + a small map pin icon.
**Visual treatment:** White card, subtle coral top border 3px, soft shadow. Sticky on scroll.

---

### SECTION 2 — Weather Widget
**Height:** ~120px card
**Layout:** Full-width card with soft gradient background (morning sky: coral → amber → pale yellow, left to right).
**Content:** 
- Left: Large weather icon (sun/clouds) + temperature "27°C"
- Center: Location "Minh Châu, Vân Đồn" + condition "Nắng đẹp, gió nhẹ"
- Right: 3-day mini forecast (small icons + temps)
- Bottom row: Humidity, wind speed, UV index as small chips
**Design note:** This should feel like a premium travel app widget, not a plain weather card.

---

### SECTION 3 — Tiền Phòng (Room Booking)
**Section header:** "🏠 Tiền Phòng" in terracotta H2, with a thin coral underline. Small subtitle: "Chọn loại phòng — giá tự động cập nhật"

**Component: Date selector row**
- Two pill-shaped inputs side by side: "📅 Nhận phòng" and "📅 Trả phòng"
- Below: auto-calculated "2 đêm · Cuối tuần" label in amber

**Component: Room type pills (4 pills in 2×2 grid)**
Each pill is a large rounded card (~160px wide × 80px tall) with:
- Room name (bold, 14px): "Phi Thuyền 2 Giường"
- Price (amber, 16px bold): "1.500.000đ/đêm"
- Small icon representing room type
- State: unselected (white bg, sand border) / selected (coral bg, white text)
- A small "ℹ" icon — tapping opens the Room Detail Modal

**Room Detail Modal (popup, bottom sheet style, 85% screen height):**
- Drag handle at top
- Hero image carousel (3 photos of the room)
- Room name H1 + price badge
- Amenity chips: Wifi · Minibar · Máy sấy tóc · Điều hòa · Bể bơi chung
- Policy notes: "Nhận phòng 14:00 · Trả phòng 12:00 · Chấp nhận thú cưng"
- Guest count stepper: "− 2 +" with note "+25%/người nếu vượt tiêu chuẩn"
- CTA button full-width: "Thêm vào hoá đơn" (coral bg, white text, large)

**Bill preview row** (appears after a room is added):
- White card: room name + nights + guest count → subtotal right-aligned in amber bold

---

### SECTION 4 — Tiền Ăn (F&B)
**Section header:** "🍜 Tiền Ăn" + subtitle "Bữa sáng & hải sản tươi"

**Component: Meal type pills (horizontal scroll row)**
3 pills: "🌅 Bữa sáng" · "🦐 Nhà ăn hải sản" · "🍹 Đồ uống minibar"

**Meal Detail Modal:**
- Meal name + description
- Photo of representative dish
- For "Nhà ăn hải sản": scrollable menu list with item name + price per person
- Guest count stepper
- CTA: "Thêm vào hoá đơn"

**Bill preview row:** Same pattern as rooms — line item with price.

---

### SECTION 5 — Tiền Chơi (Activities & Logistics)
**Section header:** "🎯 Tiền Chơi" + subtitle "Tour khám phá & di chuyển"

**Sub-section A: Logistics (Thu hộ 100%)**
Horizontal scroll row of transport pills:
- "🚢 Vé tàu cao tốc · 220k/lượt"
- "⚡ Xe điện bao chuyến · 100k"
- "🎫 Vé cảng Ao Tiên · 55k/người"
- "⚡ Xe điện lẻ · 30k/người"
- "🏖️ Xe tắm biển · Miễn phí"

**Sub-section B: Tour khám phá (Thu hộ 100%)**
2×3 grid of destination cards (small, ~150px wide):
Each card: destination photo thumbnail + name + price
- Đền Cậu · 1.700.000đ
- Eo Gió · 1.500.000đ
- Đồi Vô Cực · 1.200.000đ
- Trung tâm Quan Lạn · 800.000đ
- Angsana · 700.000đ
- Dòng Sông Cát Trắng · 500.000đ

**Tour Detail Modal:**
- Full-width landscape photo of destination
- Tour name H1
- "Thu hộ — Thanh toán 100% khi đặt cọc" notice badge (amber bg)
- Description 2–3 lines
- Party size stepper
- "Thêm vào hoá đơn" CTA

---

### SECTION 6 — Tính Tiền (Bill Summary & Payment)
**Visual:** This section should look most like a real invoice/receipt. Use a slightly off-white `#FFF3E8` background. Dashed top border (receipt-style).

**Layout — Bill breakdown:**
```
Tiền phòng:                    2.400.000đ
Tiền ăn:                         380.000đ
Tiền chơi (Thu hộ):          1.700.000đ
────────────────────────────────────────
Tổng cộng:                    4.480.000đ
Đặt cọc (30% phòng + 100% thu hộ):  2.420.000đ
Còn lại thanh toán khi nhận phòng:  2.060.000đ
```
All numbers right-aligned in amber bold. Labels left-aligned in charcoal. A thin dashed divider before the totals.

**CTA: Deposit transfer pill**
Full-width card with coral gradient background:
- "💳 Chuyển khoản đặt cọc" as heading
- Bank name + account number + account name
- QR code placeholder (square, centered)
- Amount pre-filled: "2.420.000đ"
- Copy button for account number
- Note: "Ghi chú: [Họ tên] - [Ngày nhận phòng]"

**Confirmation note:** "Sau khi chuyển khoản, chủ nhà sẽ xác nhận trong vòng 30 phút."

---

### SECTION 7 — Footer Navigation
**Layout:** Three centered text links separated by "·":
`Bài viết` · `Thông báo` · `Chính sách`
Each is a coral-colored underlined link that opens a bottom-sheet modal.

**Below the links:**
```
Website được phát triển bởi Vân Đồn Solutions © 2026
Giải pháp tiên phong trong lĩnh vực du lịch - nghỉ dưỡng
```
Small gray text, centered, 12px.

---

### SECTION 8 — Floating Elements (Always Visible)
**Long Xì AI Chat FAB:**
- Position: Bottom-right, 24px from edge
- Resting state: Circular button, 56px, coral bg, white chat bubble icon
- Expanded state (tap): A small chat widget appears above — "Xin chào! Tôi là Long Xì 🌊 Cần tôi tư vấn gì không?" with text input
- The FAB must NOT overlap the deposit CTA in Section 6 — offset vertically when Section 6 is in viewport

---

## PART 4 — INTERACTION STATES TO DESIGN

Please design the following screens/states:

1. **Default state** — Page loaded, no items added to bill yet. Bill summary section shows "Chưa có dịch vụ nào" placeholder.
2. **Room selected state** — One room pill highlighted coral, bill preview row visible below Section 3.
3. **Modal open state** — Room detail modal fully open, with bottom sheet overlaying the page (dimmed backdrop).
4. **Bill populated state** — All 3 sections have items added. Section 6 shows fully calculated amounts.
5. **Deposit CTA state** — QR code and bank transfer card visible.
6. **Long Xì chat open state** — FAB expanded with chat widget.

---

## PART 5 — TECHNICAL NOTES FOR STITCH OUTPUT

- Output format preferred: **HTML + CSS + JavaScript** (single file), OR **Figma export**
- Mobile-first: design for 390px width (iPhone 14 Pro viewport)
- All prices use Vietnamese format: `1.500.000đ` (dot-separated thousands, đ suffix)
- All modals use bottom-sheet pattern (slides up from bottom, not centered popup)
- Transitions: 300ms ease-out for modal open/close, 150ms for pill selection
- No external images needed — use placeholder gradients or Unsplash URLs for room/destination photos
- The page should feel complete and production-ready, not wireframe-style

---

## SUGGESTED STITCH PROMPT (copy-paste ready)

```
Design a single-page mobile web app (390px width) for "Bình Minh Homestay" — a boutique island homestay in Vietnam. The page simulates a beautiful interactive invoice/receipt where guests build their own service bill by selecting rooms, meals, and activities.

Visual style: warm tropical sunrise aesthetic. Color palette: coral-orange #FF6B35 primary, amber #F4A833 for prices, warm off-white #FFF8F2 background, white cards, sand borders. Font: Plus Jakarta Sans. Rounded corners (16px cards, full-round pills). Flat design with warm subtle shadows. Paper/receipt texture feel, NOT cold fintech.

Page layout top to bottom:
1. Sticky header: logo left, hotline + language toggle right, location subtitle
2. Weather widget card: morning sky gradient, temperature, 3-day forecast, humidity/wind chips
3. "Tiền Phòng" section: date picker row, 4 room type pills in 2x2 grid (each shows name + price, tapping opens bottom-sheet modal with photos, amenities, guest stepper, "Thêm vào hoá đơn" CTA button)
4. "Tiền Ăn" section: 3 meal pills in horizontal scroll, same modal pattern
5. "Tiền Chơi" section: transport pills row + 2x3 destination cards grid with photos, same modal pattern
6. "Tính Tiền" bill summary: receipt-style layout showing itemized total, deposit amount, balance due, bank transfer card with QR code
7. Footer: 3 text links + developer attribution in small gray text
8. Floating: coral circular FAB button bottom-right for "Long Xì AI" chat assistant

Show 6 states: empty page, room selected, modal open, full bill, deposit CTA active, chat FAB expanded. Make it feel premium, warm, and production-ready.
```

---

*Brief prepared by: Vân Đồn Solutions — 2026-04-13*
*For use with: Google Stitch (stitch.withgoogle.com) — Gemini 2.5 Pro mode recommended*
