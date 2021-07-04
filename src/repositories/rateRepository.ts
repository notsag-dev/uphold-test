export type Rate = {
  id?: string;
  ask: string;
  bid: string;
  currencty: string;
  pair: string;
  isInitial?: boolean;
};

interface BuildRateRepositoryArgs {
  getDatabase(): any;
}

let list: Rate[] = [];

export interface RateRepository {
  create(r: Rate): Promise<void>;
  get(id: string): Promise<Rate | undefined>;
  bulkInsert(rates: Rate[]): Promise<void>;
}

const tableName = 'domains';
export function buildRateRepository(
  params: BuildRateRepositoryArgs
): RateRepository {
  const { getDatabase } = params;

  async function create(r: Rate) {
    list.push(r);
  }

  async function get(id: string) {
    return list.find((r) => (r.id = id));
  }

  async function bulkInsert(rates: Rate[]): Promise<void> {
    list = [...list, ...rates];
  }

  // async function create(r: Rate) {
  //   const db = await getDatabase();
  //   await db(tableName).insert(r);
  // }

  // async function get(id: string) {
  //   const db = await getDatabase();
  //   const res = await db(tableName).select().where('id', id);
  //   if (res.length) {
  //     return res[0];
  //   }
  // }

  // async function bulkInsert(rates: Rate[]): Promise<void> {
  //   const db = await getDatabase();
  //   if (rates.length === 0) {
  //     return;
  //   }
  //   await db(tableName).insert(rates);
  // }

  return {
    create,
    get,
    bulkInsert,
  };
}
