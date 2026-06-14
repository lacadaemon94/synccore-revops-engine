const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#dbeafe"/>
  <rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#93c5fd" stroke-width="2"/>
  <path d="M29 19h6v26h-6z" fill="#1d4ed8"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
