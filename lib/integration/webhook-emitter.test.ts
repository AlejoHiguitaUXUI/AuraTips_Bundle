import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  signWebhookPayload,
  verifyServiceToken,
  emitAuraMedWebhook,
} from "./webhook-emitter";

describe("AuraMed Integration Helpers & Webhook Emitter", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("signs webhook payload deterministically with HMAC-SHA256", () => {
    const body = JSON.stringify({ event: "patient.protocol_completed" });
    const sig1 = signWebhookPayload(body, "test-secret");
    const sig2 = signWebhookPayload(body, "test-secret");

    expect(sig1).toMatch(/^sha256=[a-f0-9]{64}$/);
    expect(sig1).toBe(sig2);
  });

  it("verifies valid Bearer service token and rejects invalid ones", () => {
    process.env.AURATIPS_SERVICE_SECRET = "super-secret-auramed";

    expect(verifyServiceToken("Bearer super-secret-auramed")).toBe(true);
    expect(verifyServiceToken("Bearer wrong-token")).toBe(false);
    expect(verifyServiceToken("Basic super-secret-auramed")).toBe(false);
    expect(verifyServiceToken(null)).toBe(false);
  });

  it("safely logs and returns delivered=false when AURATIPS_WEBHOOK_URL is not configured", async () => {
    delete process.env.AURATIPS_WEBHOOK_URL;
    const result = await emitAuraMedWebhook({
      event: "patient.emergency_alert_triggered",
      timestamp: new Date().toISOString(),
      procedure_slug: "relleno-acido-hialuronico-labios",
      recovery_day: 1,
      urgency_level: "vascular_compromise",
      matched_categories: ["vascular_compromise"],
      user_message: "Tengo el labio blanco y frío con dolor intenso",
      automated_actions_taken: ["Canal WhatsApp presentado"],
    });

    expect(result.delivered).toBe(false);
    expect(result.signature).toMatch(/^sha256=/);
  });

  it("dispatches signed POST request when AURATIPS_WEBHOOK_URL is configured", async () => {
    process.env.AURATIPS_WEBHOOK_URL = "https://auramed.example.com/webhooks/auratips";
    process.env.AURATIPS_SERVICE_SECRET = "auramed-secret-2026";

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    const result = await emitAuraMedWebhook({
      event: "patient.protocol_completed",
      timestamp: "2026-10-17T12:00:00Z",
      patient: {
        id: "user-123",
        external_id: "auramed-pac-001",
        full_name: "Ana Gómez",
        email: "ana@ejemplo.com",
      },
      procedure: {
        course_id: "course-123",
        slug: "toxina-botulinica-botox-facial",
        title: "Toxina Botulínica (Botox Facial)",
        enrolled_at: "2026-10-03T12:00:00Z",
        completed_at: "2026-10-17T12:00:00Z",
        duration_days: 14,
      },
      closure_reason: "expired_automatically",
      next_action_hint: "ready_for_followup_or_repurchase",
    });

    expect(result.delivered).toBe(true);
    expect(result.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = fetchSpy.mock.calls[0];
    expect(calledUrl).toBe("https://auramed.example.com/webhooks/auratips");
    expect((calledInit?.headers as Record<string, string>)["X-Auratips-Event"]).toBe(
      "patient.protocol_completed"
    );
    expect(
      (calledInit?.headers as Record<string, string>)["X-Auratips-Signature"]
    ).toBe(result.signature);
  });
});
