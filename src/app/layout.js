import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "BrainScore - Quiz Application",
  description: "Test your knowledge with interactive quizzes",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
  },

};

export const viewport = {
  themeColor: "#5a01ff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
        <meta name="theme-color" content="#5a01ff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>

      <script
  dangerouslySetInnerHTML={{
    __html: `
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("/sw.js");
        });
      }
    `,
  }}
/>


      </body>
    </html>
  );
}
