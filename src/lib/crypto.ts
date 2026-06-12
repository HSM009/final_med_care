import { createHmac, timingSafeEqual } from 'crypto'

// Ensure you define this secret variable in your .env file
const ADMIN_SECRET =
  process.env.ADMIN_ACTION_SECRET || 'fallback-super-secret-key-change-me'

/**
 * Generates a unique SHA-256 HMAC signature for a user's email
 */
export function generateAdminSignature(email: string): string {
  return createHmac('sha256', ADMIN_SECRET).update(email).digest('hex')
}

/**
 * Validates the incoming token using a timing-safe comparison to prevent timing attacks
 */
export function verifyAdminSignature(
  email: string,
  signatureToVerify: string,
): boolean {
  const correctSignature = generateAdminSignature(email)

  const a = Buffer.from(correctSignature, 'hex')
  const b = Buffer.from(signatureToVerify, 'hex')

  if (a.length !== b.length) return false

  // timingSafeEqual prevents malicious actors from guessing signatures byte-by-byte
  return timingSafeEqual(a, b)
}
