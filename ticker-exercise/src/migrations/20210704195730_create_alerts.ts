import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .createTableIfNotExists('alerts', function (table) {
      table
        .uuid('id')
        .notNullable()
        .primary()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('currency').notNullable().index();
      table.string('currencyPair').notNullable().index();
      table.float('referenceRate').notNullable();
      table.float('currentRate').notNullable();
      table.float('rateDifference').notNullable();
      table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('alerts');
}
