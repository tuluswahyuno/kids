import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

const display = Baloo_2({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const APP_NAME = "Main Pintar";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Game Belajar untuk Anak TK`, template: `%s · ${APP_NAME}` },
  description:
    "Game belajar membaca, berhitung, dan mengingat untuk anak usia 4–7 tahun. Tanpa iklan, aman untuk anak.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff7e6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={display.variable}>
      <body>
        {children}
        <AppChrome />
      </body>
    </html>
  );
}
