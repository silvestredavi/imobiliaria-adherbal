const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env' });

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !url.startsWith('libsql://')) {
    console.error('ERRO: DATABASE_URL deve ser libsql://');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  try {
    console.log('Adicionando coluna...');
    await client.execute(`ALTER TABLE "Property" ADD COLUMN "exibir" BOOLEAN NOT NULL DEFAULT 1;`);
    console.log('Coluna adicionada com sucesso!');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Coluna já existe.');
    } else {
      console.error('Erro ao adicionar coluna:', error);
    }
  }
}

main();