import dotenv from 'dotenv';
import path from 'path';
import { getToken } from './auth/uphold';
import { getTickers, startTickersTask } from './usecases/getTickers';

async function init() {
  dotenv.config({
    path: path.resolve(__dirname, '../.env'),
  });

  if (
    process.env.UPHOLD_API_URL === undefined ||
    process.env.UPHOLD_API_CLIENT_ID === undefined ||
    process.env.UPHOLD_API_SECRET === undefined
  ) {
    throw new Error('Please set uphold credentials in .env file');
  }

  const token = await getToken(
    process.env.UPHOLD_API_URL,
    process.env.UPHOLD_API_CLIENT_ID,
    process.env.UPHOLD_API_SECRET
  );
  startTickersTask(process.env.UPHOLD_API_URL, token);
}

init();
