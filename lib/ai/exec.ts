export async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; took_ms: number }> {
  const t0 = performance.now();
  const value = await fn();
  return { value, took_ms: Math.round(performance.now() - t0) };
}
