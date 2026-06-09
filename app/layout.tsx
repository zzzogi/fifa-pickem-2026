// app/layout.tsx
import type { Metadata } from "next";
import { Anton, Archivo_Narrow } from "next/font/google";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FIFA Pick'em 2026",
  description: "Predict World Cup scores and compete on the leaderboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${archivoNarrow.variable}`}>
        {children}
      </body>
    </html>
  );
}
