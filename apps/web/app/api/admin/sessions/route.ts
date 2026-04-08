import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { verifyAdminToken } from "@/lib/internal-auth";

/** GET /api/admin/sessions — list active room sessions for the admin dashboard */
export async function GET(req: NextRequest) {
  if (!verifyAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = getStore();
  const sessions = await store.getActiveRoomSessions();
  return NextResponse.json({ sessions });
}
