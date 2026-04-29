const { createClient } = require('@libsql/client');
require('dotenv').config();

const sql = `
CREATE TABLE IF NOT EXISTS "Property_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL,
    "type" TEXT NOT NULL,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "area" REAL,
    "images" TEXT,
    "characteristics" TEXT DEFAULT '[]',
    "address" TEXT,
    "exibir" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Property_new" ("id", "title", "description", "price", "type", "rooms", "bathrooms", "area", "images", "characteristics", "address", "exibir", "createdAt", "updatedAt")
SELECT "id", "title", "description", "price", "type", "rooms", "bathrooms", "area", "images", "characteristics", "address", "exibir", "createdAt", "updatedAt" FROM "Property";

DROP TABLE "Property";
ALTER TABLE "Property_new" RENAME TO "Property";
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith('libsql://')) {
    console.error('ERRO: DATABASE_URL deve ser libsql://', url);
    process.exit(1);
  }

  const client = createClient({ 
    url, 
    authToken: process.env.DATABASE_AUTH_TOKEN 
  });

  try {
    console.log('Alterando tabelas...');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const stmt of statements) {
      await client.execute(stmt);
      console.log('Executado:', stmt.substring(0, 50) + "...");
    }
    console.log('Tabela atualizada com sucesso!');
  } catch (error) {
    console.error('Erro na operacao:', error);
  }
}

main();