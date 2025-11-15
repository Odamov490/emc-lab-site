// api/ai-chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// vercel serverless function
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    // YANGI 2024 API — "messages" bilan ishlaydi
    const response = await client.responses.create({
      model: "gpt-5.1-mini",
      messages: messages,
    });

    const outputText =
      response.output_text || 
      response.output?.[0]?.content?.[0]?.text ||
      "Javobni olishda xatolik bo‘ldi.";

    return res.status(200).json({ reply: outputText });

  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ error: err.message || "AI error" });
  }
}
