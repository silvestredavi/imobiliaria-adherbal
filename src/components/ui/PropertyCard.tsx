"use client";

import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, KeyRound, Home, Trash2, Eye, EyeOff, Edit } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";

interface PropertyProps {
  id: string;
  title: string;
  type: string; 
  rooms: number;
  bathrooms: number;
  area: number;
  price: number;
  images: string[];
  address: string;
  exibir?: boolean;
}

export function PropertyCard({ property, isAuthenticated }: { property: PropertyProps, isAuthenticated?: boolean }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isHidden = property.exibir === false;

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    try {
      const res = await fetch(`/api/imoveis/${property.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Imóvel excluído com sucesso!");
        router.refresh();
      } else {
        toast.error("Erro ao excluir imóvel.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão ao tentar excluir.");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDeleteModal(true);
  };

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/imoveis`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: property.id, exibir: !property.exibir })
      });
      if (res.ok) {
        toast.success(property.exibir ? "Imóvel ocultado!" : "Imóvel visível!");
        router.refresh();
      } else {
        toast.error("Erro ao alterar visibilidade.");
      }
    } catch {
      toast.error("Erro de conexão.");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/imoveis/cadastrar?id=${property.id}`);
  };

  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(property.price);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative ${isHidden ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}>
      {isAuthenticated && (
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          <button 
            onClick={handleToggleVisibility}
            className={`p-2 rounded-full shadow-md text-white transition ${isHidden ? 'bg-gray-500 hover:bg-gray-600' : 'bg-green-500 hover:bg-green-600'}`}
            title={isHidden ? "Tornar visível" : "Ocultar anúncio"}
          >
            {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button 
            onClick={handleEdit}
            className="p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
            title="Editar anúncio"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition"
            title="Excluir imóvel"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <Link href={`/imoveis/${property.id}`} className="block relative h-56 overflow-hidden">
        {/* Placeholder if no image */}
        <div className="absolute inset-0 bg-gray-200">
          <Image 
            src={property.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 flex items-center gap-1 rounded-md shadow-sm">
           {property.type.toLowerCase() === 'aluguel' ? <KeyRound size={14}/> : <Home size={14}/> }
           {property.type}
        </div>
      </Link>

      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-blue-600 mb-1">{formattedPrice}</h3>
          <Link href={`/imoveis/${property.id}`}>
            <h4 className="text-gray-800 font-semibold text-lg hover:text-blue-600 line-clamp-1" title={property.title}>
              {property.title}
            </h4>
          </Link>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin size={14} className="mr-1 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
        </div>

        <div className="pt-4 border-t grid grid-cols-3 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600" title="Quartos">
            <Bed size={18} className="text-gray-400" />
            <span className="font-medium">{property.rooms}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600" title="Banheiros">
            <Bath size={18} className="text-gray-400" />
            <span className="font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600" title="Área">
            <Maximize size={18} className="text-gray-400" />
            <span className="font-medium">{property.area} m²</span>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteModal(false);
            }} 
          />
          <div 
            className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl transform transition-all"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-6">
              <Trash2 className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-3">
              Excluir Imóvel
            </h3>
            <p className="text-center text-gray-600 mb-8 min-h-[48px]">
              Tem certeza que deseja excluir o imóvel <strong className="text-gray-900">{property.title}</strong>? <br/> Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors focus:ring-4 focus:ring-gray-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors focus:ring-4 focus:ring-red-200 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmDelete();
                }}
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
