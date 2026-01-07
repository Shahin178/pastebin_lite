export function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    const h = req.headers.get("x-test-now-ms");
    if (h) return Number(h);
  }
  return Date.now();
}
