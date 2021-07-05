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
    oscillationPercentage: number,
    refreshTimeout: number,
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
    oscillationPercentage: number,
    refreshTimeout: number,
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
        lastPercentageChangeInformed,
        oscillationPercentage
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
      printResults(compareResult, currency, currencyPair, debugging);
    }, refreshTimeout);
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
  lastPercentageChangeInformed: number,
  oscillationPercentage: number
): RateCompareResult {
  const differenceWithFirst = ((currentRate - firstRate) * 100) / firstRate;
  const differenceWithFirstFixed = +differenceWithFirst.toFixed(5);
  const differenceWithLastInformed =
    differenceWithFirst - lastPercentageChangeInformed;
  const differenceWithLastInformedFixed =
    +differenceWithLastInformed.toFixed(5);
  const inform = Math.abs(differenceWithLastInformed) >= oscillationPercentage;

  return {
    firstRate,
    currentRate,
    differenceWithFirst: differenceWithFirstFixed,
    differenceWithLastInformed: differenceWithLastInformedFixed,
    inform,
  };
}

function printResults(
  compareResult: RateCompareResult,
  currency: string,
  currencyPair: string,
  debugging: boolean
) {
  const {
    firstRate,
    currentRate,
    differenceWithFirst,
    differenceWithLastInformed,
  } = compareResult;
  if (compareResult.inform) {
    console.log(
      `ALERT! Price change for currency ${currency} and pair ${currencyPair}`
    );
  }
  if (!compareResult.inform && debugging) {
    console.log(
      `Debug: Price change not enough to trigger alert for currency ${currency} and pair ${currencyPair}`
    );
  }
  if (compareResult.inform || debugging) {
    console.log(
      `Rate ${currentRate}. Changed ${differenceWithFirst}% from first obtained rate ${firstRate}`
    );
    console.log(
      `Difference with last change that triggered an alert is ${differenceWithLastInformed}%\n`
    );
  }
}
