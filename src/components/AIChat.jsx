// src/components/AIChat.jsx

export default function AIChat() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center p-6 max-w-sm rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow">
        <div className="text-4xl mb-3">🤖</div>
        <h2 className="text-lg font-semibold mb-2">AI Assistant (ChatGPT)</h2>
        <p className="text-sm text-gray-600">
          Bu bo‘lim hozir ishlab chiqilmoqda.
          <br />
          Yaqin kunlarda siz to‘g‘ridan-to‘g‘ri ChatGPT bilan suhbatlasha olasiz.
        </p>

        <div className="mt-4 text-xs text-gray-400">
          GPT-5 quvvatidagi AI — tez orada 🔜
        </div>
      </div>
    </div>
  );
}
