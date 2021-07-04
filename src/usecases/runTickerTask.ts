import axios from 'axios';
import { AlertRepository } from '../repositories/alertRepository';

interface BuildRunTickerUsecaseParams {
  alertRepository: AlertRepository;
}

export type Rate = {
  id?: string;
  ask: string;
  bid: string;
  currencty: string;
  pair: string;
  isInitial?: boolean;
};

export function builRunTickerUsecase(
  buildRunTickerUsecase: BuildRunTickerUsecaseParams
) {
  const { alertRepository } = buildRunTickerUsecase;

  async function runTickerTask(
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

type RateCompareResult = {
  firstRate: number;
  currentRate: number;
  differenceWithFirst: number;
  differenceWithLastInformed: number;
  inform: boolean;
};

export function compareRates(
  firstRate: number,
  currentRate: number,
  lastPercentageChangeInformed: number
): RateCompareResult {
  const diff = ((currentRate - firstRate) * 100) / firstRate;
  const differenceWithFirst = +diff.toFixed(4);
  const differenceWithLastInformed =
    differenceWithFirst - lastPercentageChangeInformed;
  const inform = Math.abs(differenceWithLastInformed) >= 0.01;

  return {
    firstRate,
    currentRate,
    differenceWithFirst,
    differenceWithLastInformed,
    inform,
  };
}

function printResults(compareResult: RateCompareResult, debugging: boolean) {
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
