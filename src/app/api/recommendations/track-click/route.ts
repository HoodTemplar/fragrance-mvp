/**
 * POST /api/recommendations/track-click
 *
 * Records a click on a recommendation card. For sponsored cards, sponsorSlotId
 * is set so you can attribute clicks for billing later. No ads are on yet;
 * this route is ready for when you enable sponsored slots.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sponsorSlotId = typeof body.sponsorSlotId === "string" ? body.sponsorSlotId : null;
    const pageContext = typeof body.pageContext === "string" ? body.pageContext : "unknown";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("recommendation_clicks").insert({
      sponsored_slot_id: sponsorSlotId || null,
      user_id: user?.id ?? null,
      page_context: pageContext,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
