import dotenv from 'dotenv';
import path from 'path';
import { getToken as getUpholdToken } from './auth/uphold';
import { connectToDatabase, getDatabase } from './adapters/database';
import { buildRunTickerUsecase } from './usecases/runTickerTask';
import { buildAlertRepository } from './repositories/alertRepository';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function init(): Promise<void> {
  if (
    process.env.POSTGRES_HOST === undefined ||
    process.env.POSTGRES_USER === undefined ||
    process.env.POSTGRES_PASSWORD === undefined ||
    process.env.POSTGRES_DB === undefined
  ) {
    throw new Error('Please set database configs in .env file');
  }
  console.log('Connecting to the database...');
  let connected = false;
  while (!connected) {
    try {
      connectToDatabase();
      connected = true;
    } catch (err) {
      console.log('Database not ready, retrying...');
    }
  }
  console.log('Successfully connected to the database.');

  if (
    process.env.UPHOLD_API_URL === undefined ||
    process.env.UPHOLD_API_CLIENT_ID === undefined ||
    process.env.UPHOLD_API_SECRET === undefined
  ) {
    throw new Error('Please set uphold configs in .env file');
  }
  console.log('Requesting Uphold token...');
  const token = await getUpholdToken();
  console.log('Successfully obtained Uphold token');

  console.log('Starting task ticker task...');
  const alertRepository = buildAlertRepository({ getDatabase });
  const { runTickerTask } = buildRunTickerUsecase({ alertRepository });
  runTickerTask(process.env.UPHOLD_API_URL, token, 'USD', 'BTCUSD', true);
}

init();
