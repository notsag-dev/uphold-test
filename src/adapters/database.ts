import knex from 'knex';

let database: any;

export function connectToDatabase() {
  if (
    process.env.POSTGRES_HOST === undefined ||
    process.env.POSTGRES_USER === undefined ||
    process.env.POSTGRES_PASSWORD === undefined ||
    process.env.POSTGRES_DB === undefined
  ) {
    throw new Error('Please set database configs in .env file');
  }

  database = knex({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    },
    migrations: {
      tableName: 'migrations',
    },
    pool: { min: 0, max: 20 },
  });

  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error('No active connection to the database found');
  }
  return database;
}
