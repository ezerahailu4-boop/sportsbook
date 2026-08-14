import { NextResponse } from "next/server";
import { requireSessionUser, unauthenticatedResponse } from "@/lib/require-session";
import { getUserNotifications, markNotificationAsRead } from "@/services/notifications/notification.service";

export async function GET() {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const notifications = await getUserNotifications(user.id);
  return NextResponse.json({
    success: true,
    data: { notifications },
    error: null,
    meta: {},
  });
}

export async function PATCH(req: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json(unauthenticatedResponse(), { status: 401 });

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ success: false, data: null, error: { code: "ID_REQUIRED", message: "Notification ID required" }, meta: {} }, { status: 400 });
  }

  await markNotificationAsRead(id, user.id);
  return NextResponse.json({ success: true, data: { success: true }, error: null, meta: {} });
}
