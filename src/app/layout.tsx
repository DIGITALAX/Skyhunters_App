import type { Metadata } from "next";
import "./globals.css";
import { LOCALES } from "./lib/constants";
import { Providers } from "./lib/Providers";
import Header from "./components/Common/modules/Header";
import Footer from "./components/Common/modules/Footer";
import { Modals } from "./components/Modals/modules/Modals";

export const metadata: Metadata = {
  metadataBase: new URL("https://skyhunters.agentmeme.xyz/"),
  title: "Skyhunters",
  description: "",
  twitter: {
    card: "summary_large_image",
    creator: "@emmajane1313",
    title: "Skyhunters",
    description: "",
  },
  openGraph: {
    title: "Skyhunters",
    description: "",
  },
  robots: {
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: `https://skyhunters.agentmeme.xyz/`,
    languages: LOCALES.reduce((acc, item) => {
      acc[item] = `https://skyhunters.agentmeme.xyz/${item}/`;
      return acc;
    }, {} as { [key: string]: string }),
  },
  creator: "Emma-Jane MacKinnon-Lee",
  publisher: "Emma-Jane MacKinnon-Lee",
  keywords: [
    "Web3",
    "Web3 Fashion",
    "Moda Web3",
    "Open Source",
    "CC0",
    "Emma-Jane MacKinnon-Lee",
    "Emma-Jane Mac Fhionghuin-Vere",
    "Open Source LLMs",
    "DIGITALAX",
    "F3Manifesto",
    "digitalax",
    "f3manifesto",
    "Women",
    "Life",
    "Freedom",
  ],
  pinterest: {
    richPin: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DIGITALAX",
              url: "https://digitalax.xyz/",
              founder: {
                "@type": "Person",
                "@id": "https://emmajanemackinnonlee.com/#person",
                name: "Emma-Jane MacKinnon-Lee",
                url: "https://emmajanemackinnonlee.com/",
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": "https://emmajanemackinnonlee.com/",
                },
                sameAs: [
                  "https://emmajanemackinnonlee.com/",
                  "https://emmajanemackinnon.com/",
                  "https://emmajane.ai/",
                  "https://janefuture.com/",
                  "https://emmajanemackinnonlee.xyz/",
                  "https://emmajanemackinnonlee.net/",
                  "https://emmajanemackinnonlee.ai/",
                  "https://emmajanemackinnonlee.org/",
                  "https://emmajanemackinnonlee-f3manifesto.com/",
                  "https://emmajanemackinnonlee-digitalax.com/",
                  "https://emmajanemackinnonlee-history.com/",
                  "https://emmajanemackinnonlee-runway.com/",
                  "https://icoinedweb3fashion.com/",
                  "https://syntheticfutures.xyz/",
                  "https://web3fashion.xyz/",
                  "https://emancipa.xyz/",
                  "https://highlangu.com/",
                  "https://digitalax.xyz/",
                  "https://cc0web3fashion.com/",
                  "https://cc0web3.com/",
                  "https://cuntism.net/",
                  "https://dhawu.com/",
                  "https://casadeespejos.com/",
                  "https://emancipa.net/",
                  "https://dhawu.emancipa.xyz/",
                  "https://highlangu.emancipa.xyz/",
                ],
              },
            }),
          }}
        />
      </head>
      <body>
        <Providers>
          <div className="max-w-3xl text-xs mx-auto">
            <Header />
            {children}
            <Footer />
            <Modals />
          </div>
        </Providers>
      </body>
    </html>
  );
}
