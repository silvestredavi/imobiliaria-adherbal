import { PropertyCard } from "@/components/ui/PropertyCard";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

type SearchParams = { search?: string; type?: string; page?: string };

interface HomeProperty {
  id: string;
  title: string;
  type: string;
  rooms: number | null;
  bathrooms: number | null;
  area: number | null;
  price: number | null;
  images: string[];
  address: string | null;
  exibir: boolean;
}

function parsePrimaryImage(value: string | null): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    const firstImage = parsed.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );

    return firstImage ? [firstImage] : [];
  } catch {
    return [];
  }
}

async function queryProperties(
  search: string,
  type: string,
  page: number,
  onlyVisible: boolean
) {
  const limit = 12;
  const take = limit + 1;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.PropertyWhereInput = {};

  if (onlyVisible) {
    whereClause.exibir = true;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { address: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (type && type !== "") {
    whereClause.type = { equals: type };
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      type: true,
      rooms: true,
      bathrooms: true,
      area: true,
      price: true,
      images: true,
      address: true,
      exibir: true,
    },
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = properties.length > limit;
  const pagedProperties = hasNextPage ? properties.slice(0, limit) : properties;

  return {
    properties: pagedProperties.map((prop): HomeProperty => ({
      ...prop,
      // Mantemos apenas a imagem principal para reduzir o tamanho do cache da home.
      images: parsePrimaryImage(prop.images),
    })),
    hasNextPage,
    currentPage: page,
  };
}

const getCachedPublicProperties = unstable_cache(
  async (search: string, type: string, page: number) => {
    return queryProperties(search, type, page, true);
  },
  ["home-public-properties"],
  {
    revalidate: 120,
    tags: ["properties"],
  }
);

async function getIsAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return false;

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "imob-secret-dev-only-v1";
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

async function getProperties(searchParams: SearchParams, isAuthenticated: boolean) {
  const search = (searchParams.search || "").trim();
  const type = (searchParams.type || "").trim();
  const rawPage = Number.parseInt(searchParams.page || "1", 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  if (isAuthenticated) {
    return queryProperties(search, type, page, false);
  }

  return getCachedPublicProperties(search, type, page);
}

function buildPageHref(page: number, search: string, type: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  if (type) params.set("type", type);
  return `/?${params.toString()}`;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [resolvedSearchParams, isAuthenticated] = await Promise.all([
    searchParams,
    getIsAuthenticated(),
  ]);

  const currentSearch = (resolvedSearchParams.search || "").trim();
  const currentType = (resolvedSearchParams.type || "").trim();

  const { properties, hasNextPage, currentPage } = await getProperties(
    resolvedSearchParams,
    isAuthenticated
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero / Search Section */}
      <section className="bg-blue-600 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute z-0 inset-0">
          <Image
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=70&w=1800&auto=format&fit=crop"
            alt="Casa de alto padrão"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        
        <div className="w-full max-w-6xl mx-auto px-4 lg:px-8 relative z-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Encontre o Imóvel dos Seus Sonhos
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto drop-shadow-sm">
            Temos as melhores opções em diversas regiões. Casas, apartamentos, studios e muito mais.
          </p>

          <form 
            action="/" 
            method="GET"
            className="max-w-4xl mx-auto bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 text-black text-left items-end"
          >
            <div className="w-full md:flex-1 flex flex-col gap-2">
              <label htmlFor="search" className="text-sm font-semibold text-gray-600 uppercase">Localização ou Palavra-chave</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  name="search"
                  id="search"
                  defaultValue={currentSearch}
                  placeholder="Bairro, cidade, rua..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48 flex flex-col gap-2">
              <label htmlFor="type" className="text-sm font-semibold text-gray-600 uppercase">Tipo</label>
              <select 
                name="type" 
                id="type"
                defaultValue={currentType}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="venda">Comprar</option>
                <option value="aluguel">Alugar</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto flex items-end gap-2">
              <button type="submit" className="flex-1 md:w-32 bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition shadow-sm h-12.5">
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-6xl mx-auto px-4 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Imóveis em Destaque</h2>
            <p className="text-gray-500 mt-2">Explore as melhores ofertas selecionadas para você</p>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} isAdmin={isAuthenticated} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500">
              Nenhum imóvel encontrado.{currentSearch ? " Tente buscar com outros termos." : ""}
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {(currentPage > 1 || hasNextPage) && (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-2">
              <a 
                href={buildPageHref(Math.max(1, currentPage - 1), currentSearch, currentType)}
                className={`w-10 h-10 rounded flex items-center justify-center transition border border-gray-200 ${currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                &laquo;
              </a>

              <span className="px-4 h-10 rounded flex items-center justify-center border border-gray-200 text-sm text-gray-600 bg-white">
                Página {currentPage}
              </span>

              <a 
                href={buildPageHref(currentPage + 1, currentSearch, currentType)}
                className={`w-10 h-10 rounded flex items-center justify-center transition border border-gray-200 ${!hasNextPage ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                &raquo;
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}