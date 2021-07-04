import dotenv from 'dotenv';
import path from 'path';
import { getToken } from './auth/uphold';
import { connectToDatabase } from './adapters/database';
import { runTickerTask } from './usecases/runTickerTask';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

async function init() {
  // const database = connectToDatabase();

  if (
    process.env.UPHOLD_API_URL === undefined ||
    process.env.UPHOLD_API_CLIENT_ID === undefined ||
    process.env.UPHOLD_API_SECRET === undefined
  ) {
    throw new Error('Please set uphold configs in .env file');
  }

  const token = await getToken(
    process.env.UPHOLD_API_URL,
    process.env.UPHOLD_API_CLIENT_ID,
    process.env.UPHOLD_API_SECRET
  );

  runTickerTask(process.env.UPHOLD_API_URL, token);
}

init();
