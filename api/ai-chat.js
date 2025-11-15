// api/ai-chat.js  (Vercel Serverless Function)
import OpenAI from "openai";

const client = new OpenAI({
  // ⚠️ Kalitni Vercel environment'ida OPENAI_API_KEY nomi bilan saqlaganmiz
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Faqat POST ruxsat
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, history } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt required" });
    }

    // Chat tarixini bitta matnga yig‘amiz (oddiy, ammo ishlaydigan usul)
    let conversation = "";
    if (Array.isArray(history)) {
      for (const msg of history) {
        const speaker = msg.role === "user" ? "Foydalanuvchi" : "Yordamchi";
        conversation += `${speaker}: ${msg.text}\n`;
      }
    }
    conversation += `Foydalanuvchi: ${prompt}\nYordamchi:`;

    const response = await client.responses.create({
      model: "gpt-5.1-mini",
      // ❗ Yangi API: faqat `input`, `messages` yo‘q
      input: conversation,
      instructions:
        "Siz EMC Lab saytining AI yordamchisisiz. Savollarga qisqa, aniq va asosan o‘zbek tilida javob bering. Juda rasmiy bo‘lmasin.",
    });

    const outputText =
      response.output?.[0]?.content?.[0]?.text ||
      "Javobni olishda xatolik bo‘ldi.";

    return res.status(200).json({ reply: outputText });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ error: "AI error" });
  }
}
