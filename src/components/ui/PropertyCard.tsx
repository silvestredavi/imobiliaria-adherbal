import Link from "next/link";
import { Bed, Bath, Maximize, MapPin, KeyRound, Home } from "lucide-react";
import Image from "next/image";

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
}

export function PropertyCard({ property }: { property: PropertyProps }) {
  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(property.price);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
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
    </div>
  );
}
