import axios from 'axios';

export interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  zoneId: string;
}

export class CloudflareClient {
  private apiToken: string;
  private accountId: string;
  private zoneId: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(config: CloudflareConfig) {
    this.apiToken = config.apiToken;
    this.accountId = config.accountId;
    this.zoneId = config.zoneId;
  }

  /**
   * Cria um registro CNAME para um subdomínio de tenant (ex: loja.liveshop.com.br)
   * apontando para o nosso app (ex: cname.liveshop.com.br)
   */
  async createCnameRecord(subdomain: string, target: string) {
    const response = await axios.post(
      `${this.baseUrl}/zones/${this.zoneId}/dns_records`,
      {
        type: 'CNAME',
        name: subdomain,
        content: target,
        ttl: 1, // Auto
        proxied: true, // Habilita Cloudflare Proxy (SSL/WAF)
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  /**
   * Verifica se o DNS de um domínio externo (white-label) está apontado corretamente
   */
  async verifyDns(domain: string, expectedTarget: string): Promise<boolean> {
    try {
      // Usando Cloudflare Trace ou apenas uma checagem de DNS pública (via 1.1.1.1)
      const response = await axios.get(`https://cloudflare-dns.com/dns-query`, {
        params: { name: domain, type: 'CNAME' },
        headers: { 'Accept': 'application/dns-json' }
      });
      
      const records = response.data.Answer || [];
      return records.some((r: any) => r.data.includes(expectedTarget));
    } catch (err) {
      console.error('[Cloudflare] Erro ao verificar DNS:', err);
      return false;
    }
  }
}
