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
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'brand-sandy': '#f79d5c',
                    'brand-pumpkin': '#f3752b', 
                    'brand-ghost': '#ededf4',
                    'brand-text': '#393E41'
                  },
                  animation: {
                    'progress': 'progress 10s ease-in-out',
                    'typewriter': 'typewriter 3s steps(40, end)',
                    'fade-in': 'fadeIn 1.5s ease-in-out',
                    'ticker': 'ticker 15s linear infinite',
                    'black-to-white': 'blackToWhite 2s ease-in-out forwards'
                  },
                  keyframes: {
                    progress: {
                      '0%': { width: '0%' },
                      '100%': { width: '100%' }
                    },
                    typewriter: {
                      '0%': { width: '0' },
                      '100%': { width: '100%' }
                    },
                    fadeIn: {
                      '0%': { opacity: '0', transform: 'translateY(20px)' },
                      '100%': { opacity: '1', transform: 'translateY(0)' }
                    },
                    ticker: {
                      '0%': { transform: 'translateX(100%)' },
                      '100%': { transform: 'translateX(-100%)' }
                    },
                    blackToWhite: {
                      '0%': { backgroundColor: '#000000' },
                      '100%': { backgroundColor: '#F2F2F2' }
                    }
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className="min-h-screen font-sans" style={{backgroundColor: '#F2F2F2'}}>
        {children}
      </body>
    </html>
  );
}
