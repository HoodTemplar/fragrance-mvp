/**
 * POST /api/events
 *
 * Records a simple app event (image_uploaded, quiz_completed, recommendation_viewed,
 * recommendation_clicked, result_shared) in Supabase app_events.
 * Best-effort: always returns 200 so clients don't see 500s; failures are logged.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_EVENT_TYPES = [
  "image_uploaded",
  "quiz_completed",
  "recommendation_viewed",
  "recommendation_clicked",
  "result_shared",
] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventType = typeof body.eventType === "string" ? body.eventType : null;
    const payload = body.payload && typeof body.payload === "object" ? body.payload : null;

    if (!eventType || !ALLOWED_EVENT_TYPES.includes(eventType as (typeof ALLOWED_EVENT_TYPES)[number])) {
      return NextResponse.json({ ok: false, error: "Invalid eventType" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("app_events").insert({
      user_id: user?.id ?? null,
      event_type: eventType,
      payload: payload ?? {},
    });

    if (error) {
      console.error("[api/events] Supabase insert failed:", error.message, "code:", error.code);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[api/events] Unexpected error:", msg);
    return NextResponse.json({ ok: true });
  }
}
