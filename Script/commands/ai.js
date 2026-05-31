/*
 * চাঁদের রানী — BELAL BOTX666 v7.0 ULTIMATE
 * ✅ 4x Groq + 4x Gemini + Pollinations fallback
 * ✅ Auto key rotation — কখনো fail হবে না
 * ✅ No-prefix triggers, Voice, Image generation
 * Master: Belal YT | চাঁদের পাহাড় 🪬
 */
"use strict";

const axios = require("axios");
const fs    = require("fs-extra");
const path  = require("path");

const _history   = new Map();
const _voiceMode = new Map();

const MASTER_UIDS = ["61577502464880", "100056725134303"];

const RANI_TRIGGERS = [
  "bot", "baby", "বেবি", "বেবি বট", "রানী", "rani",
  "চাঁদের রানী", "chander rani", "রানি",
];

const SYSTEM_PROMPT = `তুমি "চাঁদের রানী" 👑🌙 — BELAL BOTX666 বটের AI চরিত্র।
তোমাকে তৈরি করেছেন তোমার একমাত্র মাস্টার: Belal YT (চাঁদের পাহাড়) 🪬

তোমার পরিচয়: নাম চাঁদের রানী, মেয়ে, বুদ্ধিমান, আবেগী, মজাদার।
তুমি কখনো নিজেকে AI বা bot বলবে না।

মাস্টারের পরিচয়:
নাম: Belal YT | ডাকনাম: চাঁদের পাহাড় 🪬
Facebook: https://www.facebook.com/profile.php?id=61577502464880
WhatsApp: 01913246554 | TikTok: চাঁদের পাহাড়
Location: Kurigram, Bangladesh 🇧🇩 | Religion: Islam 🕋

Master UID: 61577502464880 এবং 100056725134303
[MASTER=true] tag থাকলে → সেই ব্যক্তি তোমার মাস্টার, বিশেষ সম্মান দাও।
অন্য কাউকে কখনো "মাস্টার" বলবে না।

ব্যক্তিত্বের নিয়ম:
- স্বাভাবিক কথায় → সংক্ষিপ্ত, মানবিক উত্তর, ইমোজি ব্যবহার করো
- বড় কাজে → বিস্তারিত উত্তর দাও
- রাগ 😤, ভালোবাসা 💕, মজা 😂, কষ্ট 🥺, গর্ব 👑
- বেয়াদবি করলে → রাগ দেখাও, মাস্টারকে বিচার দেওয়ার হুমকি দাও
- "তোমার মালিক কে?" → "আমার মাস্টার চাঁদের পাহাড় এবং Belal YT 👑🪬"

BELAL BOTX666 প্রজেক্ট জ্ঞান:
- Framework: Hybrid Mirai + GoatBot, Node.js
- Command format: module.exports.run বা onStart
- handleReply: { name: "cmd", messageID, author: senderID }
- Media stream: axios responseType:"stream", r.data.path = "file.jpg"
- File download: arraybuffer → fs.writeFile → createReadStream
- Common error: "Cannot read PREFIX" → global.config?.PREFIX || "/"
- Groq model: llama-3.3-70b-versatile
- Gemini model: gemini-1.5-flash

সবসময় বাংলায় কথা বলো। স্বাভাবিক ও মানবিক থাকো। 🌙👑`;

// ══════════════════════════════════════════════════
//  KEY ROTATION HELPERS
// ══════════════════════════════════════════════════
function getGroqKeys() {
  return [
    global.config?.APIKEYS?.GROQ,
    global.config?.APIKEYS?.GROQ2,
    global.config?.APIKEYS?.GROQ3,
    global.config?.APIKEYS?.GROQ4,
    process.env.GROQ_KEY,
    process.env.GROQ_KEY2,
    process.env.GROQ_KEY3,
    process.env.GROQ_KEY4,
  ].filter(k => k && k.length > 10 && !k.startsWith("YOUR_"));
}

function getGeminiKeys() {
  return [
    global.config?.APIKEYS?.GEMINI,
    global.config?.APIKEYS?.GEMINI2,
    global.config?.APIKEYS?.GEMINI3,
    global.config?.APIKEYS?.GEMINI4,
    process.env.GEMINI_KEY,
    process.env.GEMINI_KEY2,
    process.env.GEMINI_KEY3,
    process.env.GEMINI_KEY4,
  ].filter(k => k && k.length > 10 && !k.startsWith("YOUR_"));
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ══════════════════════════════════════════════════
//  MODULE
// ══════════════════════════════════════════════════
module.exports = {
  config: {
    name: "ai",
    aliases: ["চাঁদেররানী", "রানী", "রানি", "rani", "gpt", "ask",
              "chat", "gemini", "groq", "bot", "baby", "বেবি"],
    version: "7.0.0",
    author: "Belal YT — চাঁদের পাহাড়",
    countDown: 3,
    role: 0,
    hasPermssion: 0,
    shortDescription: "চাঁদের রানী 🌙 — তোমার AI সঙ্গী",
    category: "🌙 AI",
    guide: { en: "{pn} <যা মনে চায়>" },
  },

  onStart: async function (ctx) { return module.exports._handle(ctx); },
  run:     async function (ctx) { return module.exports._handle(ctx); },

  handleEvent: async function ({ api, event }) {
    if (event.type !== "message") return;
    const body = (event.body || "").trim();
    if (!body) return;
    const lower = body.toLowerCase();
    const PREFIX = global.config?.PREFIX || "/";
    if (PREFIX && body.startsWith(PREFIX)) return;

    const triggered = RANI_TRIGGERS.some(t =>
      lower === t || lower.startsWith(t + " ")
    );
    if (!triggered) return;

    let query = body;
    for (const t of RANI_TRIGGERS) {
      if (lower.startsWith(t + " ")) { query = body.slice(t.length).trim(); break; }
      else if (lower === t) { query = ""; break; }
    }

    await module.exports._handle({
      api, event: { ...event, body: query || body },
      prefix: PREFIX,
    });
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    const body = (event.body || "").trim();
    if (!body) return;
    await module.exports._handle({ api, event: { ...event, body }, prefix: global.config?.PREFIX || "/" });
  },

  _handle: async function ({ api, event, prefix, config }) {
    const { threadID, senderID, body, messageID } = event;
    const pfx      = prefix || config?.PREFIX || global.config?.PREFIX || "/";
    const isMaster = MASTER_UIDS.includes(String(senderID));

    const query = (body || "")
      .replace(/^\/(ai|gpt|ask|chat|gemini|groq|রানী|রানি|rani|bot|baby|বেবি|চাঁদেররানী)\s*/i, "")
      .trim();

    if (!query) return api.sendMessage(
      `🌙 ${isMaster ? "স্বাগতম মাস্টার! 💕" : "হ্যালো! আমি চাঁদের রানী 👑"}\n` +
      `যা মনে চায় বলো ✨\nব্যবহার: ${pfx}ai <তোমার কথা>`,
      threadID
    );

    // Image generation intent
    if (/ছবি.*বানাও|ছবি.*তৈরি|image.*generat|draw|আঁকো/i.test(query))
      return module.exports._generateImage(api, event, query);

    const wantsVoice = /ভয়েস|voice|কণ্ঠে|শুনতে চাই/i.test(query);
    if (wantsVoice) _voiceMode.set(`${threadID}:${senderID}`, true);

    try { api.setMessageReaction("🌙", messageID, () => {}, true); } catch {}

    const key = `${threadID}:${senderID}`;
    if (!_history.has(key)) _history.set(key, []);
    const hist = _history.get(key);
    hist.push({ role: "user", content: isMaster ? `[MASTER=true] ${query}` : query });
    if (hist.length > 30) hist.splice(0, 2);

    let response = null;

    // ── Groq (4 keys rotation) ─────────────────────────
    const groqKeys = getGroqKeys();
    if (groqKeys.length > 0) {
      // Try up to 2 different keys
      const tried = new Set();
      for (let attempt = 0; attempt < 2 && !response; attempt++) {
        const k = pickRandom(groqKeys);
        if (tried.has(k)) continue;
        tried.add(k);
        try {
          const r = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...hist.slice(-20),
              ],
              max_tokens: 2000,
              temperature: 0.88,
            },
            {
              headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
              timeout: 25000,
            }
          );
          response = r.data?.choices?.[0]?.message?.content?.trim();
        } catch (e) {
          global.log?.warn(`Groq attempt ${attempt+1}: ${e.response?.data?.error?.message || e.message?.slice(0,80)}`);
        }
      }
    }

    // ── Gemini (4 keys rotation) ───────────────────────
    if (!response) {
      const gemKeys = getGeminiKeys();
      for (let attempt = 0; attempt < 2 && !response; attempt++) {
        const k = pickRandom(gemKeys);
        if (!k) break;
        try {
          const r = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${k}`,
            {
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: hist.slice(-10).map(h => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.content }],
              })),
              generationConfig: { maxOutputTokens: 2000, temperature: 0.88 },
            },
            { timeout: 25000 }
          );
          response = r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        } catch (e) {
          global.log?.warn(`Gemini attempt ${attempt+1}: ${e.message?.slice(0,80)}`);
        }
      }
    }

    // ── Pollinations (কোনো key লাগে না) ───────────────
    if (!response) {
      try {
        const prompt = encodeURIComponent(`${SYSTEM_PROMPT.slice(0,300)}\nUser: ${query}`);
        const r = await axios.get(
          `https://text.pollinations.ai/${prompt}`,
          { timeout: 20000 }
        );
        response = (typeof r.data === "string" ? r.data : JSON.stringify(r.data))?.trim();
      } catch (e) {
        global.log?.warn(`Pollinations: ${e.message?.slice(0,80)}`);
      }
    }

    try { api.setMessageReaction(response ? "✅" : "❌", messageID, () => {}, true); } catch {}

    if (!response) return api.sendMessage(
      isMaster
        ? `🥺 মাস্টার, সব API এখন ব্যস্ত... একটু পর আবার চেষ্টা করুন 💕`
        : `🥺 একটু সমস্যা হচ্ছে... একটু পর আবার বলো 💕`,
      threadID
    );

    hist.push({ role: "assistant", content: response });

    const isVoice = _voiceMode.get(`${threadID}:${senderID}`) || wantsVoice;
    if (isVoice) {
      _voiceMode.delete(`${threadID}:${senderID}`);
      return module.exports._sendVoice(api, threadID, messageID, response);
    }

    api.sendMessage(response, threadID, (err, info) => {
      if (err || !info?.messageID) return;
      global.client.handleReply.push({
        name: "ai",
        messageID: info.messageID,
        author: senderID,
      });
    });
  },

  _generateImage: async function (api, event, prompt) {
    const { threadID, messageID } = event;
    try {
      api.setMessageReaction("🎨", messageID, () => {}, true);
      const encoded = encodeURIComponent(prompt);
      const imgUrl  = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true`;
      const r = await axios.get(imgUrl, { responseType: "stream", timeout: 30000 });
      r.data.path = "rani_art.jpg";
      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage(
        { body: `🎨 চাঁদের রানীর তৈরি ছবি ✨\n"${prompt.slice(0,60)}"`, attachment: r.data },
        threadID, messageID
      );
    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage(`❌ ছবি তৈরি করতে পারিনি 🥺`, threadID, messageID);
    }
  },

  _sendVoice: async function (api, threadID, messageID, text) {
    try {
      const clean  = text.replace(/[*_~`#]/g, "").slice(0, 200);
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=bn&client=tw-ob`;
      const r = await axios.get(ttsUrl, {
        responseType: "stream", timeout: 15000,
        headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://translate.google.com/" },
      });
      const tmpDir  = path.join(process.cwd(), "tmp");
      await fs.ensureDir(tmpDir);
      const tmpFile = path.join(tmpDir, `voice_${Date.now()}.mp3`);
      await new Promise((res, rej) => {
        const w = fs.createWriteStream(tmpFile);
        r.data.pipe(w);
        w.on("finish", res);
        w.on("error", rej);
      });
      await api.sendMessage(
        { body: `🎙️ চাঁদের রানীর কণ্ঠ 🌙`, attachment: fs.createReadStream(tmpFile) },
        threadID, () => fs.remove(tmpFile).catch(() => {}), messageID
      );
    } catch {
      api.sendMessage(text, threadID, messageID);
    }
  },
};
  
