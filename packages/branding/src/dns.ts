import axios from 'axios';

export interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
}

export class CloudflareDNSClient {
  private apiToken: string;
  private zoneId: string;

  constructor(config: CloudflareConfig) {
    this.apiToken = config.apiToken;
    this.zoneId = config.zoneId;
  }

  async createCnameRecord(name: string, target: string) {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`,
      {
        type: 'CNAME',
        name,
        content: target,
        ttl: 1, // Auto
        proxied: true
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async verifySslStatus(domain: string) {
     // Check SSL status via Cloudflare API
     const response = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/ssl/verification`,
      {
        headers: { Authorization: `Bearer ${this.apiToken}` }
      }
    );
    return response.data;
  }
}
