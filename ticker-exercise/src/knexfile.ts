import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      port: 5432,
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: 'migrations',
      tableName: 'knex_migrations',
    },
  },
};
