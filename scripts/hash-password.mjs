// Usage: npm run hash-password -- "your-strong-password"
import { randomBytes, scryptSync } from "node:crypto";

const pw = process.argv[2];
if (!pw || pw.length < 10) {
  console.error('Usage: npm run hash-password -- "a-strong-password (10+ chars)"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(pw, salt, 64);
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`);
