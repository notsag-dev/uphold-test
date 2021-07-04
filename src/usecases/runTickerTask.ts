import axios from 'axios';
import { Rate, RateRepository } from '../repositories/rateRepository';

interface BuildRunTickerUsecaseParams {
  rateRepository: RateRepository;
}

export async function runTickerTask(
  apiUrl: string,
  token: string,
  debugging: boolean
) {
  const firstRateResult = await getRates(apiUrl, token);
  const firstRate = parseFloat(firstRateResult.bid);
  let lastPercentageChangeInformed: number = 0;

  const recurringTask = setInterval(async () => {
    const { bid } = await getRates(apiUrl, token);
    const currentRate = parseFloat(bid);
    const compareResult = compareRates(
      firstRate,
      currentRate,
      lastPercentageChangeInformed
    );
    if (compareResult.inform) {
      lastPercentageChangeInformed = compareResult.differenceWithFirst;
    }
    printResults(compareResult, debugging);
  }, 5000);
  return recurringTask;
}

type CompareResult = {
  differenceWithFirst: number;
  differenceWithLastInformed: number;
  firstRate: number;
  currentRate: number;
  inform: boolean;
};

export function compareRates(
  firstRate: number,
  currentRate: number,
  lastPercentageChangeInformed: number
): CompareResult {
  const differenceWithFirst = ((currentRate - firstRate) * 100) / firstRate;
  const differenceWithLastInformed =
    differenceWithFirst - lastPercentageChangeInformed;

  return {
    differenceWithFirst,
    differenceWithLastInformed,
    firstRate,
    currentRate,
    inform: Math.abs(differenceWithLastInformed) >= 0.01,
  };
}

function printResults(compareResult: CompareResult, debugging: boolean) {
  if (compareResult.inform) {
    console.log(
      `Conversion rate alert. BTC price changed ${compareResult.differenceWithFirst} from start value`
    );
  }
  if (debugging) {
    console.log(
      `Not informing. Change rate since last informed was ${compareResult.differenceWithLastInformed}.`
    );
  }
}

export async function getRates(apiUrl: string, token: string) {
  const { data } = await axios({
    method: 'get',
    baseURL: apiUrl,
    url: '/v0/ticker/USD',
    headers: {
      Authentication: `bearer ${token}`,
    },
  });
  return data.find((item: Rate) => item.pair === 'BTCUSD');
}
