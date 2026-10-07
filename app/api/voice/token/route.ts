import { NextRequest, NextResponse } from "next/server";
import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room") || "aura-room";
    const participantName = searchParams.get("participant_name") || "paciente";

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "Variables de entorno de LiveKit no configuradas en el servidor." },
        { status: 500 }
      );
    }

    // Despachar el agente de voz AURA (edy-voice-agent) a la sala en LiveKit Cloud
    try {
      const httpUrl = livekitUrl.replace(/^wss:\/\//, "https://").replace(/^ws:\/\//, "http://");
      const dispatchClient = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
      await dispatchClient.createDispatch(room, "edy-voice-agent");
    } catch (dispatchErr: any) {
      console.warn("[/api/voice/token] Aviso al crear AgentDispatch (posiblemente ya despachado):", dispatchErr?.message || dispatchErr);
    }

    const identity = `${participantName}-${Math.random().toString(36).substring(2, 8)}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName,
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      url: livekitUrl,
      room,
      identity,
      token,
    });
  } catch (error: any) {
    console.error("[/api/voice/token] Error generando token LiveKit:", error);
    return NextResponse.json(
      { error: error.message || "Error al generar token de voz" },
      { status: 500 }
    );
  }
}
