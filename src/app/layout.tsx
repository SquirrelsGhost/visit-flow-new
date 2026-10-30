import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import ClientApp from "../components/app/ClientApp";
import RequestTimeMarker from "../components/app/RequestTimeMarker";
import "../styles/globals.css";

/** Einzige statische Metadaten: Grundwerte der ganzen App. Jede Seite liefert ihre eigenen über generateMetadata(). */
export const metadata: Metadata = {
  metadataBase: new URL("https://visit-flow.de"),
  applicationName: "Visit Flow",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#dc2626",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Script src="/theme-boot.js" strategy="beforeInteractive" />
        <ClientApp>{children}</ClientApp>
        <RequestTimeMarker />
      </body>
    </html>
  );
}
