import knex from 'knex';

let database: any;

export function connectToDatabase() {
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
    database = connectToDatabase();
  }
  return database;
}
