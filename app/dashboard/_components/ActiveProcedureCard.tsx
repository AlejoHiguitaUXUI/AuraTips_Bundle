import Link from "next/link";

export interface ActiveProcedure {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  category?: string;
  recovery_time?: string;
  pain_level?: number;
  anesthesia_type?: string;
  enrolled_at: string;
  doctor_name?: string;
  doctor_specialty?: string;
}

interface ActiveProcedureCardProps {
  procedure: ActiveProcedure | null;
}

export function ActiveProcedureCard({ procedure }: ActiveProcedureCardProps) {
  if (!procedure) {
    return (
      <div
        className="bento-card bento-active-procedure"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "var(--space-8)",
          background: "var(--color-surface)",
          border: "1px dashed var(--color-border-hover)",
        }}
      >
        <span style={{ fontSize: 44, marginBottom: "var(--space-3)" }} role="img" aria-label="Sin procedimientos">
          🌿
        </span>
        <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
          No tienes procedimientos activos
        </h3>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "var(--text-sm)",
            maxWidth: 420,
            marginBottom: "var(--space-5)",
            lineHeight: 1.5,
          }}
        >
          Explora los protocolos de medicina estética y activa el seguimiento clínico de tus cuidados post-tratamiento.
        </p>
        <Link href="/" className="btn">
          Explorar Procedimientos →
        </Link>
      </div>
    );
  }

  // Calculate days elapsed
  const enrolledDate = new Date(procedure.enrolled_at);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - enrolledDate.getTime());
  const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentDay = Math.max(1, elapsedDays + 1);

  // Golden clinical recovery window: 14 days standard
  const totalDays = 14;
  const progressPercent = Math.min(100, Math.max(8, Math.round((currentDay / totalDays) * 100)));

  // Determine stage information
  let stageTitle = "Fase 1: Inmediata (0 - 24h)";
  let stageDescription = "Reposo guiado, postura erguida y crioterapia indirecta.";
  if (currentDay >= 2 && currentDay <= 3) {
    stageTitle = "Fase 2: Desinflamación Activa (Días 2 - 3)";
    stageDescription = "Manejo de edema y prevención de hematomas o desplazamiento.";
  } else if (currentDay >= 4 && currentDay <= 7) {
    stageTitle = "Fase 3: Asentamiento y Regeneración (Días 4 - 7)";
    stageDescription = "Integración tisular del producto y reanudación gradual de rutina.";
  } else if (currentDay >= 8 && currentDay <= 14) {
    stageTitle = "Fase 4: Consolidación y Control (Días 8 - 14)";
    stageDescription = "Estabilización final. Preparación para cita de revisión médica.";
  } else if (currentDay > 14) {
    stageTitle = "Fase 5: Mantenimiento Preventivo (Post Día 14)";
    stageDescription = "Protocolo de fotoprotección y cuidado dérmico continuo.";
  }

  return (
    <div
      className="bento-card bento-active-procedure"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "var(--space-5)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background soft glow */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-10%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(32, 80, 59, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header bar: Status badge & Category */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-full)",
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              background: "rgba(32, 80, 59, 0.12)",
              color: "var(--color-brand)",
              border: "1px solid rgba(32, 80, 59, 0.25)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--color-brand)",
                boxShadow: "0 0 0 2px rgba(32, 80, 59, 0.3)",
              }}
            />
            Recuperación Activa
          </span>

          {procedure.category && (
            <span className="badge badge-brand" style={{ fontWeight: 600 }}>
              {procedure.category}
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-muted)",
            fontWeight: 500,
          }}
        >
          Inicio: {enrolledDate.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Main content: Thumbnail + Details */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-5)",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {procedure.cover_url && (
          <div
            style={{
              width: 130,
              height: 110,
              flexShrink: 0,
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={procedure.cover_url}
              alt={procedure.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, transparent 40%, rgba(12, 18, 15, 0.5) 100%)",
              }}
            />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 220 }}>
          <h2
            style={{
              fontSize: "var(--text-xl)",
              fontWeight: 800,
              lineHeight: 1.25,
              color: "var(--color-text)",
              marginBottom: "var(--space-1)",
              letterSpacing: "-0.01em",
            }}
          >
            {procedure.title}
          </h2>

          {procedure.doctor_name && (
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-muted)",
                marginBottom: "var(--space-3)",
              }}
            >
              Tratamiento realizado por{" "}
              <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>
                {procedure.doctor_name}
              </strong>
            </p>
          )}

          {/* Key tags */}
          <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            {procedure.recovery_time && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                ⏱️ Recuperación: {procedure.recovery_time}
              </span>
            )}
            {procedure.anesthesia_type && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                🧊 {procedure.anesthesia_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Recovery Timeline & Day Counter Banner */}
      <div
        style={{
          background: "var(--color-surface-2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-4)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "var(--space-2)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-brand)",
                fontWeight: 700,
              }}
            >
              {stageTitle}
            </span>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-muted)",
                marginTop: "2px",
              }}
            >
              {stageDescription}
            </p>
          </div>

          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span
              style={{
                fontSize: "var(--text-2xl)",
                fontWeight: 800,
                color: "var(--color-brand)",
                lineHeight: 1,
              }}
            >
              Día {currentDay}
            </span>
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-muted)",
                marginLeft: "4px",
              }}
            >
              de {totalDays}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "var(--color-border)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #20503B 0%, #C29B38 100%)",
              borderRadius: 4,
              transition: "width 0.6s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--color-muted)",
            marginTop: "6px",
          }}
        >
          <span>Día 0: Aplicación</span>
          <span>{progressPercent}% del ciclo de cuidados</span>
          <span>Día 14: Control Clínico</span>
        </div>
      </div>

      {/* Card actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          paddingTop: "var(--space-1)",
        }}
      >
        <Link
          href={`/courses/${procedure.slug}`}
          className="btn"
          style={{
            padding: "8px 18px",
            fontSize: "var(--text-sm)",
          }}
        >
          Ver Protocolo Completo →
        </Link>

        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-muted)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          🔒 Protocolo médico verificado
        </span>
      </div>
    </div>
  );
}
