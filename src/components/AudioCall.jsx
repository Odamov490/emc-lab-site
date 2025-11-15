// src/components/AudioCall.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// STUN server (Google)
const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

/**
 * AudioCall
 * props:
 *   me   - { id, fullname, ... }
 *   peer - { id, fullname, ... }  // activeEmployee
 */
export default function AudioCall({ me, peer }) {
  const [status, setStatus] = useState("idle"); // idle | calling | ringing | in-call
  const [incoming, setIncoming] = useState(null); // {callerId, callerName}
  const [error, setError] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callUnsubRef = useRef(null);
  const iceUnsubRef = useRef(null);
  const timerRef = useRef(null);

  // Xona ID: call_userA_userB
  const roomId = useMemo(() => {
    if (!me || !peer) return null;
    const ids = [me.id, peer.id].sort();
    return `call_${ids[0]}_${ids[1]}`;
  }, [me, peer]);

  /** ========= Yordamchilar ========= */

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    setCallSeconds(0);
    timerRef.current = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // RTCPeerConnection + mic
  const createPeerConnection = async (role) => {
    setError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Brauzer mikrofon bilan ishlay olmaydi.");
      return null;
    }

    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    // lokal audio
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    localStreamRef.current = localStream;
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    // remote audio
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    };

    // ICE candidate
    pc.onicecandidate = async (event) => {
      if (!event.candidate || !roomId) return;
      try {
        const iceRef = collection(db, "calls", roomId, "ice");
        await addDoc(iceRef, {
          from: role, // "caller" | "callee"
          candidate: event.candidate.toJSON(), // JSON friendly
          createdAt: Date.now(),
        });
      } catch (e) {
        console.error("add ICE error:", e);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
        endCallLocal();
      }
    };

    return pc;
  };

  const endCallLocal = () => {
    setStatus("idle");
    setIncoming(null);
    setError("");
    clearTimer();

    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
  };

  const endCall = async () => {
    if (roomId) {
      const callRef = doc(db, "calls", roomId);
      try {
        await updateDoc(callRef, { status: "ended" });
      } catch (e) {
        console.error("update ended error:", e);
      }
    }
    endCallLocal();
  };

  /** ========= Qo‘ng‘iroq qilish (caller) ========= */

  const startCall = async () => {
    if (!me || !peer || !roomId) return;
    try {
      const pc = await createPeerConnection("caller");
      if (!pc) return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const callRef = doc(db, "calls", roomId);
      await setDoc(callRef, {
        callerId: me.id,
        callerName: me.fullname || "Foydalanuvchi",
        calleeId: peer.id,
        calleeName: peer.fullname || "Foydalanuvchi",
        offer, // obyekt holida
        status: "calling",
        createdAt: Date.now(),
      });

      setStatus("calling");
    } catch (e) {
      console.error("startCall error:", e);
      setError("Qo‘ng‘iroqni boshlashda xato.");
      endCallLocal();
    }
  };

  /** ========= Kelayotgan qo‘ng‘iroqlarni tinglash ========= */

  useEffect(() => {
    if (!me || !roomId) return;

    const callRef = doc(db, "calls", roomId);
    const unsubCall = onSnapshot(callRef, async (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      // Kelayotgan qo‘ng‘iroq (men callee bo‘lsam)
      if (
        data.calleeId === me.id &&
        data.status === "calling" &&
        status === "idle"
      ) {
        setIncoming({
          callerId: data.callerId,
          callerName: data.callerName,
        });
        setStatus("ringing");
      }

      // Caller tomoni: answer kelganda
      if (
        data.callerId === me.id &&
        data.answer &&
        pcRef.current &&
        status === "calling"
      ) {
        try {
          await pcRef.current.setRemoteDescription(data.answer);
          setStatus("in-call");
          startTimer();
        } catch (e) {
          console.error("setRemoteDescription(answer) error:", e);
          setError("Ulanishda xato.");
          endCallLocal();
        }
      }

      // Ended
      if (data.status === "ended" && status !== "idle") {
        endCallLocal();
      }
    });

    // ICE candidatelarni tinglash
    const iceRef = collection(db, "calls", roomId, "ice");
    const unsubIce = onSnapshot(iceRef, (snap) => {
      const pc = pcRef.current;
      if (!pc) return;
      snap.docChanges().forEach((change) => {
        if (change.type !== "added") return;
        const data = change.doc.data();
        if (!data.candidate) return;
        try {
          const candidate = new RTCIceCandidate(data.candidate);
          pc.addIceCandidate(candidate);
        } catch (e) {
          console.error("addIceCandidate error:", e);
        }
      });
    });

    callUnsubRef.current = unsubCall;
    iceUnsubRef.current = unsubIce;

    return () => {
      unsubCall();
      unsubIce();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, roomId]);

  /** ========= Qabul qilish (callee) ========= */

  const acceptCall = async () => {
    if (!me || !peer || !roomId) return;
    try {
      const callRef = doc(db, "calls", roomId);
      const snap = await getDoc(callRef);
      if (!snap.exists()) {
        setError("Qo‘ng‘iroq topilmadi.");
        setStatus("idle");
        setIncoming(null);
        return;
      }
      const data = snap.data();
      if (!data.offer) {
        setError("Offer mavjud emas.");
        return;
      }

      const pc = await createPeerConnection("callee");
      if (!pc) return;

      await pc.setRemoteDescription(data.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await updateDoc(callRef, {
        answer, // obyekt
        status: "in-call",
      });

      setStatus("in-call");
      setIncoming(null);
      startTimer();
    } catch (e) {
      console.error("acceptCall error:", e);
      setError("Qo‘ng‘iroqni qabul qilishda xato.");
      endCallLocal();
    }
  };

  const rejectCall = async () => {
    await endCall();
  };

  /** ========= Cleanup (komponent unmount) ========= */

  useEffect(() => {
    return () => {
      if (callUnsubRef.current) callUnsubRef.current();
      if (iceUnsubRef.current) iceUnsubRef.current();
      clearTimer();
      endCallLocal();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ========= UI ========= */

  if (!peer) {
    return null; // DM tanlanmagan bo'lsa tugma chiqmasin
  }

  return (
    <div className="flex items-center gap-2 text-[11px]">
      {/* remote audio (ko‘rinmaydi, faqat ovoz) */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      {/* Status / tugmalar */}
      {status === "idle" && (
        <button
          type="button"
          onClick={startCall}
          className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] shadow hover:bg-emerald-600"
        >
          📞 Qo‘ng‘iroq
        </button>
      )}

      {status === "calling" && (
        <div className="flex items-center gap-2">
          <span className="text-amber-600">Qo‘ng‘iroq qilinyapti...</span>
          <button
            type="button"
            onClick={endCall}
            className="px-2 py-1 rounded-full bg-gray-200 text-gray-800 text-[11px]"
          >
            Bekor qilish
          </button>
        </div>
      )}

      {status === "ringing" && incoming && (
        <div className="flex items-center gap-2">
          <span className="text-sky-700">
            Sizga qo‘ng‘iroq kelmoqda: {incoming.callerName}
          </span>
          <button
            type="button"
            onClick={acceptCall}
            className="px-2 py-1 rounded-full bg-emerald-500 text-white text-[11px]"
          >
            Qabul qilish
          </button>
          <button
            type="button"
            onClick={rejectCall}
            className="px-2 py-1 rounded-full bg-red-500 text-white text-[11px]"
          >
            Rad etish
          </button>
        </div>
      )}

      {status === "in-call" && (
        <div className="flex items-center gap-2">
          <span className="text-emerald-700">
            🔊 Qo‘ng‘iroq: {formatDuration(callSeconds)}
          </span>
          <button
            type="button"
            onClick={endCall}
            className="px-2 py-1 rounded-full bg-red-500 text-white text-[11px]"
          >
            Tugatish
          </button>
        </div>
      )}

      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
}
