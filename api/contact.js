// api/contact.js  (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, test, message } = req.body || {};

    // Minimal validatsiya
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'Name and Email required' });
    }

    // Telegramga yuboriladigan matn
    const text =
      `🧪 Yangi so'rov (EMC Lab)\n` +
      `👤 Ism: ${name}\n` +
      `✉️ Email: ${email}\n` +
      `📱 Tel: ${phone || '-'}\n` +
      `🧰 Sinov: ${test || '-'}\n` +
      `💬 Xabar: ${message || '-'}`;

    // Telegram Bot API (token va chat_id ni ENV orqali oling)
    const tgResp = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tgResp.ok) {
      const errText = await tgResp.text();
      return res.status(500).json({ ok: false, error: 'Telegram send failed', detail: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Server error' });
  }
}
