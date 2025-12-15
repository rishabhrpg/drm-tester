import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./App.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DASH Player with DRM",
  description: "DASH Player with DRM support built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://vjs.zencdn.net/7.21.1/video-js.css" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Load scripts in order */}
        <Script 
          src="https://vjs.zencdn.net/7.21.1/video.min.js" 
          strategy="beforeInteractive"
        />
        <Script 
          src="https://cdn.dashjs.org/v4.7.0/dash.all.min.js" 
          strategy="beforeInteractive" 
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/videojs-contrib-dash@5.1.1/dist/videojs-dash.min.js" 
          strategy="beforeInteractive" 
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/videojs-contrib-eme@3.11.0/dist/videojs-contrib-eme.min.js" 
          strategy="beforeInteractive" 
        />
        <div className="fixed bottom-2 right-2 text-xs text-green-400 pointer-events-none z-50 font-mono">
          v0.0.3
        </div>
      </body>
    </html>
  );
}
