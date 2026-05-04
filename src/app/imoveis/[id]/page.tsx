"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, KeyRound, CheckCircle, ChevronLeft, ChevronRight, Home, Mail, Phone, X } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { SITE_CONTENT } from "@/config/siteContent";

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  rooms: number;
  bathrooms: number;
  area: number;
  price: number;
  address: string;
  images: string[];
  characteristics?: string[];
}

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        const response = await fetch(`/api/imoveis/${id}`);
        if (!response.ok) throw new Error("Imóvel não encontrado.");
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError("Não foi possível carregar os detalhes deste imóvel.");
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  const nextImage = () => {
    if (!property) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (!property) return;
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500 animate-pulse text-lg">Carregando imóvel...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ops! {error}</h2>
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Voltar para Home
        </Link>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(property.price);

  const characteristics = property.characteristics || [];
  const encodedAddress = property ? encodeURIComponent(property.address) : "";
  const mapIframeUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const whatsappMessage = encodeURIComponent(
    `Ola, gostaria de saber mais informacoes sobre o imovel ID: ${property.id}`
  );
  const whatsappHref = `https://wa.me/${SITE_CONTENT.contact.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      {/* Container principal */}
      <div className="container mx-auto px-4 pt-6 max-w-7xl">
        <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4 font-medium">
          <ChevronLeft size={20} /> Voltar para busca
        </Link>
        
        {/* Carrossel de Imagens */}
        <div title="Clique para ampliar a imagem" className="relative h-[40vh] md:h-[60vh] rounded-2xl overflow-hidden mb-8 shadow-md group bg-black cursor-pointer" onClick={() => setIsViewerOpen(true)}>
          {property.images && property.images.length > 0 ? (
            <Image 
              src={property.images[currentImageIndex]} 
              alt={property.title} 
              fill 
              className="object-cover object-center transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-500">
              <Home size={64} className="mb-4 opacity-20" />
              <span>Sem imagens disponíveis</span>
            </div>
          )}
          {property.images && property.images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-4 px-6 md:px-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="w-12 h-12 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition backdrop-blur-sm">
                <ChevronLeft size={28} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="w-12 h-12 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-lg transition backdrop-blur-sm">
                <ChevronRight size={28} />
              </button>
            </div>
          )}
          {property.images && property.images.length > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm font-medium px-3 py-1 rounded-full backdrop-blur-md">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
          
          {/* Main Info (Col-1 and Col-2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header / Title */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 flex items-center gap-1 rounded-md uppercase tracking-wider">
                  {property.type.toLowerCase() === 'aluguel' ? <KeyRound size={14}/> : <Home size={14}/> }
                  {property.type}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-lg text-gray-600 flex items-center gap-2 mb-6">
                <MapPin size={20} className="text-blue-500 shrink-0"/> {property.address}
              </p>
              <div className="text-3xl font-bold text-blue-600 mb-6">
                {formattedPrice}
              </div>
              
              {/* Key Features row */}
              <div className="flex flex-wrap gap-6 py-6 border-y border-gray-100">
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 min-w-24 border border-gray-100">
                  <Bed size={28} className="text-blue-600 mb-2" />
                  <span className="font-bold text-gray-800 text-xl">{property.rooms}</span>
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Quartos</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 min-w-24 border border-gray-100">
                  <Bath size={28} className="text-blue-600 mb-2" />
                  <span className="font-bold text-gray-800 text-xl">{property.bathrooms}</span>
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Banheiros</span>
                </div>
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 min-w-24 border border-gray-100">
                  <Maximize size={28} className="text-blue-600 mb-2" />
                  <span className="font-bold text-gray-800 text-xl">{property.area} m²</span>
                  <span className="text-sm text-gray-500 uppercase tracking-wide">Área Util</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre o Imóvel</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                {property.description}
              </p>
            </div>

            {/* Características list */}
            {characteristics.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Características</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  {characteristics.map((char: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700 text-lg">
                      <CheckCircle size={20} className="text-green-500 shrink-0" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Map iframe */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Localização</h2>
            <div className="w-full h-100 rounded-xl overflow-hidden border border-gray-200">
              <iframe 
                src={mapIframeUrl} 
                width="100%" 
                height="100%" 
                style={{border:0}} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title={`Localização de ${property.title}`}
              ></iframe>
            </div>
          </div>

          </div>

          {/* Sticky Sidebar Form (Col-3) */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
              <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Valor do imóvel</span>
                <div className="text-3xl font-extrabold text-blue-600 mt-1">{formattedPrice}</div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tenho interesse</h3>
              <p className="text-sm text-gray-500 mb-6">Preencha o formulário abaixo ou fale diretamente com o corretor.</p>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Mensagem enviada com sucesso!"); }}>
                <div>
                  <input type="text" required placeholder="Seu nome" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <input type="email" required placeholder="Seu e-mail" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <input type="tel" required placeholder="Seu telefone" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="hidden">
                  {/* Hidden field for subject that automatically populates ID */}
                  <input type="text" name="subject" defaultValue={`Interesse no imóvel ID: ${property.id}`} />
                </div>
                <div>
                  <textarea rows={4} required placeholder="Sua mensagem" defaultValue={`Olá, gostaria de mais informações sobre o imóvel ID: ${property.id}.`} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-md">
                  <Mail size={18} /> Enviar Mensagem
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <a href={whatsappHref} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                   Falar no WhatsApp
                </a>
                <div className="flex items-center justify-center gap-2 text-gray-600 mt-2">
                  <Phone size={16} /> <span>{SITE_CONTENT.contact.phone}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Fullscreen Image Viewer */}
      {isViewerOpen && property?.images?.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button 
            onClick={() => setIsViewerOpen(false)} 
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-50"
          >
            <X size={36} />
          </button>
          
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center p-4">
            <Image 
              src={property.images[currentImageIndex]} 
              alt={property.title} 
              fill
              className="object-contain"
            />
          </div>

          {property.images.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <ChevronLeft size={36} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextImage(); }} 
                className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <ChevronRight size={36} />
              </button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-medium bg-black/50 px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}