export type SocialPlatform = 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'pinterest' | 'linkedin' | 'x';

export interface SocialCapability {
  platform: SocialPlatform;
  canAutopost: boolean;
  canLiveStream: boolean;
  canProductSync: boolean;
}

export const PLATFORM_CAPABILITIES: Record<SocialPlatform, SocialCapability> = {
  youtube: { platform: 'youtube', canAutopost: true, canLiveStream: true, canProductSync: false },
  facebook: { platform: 'facebook', canAutopost: true, canLiveStream: true, canProductSync: false },
  instagram: { platform: 'instagram', canAutopost: true, canLiveStream: false, canProductSync: false },
  tiktok: { platform: 'tiktok', canAutopost: false, canLiveStream: true, canProductSync: true },
  pinterest: { platform: 'pinterest', canAutopost: true, canLiveStream: false, canProductSync: false },
  linkedin: { platform: 'linkedin', canAutopost: true, canLiveStream: false, canProductSync: false },
  x: { platform: 'x', canAutopost: true, canLiveStream: true, canProductSync: false },
};

export function checkCapability(platform: SocialPlatform, capability: keyof SocialCapability): boolean {
  const config = PLATFORM_CAPABILITIES[platform];
  return config ? (config[capability] as boolean) : false;
}
