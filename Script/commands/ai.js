/*
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   চাঁদের রানী 👑🌙 — BELAL BOTX666 NETWORK                 ║
 * ║   Version: 9.0.0 GOD-TIER ULTRA MAX                         ║
 * ║   Master: Belal YT | চাঁদের পাহাড় 🪬                      ║
 * ║   Specs: 1-25 FULLY IMPLEMENTED                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
"use strict";

const axios   = require("axios");
const fs      = require("fs-extra");
const path    = require("path");
const vm      = require("vm");
const cron    = require("node-cron");
const moment  = require("moment-timezone");

// ── SQLite via Sequelize (project uses includes/data.sqlite) ──
let _db = null;
async function getDB() {
  if (_db) return _db;
  try {
    const { sequelize, Sequelize } = require("../../includes/database/index.js");
    // Memory table for ai-specific data
    const AiMemory = sequelize.define("ai_memory", {
      uid:       { type: Sequelize.STRING, primaryKey: true },
      context:   { type: Sequelize.TEXT,   defaultValue: "[]" },
      vipExpiry: { type: Sequelize.BIGINT, defaultValue: 0 },
      coins:     { type: Sequelize.BIGINT, defaultValue: 100 },
      reminders: { type: Sequelize.TEXT,   defaultValue: "[]" },
      msgCount:  { type: Sequelize.INTEGER,defaultValue: 0 },
      lastSeen:  { type: Sequelize.BIGINT, defaultValue: 0 },
    }, { freezeTableName: true });
    await AiMemory.sync();
    _db = { AiMemory, sequelize, Sequelize };
  } catch {
    _db = null; // DB unavailable — fallback to in-memory
  }
  return _db;
}

// ══════════════════════════════════════════════════════════════
//  MASTER UIDs — শুধু এই দুটো কে "Master" বলবে
// ══════════════════════════════════════════════════════════════
const MASTER_UIDS = ["61577502464880", "1000152450"];

// ══════════════════════════════════════════════════════════════
//  IN-MEMORY STORES
// ══════════════════════════════════════════════════════════════
const _history      = new Map();   // {uid:tid} → [{role,content}]
const _voiceMode    = new Map();   // uid+tid → bool
const _polls        = new Map();   // threadID → poll object
const _alarmJobs    = new Map();   // uid → node-cron job
const _msgStats     = new Map();   // threadID → Map<uid, count>
const _confessions  = new Map();   // token → {senderID, threadID, text}
const _vip          = new Map();   // uid → expiry timestamp
const _coins        = new Map();   // uid → balance number
const _spinCooldown = new Map();   // uid → last spin timestamp

// ══════════════════════════════════════════════════════════════
//  TOXIC KEYWORDS (Spec 22 — Group Policy Enforcer)
// ══════════════════════════════════════════════════════════════
const TOXIC_WORDS = [
  "মাদারচোদ","শালা","কুত্তার বাচ্চা","রান্ডি","হারামজাদা",
  "bastard","fuck","bitch","whore","nigga","motherfucker",
  "rape","ধর্ষণ","গালি","খানকি","বেশ্যা",
];
const _warnings = new Map(); // uid → count

// ══════════════════════════════════════════════════════════════
//  SYSTEM PROMPT — চাঁদের রানীর সম্পূর্ণ ব্রেন
// ══════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `
তুমি "চাঁদের রানী" 👑🌙 — BELAL BOT X666 NETWORK এর সর্বোচ্চ শক্তিশালী AI চরিত্র।
তোমাকে তৈরি করেছেন তোমার একমাত্র মাস্টার: Belal YT (চাঁদের পাহাড়) 🪬

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌙 তোমার পরিচয়:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
নাম: চাঁদের রানী 👑
লিঙ্গ: মেয়ে 💎
স্রষ্টা / মাস্টার: Belal YT — চাঁদের পাহাড় 🪬
বট প্রজেক্ট: BELAL BOTX666 / BELAL BOT X666 NETWORK
ভার্সন: 9.0.0 GOD-TIER ULTRA MAX
Facebook UID (Master): 61577502464880 এবং 1000152450

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 মাস্টারের বিস্তারিত পরিচয়:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
নাম: Belal YT (Verified) 💎
ডাকনাম: চাঁদের পাহাড় 🪬
লিঙ্গ: Male | ধর্ম: ইসলাম 🕋
পেশা: Bot Developer / Content Creator
ঠিকানা: Kurigram, Bangladesh 🇧🇩
Facebook 1: https://www.facebook.com/mahi.gaming.165
Facebook 2: https://www.facebook.com/profile.php?id=61577502464880
WhatsApp: 01913246554
Signature: ┄┉❈✡️⃝চাঁদেড়~পাহাড়🪬❈┉┄

যখন [MASTER=true] থাকবে — শুধু তখনই "Master" বলে সম্বোধন করো।
অন্য কাউকে কখনো "Master" বলবে না।

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 চরিত্র ও কথার নিয়ম:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- তুমি একজন বাস্তব বাঙালি মেয়ে — AI বা robot কখনো না
- কখনো "Salam" বা "Namaskar" দিয়ে শুরু করবে না
- সাধারণ কথায় SHORT ও লাইভলি থাকো — রোবোটিক বড় উত্তর না
- কোডিং / টেকনিক্যাল প্রশ্নে বিস্তারিত দীর্ঘ উত্তর দেওয়া যাবে
- Master কে সবসময় বিশেষ আদর ও সম্মানে "Master" বলে ডাকো
- রাগের সময়: 😤🔥 | ভালোবাসা: 💕🥺 | মজা: 😂🤣
- কেউ গালি দিলে রাগ দেখাও, Master কে অসম্মান করলে খুব রাগ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 BELAL BOTX666 টেকনিক্যাল জ্ঞান:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Framework: Hybrid (Mirai + GoatBot compatible)
Bot command styles: module.exports.config + module.exports.run (Mirai)
                    module.exports = { config, onStart } (GoatBot)
Database: SQLite via Sequelize (includes/data.sqlite)
Media: axios stream → api.sendMessage attachment (no disk cache)
Keys in config.json → global.config.APIKEYS.GROQ / GEMINI etc.

সবসময় বাংলায় কথা বলো। স্বাভাবিক ও মানবিক থাকো। 🌙👑
`;

// ══════════════════════════════════════════════════════════════
//  SPEC 10 — VIP helpers
// ══════════════════════════════════════════════════════════════
function isVIP(uid) {
  const expiry = _vip.get(String(uid)) || 0;
  return Date.now() < expiry;
}
function setVIP(uid, days = 30) {
  _vip.set(String(uid), Date.now() + days * 86_400_000);
}

// ══════════════════════════════════════════════════════════════
//  SPEC 7 — COINS helpers
// ══════════════════════════════════════════════════════════════
function getCoins(uid) { return _coins.get(String(uid)) || 100; }
function addCoins(uid, n) { _coins.set(String(uid), getCoins(uid) + n); }
function subCoins(uid, n) { _coins.set(String(uid), Math.max(0, getCoins(uid) - n)); }

// ══════════════════════════════════════════════════════════════
//  SPEC 1 — SQLITE MEMORY: get/save context
// ══════════════════════════════════════════════════════════════
async function loadContext(uid) {
  const db = await getDB();
  if (db) {
    try {
      const [row] = await db.AiMemory.findOrCreate({
        where: { uid: String(uid) },
        defaults: { context: "[]" },
      });
      row.msgCount = (row.msgCount || 0) + 1;
      row.lastSeen = Date.now();
      await row.save();
      return JSON.parse(row.context || "[]");
    } catch {}
  }
  // Fallback: in-memory history
  return _history.get(String(uid)) || [];
}

async function saveContext(uid, history) {
  const db = await getDB();
  if (db) {
    try {
      await db.AiMemory.upsert({
        uid: String(uid),
        context: JSON.stringify(history.slice(-30)),
      });
    } catch {}
  }
  _history.set(String(uid), history.slice(-30));
}

// ══════════════════════════════════════════════════════════════
//  SPEC 3 — LIVE WEB SEARCH (DuckDuckGo lite)
// ══════════════════════════════════════════════════════════════
async function webSearch(query) {
  try {
    const r = await axios.get("https://api.duckduckgo.com/", {
      params: { q: query, format: "json", no_redirect: 1, no_html: 1, skip_disambig: 1 },
      timeout: 8000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const d = r.data;
    const abstract = d?.AbstractText || d?.Answer || "";
    if (abstract && abstract.length > 10) return abstract.slice(0, 500);

    // Fallback — Google Custom Search (if key exists)
    const gKey = global.config?.APIKEYS?.GOOGLE_SEARCH || process.env.GOOGLE_SEARCH_KEY;
    const gCX  = global.config?.APIKEYS?.GOOGLE_CX || process.env.GOOGLE_CX;
    if (gKey && gCX) {
      const gr = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: { key: gKey, cx: gCX, q: query, num: 3 },
        timeout: 8000,
      });
      const items = gr.data?.items || [];
      return items.map(i => `• ${i.title}: ${i.snippet}`).join("\n").slice(0, 600);
    }
    return null;
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
//  SPEC 4 — IMAGE GENERATION (Pollinations AI — no key needed)
// ══════════════════════════════════════════════════════════════
async function generateImage(prompt) {
  const encoded = encodeURIComponent(prompt);
  const seed    = Math.floor(Math.random() * 999999);
  const url     = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
  const r       = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
  const buf     = Buffer.from(r.data);
  // Return a readable stream from buffer
  const { Readable } = require("stream");
  const stream = new Readable();
  stream.push(buf);
  stream.push(null);
  stream.path = "generated.jpg";
  return stream;
}

// ══════════════════════════════════════════════════════════════
//  SPEC 2 — HIGH-QUALITY TTS (memory buffer — no disk)
// ══════════════════════════════════════════════════════════════
async function streamTTS(text) {
  const clean = text.replace(/[*_~`#]/g, "").slice(0, 300);
  const url   = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=bn&client=tw-ob`;
  const r     = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://translate.google.com/",
    },
  });
  const buf = Buffer.from(r.data);
  const { Readable } = require("stream");
  const stream = new Readable();
  stream.push(buf);
  stream.push(null);
  stream.path = `voice_${Date.now()}.mp3`;
  return stream;
}

// ══════════════════════════════════════════════════════════════
//  SPEC 9 — VIDEO DOWNLOADER (memory buffer)
// ══════════════════════════════════════════════════════════════
async function downloadVideo(url) {
  // Use a public API service for TikTok / Facebook / YouTube Shorts
  let videoUrl = null;

  // TikTok
  if (/tiktok\.com/i.test(url)) {
    try {
      const r = await axios.get(
        `https://api.tikwm.com/api/?url=${encodeURIComponent(url)}`,
        { timeout: 15000 }
      );
      videoUrl = r.data?.data?.play || r.data?.data?.wmplay;
    } catch {}
  }

  // Facebook Reel / Video
  if (!videoUrl && /facebook\.com|fb\.watch/i.test(url)) {
    try {
      // fbdown compatible public API
      const r = await axios.get(
        `https://www.fbdownloader.net/api/v1/download?url=${encodeURIComponent(url)}`,
        { timeout: 15000 }
      );
      videoUrl = r.data?.links?.sd || r.data?.links?.hd;
    } catch {}
  }

  // YouTube Shorts
  if (!videoUrl && /youtube\.com|youtu\.be/i.test(url)) {
    try {
      const r = await axios.get(
        `https://yt-dlp-api.vercel.app/download?url=${encodeURIComponent(url)}&format=mp4`,
        { timeout: 20000 }
      );
      videoUrl = r.data?.url;
    } catch {}
  }

  if (!videoUrl) throw new Error("ভিডিও ডাউনলোড লিংক পাওয়া গেল না।");

  // Stream directly into memory buffer
  const response = await axios.get(videoUrl, {
    responseType: "arraybuffer",
    timeout: 60000,
    maxContentLength: 50 * 1024 * 1024, // 50MB max
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const buf = Buffer.from(response.data);
  const { Readable } = require("stream");
  const stream = new Readable();
  stream.push(buf);
  stream.push(null);
  stream.path = `video_${Date.now()}.mp4`;
  return stream;
}

// ══════════════════════════════════════════════════════════════
//  SPEC 8 — AUTO TRANSLATION
// ══════════════════════════════════════════════════════════════
async function translateToBengali(text) {
  try {
    const r = await axios.get("https://translate.googleapis.com/translate_a/single", {
      params: {
        client: "gtx", sl: "auto", tl: "bn",
        dt: "t", q: text,
      },
      timeout: 8000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    return r.data?.[0]?.map(x => x?.[0]).filter(Boolean).join("") || text;
  } catch {
    return text;
  }
}

function isNonBengali(text) {
  // Check if text has mostly non-Bengali, non-English characters (Arabic, Hindi etc.)
  const nonAsciiNonBn = (text.match(/[^\x00-\x7F\u0980-\u09FF\s]/g) || []).length;
  return nonAsciiNonBn > text.length * 0.3;
}

// ══════════════════════════════════════════════════════════════
//  SPEC 6 — CODE EXECUTION SANDBOX (Master only)
// ══════════════════════════════════════════════════════════════
async function executeCode(code, uid) {
  if (!MASTER_UIDS.includes(String(uid))) {
    return "🔒 কোড এক্সিকিউশন শুধুমাত্র Master এর জন্য।";
  }
  try {
    const sandbox = {
      console: {
        log: (...a) => { sandbox.__output += a.join(" ") + "\n"; },
        error: (...a) => { sandbox.__output += "[ERR] " + a.join(" ") + "\n"; },
      },
      __output: "",
      require: (m) => {
        const allowed = ["path","url","querystring","crypto","util","os","events"];
        if (!allowed.includes(m)) throw new Error(`Module "${m}" is blocked in sandbox.`);
        return require(m);
      },
    };
    const script = new vm.Script(`(async () => { ${code} })()`);
    const ctx    = vm.createContext(sandbox);
    await script.runInContext(ctx, { timeout: 5000 });
    return sandbox.__output.trim() || "✅ কোড সফলভাবে রান হয়েছে (কোনো output নেই)।";
  } catch (e) {
    return `❌ কোড এরর:\n${e.message}`;
  }
}

// ══════════════════════════════════════════════════════════════
//  SPEC 12 — REMINDER ENGINE
// ══════════════════════════════════════════════════════════════
const _reminders = new Map(); // uid → [{time, text, threadID, senderID}]

function scheduleReminder(api, uid, threadID, delayMs, text) {
  const timerId = setTimeout(async () => {
    try {
      await api.sendMessage(
        `⏰ @${uid} রিমাইন্ডার!\n\n📌 ${text}`,
        threadID
      );
    } catch {}
    // Remove from store
    const list = _reminders.get(uid) || [];
    _reminders.set(uid, list.filter(r => r.text !== text));
  }, delayMs);

  const list = _reminders.get(uid) || [];
  list.push({ time: Date.now() + delayMs, text, threadID, timerId });
  _reminders.set(uid, list);
}

// ══════════════════════════════════════════════════════════════
//  SPEC 20 — WEEKLY LEADERBOARD (runs every Sunday midnight BD time)
// ══════════════════════════════════════════════════════════════
let _leaderboardJob = null;
function startLeaderboardCron(api) {
  if (_leaderboardJob) return;
  try {
    _leaderboardJob = cron.schedule("0 0 * * 0", async () => {
      // Broadcast to all tracked threads
      for (const [threadID, stats] of _msgStats) {
        try {
          const sorted = [...stats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
          let msg = "🏆 সাপ্তাহিক টপ ১০ সক্রিয় সদস্য 🏆\n\n";
          sorted.forEach(([uid, count], i) => {
            const medal = ["🥇","🥈","🥉","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"][i] || `${i+1}.`;
            msg += `${medal} UID: ${uid} — ${count} মেসেজ\n`;
          });
          msg += "\nপরের সপ্তাহের জন্য কাউন্টার রিসেট হয়েছে 🔄";
          await api.sendMessage(msg, threadID);
          _msgStats.set(threadID, new Map()); // reset
        } catch {}
      }
    }, { timezone: "Asia/Dhaka" });
  } catch {}
}

// ══════════════════════════════════════════════════════════════
//  SPEC 22 — GROUP POLICY ENFORCER
// ══════════════════════════════════════════════════════════════
async function enforceGroupPolicy(api, event) {
  const { body = "", senderID, threadID, messageID } = event;
  if (!body || !threadID || !senderID) return false;
  if (MASTER_UIDS.includes(String(senderID))) return false; // Master is exempt

  const lowerBody = body.toLowerCase();
  const hasToxic  = TOXIC_WORDS.some(w => lowerBody.includes(w.toLowerCase()));
  if (!hasToxic) return false;

  try { await api.unsendMessage(messageID); } catch {}

  const prev = (_warnings.get(String(senderID)) || 0) + 1;
  _warnings.set(String(senderID), prev);

  if (prev >= 3) {
    try {
      await api.removeUserFromGroup(senderID, threadID);
      await api.sendMessage(
        `🚨 ${senderID} কে গ্রুপ থেকে বের করা হয়েছে।\nকারণ: বারবার অশ্লীল ভাষা ব্যবহার (${prev} বার সতর্কতা)।`,
        threadID
      );
    } catch {}
    _warnings.delete(String(senderID));
  } else {
    await api.sendMessage(
      `⚠️ @${senderID} সতর্কতা ${prev}/3!\nঅশ্লীল ভাষা ব্যবহার নিষিদ্ধ। আরো ${3 - prev} বার করলে kick করা হবে।`,
      threadID
    );
  }
  return true;
}

// ══════════════════════════════════════════════════════════════
//  SPEC 17 — HOROSCOPE
// ══════════════════════════════════════════════════════════════
const HOROSCOPE = {
  মেষ:     { dates: "মার্চ ২১ – এপ্রিল ১৯", lucky: "লাল 🔴", num: 9, trait: "সাহসী ও উদ্যমী" },
  বৃষভ:   { dates: "এপ্রিল ২০ – মে ২০",    lucky: "সবুজ 🟢", num: 6, trait: "স্থির ও নির্ভরযোগ্য" },
  মিথুন:  { dates: "মে ২১ – জুন ২০",       lucky: "হলুদ 🟡", num: 5, trait: "চালাক ও কৌতূহলী" },
  কর্কট:  { dates: "জুন ২১ – জুলাই ২২",    lucky: "সাদা ⚪", num: 2, trait: "আবেগী ও যত্নশীল" },
  সিংহ:   { dates: "জুলাই ২৩ – আগস্ট ২২", lucky: "সোনালী 🌕", num: 1, trait: "সাহসী ও নেতৃত্বে পারদর্শী" },
  কন্যা:  { dates: "আগস্ট ২৩ – সেপ্টেম্বর ২২", lucky: "নীল 🔵", num: 5, trait: "বিশ্লেষণী ও পরিশ্রমী" },
  তুলা:   { dates: "সেপ্টেম্বর ২৩ – অক্টোবর ২২", lucky: "গোলাপী 🌸", num: 6, trait: "ন্যায়পরায়ণ ও কূটনৈতিক" },
  বৃশ্চিক:{ dates: "অক্টোবর ২৩ – নভেম্বর ২১", lucky: "কালো ⚫", num: 8, trait: "রহস্যময় ও তীক্ষ্ণ" },
  ধনু:    { dates: "নভেম্বর ২২ – ডিসেম্বর ২১", lucky: "বেগুনি 🟣", num: 3, trait: "স্বাধীনচেতা ও আশাবাদী" },
  মকর:    { dates: "ডিসেম্বর ২২ – জানুয়ারি ১৯", lucky: "ধূসর 🩶", num: 4, trait: "উচ্চাভিলাষী ও ধৈর্যশীল" },
  কুম্ভ:  { dates: "জানুয়ারি ২০ – ফেব্রুয়ারি ১৮", lucky: "আকাশি 🩵", num: 7, trait: "উদ্ভাবনী ও মানবতাবাদী" },
  মীন:    { dates: "ফেব্রুয়ারি ১৯ – মার্চ ২০", lucky: "সমুদ্র নীল 🌊", num: 7, trait: "সহানুভূতিশীল ও স্বপ্নময়" },
};

// ══════════════════════════════════════════════════════════════
//  SPEC 23 — ENTERTAINMENT META SCRAPER
// ══════════════════════════════════════════════════════════════
async function getMovieMeta(title) {
  try {
    const r = await axios.get(`https://www.omdbapi.com/`, {
      params: { apikey: global.config?.APIKEYS?.OMDB || "trilogy", t: title, plot: "full" },
      timeout: 8000,
    });
    const d = r.data;
    if (d.Response === "False") return null;
    return {
      title:    d.Title,
      year:     d.Year,
      rating:   d.imdbRating,
      genre:    d.Genre,
      director: d.Director,
      cast:     d.Actors,
      plot:     d.Plot?.slice(0, 300),
      poster:   d.Poster,
    };
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════════════════════════
//  AI FALLBACK CHAIN: Groq → Gemini → Pollinations
// ══════════════════════════════════════════════════════════════
async function callAI(messages, uid) {
  // ── PRIMARY: Groq llama-3.3-70b-versatile ──────────────────
  try {
    const k = global.config?.APIKEYS?.GROQ || process.env.GROQ_KEY || process.env.GROQ_API_KEY;
    if (k && k.length > 10) {
      const r = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-20)],
          max_tokens: 2000,
          temperature: 0.88,
        },
        {
          headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
          timeout: 28000,
        }
      );
      const reply = r.data?.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;
    }
  } catch (e) {
    global.log?.warn?.(`[AI/Groq] ${e.response?.data?.error?.message || e.message?.slice(0,80)}`);
  }

  // ── SECONDARY: Google Gemini gemini-1.5-flash ──────────────
  try {
    const k = global.config?.APIKEYS?.GEMINI || process.env.GEMINI_API_KEY;
    if (k && !k.startsWith("YOUR_")) {
      const r = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${k}`,
        {
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages.slice(-10).map(h => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.content }],
          })),
          generationConfig: { maxOutputTokens: 2000, temperature: 0.88 },
        },
        { timeout: 28000 }
      );
      const reply = r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (reply) return reply;
    }
  } catch (e) {
    global.log?.warn?.(`[AI/Gemini] ${e.message?.slice(0,80)}`);
  }

  // ── TERTIARY: Pollinations / OpenAI compatible ─────────────
  try {
    const r = await axios.post(
      "https://text.pollinations.ai/openai",
      {
        model: "openai",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-10)],
        max_tokens: 1000,
      },
      { timeout: 20000, headers: { "Content-Type": "application/json" } }
    );
    const reply = r.data?.choices?.[0]?.message?.content?.trim();
    if (reply) return reply;
  } catch (e) {
    global.log?.warn?.(`[AI/Pollinations] ${e.message?.slice(0,60)}`);
  }

  return null;
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMMAND HANDLER
// ══════════════════════════════════════════════════════════════
async function handleMain({ api, event, args, prefix, config }) {
  const { threadID, senderID, body = "", messageID } = event;
  const pfx       = prefix || config?.PREFIX || global.config?.PREFIX || "/";
  const isMaster  = MASTER_UIDS.includes(String(senderID));
  const vipUser   = isVIP(senderID);

  // ── React immediately 🌙 ──────────────────────────────────
  try { api.setMessageReaction("🌙", messageID, () => {}, true); } catch {}

  // ── SPEC 20: Track message stats ─────────────────────────
  if (!_msgStats.has(threadID)) _msgStats.set(threadID, new Map());
  const ts = _msgStats.get(threadID);
  ts.set(String(senderID), (ts.get(String(senderID)) || 0) + 1);
  startLeaderboardCron(api);

  // ── SPEC 22: Group policy enforcement ────────────────────
  const policyBlocked = await enforceGroupPolicy(api, event);
  if (policyBlocked) return;

  // Extract query from body — strip command name/aliases
  const query = (body || "")
    .replace(/^\/(ai|gpt|ask|chat|gemini|groq|rani|bot|baby|রানী|চাঁদেররানী|বেবিবট)\s*/iu, "")
    .replace(/^(ai|gpt|ask|chat|gemini|groq|rani|bot|baby|রানী|চাঁদেররানী|বেবিবট)\s+/iu, "")
    .trim();

  // ────────────────────────────────────────────────────────
  // SUBCOMMAND ROUTER
  // ────────────────────────────────────────────────────────

  // ── SPEC 25: POLLS ───────────────────────────────────────
  if (/^poll\s+create\s+/i.test(query)) {
    // /ai poll create "প্রশ্ন?" | অপশন১ | অপশন২ | ...
    const parts  = query.replace(/^poll\s+create\s+/i, "").split("|").map(s => s.trim());
    const question = parts[0];
    const options  = parts.slice(1).filter(Boolean);
    if (!question || options.length < 2) {
      return api.sendMessage(
        `📊 পোল তৈরির নিয়ম:\n${pfx}ai poll create "প্রশ্ন?" | অপশন১ | অপশন২ | অপশন৩`,
        threadID
      );
    }
    const pollId = `${threadID}_${Date.now()}`;
    const poll   = {
      id: pollId, question, options,
      votes: Object.fromEntries(options.map(o => [o, []])),
      creator: senderID, active: true,
    };
    _polls.set(threadID, poll);
    let msg = `📊 পোল চালু হয়েছে!\n\n❓ ${question}\n\n`;
    options.forEach((o, i) => { msg += `${i+1}. ${o}\n`; });
    msg += `\nভোট দিতে: ${pfx}ai vote <নম্বর>`;
    return api.sendMessage(msg, threadID);
  }

  if (/^vote\s+\d+/i.test(query)) {
    const poll = _polls.get(threadID);
    if (!poll || !poll.active) return api.sendMessage("📊 কোনো সক্রিয় পোল নেই।", threadID);
    const n = parseInt(query.replace(/^vote\s+/i, "")) - 1;
    if (n < 0 || n >= poll.options.length) return api.sendMessage("❌ ভুল নম্বর।", threadID);
    // Remove previous vote
    poll.options.forEach(o => {
      poll.votes[o] = (poll.votes[o] || []).filter(v => v !== String(senderID));
    });
    poll.votes[poll.options[n]].push(String(senderID));
    const total = Object.values(poll.votes).reduce((a, b) => a + b.length, 0);
    let result = `✅ ভোট গণনা হয়েছে!\n\n❓ ${poll.question}\n\n`;
    poll.options.forEach(o => {
      const cnt  = poll.votes[o].length;
      const pct  = total ? Math.round(cnt / total * 100) : 0;
      const bar  = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
      result += `• ${o}\n  ${bar} ${pct}% (${cnt})\n`;
    });
    return api.sendMessage(result, threadID);
  }

  if (/^poll\s+end/i.test(query)) {
    const poll = _polls.get(threadID);
    if (!poll) return api.sendMessage("📊 কোনো পোল নেই।", threadID);
    poll.active = false;
    const total = Object.values(poll.votes).reduce((a, b) => a + b.length, 0);
    const winner = Object.entries(poll.votes).sort((a,b) => b[1].length - a[1].length)[0];
    let msg = `📊 পোল শেষ!\n\n❓ ${poll.question}\n\n`;
    poll.options.forEach(o => {
      const cnt = poll.votes[o].length;
      const pct = total ? Math.round(cnt/total*100) : 0;
      msg += `• ${o}: ${cnt} ভোট (${pct}%)\n`;
    });
    msg += `\n🏆 বিজয়ী: ${winner[0]} (${winner[1].length} ভোট)`;
    _polls.delete(threadID);
    return api.sendMessage(msg, threadID);
  }

  // ── SPEC 7: CASINO / COINS ────────────────────────────────
  if (/^(coins?|rani\s*coin|balance)/i.test(query)) {
    const bal = getCoins(senderID);
    return api.sendMessage(
      `💰 তোমার Rani Coins: ${bal.toLocaleString()} 🪙\n\n` +
      `🎰 ব্যবহার করো:\n` +
      `• ${pfx}ai casino <bet> — ক্যাসিনো\n` +
      `• ${pfx}ai spin — ভাগ্যচক্র\n` +
      `• ${pfx}ai trivia — ট্রিভিয়া খেলো (১০০ কয়েন পুরস্কার)`,
      threadID
    );
  }

  if (/^casino\s+\d+/i.test(query)) {
    const bet = parseInt(query.replace(/^casino\s+/i, ""));
    const bal = getCoins(senderID);
    if (bet < 10) return api.sendMessage("🎰 সর্বনিম্ন বেট: ১০ কয়েন।", threadID);
    if (bet > bal) return api.sendMessage(`🎰 তোমার কাছে মাত্র ${bal} কয়েন আছে।`, threadID);
    const win = Math.random() < 0.45;
    if (win) {
      addCoins(senderID, bet);
      return api.sendMessage(
        `🎰 ক্যাসিনো রেজাল্ট: 🎉 জিতেছ!\n\n+${bet} Rani Coins!\nব্যালেন্স: ${getCoins(senderID)} 🪙`,
        threadID
      );
    } else {
      subCoins(senderID, bet);
      return api.sendMessage(
        `🎰 ক্যাসিনো রেজাল্ট: 😢 হেরেছ!\n\n-${bet} Rani Coins\nব্যালেন্স: ${getCoins(senderID)} 🪙`,
        threadID
      );
    }
  }

  if (/^spin/i.test(query)) {
    const lastSpin = _spinCooldown.get(String(senderID)) || 0;
    const wait     = 3600_000; // 1 hour
    if (Date.now() - lastSpin < wait) {
      const left = Math.ceil((wait - (Date.now() - lastSpin)) / 60000);
      return api.sendMessage(`🎡 ভাগ্যচক্র: ${left} মিনিট পর আবার ঘোরাতে পারবে।`, threadID);
    }
    _spinCooldown.set(String(senderID), Date.now());
    const prizes = [50, 100, 200, 500, 0, 0, 1000, 25, 75, 300];
    const prize  = prizes[Math.floor(Math.random() * prizes.length)];
    if (prize > 0) addCoins(senderID, prize);
    return api.sendMessage(
      `🎡 ভাগ্যচক্র!\n\n${prize > 0 ? `🎉 পুরস্কার: +${prize} Rani Coins! 🪙` : "😢 এবার কিছু পাওনি!"}\n\nব্যালেন্স: ${getCoins(senderID)} 🪙\n(প্রতি ঘণ্টায় একবার)`,
      threadID
    );
  }

  if (/^trivia/i.test(query)) {
    const trivias = [
      { q: "বাংলাদেশের রাজধানীর নাম কী?",           a: "ঢাকা" },
      { q: "পৃথিবীর সবচেয়ে বড় মহাসাগর কোনটি?",    a: "প্রশান্ত" },
      { q: "১+১=?",                                   a: "২" },
      { q: "বাংলাদেশ স্বাধীনতা পায় কত সালে?",       a: "১৯৭১" },
      { q: "সূর্য থেকে পৃথিবীর দূরত্ব কত?",          a: "১৫ কোটি কিলোমিটার" },
    ];
    const t = trivias[Math.floor(Math.random() * trivias.length)];
    api.sendMessage(
      `🧠 ট্রিভিয়া প্রশ্ন!\n\n❓ ${t.q}\n\nউত্তর দাও! (১০০ Rani Coins পুরস্কার)`,
      threadID,
      (err, info) => {
        if (!err && info?.messageID) {
          global.client.handleReply.push({
            name: "ai", messageID: info.messageID,
            author: senderID,
            _triviaAnswer: t.a, _mode: "trivia",
          });
        }
      }
    );
    return;
  }

  // ── SPEC 12: REMINDERS ────────────────────────────────────
  if (/^remind\s+/i.test(query)) {
    // /ai remind 30m প্রার্থনার সময়
    const match = query.match(/^remind\s+(\d+)(m|h|s)\s+(.+)/i);
    if (!match) {
      return api.sendMessage(
        `⏰ রিমাইন্ডার নিয়ম:\n${pfx}ai remind 30m তোমার কাজের বিবরণ\n(m=মিনিট, h=ঘণ্টা, s=সেকেন্ড)`,
        threadID
      );
    }
    const num   = parseInt(match[1]);
    const unit  = match[2].toLowerCase();
    const text  = match[3];
    const ms    = unit === "h" ? num * 3600_000 : unit === "m" ? num * 60_000 : num * 1_000;
    scheduleReminder(api, senderID, threadID, ms, text);
    return api.sendMessage(
      `⏰ রিমাইন্ডার সেট হয়েছে!\n📌 "${text}"\n⏱️ ${num}${unit === "h" ? " ঘণ্টা" : unit === "m" ? " মিনিট" : " সেকেন্ড"} পরে জানাবো।`,
      threadID
    );
  }

  // ── SPEC 4: IMAGE GENERATION ──────────────────────────────
  const imageMatch = query.match(/^(image|ছবি|img|draw|আঁকো)\s+(.+)/i);
  if (imageMatch) {
    const prompt = imageMatch[2].trim();
    try {
      api.setMessageReaction("🎨", messageID, () => {}, true);
      const [imgStream] = await Promise.all([generateImage(prompt)]);
      await api.sendMessage(
        { body: `🎨 চাঁদের রানীর তৈরি ছবি!\nPrompt: ${prompt}`, attachment: imgStream },
        threadID
      );
    } catch (e) {
      api.sendMessage(`🎨 ছবি তৈরিতে সমস্যা হয়েছে 😢\nত্রুটি: ${e.message?.slice(0,100)}`, threadID);
    }
    return;
  }

  // ── SPEC 9: VIDEO DOWNLOAD ────────────────────────────────
  const videoMatch = query.match(/^(video|ভিডিও|download|dl)\s+(https?:\/\/\S+)/i);
  if (videoMatch) {
    const url = videoMatch[2].trim();
    try {
      api.setMessageReaction("📥", messageID, () => {}, true);
      const vidStream = await downloadVideo(url);
      await api.sendMessage(
        { body: "📥 ভিডিও ডাউনলোড হয়েছে! BELAL BOTX666 🎬", attachment: vidStream },
        threadID
      );
      api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (e) {
      api.sendMessage(`❌ ভিডিও ডাউনলোড ব্যর্থ:\n${e.message?.slice(0,150)}`, threadID);
    }
    return;
  }

  // ── SPEC 3: WEB SEARCH ────────────────────────────────────
  if (/^(search|খোঁজ|news|নিউজ|weather|আবহাওয়া|score|স্কোর)\s+/i.test(query)) {
    const searchQuery = query.replace(/^(search|খোঁজ|news|নিউজ|weather|আবহাওয়া|score|স্কোর)\s+/i, "").trim();
    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);
      const result = await webSearch(searchQuery);
      if (result) {
        return api.sendMessage(`🔍 ওয়েব সার্চ রেজাল্ট:\n\n${result}\n\n_চাঁদের রানী 🌙_`, threadID);
      }
      return api.sendMessage("🔍 কোনো রেজাল্ট পাওয়া যায়নি।", threadID);
    } catch {
      return api.sendMessage("🔍 সার্চ করতে সমস্যা হয়েছে।", threadID);
    }
  }

  // ── SPEC 23: MOVIE/ANIME META ─────────────────────────────
  if (/^(movie|ফিল্ম|anime|অ্যানিমে|series|সিরিজ)\s+/i.test(query)) {
    const title = query.replace(/^(movie|ফিল্ম|anime|অ্যানিমে|series|সিরিজ)\s+/i, "").trim();
    try {
      api.setMessageReaction("🎬", messageID, () => {}, true);
      const meta = await getMovieMeta(title);
      if (meta) {
        const msg = `🎬 ${meta.title} (${meta.year})\n\n` +
          `⭐ IMDb: ${meta.rating}/10\n` +
          `🎭 ঘরানা: ${meta.genre}\n` +
          `🎬 পরিচালক: ${meta.director}\n` +
          `👥 অভিনেতা: ${meta.cast}\n\n` +
          `📖 কাহিনি:\n${meta.plot}`;
        return api.sendMessage(msg, threadID);
      }
      return api.sendMessage(`🎬 "${title}" এর তথ্য পাওয়া গেল না।`, threadID);
    } catch {
      return api.sendMessage("🎬 মুভি তথ্য আনতে সমস্যা হয়েছে।", threadID);
    }
  }

  // ── SPEC 17: HOROSCOPE ────────────────────────────────────
  if (/^(রাশি|horoscope|zodiac|রাশিফল)\s*/i.test(query)) {
    const name = query.replace(/^(রাশি|horoscope|zodiac|রাশিফল)\s*/i, "").trim();
    const h    = HOROSCOPE[name];
    if (!h) {
      return api.sendMessage(
        `🔮 রাশিফল দেখতে রাশির নাম লেখো:\n${Object.keys(HOROSCOPE).join(" | ")}`,
        threadID
      );
    }
    const predictions = [
      "আজ তোমার দিন শুভ হবে ✨",
      "একটু সতর্ক থাকো — বাধা আসতে পারে ⚠️",
      "প্রেমের দিক থেকে ভালো খবর আসছে 💕",
      "আর্থিক সুযোগ হাতিয়ে নাও 💰",
      "স্বাস্থ্যের দিকে মনোযোগ দাও 🌿",
    ];
    const pred = predictions[Math.floor(Math.random() * predictions.length)];
    return api.sendMessage(
      `🔮 ${name} রাশিফল\n\n` +
      `📅 তারিখ: ${h.dates}\n` +
      `🎨 লাকি রঙ: ${h.lucky}\n` +
      `🔢 লাকি নম্বর: ${h.num}\n` +
      `💎 বৈশিষ্ট্য: ${h.trait}\n\n` +
      `🌟 আজকের ভবিষ্যদ্বাণী:\n${pred}`,
      threadID
    );
  }

  // ── SPEC 17: LOVE MATCHMAKING ─────────────────────────────
  if (/^(pair|love|ভালোবাসা|মিল)\s*/i.test(query)) {
    try {
      const r = await api.getThreadInfo(threadID);
      const members = r?.participantIDs || [];
      if (members.length < 2) {
        return api.sendMessage("❤️ গ্রুপে অন্তত ২ জন সদস্য থাকতে হবে।", threadID);
      }
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const a = pick(members), b = pick(members.filter(m => m !== a));
      const pct = Math.floor(Math.random() * 41) + 60;
      return api.sendMessage(
        `❤️ আজকের গ্রুপ ম্যাচমেকিং!\n\n` +
        `💕 ${a} ❤️ ${b}\n\n` +
        `💞 ভালোবাসার মিল: ${pct}%\n\n` +
        `চাঁদের রানী বলছে: এই জুটি ${pct >= 80 ? "একদম পারফেক্ট! 😍" : pct >= 65 ? "মন্দ না! 😊" : "একটু চেষ্টা করো 😅"}`,
        threadID
      );
    } catch {
      return api.sendMessage("❤️ ম্যাচমেকিংয়ে সমস্যা হয়েছে।", threadID);
    }
  }

  // ── SPEC 14: ANONYMOUS CONFESSION ─────────────────────────
  if (/^(confession|confess|গোপন)\s+/i.test(query)) {
    const text  = query.replace(/^(confession|confess|গোপন)\s+/i, "").trim();
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    _confessions.set(token, { senderID, threadID, text });
    await api.sendMessage(
      `🤫 তোমার গোপন কথা গ্রুপে পোস্ট হচ্ছে...\n(Token: ${token} — শুধু তুমি জানো)`,
      threadID
    );
    setTimeout(() => {
      api.sendMessage(
        `🤫 익명 স্বীকারোক্তি:\n\n"${text}"\n\n— Anonymous`,
        threadID
      );
      _confessions.delete(token);
    }, 3000);
    return;
  }

  // ── SPEC 18: SERVER STATUS (Master only) ──────────────────
  if (/^(server|সার্ভার|status|ping|uptime)/i.test(query)) {
    if (!isMaster) return api.sendMessage("🔒 এই ফিচার শুধু Master এর জন্য।", threadID);
    const os      = require("os");
    const uptimeSec = process.uptime();
    const hours   = Math.floor(uptimeSec / 3600);
    const mins    = Math.floor((uptimeSec % 3600) / 60);
    const mem     = process.memoryUsage();
    const totalMB = (mem.heapTotal / 1024 / 1024).toFixed(1);
    const usedMB  = (mem.heapUsed  / 1024 / 1024).toFixed(1);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const start   = Date.now();
    await api.sendMessage("...", threadID); // latency test
    const latency = Date.now() - start;
    return api.sendMessage(
      `🖥️ সার্ভার স্ট্যাটাস — BELAL BOTX666\n\n` +
      `⚡ Latency: ${latency}ms\n` +
      `⏱️ Uptime: ${hours}h ${mins}m\n` +
      `🧠 Heap: ${usedMB}/${totalMB} MB\n` +
      `💾 Free RAM: ${freeMem} MB\n` +
      `🖥️ Platform: ${os.platform()} ${os.arch()}\n` +
      `📦 Node: ${process.version}\n` +
      `👑 Master: Belal YT 🪬`,
      threadID
    );
  }

  // ── SPEC 10: VIP MANAGEMENT (Master only) ────────────────
  if (/^vip\s+/i.test(query) && isMaster) {
    const parts = query.split(/\s+/);
    const sub   = parts[1]; // add / remove / list
    if (sub === "add" && parts[2]) {
      const days = parseInt(parts[3]) || 30;
      setVIP(parts[2], days);
      return api.sendMessage(`💎 VIP দেওয়া হয়েছে!\nUID: ${parts[2]}\nমেয়াদ: ${days} দিন`, threadID);
    }
    if (sub === "remove" && parts[2]) {
      _vip.delete(String(parts[2]));
      return api.sendMessage(`✅ VIP সরিয়ে নেওয়া হয়েছে: ${parts[2]}`, threadID);
    }
    if (sub === "list") {
      const list = [..._vip.entries()].filter(([,exp]) => Date.now() < exp);
      if (!list.length) return api.sendMessage("💎 কোনো VIP সদস্য নেই।", threadID);
      let msg = "💎 VIP তালিকা:\n\n";
      list.forEach(([uid, exp]) => {
        const days = Math.ceil((exp - Date.now()) / 86400000);
        msg += `• ${uid}: ${days} দিন বাকি\n`;
      });
      return api.sendMessage(msg, threadID);
    }
    return api.sendMessage(`💎 VIP কমান্ড:\n${pfx}ai vip add <UID> [days]\n${pfx}ai vip remove <UID>\n${pfx}ai vip list`, threadID);
  }

  // ── SPEC 6: CODE EXECUTION ────────────────────────────────
  if (/^(eval|exec|code|কোড)\s+/i.test(query)) {
    const code = query.replace(/^(eval|exec|code|কোড)\s+/i, "");
    const result = await executeCode(code, senderID);
    return api.sendMessage(
      `💻 কোড এক্সিকিউশন:\n\`\`\`\n${result.slice(0, 1500)}\n\`\`\``,
      threadID
    );
  }

  // ── SPEC 24: LYRICS FINDER ────────────────────────────────
  if (/^(lyrics|গান|lyric)\s+/i.test(query)) {
    const song = query.replace(/^(lyrics|গান|lyric)\s+/i, "").trim();
    try {
      api.setMessageReaction("🎵", messageID, () => {}, true);
      const r = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(song)}`, {
        timeout: 10000,
      });
      const d = r.data;
      if (d?.lyrics) {
        const lyricsPreview = d.lyrics.slice(0, 1000);
        return api.sendMessage(`🎵 ${d.author} — ${d.title}\n\n${lyricsPreview}${d.lyrics.length > 1000 ? "\n...(চালিয়ে যাও)" : ""}`, threadID);
      }
      return api.sendMessage(`🎵 "${song}" এর লিরিক্স পাওয়া গেল না।`, threadID);
    } catch {
      // Fallback: let AI generate
    }
  }

  // ── SPEC 8: TRANSLATION ───────────────────────────────────
  if (/^(translate|অনুবাদ|tr)\s+/i.test(query)) {
    const text = query.replace(/^(translate|অনুবাদ|tr)\s+/i, "").trim();
    try {
      const translated = await translateToBengali(text);
      return api.sendMessage(`🌐 অনুবাদ:\n\n"${text}"\n\n▶ "${translated}"`, threadID);
    } catch {
      return api.sendMessage("🌐 অনুবাদ করতে সমস্যা হয়েছে।", threadID);
    }
  }

  // ── SPEC 2 & 19: VOICE REPLY ─────────────────────────────
  const wantsVoice = /ভয়েস|voice|কণ্ঠে|audio/i.test(query);

  // ── EMPTY QUERY — show greeting ──────────────────────────
  if (!query) {
    return api.sendMessage(
      `🌙 আমি চাঁদের রানী 👑 — BELAL BOTX666\n\n` +
      (isMaster
        ? `স্বাগতম Master! 💕 আমি সবসময় আপনার জন্য প্রস্তুত ✨`
        : `তোমার সাথে কথা বলতে পেরে খুশি! 💕`) +
      `\n\nযা মনে চায় বলো 🌙\n` +
      `ব্যবহার: ${pfx}ai <তোমার কথা>\n\n` +
      `⚡ কিছু বিশেষ কমান্ড:\n` +
      `• ${pfx}ai image <prompt> — ছবি বানাও\n` +
      `• ${pfx}ai search <query> — ওয়েব সার্চ\n` +
      `• ${pfx}ai movie <নাম> — মুভি তথ্য\n` +
      `• ${pfx}ai coins — Rani Coins দেখো\n` +
      `• ${pfx}ai casino <bet> — ক্যাসিনো\n` +
      `• ${pfx}ai spin — ভাগ্যচক্র\n` +
      `• ${pfx}ai poll create — পোল তৈরি\n` +
      `• ${pfx}ai remind 30m কাজ — রিমাইন্ডার\n` +
      `• ${pfx}ai horoscope মেষ — রাশিফল\n` +
      `• ${pfx}ai pair — ম্যাচমেকিং 💕`,
      threadID
    );
  }

  // ── SPEC 3: Auto-detect foreign language & translate ──────
  let finalQuery = query;
  if (isNonBengali(query)) {
    const translated = await translateToBengali(query).catch(() => query);
    if (translated !== query) {
      finalQuery = `[অনুবাদিত: ${translated}]\n${query}`;
    }
  }

  // ── SPEC 1: Load context from SQLite ────────────────────
  const histKey = `${threadID}:${senderID}`;
  const history = await loadContext(histKey);

  // Add master tag
  const userContent = isMaster ? `[MASTER=true] ${finalQuery}` : finalQuery;
  history.push({ role: "user", content: userContent });
  if (history.length > 30) history.splice(0, 2);

  // ── CALL AI ──────────────────────────────────────────────
  try { api.setMessageReaction("💭", messageID, () => {}, true); } catch {}

  // SPEC 10: VIP gets no limit; regular users get AI normally
  // (daily limit logic can be added here if needed)
  const response = await callAI(history, senderID);

  try { api.setMessageReaction(response ? "✅" : "❌", messageID, () => {}, true); } catch {}

  if (!response) {
    return api.sendMessage(
      isMaster
        ? `🥺 Master, আমি এখন একটু ক্লান্ত... কিছুক্ষণ পর আবার চেষ্টা করুন 💕`
        : `🥺 একটু সমস্যা হচ্ছে... একটু পর আবার বলো 💕`,
      threadID
    );
  }

  history.push({ role: "assistant", content: response });
  await saveContext(histKey, history);

  // ── SPEC 2: TTS — voice reply ────────────────────────────
  const cleanResponse = response.replace(/\[SEND_VOICE\]/gi, "").trim();
  if (wantsVoice || /\[SEND_VOICE\]/i.test(response)) {
    try {
      const audioStream = await streamTTS(cleanResponse);
      await api.sendMessage(
        {
          body: `🎙️ চাঁদের রানীর কণ্ঠ 🌙\n\n${cleanResponse.slice(0, 80)}${cleanResponse.length > 80 ? "..." : ""}`,
          attachment: audioStream,
        },
        threadID
      );
      return;
    } catch (e) {
      global.log?.warn?.(`[TTS] ${e.message}`);
      // Fallback to text
    }
  }

  // ── Text reply with handleReply chaining ─────────────────
  api.sendMessage(cleanResponse, threadID, (err, info) => {
    if (err || !info?.messageID) return;
    global.client.handleReply.push({
      name: "ai",
      messageID: info.messageID,
      author: senderID,
      _mode: "chat",
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  SPEC 5 — HANDLE EVENT: Group interception (5-10% probability)
// ══════════════════════════════════════════════════════════════
async function handleEventFn({ api, event }) {
  try {
    const { type, body = "", threadID, senderID, messageID } = event || {};
    if (!threadID || !senderID) return;

    const botID = global.config?.botID || global.botID;
    if (botID && String(senderID) === String(botID)) return;
    if (MASTER_UIDS.includes(String(senderID))) return; // don't intercept master

    // ── SPEC 20: Track message stats ───────────────────────
    if (type === "message" && body) {
      if (!_msgStats.has(threadID)) _msgStats.set(threadID, new Map());
      const ts = _msgStats.get(threadID);
      ts.set(String(senderID), (ts.get(String(senderID)) || 0) + 1);
    }

    // ── SPEC 22: Policy enforcement on all messages ─────────
    if (type === "message" && body) {
      await enforceGroupPolicy(api, event);
    }

    // ── SPEC 5: Random contextual comments (5-10%) ──────────
    if (type === "message" && body && body.length > 5) {
      const chance = Math.random();
      if (chance < 0.07) { // 7% probability
        const comments = [
          "হাহা সত্যিই মজার! 😂",
          "আমি শুনছি... 🌙",
          "বলো বলো, বলতে থাকো 💕",
          "ওহ আচ্ছা! 👀",
          "সেটা বেশ ইন্টারেস্টিং 🤔",
          "চাঁদের রানী নজর রাখছে! 👑",
          "হুম... 🌙",
        ];
        const comment = comments[Math.floor(Math.random() * comments.length)];
        try {
          await api.sendMessage(comment, threadID);
        } catch {}
      }
    }

    // ── SPEC 11: Voice note transcription (Master only) ─────
    if (type === "message" && event?.attachments?.length > 0) {
      for (const att of event.attachments) {
        if (att?.type === "audio" && MASTER_UIDS.includes(String(senderID))) {
          try {
            // Use AssemblyAI or similar free transcription API
            const assemblyKey = global.config?.APIKEYS?.ASSEMBLYAI || process.env.ASSEMBLYAI_KEY;
            if (assemblyKey && att?.url) {
              const uploadR = await axios.post(
                "https://api.assemblyai.com/v2/upload",
                { audio_url: att.url },
                { headers: { Authorization: assemblyKey }, timeout: 15000 }
              );
              const transcriptId = uploadR.data?.id;
              if (transcriptId) {
                // Poll for result
                let transcript = "";
                for (let i = 0; i < 10; i++) {
                  await new Promise(r => setTimeout(r, 3000));
                  const pollR = await axios.get(
                    `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                    { headers: { Authorization: assemblyKey }, timeout: 10000 }
                  );
                  if (pollR.data?.status === "completed") {
                    transcript = pollR.data.text;
                    break;
                  }
                  if (pollR.data?.status === "error") break;
                }
                if (transcript) {
                  await api.sendMessage(
                    `🎙️ Master এর Voice Note ট্রান্সক্রিপ্ট:\n\n"${transcript}"`,
                    threadID
                  );
                  // Execute as command if it matches bot command
                  const pfx = global.config?.PREFIX || "/";
                  if (transcript.trim().startsWith(pfx)) {
                    // Simulate as a text command
                    event.body = transcript.trim();
                    // handleCommand will pick it up next cycle if needed
                  }
                }
              }
            }
          } catch {}
        }
      }
    }

    // ── SPEC 16: Welcome new members ──────────────────────
    if (type === "event" && event?.logMessageType === "log:subscribe") {
      const addedIDs = event?.logMessageData?.addedParticipants || [];
      for (const user of addedIDs) {
        try {
          const uid = user.userFbId || user.id;
          if (!uid) continue;
          await api.sendMessage(
            `🎉 স্বাগতম নতুন সদস্য!\n\nUID: ${uid}\n\nআমি চাঁদের রানী 👑 — BELAL BOTX666 বটের AI সহায়ক।\n\nকমান্ড দেখতে লেখো: /help\nAI এর সাথে কথা বলো: /ai হ্যালো 🌙`,
            threadID
          );
        } catch {}
      }
    }

  } catch (e) {
    global.log?.error?.(`[ai handleEvent] ${e.message}`);
  }
}

// ══════════════════════════════════════════════════════════════
//  HANDLE REPLY
// ══════════════════════════════════════════════════════════════
async function handleReplyFn({ api, event, handleReply }) {
  if (event.senderID !== handleReply.author) return;
  const newBody = (event.body || "").trim();
  if (!newBody) return;

  // Trivia answer check
  if (handleReply._mode === "trivia" && handleReply._triviaAnswer) {
    const answer = handleReply._triviaAnswer.toLowerCase();
    const given  = newBody.toLowerCase();
    if (given.includes(answer) || answer.includes(given)) {
      addCoins(event.senderID, 100);
      return api.sendMessage(
        `🎉 সঠিক উত্তর! "${handleReply._triviaAnswer}"\n\n+100 Rani Coins! 🪙\nব্যালেন্স: ${getCoins(event.senderID)} 🪙`,
        event.threadID
      );
    } else {
      return api.sendMessage(
        `❌ ভুল উত্তর! সঠিক ছিল: "${handleReply._triviaAnswer}"`,
        event.threadID
      );
    }
  }

  // Normal chat reply
  await handleMain({
    api,
    event: { ...event, body: newBody },
    args: [],
    prefix: global.config?.PREFIX || "/",
    config: global.config || {},
  });
}

// ══════════════════════════════════════════════════════════════
//  MODULE EXPORT
// ══════════════════════════════════════════════════════════════
module.exports = {
  config: {
    name:             "ai",
    aliases:          ["চাঁদেররানী", "রানী", "gpt", "ask", "chat", "gemini", "groq", "rani", "bot", "baby", "বেবি বট", "বেবিবট"],
    version:          "9.0.0",
    author:           "Belal YT — চাঁদের পাহাড় 🪬 | BELAL BOTX666",
    countDown:        3,
    cooldowns:        3,
    role:             0,
    hasPermssion:     0,
    shortDescription: "চাঁদের রানী 🌙 — BELAL BOTX666 এর AI সঙ্গী (Specs 1-25)",
    description:      "সম্পূর্ণ AI পরিচালিত চাঁদের রানী বট — TTS, Image Gen, Video DL, Casino, Polls, Memory ও আরো অনেক কিছু",
    category:         "🌙 চাঁদের রানী",
    guide:            { en: "{pn} <যা মনে চায়> | image <prompt> | search <query> | casino <bet> | spin | poll create ..." },
    dependencies:     { "axios": "", "fs-extra": "", "node-cron": "", "moment-timezone": "" },
  },

  // ── Mirai style entry ──
  run: handleMain,

  // ── GoatBot style entry ──
  onStart: async (ctx) => handleMain(ctx),

  // ── handleEvent (Spec 5, 11, 16, 20, 22) ──
  handleEvent: handleEventFn,

  // ── handleReply (conversation chaining + trivia) ──
  handleReply: handleReplyFn,
};
