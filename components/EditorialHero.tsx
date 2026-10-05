"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheckIcon } from "@/components/icons";

interface Procedure {
  id: string;
  name: string;
  category: string;
  image: string;
  alt: string;
}

const PROCEDURES: Procedure[] = [
  {
    id: "facial-clinico",
    name: "Cuidado Facial",
    category: "Protocolo Clínico",
    image: "/images/plasma-facial.jpg",
    alt: "Acompañamiento médico y cuidado facial clínico en AuraMed",
  },
  {
    id: "hidrolipoclasia",
    name: "Hidrolipoclasia",
    category: "Modelado Ultrasónico",
    image: "/images/hidrolipoclasia.jpg",
    alt: "Hidrolipoclasia ultrasónica y protocolo de cuidados corporales",
  },
  {
    id: "sueroterapia",
    name: "Sueroterapia",
    category: "Medicina Regenerativa",
    image: "/images/sueroterapia.jpg",
    alt: "Sueroterapia y revitalización celular médica en AuraMed",
  },
  {
    id: "drenaje",
    name: "Drenaje Linfático",
    category: "Post-Quirúrgico",
    image: "/images/drenaje-linfatico.jpg",
    alt: "Drenaje linfático y pautas de desinflamación post-operatoria en AuraMed",
  },
  {
    id: "bioestimulacion",
    name: "Bioestimulación",
    category: "Inducción Colágena",
    image: "/images/bioestimulacion.jpg",
    alt: "Bioestimulación de colágeno y reactivación tisular en AuraMed",
  },
  {
    id: "botox",
    name: "Toxina Botulínica",
    category: "Armonización Facial",
    image: "/images/botox.jpg",
    alt: "Aplicación de Toxina Botulínica y cuidados preventivos",
  },
  {
    id: "lips",
    name: "Aumento de Labios",
    category: "Ácido Hialurónico",
    image: "/images/lips.jpg",
    alt: "Aumento e hidratación de labios",
  },
  {
    id: "rhino",
    name: "Rinomodelación",
    category: "Armonización Facial",
    image: "/images/rhino.jpg",
    alt: "Rinomodelación sin cirugía",
  },
  {
    id: "peeling",
    name: "Peeling Químico",
    category: "Renovación Celular",
    image: "/images/peeling.jpg",
    alt: "Peeling químico clínico",
  },
  {
    id: "dermapen",
    name: "Microneedling",
    category: "Terapia Microagujas",
    image: "/images/dermapen.jpg",
    alt: "Terapia con Dermapen y reactivación epidérmica",
  },
  {
    id: "carboxiterapia",
    name: "Carboxiterapia",
    category: "Oxigenación Tisular",
    image: "/images/carboxiterapia.jpg",
    alt: "Carboxiterapia corporal y facial",
  },
  {
    id: "radiofrecuencia",
    name: "Radiofrecuencia",
    category: "Tensado Cutáneo",
    image: "/images/radiofrecuencia-facial.jpg",
    alt: "Radiofrecuencia facial y corporal",
  },
];

export function EditorialHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Reference for detecting wrap-arounds to kill the flying animation
  const prevActiveIndexRef = React.useRef(activeIndex);
  useEffect(() => {
    prevActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  const len = PROCEDURES.length;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % len);
  }, [len]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + len) % len);
  }, [len]);

  // Rotación automática cada 3.8s, pausada al pasar el cursor o interactuar
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(handleNext, 3800);
    return () => clearInterval(interval);
  }, [isPaused, handleNext]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section className="editorial-hero" aria-labelledby="hero-title">
      {/* Luz ambiental sutil */}
      <div className="editorial-hero-glow" aria-hidden="true" />

      <div className="editorial-hero-content">
        {/* Titular Editorial de Alta Gama (Con espaciado generoso superior sin el chip) */}
        <h1 id="hero-title" className="editorial-hero-title">
          <span>Cuidado</span>
          <span className="editorial-hero-amp" aria-hidden="true">&</span>
          <span>Recuperación</span>
        </h1>

        {/* Subencabezados Balanceados */}
        <div className="editorial-hero-subheaders">
          <span>Seguimiento Clínico Personalizado</span>
          <span className="editorial-sub-dot" aria-hidden="true">•</span>
          <span>Supervisión Médica Especializada</span>
        </div>

        {/* Texto Contextual */}
        <p className="editorial-hero-lead">
          Portal clínico exclusivo de acompañamiento paso a paso, cronogramas de desinflamación y pautas de seguridad médica supervisadas por la Dra. Mariana Gómez.
        </p>

        {/* Carrusel de 5 Arcos Orgánicos con Profundidad y Nitidez Dinámica */}
        <div
          className="editorial-carousel-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="region"
          aria-label="Carrusel interactivo de procedimientos y tratamientos de AuraMed"
        >
          <div className="editorial-arches-gallery">
            {PROCEDURES.map((proc, index) => {
              let offset = index - activeIndex;
              // Circular offset normalization for infinite loop feel
              if (offset > Math.floor(len / 2)) offset -= len;
              if (offset < -Math.floor(len / 2)) offset += len;

              let prevOffset = index - prevActiveIndexRef.current;
              if (prevOffset > Math.floor(len / 2)) prevOffset -= len;
              if (prevOffset < -Math.floor(len / 2)) prevOffset += len;

              let slotStatus = "hidden";
              if (offset === 0) slotStatus = "center";
              else if (offset === -1) slotStatus = "near-left";
              else if (offset === 1) slotStatus = "near-right";
              else if (offset === -2) slotStatus = "far-left";
              else if (offset === 2) slotStatus = "far-right";
              else if (offset < -2) slotStatus = "hidden-left";
              else if (offset > 2) slotStatus = "hidden-right";

              let prevSlotStatus = "hidden";
              if (prevOffset === 0) prevSlotStatus = "center";
              else if (prevOffset === -1) prevSlotStatus = "near-left";
              else if (prevOffset === 1) prevSlotStatus = "near-right";
              else if (prevOffset === -2) prevSlotStatus = "far-left";
              else if (prevOffset === 2) prevSlotStatus = "far-right";
              else if (prevOffset < -2) prevSlotStatus = "hidden-left";
              else if (prevOffset > 2) prevSlotStatus = "hidden-right";

              const isWrapping = slotStatus.startsWith("hidden-") && prevSlotStatus.startsWith("hidden-") && slotStatus !== prevSlotStatus;

              const isCenter = offset === 0;

              return (
                <button
                  key={proc.id}
                  type="button"
                  style={isWrapping ? { transition: "none" } : undefined}
                  onClick={() => setActiveIndex(index)}
                  className={`editorial-arch ${isCenter ? "active" : ""}`}
                  data-status={slotStatus}
                  aria-label={`Ver procedimiento ${proc.name} (${proc.category})`}
                  title={isCenter ? `Procedimiento activo: ${proc.name}` : `Centrar ${proc.name}`}
                >
                  <div className="editorial-arch-img-wrap">
                    <Image
                      src={proc.image}
                      alt={proc.alt}
                      fill
                      sizes="(max-width: 768px) 360px, (max-width: 1200px) 480px, 600px"
                      quality={100}
                      className="editorial-arch-img"
                      // Solo 12 fotos: se cargan todas de inmediato para que ninguna
                      // tarjeta entre al carrusel vacía. La prioridad es estática
                      // (slides visibles al cargar) para no re-renderizar atributos en cada giro.
                      priority={index <= 2 || index >= len - 2}
                      loading={index <= 2 || index >= len - 2 ? undefined : "eager"}
                    />
                    <div className="editorial-arch-overlay" aria-hidden="true" />
                  </div>

                  <div className="editorial-arch-badge">
                    <span className="editorial-arch-badge-name">{proc.name}</span>
                    <span className="editorial-arch-badge-tag">{proc.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Indicador de posición del carrusel */}
          <div className="editorial-carousel-indicators" aria-hidden="true">
            {PROCEDURES.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`editorial-scroll-dot ${idx === activeIndex ? "active" : ""}`}
                aria-label={`Ir al procedimiento ${p.name}`}
              />
            ))}
          </div>
        </div>

        {/* Llamado a la Acción (CTA Focal Único - Opción B con Vectores de Navegación) */}
        <div className="editorial-cta-section">
          <div className="editorial-cta-row">
            {/* Vector interactivo izquierdo para avanzar al procedimiento previo */}
            <button
              type="button"
              onClick={handlePrev}
              className="editorial-vector-btn left"
              aria-label="Procedimiento anterior"
              title="Procedimiento anterior"
            >
              <svg width="74" height="12" viewBox="0 0 74 12" fill="none">
                <path
                  d="M9 1.5L2 6L9 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="2"
                  y1="6"
                  x2="64"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <circle cx="68" cy="6" r="3" fill="currentColor" />
              </svg>
            </button>

            {/* Botón en cápsula moderna con enfoque exclusivo en el portal de cuidados */}
            <Link
              href="/login"
              className="editorial-capsule-btn"
              id="hero-portal-cuidados-btn"
              aria-label="Acceder a mi Portal de Cuidados para pacientes de AuraMed"
            >
              <span className="editorial-btn-main">
                <span className="editorial-btn-icon" aria-hidden="true">
                  <ShieldCheckIcon size={16} />
                </span>
                <span className="editorial-btn-title">Acceder a mi Portal de Cuidados</span>
              </span>
              <span className="editorial-btn-badge">Pacientes AuraMed</span>
            </Link>

            {/* Vector interactivo derecho para avanzar al siguiente procedimiento */}
            <button
              type="button"
              onClick={handleNext}
              className="editorial-vector-btn right"
              aria-label="Siguiente procedimiento"
              title="Siguiente procedimiento"
            >
              <svg width="74" height="12" viewBox="0 0 74 12" fill="none">
                <circle cx="6" cy="6" r="3" fill="currentColor" />
                <line
                  x1="10"
                  y1="6"
                  x2="72"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M65 1.5L72 6L65 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <p className="editorial-cta-hint">
            Ingresa con el correo electrónico registrado en tu consulta para consultar tu plan diario de desinflamación y pautas de recuperación activas.
          </p>
        </div>
      </div>
    </section>
  );
}
