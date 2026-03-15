const DEFAULT_APP_URL = 'https://tasks.bncglobal.in';

export function getAppUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    DEFAULT_APP_URL;

  return configuredUrl.replace(/\/$/, '');
}

export function getLoginUrl() {
  return `${getAppUrl()}/login`;
}
