// api/ai-chat.js  (Vercel serverless function, Gemini bilan)

// 1) npm orqali o‘rnatilgan bo‘lishi kerak:
//    npm install @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";

// 2) Vercel’da Environment Variables ichida:
//    GEMINI_API_KEY = ... (sening Gemini API kaliting)
//    qilib qo‘yilgan bo‘lishi kerak.
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Only POST method allowed for this endpoint" });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    // Frontdan kelgan {role, content} massivini bitta promptga aylantiramiz
    const prompt = messages
      .map((m) => {
        const role = m.role === "assistant" ? "AI" : "User";
        return `${role}: ${m.content}`;
      })
      .join("\n");

    // 🔹 MUHIM: model nomi — gemini-pro
    const model = client.getGenerativeModel({
      model: "gemini-pro",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.response?.text?.() || "Javob topilmadi.";

    return res.status(200).json({ reply: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({
      error: "Gemini API error",
      details: err?.message || String(err),
    });
  }
}
