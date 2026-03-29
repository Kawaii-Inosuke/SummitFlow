import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SummitFlow",
  description: "University Event Management PWA",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/SummitFlow Logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#EC5B13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
