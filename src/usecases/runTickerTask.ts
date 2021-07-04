import axios from 'axios';
import { Rate, RateRepository } from '../repositories/rateRepository';

interface BuildRunTickerUsecaseParams {
  rateRepository: RateRepository;
}

// export function buildRunTickerUsecase(params: BuildRunTickerUsecaseParams) {
//   const { rateRepository } = params;
let firstBid: number;
let lastPercentageChangeInformed: number = 0;

export async function runTickerTask(apiUrl: string, token: string) {
  const resRate = await getRates(apiUrl, token);
  console.log(resRate);

  firstBid = resRate.bid;

  const recurringTask = setInterval(async () => {
    const conversion = await getRates(apiUrl, token);
    const currentBid = parseFloat(conversion.bid);

    const percentageChange = ((currentBid - firstBid) * 100) / firstBid;
    const differenceWithLastInformed =
      percentageChange - lastPercentageChangeInformed;
    if (Math.abs(differenceWithLastInformed) >= 0.01) {
      console.log(
        `Conversion rate alert. BTC price changed ${percentageChange} from start value`
      );
      lastPercentageChangeInformed = percentageChange;
    } else {
      console.log(`Not informing. Change rate was ${percentageChange}.`);
    }
    console.log(`Difference with last informed: ${differenceWithLastInformed}`);

    console.log(conversion);
  }, 5000);
  return recurringTask;
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

//  return {
//    runTickerTask,
//    getRates,
//  };
//}
