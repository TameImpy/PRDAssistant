import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "DATA_WORKSHOP | Request. Structure. Ship.",
  description:
    "Internal tool for submitting data requests and creating structured tickets for the Commercial Analysts team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} light`}
    >
      <body className="bg-background font-body text-on-surface technical-grid min-h-screen">
        <SessionProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
