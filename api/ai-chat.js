// api/ai-chat.js  (Vercel Serverless Function)

import OpenAI from "openai";

// 🔐 Kalit faqat serverda, Vercel'dagi OPENAI_API_KEY dan olinadi
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

    // OpenAI Responses API uchun format
    const inputMessages = messages.map((m) => ({
      role: m.role || "user",
      content: [
        {
          type: "input_text",
          text: m.content || "",
        },
      ],
    }));

    const response = await client.responses.create({
      model: "gpt-5.1-mini",
      input: inputMessages,
    });

    const firstOutput = response.output?.[0];
    const firstContent = firstOutput?.content?.[0];

    let replyText = "Javobni olishda xatolik bo‘ldi.";

    if (firstContent?.text) {
      if (typeof firstContent.text === "string") {
        replyText = firstContent.text;
      } else if (typeof firstContent.text.value === "string") {
        replyText = firstContent.text.value;
      } else {
        replyText = String(firstContent.text);
      }
    }

    return res.status(200).json({ reply: replyText });
  } catch (err) {
    console.error("AI error:", err);
    return res
      .status(500)
      .json({ error: "AI error", detail: err.message || String(err) });
  }
}
