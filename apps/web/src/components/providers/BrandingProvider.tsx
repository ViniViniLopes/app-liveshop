'use client';

import { useEffect } from 'react';
import { getBrandingTokens } from '@liveshop/branding';

interface BrandingProviderProps {
  branding: any;
  children: React.ReactNode;
}

export function BrandingProvider({ branding, children }: BrandingProviderProps) {
  useEffect(() => {
    if (!branding) return;

    const root = document.documentElement;
    const tokens = getBrandingTokens(branding);

    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    // Handle Custom Fonts
    if (branding.font_url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = branding.font_url;
      document.head.appendChild(link);
    }
  }, [branding]);

  return <>{children}</>;
}
