import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Defina a URL base do seu site. Você pode configurar a variável de ambiente NEXT_PUBLIC_BASE_URL em produção.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://suaimobiliaria.com.br";

  // Busca todos os imóveis que estão visíveis no banco de dados
  const properties = await prisma.property.findMany({
    where: { exibir: true },
    select: { id: true, updatedAt: true, createdAt: true },
  });

  // Cria as rotas dinâmicas para cada imóvel
  const propertyUrls: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/imoveis/${property.id}`,
    lastModified: property.updatedAt || property.createdAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Retorna as rotas estáticas e dinâmicas
  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...propertyUrls,
  ];
}
