import { createHmac, timingSafeEqual } from "crypto";

export function signToken(email: string, productUrl: string): string {
  const secret = process.env.ALERT_TOKEN_SECRET;
  if (!secret) {
    throw new Error("ALERT_TOKEN_SECRET is not set");
  }
  return createHmac("sha256", secret)
    .update(`${email}:${productUrl}`)
    .digest("hex");
}

export function verifyToken(
  email: string,
  productUrl: string,
  token: string,
): boolean {
  try {
    const expected = signToken(email, productUrl);
    const expectedBuf = Buffer.from(expected, "hex");
    const tokenBuf = Buffer.from(token, "hex");
    if (expectedBuf.length !== tokenBuf.length) return false;
    return timingSafeEqual(expectedBuf, tokenBuf);
  } catch {
    return false;
  }
}
