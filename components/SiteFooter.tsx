import Link from "next/link";
import { LeafIcon, StethoscopeIcon, ShieldCheckIcon, MessageCircleIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        paddingTop: "var(--space-12)",
        paddingBottom: "var(--space-8)",
        marginTop: "var(--space-12)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-8)",
            marginBottom: "var(--space-10)",
          }}
        >
          {/* Columna 1: Marca y Propósito */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-3)" }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "linear-gradient(135deg, #183C2C, #20503B)",
                  color: "#FAF8F5",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(194, 155, 56, 0.4)",
                  boxShadow: "0 2px 8px rgba(32, 80, 59, 0.15)",
                }}
              >
                <LeafIcon size={16} />
              </span>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text)", fontSize: "1.05rem" }}>
                  AuraTips
                </span>
                <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-brand)", fontWeight: 600 }}>
                  Acompañamiento Clínico
                </span>
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
              Acompañamiento médico integral y protocolos de recuperación estética guiados con calidez y rigor por la <strong>Dra. Mariana Gómez</strong>.
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: "var(--color-brand-soft)",
                color: "var(--color-brand)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <ShieldCheckIcon size={14} />
              <span>Protocolos Clínicos Validados</span>
            </div>
          </div>

          {/* Columna 2: Procedimientos Clave */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
                marginBottom: "var(--space-3)",
              }}
            >
              Protocolos de Recuperación
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <li>
                <Link href="/courses/toxina-botulinica-botox-facial" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Toxina Botulínica Facial
                </Link>
              </li>
              <li>
                <Link href="/courses/acido-hialuronico-labios-russian-lips" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Ácido Hialurónico en Labios
                </Link>
              </li>
              <li>
                <Link href="/courses/rinomodelacion-sin-cirugia-acido-hialuronico" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Rinomodelación sin Cirugía
                </Link>
              </li>
              <li>
                <Link href="/courses/peeling-quimico-medico-facial" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Peeling Químico Médico
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Centro del Paciente */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
                marginBottom: "var(--space-3)",
              }}
            >
              Centro del Paciente
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <li>
                <Link href="/dashboard/learning" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Mis Cuidados Activos
                </Link>
              </li>
              <li>
                <Link href="/dashboard/teaching" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Dirección Médica & Especialista
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Perfil y Ficha de Paciente
                </Link>
              </li>
              <li>
                <Link href="/login" style={{ color: "var(--color-muted)", textDecoration: "none" }}>
                  Portal de Acceso
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Acompañamiento Médico */}
          <div>
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-brand)",
                marginBottom: "var(--space-3)",
              }}
            >
              Atención y Soporte
            </h4>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px" }}>
              <StethoscopeIcon size={16} color="var(--color-brand)" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div style={{ fontSize: "13px", lineHeight: 1.4 }}>
                <strong style={{ color: "var(--color-text)" }}>Dra. Mariana Gómez</strong>
                <p style={{ margin: "2px 0 0", color: "var(--color-muted)", fontSize: "12px" }}>
                  Medicina Estética & Cuidado Post-Procedimiento
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/573001234567?text=Hola%20Dra.%20Mariana%20G%C3%B3mez,%20tengo%20una%20consulta%20sobre%20mi%20recuperaci%C3%B3n%20en%20AuraTips"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-brand)",
                background: "var(--color-brand-soft)",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
              }}
            >
              <MessageCircleIcon size={14} />
              <span>WhatsApp de Soporte Clínico</span>
            </a>
          </div>
        </div>

        {/* Disclaimer Médico y Copyright */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontSize: "12px",
            color: "var(--color-muted)",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Aviso de Responsabilidad Médica:</strong> Las indicaciones, cronogramas y listas de verificación proporcionadas en AuraTips corresponden a protocolos de post-cuidado estético y no reemplazan la valoración presencial, diagnóstico ni tratamiento de urgencias médicas. Ante cualquier signo de alarma severo, comunícate de inmediato con tu centro clínico de atención.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span>&copy; 2026 AuraTips · Dra. Mariana Gómez. Todos los derechos reservados.</span>
            <span style={{ fontSize: "12px", color: "var(--color-muted-2)" }}>
              Diseño Clínico Accesible · Estándar WCAG 2.1 AA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
