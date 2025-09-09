import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FuturMaster POC - Intelligent Sales Assistant",
  description: "Interactive sales assistant for FuturMaster demand planning solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Artifika&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen font-sans" style={{backgroundColor: '#F2F2F2'}}>
        {children}
      </body>
    </html>
  );
}
