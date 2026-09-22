import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

// The header reads the auth session per request; skip static prerendering.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "AuraTips · Acompañamiento Clínico de Recuperación | Dra. Mariana Gómez",
    template: "%s · AuraTips",
  },
  description:
    "Acompañamiento clínico integral y protocolos de recuperación post-procedimiento estético por la Dra. Mariana Gómez. Cuidado médico experto, cálido y personalizado.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "AuraTips · Acompañamiento Clínico de Recuperación",
    title: "AuraTips · Acompañamiento Clínico de Recuperación | Dra. Mariana Gómez",
    description:
      "Protocolos guiados de recuperación post-tratamiento estético, tiempos de desinflamación y pautas médicas supervisadas por la Dra. Mariana Gómez.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline theme script: prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <SiteHeader />
        <main className="container" style={{ paddingBlock: "var(--space-8)" }}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
