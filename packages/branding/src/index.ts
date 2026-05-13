import type { TenantBranding } from '@liveshop/database';

/**
 * Resolves CSS variables from tenant branding data
 */
export function getThemeVariables(branding: Partial<TenantBranding>) {
  return {
    '--color-primary': branding.primary_color ?? '#111827',
    '--color-accent': branding.accent_color ?? '#A3FF00',
    '--color-bg': branding.background_color ?? '#0a0a0a',
    '--radius-button': branding.button_radius ?? '14px',
    '--radius-card': branding.card_radius ?? '18px',
    '--font-main': branding.font_family ?? 'Inter',
  };
}

/**
 * Resolves public URLs for branding assets
 */
export function getBrandAssets(branding: Partial<TenantBranding>) {
  return {
    logo: branding.logo_url || '/fallback-logo.svg',
    favicon: branding.favicon_url || '/favicon.ico',
    ogImage: branding.og_image_url || '/default-og.png',
  };
}

/**
 * Legacy tokens helper
 */
export function getBrandingTokens(branding: Partial<TenantBranding>) {
  return {
    '--tenant-primary': branding.primary_color || '#A3FF00',
    '--tenant-secondary': branding.secondary_color || '#000000',
    '--tenant-logo': `url(${branding.logo_url || ''})`,
    '--tenant-font': branding.font_family || 'Inter, sans-serif',
  };
}
