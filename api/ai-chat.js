// api/ai-chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, history } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Tarixni matnga aylantirish
    let conversation = "";
    if (Array.isArray(history)) {
      for (const m of history) {
        const who = m.role === "user" ? "Foydalanuvchi" : "Yordamchi";
        conversation += `${who}: ${m.text}\n`;
      }
    }
    conversation += `Foydalanuvchi: ${prompt}\nYordamchi:`;

    // Yangi Responses API
    const response = await client.responses.create({
      model: "gpt-5.1-mini",
      input: conversation,
    });

    // To‘g‘ri o‘qish
    const reply =
      response.output?.[0]?.content?.[0]?.text ||
      "Xatolik: javobni o‘qib bo‘lmadi";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ error: "AI error" });
  }
}
