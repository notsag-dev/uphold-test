import axios from 'axios';

export async function getToken() {
  const apiUrl = process.env.UPHOLD_API_URL || '';
  const clientId = process.env.UPHOLD_API_CLIENT_ID || '';
  const secret = process.env.UPHOLD_API_SECRET || '';

  const { data } = await axios({
    method: 'post',
    baseURL: apiUrl,
    url: '/oauth2/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: clientId,
      password: secret,
    },
    data: 'grant_type=client_credentials',
  });
  return data.access_token;
}
