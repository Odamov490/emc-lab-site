// api/ai-chat.js  (Vercel Serverless Function)
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    // 🔥 YANGI TO‘G‘RI MODEL
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
    });

    // 🔥 YANGI TOG‘RI NATIJA FORMATI
    const outputText = response.output_text || "Javob topilmadi.";

    return res.status(200).json({ reply: outputText });
  } catch (err) {
    console.error("AI ERROR:", err);
    return res.status(500).json({ error: "AI server error" });
  }
}
