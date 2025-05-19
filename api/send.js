/**
 * /api/send  –  Vercel serverless function
 * Proxies availability data from the Dayger form to Google Apps Script
 * and handles CORS for dayger.co.uk.
 */

export default async function handler(req, res) {
  /* ────────────────────────────────
     1.  CORS – only allow Dayger site
  ───────────────────────────────────*/
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

  // Pre-flight (OPTIONS) reply
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  /* ────────────────────────────────
     2.  Forward the payload to Apps Script
  ───────────────────────────────────*/
  const body = req.body;   // { email, name, days[] }

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbwXIdkZPwNVrg18oXG8yw20U2wLwF5tLn6ye_xSZGYzbnyWBtBLvTpByTzoFWMTrq_bEg/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const resultText = await response.text();
    return res.status(200).json({ success: true, response: resultText });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

