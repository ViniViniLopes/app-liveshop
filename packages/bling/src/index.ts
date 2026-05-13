import axios, { AxiosInstance } from 'axios';

export interface BlingConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
}

export interface BlingTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token: string;
}

export class BlingClient {
  private axiosInstance: AxiosInstance;
  private config: BlingConfig;

  constructor(config: BlingConfig, accessToken?: string) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://www.bling.com.br/Api/v3',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
  }

  setAccessToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async getAuthorizationUrl(redirectUri: string, state: string): Promise<string> {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      state: state,
      scope: 'produtos pedidos estoques'
    });
    return `https://www.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<BlingTokenResponse> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }), 
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<BlingTokenResponse> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
    const response = await axios.post('https://www.bling.com.br/Api/v3/oauth/token', 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }), 
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data;
  }

  // Product Sync
  async getProducts(params: { pagina: number, limite: number }) {
    const response = await this.axiosInstance.get('/produtos', { params });
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.axiosInstance.get(`/produtos/${id}`);
    return response.data;
  }

  async getStock(productIds: string[]) {
    const response = await this.axiosInstance.get('/estoques', { 
      params: { idsProdutos: productIds.join(',') } 
    });
    return response.data;
  }

  // Channels
  async getChannels() {
    const response = await this.axiosInstance.get('/canais-venda');
    return response.data;
  }

  // Orders
  async createOrder(orderData: any) {
    const response = await this.axiosInstance.post('/pedidos', orderData);
    return response.data;
  }
}
