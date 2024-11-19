import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import {
  availableLocaleCodes,
  availableLocalesMap,
  defaultLocale,
} from "@/next.locales.mjs";
import { getLocale, unstable_setRequestLocale } from "next-intl/server";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import NavBar from "@/components/navigation/NavBar";
import { ReactNode } from "react";
import ToasterContext from "@/lib/providers/ToasterContext";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return availableLocaleCodes.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Trippy",
  description: "Plan your next getaway",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocale();

  const { langDir, hrefLang } = availableLocalesMap[locale] || defaultLocale;

 
  // Enable static rendering
  unstable_setRequestLocale(locale);
  
  return (
    <html
      lang={hrefLang}
      dir={langDir}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className={inter.className}>
        <ToasterContext />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
