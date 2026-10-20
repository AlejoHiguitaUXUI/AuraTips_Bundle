import { ImageResponse } from "next/og";

export const alt =
  "AuraTips · Acompañamiento Clínico de Recuperación | Dra. Mariana Gómez · AuraMed";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          background: "linear-gradient(135deg, #0F261C 0%, #183C2C 55%, #20503B 100%)",
          color: "#FAF8F5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(194, 155, 56, 0.2)",
                border: "2px solid #C29B38",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: 800,
                color: "#E6CA85",
              }}
            >
              A
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
                AuraTips
              </span>
              <span
                style={{
                  fontSize: "13px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#E6CA85",
                  fontWeight: 700,
                }}
              >
                By AuraMed Grupo Estético
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "8px 20px",
              borderRadius: "999px",
              background: "rgba(194, 155, 56, 0.16)",
              border: "1px solid rgba(194, 155, 56, 0.45)",
              color: "#F3E3B6",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            Medicina Estética · Medellín, Colombia
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "920px" }}>
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#FAF8F5",
            }}
          >
            Cuidado &amp; Recuperación Post-Procedimiento
          </div>
          <div
            style={{
              fontSize: "26px",
              lineHeight: 1.45,
              color: "rgba(250, 248, 245, 0.85)",
              fontWeight: 400,
            }}
          >
            Protocolos clínicos personalizados, cronogramas de desinflamación y supervisión médica directa por la Dra. Mariana Gómez.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(194, 155, 56, 0.3)",
            fontSize: "18px",
            color: "#E6CA85",
            fontWeight: 600,
          }}
        >
          <span>Dra. Mariana Gómez · Dirección Clínica (RM-482910-ANT)</span>
          <span>Protocolos Clínicos Validados</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
