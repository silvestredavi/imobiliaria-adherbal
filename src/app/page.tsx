import { PropertyCard } from "@/components/ui/PropertyCard";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getProperties(searchParams: { search?: string; type?: string; page?: string }, isAuthenticated: boolean) {
  const search = searchParams.search || "";
  const type = searchParams.type || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 6;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  
  if (!isAuthenticated) {
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

  const [properties, totalCount] = await Promise.all([
    prisma.property.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where: whereClause }),
  ]);

  return {
    properties: properties.map((prop) => ({
      ...prop,
      images: prop.images ? JSON.parse(prop.images) : [],
      characteristics: prop.characteristics ? JSON.parse(prop.characteristics) : [],
    })),
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || "imob-secret-dev-only-v1";
      jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  const { properties, totalPages, currentPage } = await getProperties(resolvedSearchParams, isAuthenticated);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero / Search Section */}
      <section className="bg-blue-600 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute z-0 inset-0 bg-[url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        
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
                  defaultValue={resolvedSearchParams.search || ""}
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
                defaultValue={resolvedSearchParams.type || ""}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="venda">Comprar</option>
                <option value="aluguel">Alugar</option>
              </select>
            </div>
            
            <div className="w-full md:w-auto flex items-end gap-2">
              <button type="submit" className="flex-1 md:w-32 bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-lg transition shadow-sm h-[50px]">
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
              <PropertyCard key={property.id} property={property as any} isAuthenticated={isAuthenticated} />
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10 text-gray-500">
              Nenhum imóvel encontrado.{resolvedSearchParams.search ? " Tente buscar com outros termos." : ""}
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-2">
              <a 
                href={`/?page=${Math.max(1, currentPage - 1)}${resolvedSearchParams.search ? `&search=${resolvedSearchParams.search}` : ''}${resolvedSearchParams.type ? `&type=${resolvedSearchParams.type}` : ''}`}
                className={`w-10 h-10 rounded flex items-center justify-center transition border border-gray-200 ${currentPage === 1 ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                &laquo;
              </a>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <a 
                  key={i}
                  href={`/?page=${i + 1}${resolvedSearchParams.search ? `&search=${resolvedSearchParams.search}` : ''}${resolvedSearchParams.type ? `&type=${resolvedSearchParams.type}` : ''}`}
                  className={`w-10 h-10 rounded flex items-center justify-center transition ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-200 border border-gray-200'}`}
                >
                  {i + 1}
                </a>
              ))}

              <a 
                href={`/?page=${Math.min(totalPages, currentPage + 1)}${resolvedSearchParams.search ? `&search=${resolvedSearchParams.search}` : ''}${resolvedSearchParams.type ? `&type=${resolvedSearchParams.type}` : ''}`}
                className={`w-10 h-10 rounded flex items-center justify-center transition border border-gray-200 ${currentPage === totalPages ? 'text-gray-300 pointer-events-none' : 'text-gray-500 hover:bg-gray-200'}`}
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