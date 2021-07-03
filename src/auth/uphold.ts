import axios from 'axios';

export async function getToken(
  apiUrl: string,
  clientId: string,
  secret: string
) {
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
