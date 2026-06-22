export const ALERT_EMAIL_KEY = "qdm:alert-email";

export function getStoredEmail(storage: Record<string, string>): string | null {
  return storage[ALERT_EMAIL_KEY] ?? null;
}

export function setStoredEmail(
  storage: Record<string, string>,
  email: string,
): void {
  storage[ALERT_EMAIL_KEY] = email;
}
