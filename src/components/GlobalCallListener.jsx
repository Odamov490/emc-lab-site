// src/components/GlobalCallListener.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * GlobalCallListener
 * - Foydalanuvchi (me.id) ga kelayotgan qo'ng'iroqlarni eshitadi
 * - Ringtone chaladi
 * - Ekranning o‘ng pastida kichik “Incoming call” popap ko‘rsatadi
 * - "Chatga o'tish" tugmasi bosilganda parent’dan kelgan openChat() ni chaqiradi
 *
 * Firestore’da "calls" kolleksiyasi oldingi AudioCall.jsx bilan bir xil bo‘lishi kerak:
 *  {
 *    callerId,
 *    callerName,
 *    calleeId,
 *    calleeName,
 *    status: "ringing" | "accepted" | "ended",
 *    createdAt
 *  }
 */
export default function GlobalCallListener({ me, openChat }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const ringAudioRef = useRef(null);
  const ringObjRef = useRef(null);

  // Ringtone tayyorlash
  useEffect(() => {
    // ring.mp3 faylini public/sounds/ring.mp3 ga qo‘ying
    const audio = new Audio("/sounds/ring.mp3");
    audio.loop = true;
    audio.volume = 0.8;
    ringObjRef.current = audio;
  }, []);

  // Firestore'dan incoming qo'ng'iroqlarni tinglash
  useEffect(() => {
    if (!me?.id) return;

    // Faqat menga qaratilgan, holati "ringing" bo'lgan qo'ng'iroqlar
    const qCalls = query(
      collection(db, "calls"),
      where("calleeId", "==", me.id),
      where("status", "==", "ringing")
    );

    const unsub = onSnapshot(
      qCalls,
      (snap) => {
        if (snap.empty) {
          setIncomingCall(null);
          stopRing();
          return;
        }
        // Hozircha bitta eng yangisini olamiz
        const doc = snap.docs[0];
        const data = { id: doc.id, ...doc.data() };
        setIncomingCall(data);
        playRing();
      },
      (err) => {
        console.error("GlobalCallListener error:", err);
      }
    );

    return () => {
      unsub();
      stopRing();
    };
  }, [me]);

  const playRing = () => {
    const audio = ringObjRef.current;
    if (!audio) return;

    // Autoplay blok bo‘lmasligi uchun birinchi marta user interaction bo‘lgan:
    audio
      .play()
      .then(() => {
        // OK
      })
      .catch(() => {
        // Agar bloklansa, userga ustida "🔔 Jiringlashni yoqish" tugmasini ko‘rsatamiz
      });
  };

  const stopRing = () => {
    const audio = ringObjRef.current;
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      // ignore
    }
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <div className="rounded-2xl border border-sky-200 bg-white/95 shadow-xl px-3 py-2 text-[11px] text-gray-800 flex items-start gap-2">
        <div className="mt-0.5 text-lg">📞</div>
        <div className="flex-1">
          <div className="text-[11px] font-semibold mb-0.5">
            {incomingCall.callerName || "Yangi qo‘ng‘iroq"}
          </div>
          <div className="text-[10px] text-gray-500 mb-1">
            Sizga audio qo‘ng‘iroq qilmoqda
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                stopRing();
                // Chat tabga o'tishni so'raymiz
                openChat && openChat(incomingCall);
              }}
              className="flex-1 rounded-full bg-sky-600 text-white text-[11px] px-2 py-1 hover:bg-sky-700"
            >
              Chatga o'tish
            </button>
            <button
              type="button"
              onClick={() => {
                // Faqat jiringni to'xtatamiz, call statusini AudioCall boshqaradi
                stopRing();
                setIncomingCall(null);
              }}
              className="rounded-full border border-gray-300 text-[11px] px-2 py-1 hover:bg-gray-50"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
