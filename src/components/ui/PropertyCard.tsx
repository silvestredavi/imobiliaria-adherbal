import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, KeyRound, Home } from "lucide-react";
import Image from "next/image";
import { PropertyCardAdminActions } from "./PropertyCardAdminActions";

interface PropertyProps {
  id: string;
  title: string;
  type: string; 
  rooms: number | null;
  bathrooms: number | null;
  area: number | null;
  price: number | null;
  images: string[];
  address: string | null;
  exibir?: boolean;
}

function formatPrice(price: number | null) {
  if (price === null) return "Consulte valor";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export function PropertyCard({
  property,
  isAdmin = false,
}: {
  property: PropertyProps;
  isAdmin?: boolean;
}) {
  const isHidden = property.exibir === false;
  const formattedPrice = formatPrice(property.price);
  const rooms = property.rooms ?? "-";
  const bathrooms = property.bathrooms ?? "-";
  const area = property.area ?? "-";

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative ${isHidden ? 'opacity-60 grayscale hover:grayscale-0' : ''}`}>
      {isAdmin && <PropertyCardAdminActions property={property} />}

      <Link href={`/imoveis/${property.id}`} className="block relative h-56 overflow-hidden">
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
            <span className="font-medium">{rooms}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600" title="Banheiros">
            <Bath size={18} className="text-gray-400" />
            <span className="font-medium">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600" title="Área">
            <Maximize size={18} className="text-gray-400" />
            <span className="font-medium">{area === "-" ? area : `${area} m²`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
