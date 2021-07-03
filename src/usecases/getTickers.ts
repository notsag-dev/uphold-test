import axios from 'axios';

type TickersItem = {
  ask: string;
  bid: string;
  currencty: string;
  pair: string;
};

export function startTickersTask(apiUrl: string, token: string) {
  const interval = setInterval(async () => {
    const conversion = await getTickers(apiUrl, token);
    console.log(conversion);
  }, 5000);
  return interval;
}
export async function getTickers(apiUrl: string, token: string) {
  const { data } = await axios({
    method: 'get',
    baseURL: apiUrl,
    url: '/v0/ticker/USD', // TODO parameter
    headers: {
      Authentication: `bearer ${token}`,
    },
  });
  return data.find((item: TickersItem) => item.pair === 'BTCUSD');
}
