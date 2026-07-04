type Attempt = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, Attempt>();

export const checkRateLimit = (
  key: string,
  max = 5,
  windowMs = 15 * 60 * 1000,
): boolean => {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
};