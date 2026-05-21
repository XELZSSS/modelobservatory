export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i) + Math.random() * 500));
    }
  }
  throw new Error("unreachable");
}
