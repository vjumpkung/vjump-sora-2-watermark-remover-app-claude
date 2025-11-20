import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sora 2 Watermark Remover",
  description: "Remove watermarks from your Sora AI videos instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
