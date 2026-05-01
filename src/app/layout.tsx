import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
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
  // O objeto title permite configurar um padrão para o site todo
  title: {
    default: "Corretor de Imóveis | Adherbal | Imóveis | Casas para alugar",
    template: "%s | Adherbal", 
  },
  description: "Encontre as melhores casas à venda, terrenos e oportunidades de aluguel em Jambeiro e região com um corretor credenciado e especializado.",
  keywords: ["imobiliária em Jambeiro", "corretor de imóveis", "casas à venda em Jambeiro", "comprar terreno", "aluguel em Jambeiro"],
  
  // O OpenGraph é crucial para corretagem: ele define a imagem e texto 
  // que aparecem quando você envia o link do site no WhatsApp
  openGraph: {
    title: "Corretor de Imóveis em Jambeiro | Adherbal",
    description: "Confira nossas opções de imóveis à venda e locação em Jambeiro.",
    url: "https://www.adherbalimoveis.com.br",
    siteName: "Adherbal Imóveis",
    locale: "pt_BR",
    type: "website",
  },
  
  // Informações para os robôs do Google
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
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
