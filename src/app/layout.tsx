import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { SITE_CONTENT } from "@/config/siteContent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: SITE_CONTENT.metadata.titleDefault,
    template: SITE_CONTENT.metadata.titleTemplate,
  },
  description: SITE_CONTENT.metadata.description,
  keywords: [...SITE_CONTENT.metadata.keywords],
  openGraph: {
    ...SITE_CONTENT.metadata.openGraph,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900" suppressHydrationWarning>
        <AuthProvider>
          <Toaster position="bottom-right" />
          <Header />
          <main className="grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
