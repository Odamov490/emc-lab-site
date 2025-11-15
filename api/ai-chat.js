// api/ai-chat.js  (Vercel Serverless Function)

import OpenAI from "openai";

export default async function handler(req, res) {
  // faqat POST ruxsat
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ENV tekshirish
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY topilmadi!");
    return res
      .status(500)
      .json({ error: "AI sozlanmagan (OPENAI_API_KEY yo‘q)" });
  }

  const client = new OpenAI({ apiKey });

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // messages massividan bitta matn yasaymiz
    const inputText = messages.join("\n");

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: inputText,
    });

    const outputText =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "Javobni olishda xatolik bo‘ldi.";

    return res.status(200).json({ reply: outputText });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ error: "AI server error" });
  }
}
