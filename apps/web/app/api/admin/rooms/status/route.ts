import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/internal-auth';
import { getStore } from '@/lib/store';
import { ROOM_INVENTORY } from '@/lib/constants';
import type { RoomStatus } from '@/components/RoomStatusGrid';

export const revalidate = 0;

interface RoomStatusRow {
  roomId:     string;
  status:     RoomStatus;
  guestName?: string;
  checkOut?:  string;
}

export async function GET(req: Request) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const store = getStore();
    const pool  = await (store as any).pool?.();

    // Nếu chưa có DB (memory store) → trả về toàn bộ phòng là "empty"
    if (!pool) {
      const rooms: RoomStatusRow[] = ROOM_INVENTORY.map(r => ({
        roomId: r.id,
        status: 'empty',
      }));
      return NextResponse.json({ rooms });
    }

    const today    = new Date();
    const todayStr = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // 1. Active room_sessions (session đang chạy, chưa check-out, chưa bị terminate)
    const sessResult = await pool.query<{
      room_type: string;
      guest_name: string;
      check_out: string;
    }>(`
      SELECT room_type, guest_name, check_out
      FROM   room_sessions
      WHERE  terminated_at IS NULL
        AND  check_out > now()
      ORDER  BY check_out ASC
    `);

    // 2. Bookings check-out hôm nay (trạng thái CONFIRMED hoặc DEPOSITED)
    const checkoutResult = await pool.query<{
      room_type: string;
      guest_name: string;
      check_out_date: string;
    }>(`
      SELECT room_type, guest_name,
             check_out_date::text
      FROM   bookings
      WHERE  status IN ('CONFIRMED','DEPOSITED','CHECKED_IN')
        AND  DATE(check_out_date) = $1
    `, [todayStr]);

    // 3. Bookings check-in hôm nay (chưa có session → đang chờ nhận phòng)
    const checkinResult = await pool.query<{
      room_type: string;
      guest_name: string;
    }>(`
      SELECT room_type, guest_name
      FROM   bookings
      WHERE  status IN ('CONFIRMED','DEPOSITED')
        AND  DATE(check_in_date) = $1
    `, [todayStr]);

    // Build lookup maps: roomType → data
    // Note: roomType = 'phi-thuyen-1' | 'phi-thuyen-2' | 'homestay-1' | 'homestay-2'
    // nhưng ROOM_INVENTORY dùng room id (101, 102, PT1, PT2...).
    // Mapping: ta dùng type để xác định trạng thái, không phải id riêng lẻ,
    // vì booking chỉ biết loại phòng chứ không biết số phòng cụ thể.
    // → Tô màu theo logic ưu tiên: occupied > checkout > checkin > empty

    const occupiedByType   = new Map<string, { guestName: string; checkOut: string }>();
    const checkoutByType   = new Map<string, { guestName: string }>();
    const checkinByType    = new Map<string, { guestName: string }>();

    for (const row of sessResult.rows) {
      if (!occupiedByType.has(row.room_type)) {
        occupiedByType.set(row.room_type, {
          guestName: row.guest_name,
          checkOut:  row.check_out,
        });
      }
    }
    for (const row of checkoutResult.rows) {
      if (!checkoutByType.has(row.room_type)) {
        checkoutByType.set(row.room_type, { guestName: row.guest_name });
      }
    }
    for (const row of checkinResult.rows) {
      if (!checkinByType.has(row.room_type)) {
        checkinByType.set(row.room_type, { guestName: row.guest_name });
      }
    }

    // Build per-room status — dùng counters để phân phối khách vào từng phòng
    // (vì DB chỉ lưu roomType, không lưu roomId cụ thể)
    const occupiedCountByType  = new Map<string, number>();
    const checkoutCountByType  = new Map<string, number>();
    const checkinCountByType   = new Map<string, number>();

    // Đếm số lượng session/booking theo type
    for (const row of sessResult.rows) {
      occupiedCountByType.set(row.room_type, (occupiedCountByType.get(row.room_type) ?? 0) + 1);
    }
    for (const row of checkoutResult.rows) {
      checkoutCountByType.set(row.room_type, (checkoutCountByType.get(row.room_type) ?? 0) + 1);
    }
    for (const row of checkinResult.rows) {
      checkinCountByType.set(row.room_type, (checkinCountByType.get(row.room_type) ?? 0) + 1);
    }

    // Phân phối từng phòng theo type, ưu tiên: occupied > checkout > checkin > empty
    const usedOccupied = new Map<string, number>();
    const usedCheckout = new Map<string, number>();
    const usedCheckin  = new Map<string, number>();

    const rooms: RoomStatusRow[] = ROOM_INVENTORY.map(room => {
      const type = room.type;

      const oUsed = usedOccupied.get(type) ?? 0;
      const oTotal = occupiedCountByType.get(type) ?? 0;
      if (oUsed < oTotal) {
        usedOccupied.set(type, oUsed + 1);
        const data = occupiedByType.get(type);
        return { roomId: room.id, status: 'occupied', guestName: data?.guestName, checkOut: data?.checkOut };
      }

      const coutUsed = usedCheckout.get(type) ?? 0;
      const coutTotal = checkoutCountByType.get(type) ?? 0;
      if (coutUsed < coutTotal) {
        usedCheckout.set(type, coutUsed + 1);
        const data = checkoutByType.get(type);
        return { roomId: room.id, status: 'checkout', guestName: data?.guestName };
      }

      const cinUsed = usedCheckin.get(type) ?? 0;
      const cinTotal = checkinCountByType.get(type) ?? 0;
      if (cinUsed < cinTotal) {
        usedCheckin.set(type, cinUsed + 1);
        const data = checkinByType.get(type);
        return { roomId: room.id, status: 'checkin', guestName: data?.guestName };
      }

      return { roomId: room.id, status: 'empty' };
    });

    return NextResponse.json({ rooms });

  } catch (error) {
    console.error('[rooms/status]', error);
    // Fail-open: trả về toàn bộ empty thay vì crash dashboard
    const rooms: RoomStatusRow[] = ROOM_INVENTORY.map(r => ({ roomId: r.id, status: 'empty' }));
    return NextResponse.json({ rooms });
  }
}
