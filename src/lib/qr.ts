import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const SECRET = process.env.NEXT_PUBLIC_QR_ENCRYPTION_KEY || "summitflow-qr-secret-2024";

export function generateQRHash(userId: string, eventId: string): string {
  const payload = JSON.stringify({
    uid: userId,
    eid: eventId,
    nonce: uuidv4(),
    ts: Date.now(),
  });
  return CryptoJS.AES.encrypt(payload, SECRET).toString();
}

export function decryptQRHash(hash: string): { uid: string; eid: string; nonce: string; ts: number } | null {
  try {
    const bytes = CryptoJS.AES.decrypt(hash, SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}
