import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NOMBRE_COTO } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Reglamento Interno · ${NOMBRE_COTO}`,
  description: `Consulta el Reglamento Interno del ${NOMBRE_COTO} y confirma tu lectura.`,
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
