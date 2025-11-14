// src/components/ApplicationChat.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
  collectionGroup,
  where,
  getDocs,
  deleteDoc,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

/**
 * KICHIK UI KOMPONENTLAR
 */
function IconButton({ children, title, onClick, className = "", disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-white/70 hover:bg-black/5 text-sm disabled:opacity-50 " +
        className
      }
    >
      {children}
    </button>
  );
}

function TextButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-[11px] text-sky-600 hover:text-sky-800 hover:underline disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * Xabar turi bo‘yicha ko‘rinish
 */
function MessageContent({ msg }) {
  const { kind, text, fileUrl, fileName } = msg;

  if (kind === "image" && fileUrl) {
    return (
      <div className="space-y-1">
        {text && <div className="whitespace-pre-wrap text-sm">{text}</div>}
        <img
          src={fileUrl}
          alt={fileName || "image"}
          className="max-h-64 rounded-xl border border-black/10 object-cover"
        />
      </div>
    );
  }

  if ((kind === "video" || kind === "circleVideo" || kind === "audio") && fileUrl) {
    const isAudio = kind === "audio";
    const isCircle = kind === "circleVideo";
    return (
      <div className="space-y-1">
        {text && <div className="whitespace-pre-wrap text-sm">{text}</div>}
        {isAudio ? (
          <audio controls className="w-full">
            <source src={fileUrl} />
          </audio>
        ) : (
          <video
            controls
            className={
              isCircle
                ? "rounded-full w-32 h-32 object-cover"
                : "rounded-xl max-h-64 w-full"
            }
          >
            <source src={fileUrl} />
          </video>
        )}
        {fileName && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-sky-100 underline"
          >
            {fileName}
          </a>
        )}
      </div>
    );
  }

  if (kind === "file" && fileUrl) {
    return (
      <div className="space-y-1">
        {text && <div className="whitespace-pre-wrap text-sm">{text}</div>}
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg border border-black/10 bg-white/50 px-3 py-2 text-xs hover:bg-black/5"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-700 text-xs font-semibold">
            📎
          </span>
          <span className="truncate">{fileName || "Faylni ochish"}</span>
        </a>
      </div>
    );
  }

  // Oddiy text
  return <div className="whitespace-pre-wrap text-sm">{text}</div>;
}

/**
 * EMOJI REAKSIYALAR
 */
const REACTION_EMOJIS = ["👍", "😀", "✅", "❗"];

/**
 * ASOSIY CHAT KOMPONENT
 * props: me { id, fullname, photoUrl, role, username }
 */
export default function ApplicationChat({ me }) {
  const [employees, setEmployees] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState("");

  const [replyTo, setReplyTo] = useState(null);

  const [activeEmployee, setActiveEmployee] = useState(null); // null => umumiy chat

  const [pinnedHidden, setPinnedHidden] = useState(false);

  const [dmUnreadMap, setDmUnreadMap] = useState({});

  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const lastMessageRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Voice recording
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recording, setRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordIntervalRef = useRef(null);

  // Circle video recording
  const videoRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoRecordTimer, setVideoRecordTimer] = useState(0);
  const videoRecordIntervalRef = useRef(null);

  /** ====== Hodimlar ro‘yxatini olish (employees) ====== */
  useEffect(() => {
    const qEmp = query(collection(db, "employees"), orderBy("fullname", "asc"));
    const unsub = onSnapshot(
      qEmp,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEmployees(list);
      },
      (err) => console.error("employees snapshot error:", err)
    );
    return () => unsub();
  }, []);

  /** ====== Notification permission so‘rash (bir marta) ====== */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  /** ====== Qaysi chat? umumiymi yoki DM? ====== */
  const chatKey = useMemo(() => {
    if (!me) return null;
    if (!activeEmployee) return "global";
    const a = me.id;
    const b = activeEmployee.id;
    if (!a || !b) return "global";
    const [minId, maxId] = a < b ? [a, b] : [b, a];
    return `dm_${minId}_${maxId}`;
  }, [me, activeEmployee]);

  /** ====== Xabarlarni olish (global yoki DM) ====== */
  useEffect(() => {
    if (!chatKey) return;
    setLoadingMessages(true);
    setPinnedHidden(false);

    let qMsgs;
    if (chatKey === "global") {
      qMsgs = query(
        collection(db, "chatGlobal"),
        orderBy("createdAt", "asc")
      );
    } else {
      qMsgs = query(
        collection(db, "directChats", chatKey, "messages"),
        orderBy("createdAt", "asc")
      );
    }

    const unsub = onSnapshot(
      qMsgs,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(list);
        setLoadingMessages(false);
      },
      (err) => {
        console.error("messages snapshot error:", err);
        setLoadingMessages(false);
      }
    );

    return () => unsub();
  }, [chatKey]);

  /** ====== DM unread map (barcha shaxsiy chatlar uchun) ====== */
  useEffect(() => {
    if (!me) return;
    // directChats/*/messages collectionGroup
    const qDm = query(
      collectionGroup(db, "messages"),
      where("participants", "array-contains", me.id)
    );
    const unsub = onSnapshot(
      qDm,
      (snap) => {
        const map = {};
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          const participants = d.participants || [];
          if (!Array.isArray(participants) || participants.length < 2) return;
          const otherId = participants.find((id) => id !== me.id);
          if (!otherId) return;
          const seenBy = d.seenBy || [];
          if (d.senderId === me.id) return;
          if (seenBy.includes(me.id)) return;
          map[otherId] = (map[otherId] || 0) + 1;
        });
        setDmUnreadMap(map);
      },
      (err) => console.error("dm unread snapshot error:", err)
    );

    return () => unsub();
  }, [me]);

  /** ====== Scroll to bottom ====== */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, chatKey]);

  /** ====== Pinned xabar ====== */
  const pinnedMessage = useMemo(
    () => messages.find((m) => m.pinned) || null,
    [messages]
  );

  /** ====== Sana format ====== */
  const formatTime = (ts) => {
    try {
      const d = ts?.toDate ? ts.toDate() : null;
      if (!d) return "";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  /** ====== Ko‘rinadigan xabarlar (qidiruv bo‘yicha) ====== */
  const visibleMessages = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter((m) => {
      const t = (m.text || "").toLowerCase();
      const s = (m.senderName || "").toLowerCase();
      const f = (m.fileName || "").toLowerCase();
      return t.includes(q) || s.includes(q) || f.includes(q);
    });
  }, [messages, search]);

  /** ====== Yuboriladigan collecction linki ====== */
  const getMessagesCollectionRef = () => {
    if (chatKey === "global") {
      return collection(db, "chatGlobal");
    }
    return collection(db, "directChats", chatKey, "messages");
  };

  /** ====== Xabar yuborish (matn) ====== */
  const handleSend = async () => {
    const text = messageText.trim();
    if (!me || !chatKey) return;
    if (!text && !replyTo) return;

    setSending(true);
    try {
      const colRef = getMessagesCollectionRef();
      const msgBody = {
        text,
        kind: "text",
        senderId: me.id,
        senderName: me.fullname,
        senderPhoto: me.photoUrl || "",
        createdAt: serverTimestamp(),
        reactions: {},
        seenBy: [me.id],
      };

      if (chatKey !== "global" && activeEmployee) {
        msgBody.participants = [me.id, activeEmployee.id];
      }

      if (replyTo) {
        msgBody.replyTo = {
          id: replyTo.id,
          senderName: replyTo.senderName,
          preview:
            (replyTo.text || replyTo.fileName || "").toString().slice(0, 120) ||
            "Xabar",
        };
      }

      await addDoc(colRef, msgBody);
      setMessageText("");
      setReplyTo(null);
    } catch (err) {
      console.error("send message error:", err);
      alert("Xabar yuborishda xato!");
    } finally {
      setSending(false);
    }
  };


  // Enter bosilganda yuborish, Shift+Enter yangi qatordan yozadi
const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // yangi qatordan tushishini bloklaydi
    handleSend();       // xabar yuboradi
  }
};

  /** ====== Fayl yuklash ====== */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !me || !chatKey) return;

    setUploading(true);
    setUploadInfo("Yuklanmoqda: " + file.name);

    try {
      const colRef = getMessagesCollectionRef();
      const basePath =
        chatKey === "global" ? "chatUploads/global" : `chatUploads/${chatKey}`;
      const path = `${basePath}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      let kind = "file";
      if (file.type.startsWith("image/")) kind = "image";
      else if (file.type.startsWith("video/")) kind = "video";
      else if (file.type.startsWith("audio/")) kind = "audio";

      const msgBody = {
        text: messageText.trim(), // caption bo‘lishi mumkin
        kind,
        fileUrl: url,
        fileName: file.name,
        senderId: me.id,
        senderName: me.fullname,
        senderPhoto: me.photoUrl || "",
        createdAt: serverTimestamp(),
        reactions: {},
        seenBy: [me.id],
      };

      if (chatKey !== "global" && activeEmployee) {
        msgBody.participants = [me.id, activeEmployee.id];
      }

      if (replyTo) {
        msgBody.replyTo = {
          id: replyTo.id,
          senderName: replyTo.senderName,
          preview:
            (replyTo.text || replyTo.fileName || "").toString().slice(0, 120) ||
            "Xabar",
        };
      }

      await addDoc(colRef, msgBody);
      setMessageText("");
      setReplyTo(null);
      e.target.value = "";
      setUploadInfo("Yuklandi: " + file.name);
      setTimeout(() => setUploadInfo(""), 1500);
    } catch (err) {
      console.error("file upload error:", err);
      alert("Fayl yuklashda xato!");
    } finally {
      setUploading(false);
    }
  };

  /** ====== Voice message: audio blobni Firestore'ga yuborish ====== */
 const uploadVoiceBlob = async (blob) => {
  if (!me || !chatKey) return;
  setUploading(true);
  setUploadInfo("Ovozli xabar yuklanmoqda...");

  try {
    const colRef = getMessagesCollectionRef();
    const basePath =
      chatKey === "global" ? "voices/global" : `voices/${chatKey}`;
    const fileName = `voice_${Date.now()}.webm`;
    const storageRef = ref(storage, `${basePath}/${fileName}`);

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    const msgBody = {
      text: "",
      kind: "voice",
      fileUrl: url,
      fileName,
      senderId: me.id,
      senderName: me.fullname,
      senderPhoto: me.photoUrl || "",
      createdAt: serverTimestamp(),
      reactions: {},
      seenBy: [me.id],
    };

    if (chatKey !== "global" && activeEmployee) {
      msgBody.participants = [me.id, activeEmployee.id];
    }

    if (replyTo) {
      msgBody.replyTo = {
        id: replyTo.id,
        senderName: replyTo.senderName,
        preview:
          (replyTo.text || replyTo.fileName || "").toString().slice(0, 120) ||
          "Xabar",
      };
    }

    await addDoc(colRef, msgBody);

    setReplyTo(null);
    setUploadInfo("Ovozli xabar yuborildi");
    setTimeout(() => setUploadInfo(""), 1500);   // ✅ muvaffaqiyatli bo‘lsa yo‘qoladi
  } catch (err) {
    console.error("voice upload error:", err);
    alert("Ovozli xabarni yuklashda xato!");
    setUploadInfo("");                            // ✅ xato bo‘lsa ham tozalaymiz
  } finally {
    setUploading(false);
  }
};


  /** ====== Dumaloq video blobini yuborish ====== */
 const uploadCircleVideoBlob = async (blob) => {
  if (!me || !chatKey) return;
  setUploading(true);
  setUploadInfo("Dumaloq video yuklanmoqda...");

  try {
    const colRef = getMessagesCollectionRef();
    const basePath =
      chatKey === "global"
        ? "circleVideos/global"
        : `circleVideos/${chatKey}`;
    const fileName = `circle_${Date.now()}.webm`;
    const storageRef = ref(storage, `${basePath}/${fileName}`);

    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);

    const msgBody = {
      text: "",
      kind: "circleVideo",
      fileUrl: url,
      fileName,
      senderId: me.id,
      senderName: me.fullname,
      senderPhoto: me.photoUrl || "",
      createdAt: serverTimestamp(),
      reactions: {},
      seenBy: [me.id],
    };

    if (chatKey !== "global" && activeEmployee) {
      msgBody.participants = [me.id, activeEmployee.id];
    }

    if (replyTo) {
      msgBody.replyTo = {
        id: replyTo.id,
        senderName: replyTo.senderName,
        preview:
          (replyTo.text || replyTo.fileName || "").toString().slice(0, 120) ||
          "Xabar",
      };
    }

    await addDoc(colRef, msgBody);

    setReplyTo(null);
    setUploadInfo("Dumaloq video yuborildi");
    setTimeout(() => setUploadInfo(""), 1500);   // ✅ muvaffaqiyatli bo‘lsa yo‘qoladi
  } catch (err) {
    console.error("circle video upload error:", err);
    alert("Dumaloq videoni yuklashda xato!");
    setUploadInfo("");                            // ✅ xato bo‘lsa ham tozalaymiz
  } finally {
    setUploading(false);
  }
};


  /** ====== Voice recording bosh/stop ====== */
  const startRecording = async () => {
    if (recording) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Mikrofonga ruxsat yo‘q yoki brauzer qo‘llab-quvvatlamaydi.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];
          stream.getTracks().forEach((t) => t.stop());
          if (blob.size > 0) {
            await uploadVoiceBlob(blob);
          }
        } catch (err) {
          console.error("record stop error:", err);
        }
      };

      recorder.start();
      setRecording(true);
      setRecordTimer(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordTimer((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("startRecording error:", err);
      alert("Mikrofonni ishga tushirib bo‘lmadi.");
    }
  };

  const stopRecording = () => {
    if (!recording) return;
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    } catch (err) {
      console.error("stopRecording error:", err);
    }
    setRecording(false);
    clearInterval(recordIntervalRef.current);
    recordIntervalRef.current = null;
  };

  /** ====== Dumaloq video yozuv bosh/stop ====== */
  const startCircleVideoRecording = async () => {
    if (videoRecording) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Kamera/mikrofon uchun ruxsat yo‘q yoki brauzer qo‘llab-quvvatlamaydi.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      videoRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "video/webm" });
          stream.getTracks().forEach((t) => t.stop());
          if (blob.size > 0) {
            await uploadCircleVideoBlob(blob);
          }
        } catch (err) {
          console.error("circle record stop error:", err);
        }
      };

      recorder.start();
      setVideoRecording(true);
      setVideoRecordTimer(0);
      videoRecordIntervalRef.current = setInterval(() => {
        setVideoRecordTimer((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("startCircleVideoRecording error:", err);
      alert("Kamerani ishga tushirib bo‘lmadi.");
    }
  };

  const stopCircleVideoRecording = () => {
    if (!videoRecording) return;
    try {
      if (
        videoRecorderRef.current &&
        videoRecorderRef.current.state !== "inactive"
      ) {
        videoRecorderRef.current.stop();
      }
    } catch (err) {
      console.error("stopCircleVideoRecording error:", err);
    }
    setVideoRecording(false);
    if (videoRecordIntervalRef.current) {
      clearInterval(videoRecordIntervalRef.current);
      videoRecordIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      // cleanup
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (videoRecordIntervalRef.current)
        clearInterval(videoRecordIntervalRef.current);
      if (
        videoRecorderRef.current &&
        videoRecorderRef.current.state !== "inactive"
      ) {
        videoRecorderRef.current.stop();
      }
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /** ====== Reaksiya toggle ====== */
  const toggleReaction = async (msg, emoji) => {
    if (!me || !chatKey) return;
    try {
      const current = msg.reactions || {};
      const users = new Set(current[emoji] || []);
      if (users.has(me.id)) {
        users.delete(me.id);
      } else {
        users.add(me.id);
      }
      const updated = { ...current, [emoji]: Array.from(users) };
      const msgRef =
        chatKey === "global"
          ? doc(db, "chatGlobal", msg.id)
          : doc(db, "directChats", chatKey, "messages", msg.id);
      await updateDoc(msgRef, { reactions: updated });
    } catch (err) {
      console.error("toggle reaction error:", err);
    }
  };

  /** ====== Pin / Unpin ====== */
  const pinMessage = async (msg) => {
    if (!chatKey) return;
    try {
      const currentPinned = messages.find((m) => m.pinned);
      // old pinnedni olib tashlaymiz
      if (currentPinned) {
        const oldRef =
          chatKey === "global"
            ? doc(db, "chatGlobal", currentPinned.id)
            : doc(db, "directChats", chatKey, "messages", currentPinned.id);
        await updateDoc(oldRef, { pinned: false });
      }
      const msgRef =
        chatKey === "global"
          ? doc(db, "chatGlobal", msg.id)
          : doc(db, "directChats", chatKey, "messages", msg.id);
      await updateDoc(msgRef, { pinned: true });
      setPinnedHidden(false);
    } catch (err) {
      console.error("pin error:", err);
    }
  };

  const unpinMessage = async () => {
    if (!chatKey) return;
    try {
      const currentPinned = messages.find((m) => m.pinned);
      if (!currentPinned) return;
      const msgRef =
        chatKey === "global"
          ? doc(db, "chatGlobal", currentPinned.id)
          : doc(db, "directChats", chatKey, "messages", currentPinned.id);
      await updateDoc(msgRef, { pinned: false });
    } catch (err) {
      console.error("unpin error:", err);
    }
  };

  /** ====== Xabarlarni o‘qilgan deb belgilash (seenBy) ====== */
  useEffect(() => {
    if (!me || !chatKey || messages.length === 0) return;

    const unread = messages.filter(
      (m) =>
        m.senderId !== me.id && !(m.seenBy || []).includes(me.id)
    );
    if (unread.length === 0) return;

    const mark = async () => {
      try {
        for (const m of unread) {
          const msgRef =
            chatKey === "global"
              ? doc(db, "chatGlobal", m.id)
              : doc(db, "directChats", chatKey, "messages", m.id);
          await updateDoc(msgRef, {
            seenBy: arrayUnion(me.id),
          });
        }
      } catch (err) {
        console.error("mark read error:", err);
      }
    };

    mark();
  }, [me, chatKey, messages]);

  /** ====== Toast + brauzer notification (yangi xabar) ====== */
  useEffect(() => {
    if (!me || !chatKey || messages.length === 0) return;
    const last = messages[messages.length - 1];
    const prev = lastMessageRef.current;

    // birinchi load paytida bildirishnoma bermaslik
    if (!prev) {
      lastMessageRef.current = last;
      return;
    }

    if (prev.id === last.id) return;
    lastMessageRef.current = last;

    // agar o‘zim yozgan bo‘lsam — bildirishnoma shart emas
    if (last.senderId === me.id) return;

    const preview = (last.text || last.fileName || "Yangi xabar")
      .toString()
      .slice(0, 80);

    setToast({ id: last.id, text: preview });

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted" &&
      document.hidden
    ) {
      const title = activeEmployee
        ? `${activeEmployee.fullname} dan yangi xabar`
        : "Umumiy chatda yangi xabar";
      try {
        new Notification(title, { body: preview });
      } catch {
        // ignore
      }
    }
  }, [messages, chatKey, me, activeEmployee]);

  /** ====== Toast auto-hide ====== */
  useEffect(() => {
    if (!toast) return;
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [toast]);

  /** ====== Chat tarixini tozalash ====== */
  const clearChatHistory = async () => {
    if (!chatKey) return;
    if (chatKey === "global" && me?.role !== "admin") {
      alert("Umumiy chat tarixini faqat admin tozalashi mumkin.");
      return;
    }
    const confirmText =
      chatKey === "global"
        ? "Umumiy chatdagi BARCHA xabarlar o‘chiriladi. Davom etasizmi?"
        : "Ushbu shaxsiy chatdagi barcha xabarlar o‘chiriladi. Davom etasizmi?";
    if (!window.confirm(confirmText)) return;

    try {
      const colRef = getMessagesCollectionRef();
      const snap = await getDocs(colRef);
      const tasks = snap.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(tasks);
    } catch (err) {
      console.error("clear chat error:", err);
      alert("Tarixni o‘chirishda xato!");
    }
  };

  /** ====== Umumiy / DM sarlavha va izoh ====== */
  const headerTitle = activeEmployee
    ? activeEmployee.fullname
    : "Umumiy chat (barcha hodimlar)";

  const headerSubtitle = activeEmployee
    ? "Shaxsiy xabar almashish (DM)"
    : "Laboratoriya ichki umumiy muloqot xonasi";

  if (!me) {
    return (
      <div className="h-[400px] grid place-items-center text-sm text-gray-500">
        Avval tizimga kiring.
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-3xl border border-black/10 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-lg overflow-hidden flex text-sm">
      {/* LEFT SIDEBAR: Umumiy + Hodimlar */}
      <div className="w-64 border-r border-black/10 bg-white/75 backdrop-blur flex flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-black/10">
          <div className="text-xs text-gray-500">Chat</div>
          <div className="text-sm font-semibold">EMC Lab messenger</div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {/* Umumiy chat tugmasi */}
          <button
            onClick={() => setActiveEmployee(null)}
            className={
              "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-sky-50/80 " +
              (!activeEmployee ? "bg-sky-50/80" : "")
            }
          >
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 text-white text-xs font-semibold grid place-items-center shadow-sm">
              💬
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">
                Umumiy chat
              </div>
              <div className="text-[10px] text-gray-500 truncate">
                Barcha hodimlar uchun
              </div>
            </div>
          </button>

          {/* Hodimlar ro‘yxati */}
          <div className="mt-2 px-3 text-[10px] uppercase tracking-wide text-gray-500">
            Hodimlar
          </div>
          {employees
            .filter((e) => e.id !== me.id)
            .map((e) => {
              const active = activeEmployee?.id === e.id;
              const unread = dmUnreadMap[e.id] || 0;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveEmployee(e)}
                  className={
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-sky-50/80 " +
                    (active ? "bg-sky-50/80" : "")
                  }
                >
                  <div className="h-8 w-8 rounded-full bg-black/5 overflow-hidden grid place-items-center">
                    {e.photoUrl ? (
                      <img
                        src={e.photoUrl}
                        alt=""
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      <span className="text-xs">
                        {e.fullname?.[0] || "👤"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-1 min-w-0 gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {e.fullname}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {e.role || "Hodim"}
                      </div>
                    </div>
                    {unread > 0 && (
                      <span className="inline-flex min-w-[18px] justify-center rounded-full bg-sky-500 text-white text-[10px] px-1">
                        {unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Hozirgi foydalanuvchi pastda */}
        <div className="border-t border-black/10 px-3 py-2 flex items-center gap-2 bg-white/85">
          <div className="h-7 w-7 rounded-full bg-black/5 overflow-hidden grid place-items-center">
            {me?.photoUrl ? (
              <img src={me.photoUrl} alt="" className="h-7 w-7 object-cover" />
            ) : (
              <span className="text-xs">{me?.fullname?.[0] || "👤"}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">
              {me?.fullname || "Foydalanuvchi"}
            </div>
            <div className="text-[10px] text-gray-500 truncate">
              {me?.role || "user"}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Chat oynasi */}
      <div className="relative flex-1 flex flex-col bg-gradient-to-br from-sky-50/60 via-white to-indigo-50/60">
        {/* HEADER */}
        <div className="h-14 border-b border-black/10 px-4 flex items-center justify-between bg-white/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-xs font-semibold grid place-items-center shadow">
              {activeEmployee ? activeEmployee.fullname?.[0] || "👤" : "💬"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{headerTitle}</div>
                {activeEmployee && (
                  <span className="text-[10px] rounded-full bg-sky-100 text-sky-700 px-2 py-0.5">
                    DM
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-500 truncate max-w-[260px]">
                {headerSubtitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="rounded-2xl border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] w-40 focus:outline-none focus:ring-1 focus:ring-sky-400"
              placeholder="Chat ichida qidirish"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <TextButton onClick={clearChatHistory}>Tarixni tozalash</TextButton>
          </div>
        </div>

        {/* PINNED BANNER */}
        {pinnedMessage && !pinnedHidden && (
          <div className="px-4 pt-2">
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-900">
              <span className="mt-0.5">📌</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-[11px]">
                    Pinned xabar — {pinnedMessage.senderName}
                  </div>
                  <div className="flex items-center gap-2">
                    <TextButton onClick={() => setPinnedHidden(true)}>
                      Yopish
                    </TextButton>
                    <TextButton onClick={unpinMessage}>Unpin</TextButton>
                  </div>
                </div>
                <div className="line-clamp-2">
                  <MessageContent msg={pinnedMessage} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES LIST */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loadingMessages && (
            <div className="text-xs text-gray-500 text-center mt-4">
              Xabarlar yuklanmoqda...
            </div>
          )}

          {!loadingMessages && visibleMessages.length === 0 && (
            <div className="text-xs text-gray-400 text-center mt-8">
              Hozircha xabar yo‘q. Birinchi bo‘lib yozib ko‘ring 😊
            </div>
          )}

          {visibleMessages.map((msg) => {
            const isMe = msg.senderId === me?.id;
            const bubbleAlign = isMe ? "items-end" : "items-start";
            const bubbleBg = isMe
              ? "bg-sky-500 text-white"
              : "bg-white text-gray-900";
            const bubbleExtra = isMe ? "rounded-br-sm" : "rounded-bl-sm";

            const reactions = msg.reactions || {};
            const hasReactions = Object.keys(reactions).length > 0;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${bubbleAlign} gap-1`}
              >
                {/* Reply preview (bu xabar kimnidir javobi bo‘lsa) */}
                {msg.replyTo && (
                  <div className="max-w-[70%] text-[10px] text-gray-500 border border-dashed border-gray-200 bg-white/60 rounded-xl px-2 py-1 mb-0.5">
                    <div className="font-semibold text-[10px]">
                      Javob: {msg.replyTo.senderName}
                    </div>
                    <div className="line-clamp-2">
                      {msg.replyTo.preview || "Xabar"}
                    </div>
                  </div>
                )}

                {/* Bubble */}
                <div className="flex items-end gap-2 max-w-[80%]">
                  {!isMe && (
                    <div className="h-7 w-7 rounded-full bg-black/5 overflow-hidden grid place-items-center">
                      {msg.senderPhoto ? (
                        <img
                          src={msg.senderPhoto}
                          alt=""
                          className="h-7 w-7 object-cover"
                        />
                      ) : (
                        <span className="text-[11px]">
                          {msg.senderName?.[0] || "👤"}
                        </span>
                      )}
                    </div>
                  )}
                  <div
                    className={
                      "rounded-2xl px-3 py-2 shadow-sm border border-black/5 text-xs " +
                      bubbleBg +
                      " " +
                      bubbleExtra
                    }
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="font-semibold text-[11px]">
                        {msg.senderName}
                      </div>
                      <div className="text-[9px] opacity-80">
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                    <MessageContent msg={msg} />

                    {/* Reaksiyalar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {REACTION_EMOJIS.map((emoji) => {
                          const userList = reactions[emoji] || [];
                          const active = userList.includes(me?.id);
                          const count = userList.length;
                          return (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => toggleReaction(msg, emoji)}
                              className={
                                "h-6 px-1.5 rounded-full border text-[10px] flex items-center gap-1 " +
                                (active
                                  ? "bg-sky-600 text-white border-sky-600"
                                  : "bg-black/5 text-gray-700 border-black/10")
                              }
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span>{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex-1" />
                      <div className="flex gap-1">
                        <TextButton onClick={() => setReplyTo(msg)}>
                          Reply
                        </TextButton>
                        <TextButton onClick={() => pinMessage(msg)}>
                          📌 Pin
                        </TextButton>
                      </div>
                    </div>

                    {/* Agar reaksiya bor bo‘lsa, kichkina banda ko‘rsatamiz (ixtiyoriy) */}
                    {hasReactions && (
                      <div className="mt-1 flex flex-wrap gap-1 text-[9px] opacity-75">
                        {Object.entries(reactions).map(([emoji, users]) => (
                          <span
                            key={emoji}
                            className="inline-flex items-center gap-1 rounded-full bg-black/10 px-1.5 py-0.5"
                          >
                            <span>{emoji}</span>
                            <span>{users.length}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isMe && (
                    <div className="h-7 w-7 rounded-full bg-black/5 overflow-hidden grid place-items-center">
                      {me?.photoUrl ? (
                        <img
                          src={me.photoUrl}
                          alt=""
                          className="h-7 w-7 object-cover"
                        />
                      ) : (
                        <span className="text-[11px]">
                          {me?.fullname?.[0] || "👤"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* REPLY BAR */}
        {replyTo && (
          <div className="px-4 pb-1">
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-[11px]">
              <div className="flex items-start gap-2">
                <span>↩️</span>
                <div>
                  <div className="font-semibold text-[11px]">
                    {replyTo.senderName} xabariga javob
                  </div>
                  <div className="line-clamp-1 text-gray-600">
                    {(replyTo.text || replyTo.fileName || "Xabar")?.toString()}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-[11px] text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Toast (yangi xabar) */}
        {toast && (
          <div className="absolute bottom-16 right-4 max-w-xs">
            <div className="rounded-2xl border border-sky-200 bg-white/90 shadow-lg px-3 py-2 text-[11px] text-gray-800 flex items-start gap-2">
              <span className="mt-0.5">🔔</span>
              <div className="flex-1">
                <div className="font-semibold text-[11px] mb-0.5">
                  Yangi xabar
                </div>
                <div className="line-clamp-3">{toast.text}</div>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-[11px] text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* INPUT AREA */}
        <div className="border-t border-black/10 bg-white/85 backdrop-blur px-4 py-2">
          {uploadInfo && (
            <div className="text-[11px] text-gray-500 mb-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              {uploadInfo}
            </div>
          )}
          <div className="flex items-end gap-2">
            {/* Fayl tanlash */}
            <IconButton
              title="Fayl (rasm, video, audio, hujjat)"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              📎
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Ovozli xabar tugmasi */}
            <IconButton
              title="Ovozli xabar"
              onClick={recording ? stopRecording : startRecording}
              disabled={uploading}
              className={
                recording
                  ? "border-red-400 bg-red-50 text-red-600"
                  : "border-black/5"
              }
            >
              {recording ? "⏺" : "🎤"}
            </IconButton>

            {/* Dumaloq video tugmasi */}
            <IconButton
              title="Dumaloq video"
              onClick={
                videoRecording
                  ? stopCircleVideoRecording
                  : startCircleVideoRecording
              }
              disabled={uploading}
              className={
                videoRecording
                  ? "border-purple-400 bg-purple-50 text-purple-600"
                  : "border-black/5"
              }
            >
              {videoRecording ? "⏺" : "📹"}
            </IconButton>

            <div className="flex-1">
              {recording && (
                <div className="text-[11px] text-red-600 mb-0.5 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  Ovoz yozilmoqda... {recordTimer}s
                </div>
              )}
              {videoRecording && (
                <div className="text-[11px] text-purple-600 mb-0.5 flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-purple-500 animate-ping" />
                  Dumaloq video yozilmoqda... {videoRecordTimer}s
                </div>
              )}
          <textarea
  rows={1}
  value={messageText}
  onChange={(e) => setMessageText(e.target.value)}
  onKeyDown={handleKeyDown}   // 🔥 MUHIM joy
  placeholder={
    activeEmployee
      ? `${activeEmployee.fullname} bilan chat...`
      : "Umumiy chatga xabar yozing..."
  }
  className="w-full max-h-32 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-sky-400"
/>

            </div>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || (!messageText.trim() && !replyTo)}
              className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-xs font-medium text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Yuborilmoqda..." : "Yuborish"}
              <span>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
