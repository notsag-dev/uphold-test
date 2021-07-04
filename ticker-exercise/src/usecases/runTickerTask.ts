import axios from 'axios';
import { AlertRepository } from '../repositories/alertRepository';

interface BuildRunTickerUsecaseParams {
  alertRepository: AlertRepository;
}

export type Rate = {
  id?: string;
  ask: string;
  bid: string;
  currency: string;
  pair: string;
  isInitial?: boolean;
};

export interface RunTickerUsecase {
  runTickerTask(
    apiUrl: string,
    token: string,
    currency: string,
    currencyPair: string,
    debugging: boolean
  ): Promise<ReturnType<typeof setInterval>>;
}

export function buildRunTickerUsecase(
  buildRunTickerUsecase: BuildRunTickerUsecaseParams
): RunTickerUsecase {
  const { alertRepository } = buildRunTickerUsecase;

  async function runTickerTask(
    apiUrl: string,
    token: string,
    currency: string,
    currencyPair: string,
    debugging: boolean
  ): Promise<ReturnType<typeof setInterval>> {
    const firstRateResult = await getRateFromCurrencyAndPair(
      apiUrl,
      token,
      currency,
      currencyPair
    );
    const firstRate = parseFloat(firstRateResult.bid);
    let lastPercentageChangeInformed: number = 0;

    const recurringTask = setInterval(async () => {
      const { bid, pair } = await getRateFromCurrencyAndPair(
        apiUrl,
        token,
        currency,
        currencyPair
      );

      const currentRate = parseFloat(bid);
      const compareResult = compareRates(
        firstRate,
        currentRate,
        lastPercentageChangeInformed
      );
      if (compareResult.inform) {
        lastPercentageChangeInformed = compareResult.differenceWithFirst;
        await alertRepository.create({
          currency,
          currencyPair: pair,
          referenceRate: firstRate,
          currentRate,
          rateDifference: compareResult.differenceWithFirst,
        });
      }
      printResults(compareResult, debugging);
    }, 5000);
    return recurringTask;
  }

  return { runTickerTask };
}

export async function getRateFromCurrencyAndPair(
  apiUrl: string,
  token: string,
  currency: string,
  currencyPair: string
): Promise<Rate> {
  const rates = await getRates(apiUrl, token, currency);
  const rate = rates.find((item: Rate) => item.pair === currencyPair);
  if (rate === undefined) {
    throw new Error(
      `Error trying to find rate for currency ${currency} and ${currencyPair}`
    );
  }
  return rate;
}

export async function getRates(
  apiUrl: string,
  token: string,
  currency: string
): Promise<Rate[]> {
  const { data } = await axios({
    method: 'get',
    baseURL: apiUrl,
    url: `/v0/ticker/${currency}`,
    headers: {
      Authentication: `bearer ${token}`,
    },
  });
  return data;
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
