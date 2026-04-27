const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.property.updateMany({
    data: { 
      images: JSON.stringify(["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80"])
    },
    where: { 
      images: { contains: 'blob:' } 
    }
  });
  console.log("DB Fixed");
}

fix();
