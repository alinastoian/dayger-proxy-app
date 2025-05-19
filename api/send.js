/**
 * Vercel serverless function
 * Path: /api/send
 */
export default async function handler(req, res) {
  // ──────────────────────────────────────────────
  // 1. CORS – allow Dayger front-end origins only
  // ──────────────────────────────────────────────
  const allowedOrigins = [
    "https://dayger.co.uk",
    "https://www.dayger.co.uk"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle pre-flight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only POST is accepted for real work
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  // ──────────────────────────────────────────────
  // 2. Forward data to Google Apps Script
  // ──────────────────────────────────────────────
  const body = req.body;

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwXldkZPwNVrg18oXG8yw20U2wLwF5tLn6ye_xSZGYzbnyWBTbLVTpByTzoFWMTTq_bEg/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const resultText = await response.text();

    // Bubble the Apps Script response back to the browser
    return res.status(200).json({ success: true, response: resultText });
  } catch (error) {
    console.error("Proxy error:", error);
    return res
      .status(500)
      .json({ success: false, error: error.message || "Proxy failed" });
  }
}
