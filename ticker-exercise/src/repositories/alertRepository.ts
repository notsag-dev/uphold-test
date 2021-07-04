interface BuildAlertRepositoryArgs {
  getDatabase(): any;
}

type Alert = {
  id?: string;
  currency: string;
  currencyPair: string;
  referenceRate: number;
  currentRate: number;
  rateDifference: number;
};

export interface AlertRepository {
  create(a: Alert): Promise<void>;
  get(id: string): Promise<Alert | undefined>;
  bulkInsert(alerts: Alert[]): Promise<void>;
}

const tableName = 'alerts';
export function buildAlertRepository(
  params: BuildAlertRepositoryArgs
): AlertRepository {
  const { getDatabase } = params;

  async function create(r: Alert) {
    const db = await getDatabase();
    await db(tableName).insert(r);
  }

  async function get(id: string) {
    const db = await getDatabase();
    const res = await db(tableName).select().where('id', id);
    if (res.length) {
      return res[0];
    }
  }

  async function bulkInsert(alerts: Alert[]): Promise<void> {
    const db = await getDatabase();
    if (alerts.length === 0) {
      return;
    }
    await db(tableName).insert(alerts);
  }

  return {
    create,
    get,
    bulkInsert,
  };
}
