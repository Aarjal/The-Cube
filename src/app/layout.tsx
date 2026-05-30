import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "THE CUBE — Premium Rubik's Cube Experience",
  description:
    "A cinematic scrollytelling experience showcasing authentic Rubik's Cube mechanics with luxury-tech motion design.",
  keywords: ["Rubik's Cube", "speedcubing", "cinematic", "premium", "3D"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${inter.variable} font-sans`}
        style={{ backgroundColor: "#050505", color: "#ffffff" }}
      >
        {children}
      </body>
    </html>
  );
}
