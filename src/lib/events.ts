/**
 * Simple event tracking for the MVP.
 * Sends events to POST /api/events, which stores them in Supabase app_events.
 */

export type AppEventType =
  | "image_uploaded"
  | "quiz_completed"
  | "recommendation_viewed"
  | "recommendation_clicked"
  | "result_shared";

export type EventPayload = Record<string, unknown>;

export async function trackEvent(
  eventType: AppEventType,
  payload?: EventPayload
): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, payload: payload ?? {} }),
    });
  } catch {
    // Silently ignore (offline, API not ready)
  }
}
