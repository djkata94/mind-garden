// Shared CORS helpers: reflect the Origin only when allowlisted
// (ALLOWED_ORIGINS, comma-separated). Server-to-server needs no headers.
export function allowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeaders(request) {
  const origin = request?.headers?.get("origin");
  const headers = { Vary: "Origin" };
  if (origin && allowedOrigins().includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}
