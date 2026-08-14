import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "でんしゃ・えき たんけんたい",
  description:
    "しんかんせん・JR西日本・近江鉄道の でんしゃと えきを たんけんできる、こども向けの鉄道アプリ。",
  applicationName: "でんしゃ・えき たんけんたい",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "でんしゃたんけんたい",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0b57d0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
