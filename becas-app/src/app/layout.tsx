import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/features/scholarships/DashboardLayout"; // <--- Importamos el nuevo cerebro

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Becas Tech",
  description: "Plataforma de gestión de becas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        {/* El DashboardLayout maneja el Sidebar y el Main */}
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}