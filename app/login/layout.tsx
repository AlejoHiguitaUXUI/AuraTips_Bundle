import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión · Portal de Pacientes",
  description:
    "Ingresa con tus credenciales entregadas en consulta por AuraMed para acceder a tu protocolo diario de recuperación y seguimiento médico en AuraTips.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
