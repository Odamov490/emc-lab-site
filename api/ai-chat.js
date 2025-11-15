import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt required" });
    }

    // Gemini ulanish
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Chat tarixi formatlash
    const chatMessages = [
      ...history.map(m => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const result = await model.generateContent({
      contents: chatMessages,
    });

    const reply = result.response.text();

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({
      error: "server_error",
      message: "Gemini bilan bog‘lanishda xatolik.",
    });
  }
}
