const { createClient } = require('@libsql/client');

const sql = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "area" REAL NOT NULL,
    "images" TEXT NOT NULL,
    "characteristics" TEXT NOT NULL DEFAULT '[]',
    "address" TEXT NOT NULL,
    "exibir" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
`;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith('libsql://')) {
    console.error('ERRO: DATABASE_URL deve ser libsql://');
    process.exit(1);
  }

  const client = createClient({ url });

  try {
    console.log('Conectando e criando tabelas...');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const stmt of statements) {
      await client.execute(stmt);
    }
    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

main();