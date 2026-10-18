import crypto from "crypto";

export type AuraTipsWebhookEvent =
  | "patient.protocol_completed"
  | "patient.emergency_alert_triggered";

export interface ProtocolCompletedWebhookPayload {
  event: "patient.protocol_completed";
  timestamp: string;
  patient: {
    id: string;
    external_id?: string | null;
    full_name: string;
    email: string;
    phone?: string | null;
  };
  procedure: {
    course_id: string;
    slug: string;
    title: string;
    category?: string;
    enrolled_at: string;
    completed_at: string;
    duration_days: number;
  };
  closure_reason: "expired_automatically" | "closed_by_specialist";
  next_action_hint: "ready_for_followup_or_repurchase";
}

export interface EmergencyAlertWebhookPayload {
  event: "patient.emergency_alert_triggered";
  timestamp: string;
  patient?: {
    external_id?: string | null;
    full_name?: string;
    phone?: string | null;
  };
  procedure_slug: string;
  recovery_day: number;
  urgency_level: string;
  matched_categories: string[];
  user_message: string;
  automated_actions_taken: string[];
}

export type WebhookPayload =
  | ProtocolCompletedWebhookPayload
  | EmergencyAlertWebhookPayload;

/**
 * Calcula la firma HMAC-SHA256 del cuerpo JSON para el header X-Auratips-Signature.
 */
export function signWebhookPayload(bodyJson: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret).update(bodyJson).digest("hex");
  return `sha256=${hmac}`;
}

/**
 * Valida el token Bearer M2M enviado por el Sistema Madre de AuraMed / AuraLead.
 */
export function verifyServiceToken(authHeader?: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  const expectedSecret =
    process.env.AURATIPS_SERVICE_SECRET || "auramed-default-service-secret";
  return Boolean(token && token === expectedSecret);
}

/**
 * Emite un webhook firmado desde AuraTips hacia el Sistema Madre de AuraMed.
 * Si AURATIPS_WEBHOOK_URL no está configurada, registra el evento de forma segura sin fallar.
 */
export async function emitAuraMedWebhook(
  payload: WebhookPayload
): Promise<{ delivered: boolean; status?: number; signature: string }> {
  const webhookUrl = process.env.AURATIPS_WEBHOOK_URL;
  const secret =
    process.env.AURATIPS_SERVICE_SECRET || "auramed-default-service-secret";
  const bodyJson = JSON.stringify(payload);
  const signature = signWebhookPayload(bodyJson, secret);

  if (!webhookUrl) {
    console.info(
      `[AuraTips -> AuraMed Webhook] (${payload.event}) listo para despacho:`,
      bodyJson
    );
    return { delivered: false, signature };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auratips-Signature": signature,
        "X-Auratips-Event": payload.event,
      },
      body: bodyJson,
    });

    return {
      delivered: res.ok,
      status: res.status,
      signature,
    };
  } catch (err) {
    console.warn(
      `[AuraTips -> AuraMed Webhook] Error al enviar ${payload.event} a ${webhookUrl}:`,
      err
    );
    return { delivered: false, signature };
  }
}
