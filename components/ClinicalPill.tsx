"use client";

import React from "react";
import Link from "next/link";

export interface ClinicalPillProps {
  icon?: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: string;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function ClinicalPill({
  icon,
  label,
  subtitle,
  badge,
  isActive = false,
  href,
  onClick,
  className = "",
  style,
}: ClinicalPillProps) {
  const content = (
    <>
      {icon && (
        <span className="clinical-pill-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="clinical-pill-text">
        <span className="clinical-pill-label">{label}</span>
        {subtitle && <span className="clinical-pill-sub">{subtitle}</span>}
      </div>
      {badge && <span className="clinical-pill-badge">{badge}</span>}
    </>
  );

  const combinedClass = `clinical-pill ${isActive ? "active" : ""} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClass} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={combinedClass} style={style}>
      {content}
    </button>
  );
}
