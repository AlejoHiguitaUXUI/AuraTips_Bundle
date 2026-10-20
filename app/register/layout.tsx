import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta Clínica · Portal de Pacientes",
  description:
    "Registro clínico de pacientes para acceder a protocolos de recuperación post-procedimiento estético en AuraTips.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
