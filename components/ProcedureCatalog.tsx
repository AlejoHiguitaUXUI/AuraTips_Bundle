"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ClockIcon,
  ActivityIcon,
  SparklesIcon,
  PencilIcon,
  ChevronRightIcon,
} from "@/components/icons";
import {
  ProcedureInfoModal,
  ProcedureModalData,
} from "@/components/ProcedureInfoModal";

export interface ProcedureItem extends ProcedureModalData {
  author_name?: string;
  [key: string]: unknown;
}

interface ProcedureCatalogProps {
  procedures: ProcedureItem[];
  isSpecialist?: boolean;
}

export function ProcedureCatalog({
  procedures,
  isSpecialist = false,
}: ProcedureCatalogProps) {
  const searchParams = useSearchParams();
  const [selectedProcedure, setSelectedProcedure] =
    useState<ProcedureItem | null>(null);

  // Soporte para abrir el modal automáticamente si viene ?proc=slug en la URL
  useEffect(() => {
    const procSlug = searchParams.get("proc") || searchParams.get("selected");
    if (procSlug) {
      const match = procedures.find(
        (p) => p.slug.toLowerCase() === procSlug.toLowerCase()
      );
      if (match) {
        setSelectedProcedure(match);
      }
    }
  }, [searchParams, procedures]);

  const handleOpenModal = (proc: ProcedureItem) => {
    setSelectedProcedure(proc);
  };

  const handleCloseModal = () => {
    setSelectedProcedure(null);
  };

  return (
    <>
      <section
        className="catalog-grid stagger animate-slide-up"
        aria-label="Catálogo informativo de procedimientos médicos de AuraMed"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "var(--space-6, 24px)",
        }}
      >
        {procedures.map((proc) => {
          const painMeter =
            "●".repeat(proc.pain_level) + "○".repeat(5 - proc.pain_level);

          return (
            <article
              key={proc.id}
              className="procedure-card"
              style={{
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onClick={() => handleOpenModal(proc)}
            >
              {/* Contenedor de la Imagen / Portada */}
              <div
                className="procedure-thumb-wrap"
                style={{ position: "relative", height: "200px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={proc.cover_url}
                  alt={proc.title}
                  className="procedure-thumb"
                  loading="lazy"
                />
                <span className="procedure-category-tag">{proc.category}</span>
              </div>

              {/* Cuerpo de la Card */}
              <div
                className="procedure-card-body"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "var(--space-5, 20px)",
                }}
              >
                {/* Título */}
                <h2
                  className="procedure-card-title"
                  style={{
                    fontSize: "var(--text-lg, 1.15rem)",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "var(--color-text)",
                    marginBottom: "8px",
                  }}
                >
                  {proc.title}
                </h2>

                {/* Descripción completa del procedimiento */}
                <p
                  style={{
                    fontSize: "var(--text-sm, 13.5px)",
                    color: "var(--color-muted)",
                    lineHeight: 1.55,
                    marginBottom: "var(--space-4, 16px)",
                    // Permitir lectura clara y completa de la descripción
                    wordBreak: "break-word",
                  }}
                >
                  {proc.description}
                </p>

                {/* Métricas Clínicas: Recuperación y Molestia */}
                <div
                  className="procedure-metrics"
                  style={{
                    marginTop: "auto",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    padding: "10px 0",
                    borderTop: "1px solid var(--color-border)",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "12px",
                  }}
                >
                  <div className="metric-item">
                    <span
                      className="metric-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--color-muted-2, #64748b)",
                      }}
                    >
                      <ClockIcon size={13} color="var(--color-brand)" /> Recuperación estimada
                    </span>
                    <span className="metric-value" style={{ fontWeight: 600 }}>
                      {proc.recovery_time}
                    </span>
                  </div>

                  <div className="metric-item">
                    <span
                      className="metric-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--color-muted-2, #64748b)",
                      }}
                    >
                      <ActivityIcon size={13} color="var(--color-brand)" /> Molestia esperada
                    </span>
                    <span
                      className="metric-value"
                      title={`Nivel ${proc.pain_level} de 5`}
                      style={{ color: "var(--color-brand)", fontWeight: 600 }}
                    >
                      {painMeter}{" "}
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--color-muted)",
                          fontWeight: 400,
                        }}
                      >
                        ({proc.pain_level}/5)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Footer de la Card: Botón Conocer Más (sin Ver Protocolo ni Dra. Mariana Gómez) */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "var(--space-3, 12px)",
                    paddingTop: "var(--space-2, 8px)",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(proc);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      color: "var(--color-brand)",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <SparklesIcon size={14} color="#C29B38" />
                    <span>Conocer más del procedimiento</span>
                    <ChevronRightIcon size={14} />
                  </button>

                  {/* Acceso para Especialista en Dirección Clínica si aplica */}
                  {isSpecialist && (
                    <Link
                      href={`/dashboard/teaching/${proc.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(194, 155, 56, 0.15)",
                        color: "var(--color-gold-text, #997316)",
                        border: "1px solid rgba(194, 155, 56, 0.35)",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                      title={`Editar protocolo clínico de ${proc.title}`}
                    >
                      <PencilIcon size={12} />
                      <span>Editar</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Modal Pop-up Informativo */}
      <ProcedureInfoModal
        procedure={selectedProcedure}
        isOpen={!!selectedProcedure}
        onClose={handleCloseModal}
      />
    </>
  );
}
