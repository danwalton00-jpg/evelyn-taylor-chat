export function isFacebookProfileUrl(value) {
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    const allowedHosts = new Set([
      'facebook.com',
      'm.facebook.com',
      'mbasic.facebook.com',
    ]);

    return (
      url.protocol === 'https:' &&
      allowedHosts.has(host) &&
      url.pathname.length > 1 &&
      url.pathname !== '/'
    );
  } catch {
    return false;
  }
}
