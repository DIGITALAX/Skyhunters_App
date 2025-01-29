import Providers from "../providers";
import "@rainbow-me/rainbowkit/styles.css";
import "./../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skyhunters",
  robots: {
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={params.lang}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
