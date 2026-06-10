import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import crypto from "crypto";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/**
 * Generates a cryptographically random nonce for Content-Security-Policy.
 */
function generateNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

/**
 * Applies security headers to every response.
 * Content-Security-Policy helps prevent XSS attacks.
 * Uses strict CSP in production (with nonce) and relaxed CSP in development
 * (where Vite requires unsafe-inline/eval for HMR).
 */
function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;

  if (!headers.has("Content-Security-Policy")) {
    const nonce = generateNonce();
    // Store nonce for potential use in SSR template rendering
    // @ts-expect-error - custom property for nonce propagation
    response.nonce = nonce;

    if (isDev) {
      // Development mode: Vite needs unsafe-inline/eval for HMR and source maps
      headers.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'nonce-${nonce}'`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "media-src 'self' blob: https:",
          "connect-src 'self' https: wss:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      );
    } else {
      // Production mode: strict CSP with nonce for inline scripts
      // Scripts loaded from the bundle are 'self', inline scripts need nonce
      headers.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          `script-src 'self' 'nonce-${nonce}'`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "media-src 'self' blob: https://*.supabase.co",
          // Restrict connect-src to known origins only
          "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://*.supabase.co",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      );
    }
  }

  // Prevent MIME type sniffing
  if (!headers.has("X-Content-Type-Options")) {
    headers.set("X-Content-Type-Options", "nosniff");
  }

  // Prevent clickjacking
  if (!headers.has("X-Frame-Options")) {
    headers.set("X-Frame-Options", "DENY");
  }

  // Enable browser XSS filter
  if (!headers.has("X-XSS-Protection")) {
    headers.set("X-XSS-Protection", "1; mode=block");
  }

  // Referrer policy
  if (!headers.has("Referrer-Policy")) {
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  // HTTP Strict-Transport-Security (HSTS) — force HTTPS
  if (!headers.has("Strict-Transport-Security")) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Disable feature permissions
  if (!headers.has("Permissions-Policy")) {
    headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CSRF-Token",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applySecurityHeaders(normalized);
    } catch (error) {
      console.error(error);
      const errorResponse = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      return applySecurityHeaders(errorResponse);
    }
  },
};
