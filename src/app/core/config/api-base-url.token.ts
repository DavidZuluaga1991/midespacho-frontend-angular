import { InjectionToken } from '@angular/core';

const DEFAULT_API_BASE_URL = '/api/v1';

const normalizeUrl = (url: string): string => url.replace(/\/+$/, '');

export const resolveApiBaseUrl = (): string => {
  const fromProcess = typeof process !== 'undefined' ? process.env?.['API_BASE_URL'] : undefined;
  if (fromProcess) {
    return normalizeUrl(fromProcess);
  }

  const fromMetaTag =
    typeof document !== 'undefined'
      ? (document.querySelector('meta[name="api-base-url"]') as HTMLMetaElement | null)?.content
      : undefined;
  if (fromMetaTag) {
    return normalizeUrl(fromMetaTag);
  }

  const fromGlobalEnv = (globalThis as { __env?: { API_BASE_URL?: string } }).__env?.API_BASE_URL;
  if (fromGlobalEnv) {
    return normalizeUrl(fromGlobalEnv);
  }

  return DEFAULT_API_BASE_URL;
};

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: resolveApiBaseUrl,
});
