import dotenv from 'dotenv';
import path from 'path';
import { getToken as getUpholdToken } from './auth/uphold';
import { connectToDatabase, getDatabase } from './adapters/database';
import { buildRunTickerUsecase } from './usecases/runTickerTask';
import { buildAlertRepository } from './repositories/alertRepository';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

async function init(): Promise<void> {
  initDb();
  const { token, apiUrl } = await initUphold();

  const alertRepository = buildAlertRepository({ getDatabase });
  const { runTickerTask } = buildRunTickerUsecase({ alertRepository });

  const { oscillationPercentage, refreshTimeout, currency, currencyPair } =
    getBotParams();

  const debugging = process.env.DEBUGGING === '1';

  console.log('Starting ticker task...');
  runTickerTask(
    apiUrl,
    token,
    currency,
    currencyPair,
    oscillationPercentage,
    refreshTimeout,
    debugging
  );
}

function initDb() {
  if (
    process.env.POSTGRES_HOST === undefined ||
    process.env.POSTGRES_USER === undefined ||
    process.env.POSTGRES_PASSWORD === undefined ||
    process.env.POSTGRES_DB === undefined
  ) {
    throw new Error('Please set database configs in .env file');
  }

  console.log('Connecting to the database...');
  connectToDatabase();
  console.log('Successfully connected to the database.');
}

async function initUphold() {
  if (
    process.env.UPHOLD_API_URL === undefined ||
    process.env.UPHOLD_API_CLIENT_ID === undefined ||
    process.env.UPHOLD_API_SECRET === undefined
  ) {
    throw new Error('Please set uphold configs in .env file');
  }

  console.log('Requesting Uphold token...');
  const token = await getUpholdToken();
  console.log('Successfully obtained Uphold token.');

  return { token, apiUrl: process.env.UPHOLD_API_URL };
}

function getBotParams() {
  const oscillationPercentage = process.env.TICKER_ALERT_OSCILLATION_PERCENTAGE
    ? parseFloat(process.env.TICKER_ALERT_OSCILLATION_PERCENTAGE)
    : 0.01;
  const refreshTimeout = process.env.TICKER_FETCH_INTERVAL_MILLISECONDS
    ? parseInt(process.env.TICKER_FETCH_INTERVAL_MILLISECONDS)
    : 5000;
  const currency = process.env.CURRENCY || 'USD';
  const currencyPair = process.env.CURRENCY_PAIR || 'BTCUSD';

  return { oscillationPercentage, refreshTimeout, currency, currencyPair };
}

init();
