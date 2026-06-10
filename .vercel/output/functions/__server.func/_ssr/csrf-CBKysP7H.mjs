import crypto from "crypto";
const CSRF_SECRET = (() => {
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    throw new Error(
      "CSRF_SECRET environment variable is required. Set it to a random 64-character hex string (e.g. openssl rand -hex 32)."
    );
  }
  return secret;
})();
function generateCsrfToken(userId) {
  return generateCsrfTokenForHour(userId, getCurrentHourSlice());
}
function validateCsrfToken(token, userId) {
  const current = generateCsrfTokenForHour(userId, getCurrentHourSlice());
  if (constantTimeEqual(token, current)) return true;
  const previous = generateCsrfTokenForHour(userId, getCurrentHourSlice(-1));
  if (constantTimeEqual(token, previous)) return true;
  return false;
}
function generateCsrfTokenForHour(userId, hourSlice) {
  const hmac = crypto.createHmac("sha256", CSRF_SECRET);
  hmac.update(userId);
  hmac.update(hourSlice);
  return hmac.digest("hex");
}
function getCurrentHourSlice(offsetHours = 0) {
  const d = /* @__PURE__ */ new Date();
  d.setHours(d.getHours() + offsetHours);
  return d.toISOString().slice(0, 13);
}
function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    const dummy = Buffer.alloc(a.length);
    crypto.timingSafeEqual(Buffer.from(a), dummy);
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
export {
  generateCsrfToken as g,
  validateCsrfToken as v
};
