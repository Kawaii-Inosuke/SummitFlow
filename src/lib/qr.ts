const QR_PREFIX = "SF:";

/**
 * Generate a QR code value for a registration.
 * Uses a simple prefix + registration ID format for clean, easily-scannable QR codes.
 */
export function generateQRHash(registrationId: string): string {
  return `${QR_PREFIX}${registrationId}`;
}

/**
 * Parse a scanned QR code value.
 * Returns the registration ID if it's a valid SummitFlow QR, or null otherwise.
 */
export function parseQRCode(scannedValue: string): string | null {
  if (scannedValue.startsWith(QR_PREFIX)) {
    const regId = scannedValue.slice(QR_PREFIX.length);
    if (regId.length > 0) return regId;
  }
  return null;
}
