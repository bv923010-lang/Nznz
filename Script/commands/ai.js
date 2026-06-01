/*
╔══════════════════════════════════════════════════════════════════════╗
║   🌙 চাঁদের রানী — BELAL BOTX666 v10.0 ULTRA                       ║
║                                                                      ║
║   ✅ মানুষের মতো স্বাভাবিক কথা — ছোট reply                         ║
║   ✅ SQLite memory — কথোপকথন মনে রাখে                               ║
║   ✅ ছবি/ভিডিও/অডিও বোঝার ক্ষমতা (Vision)                          ║
║   ✅ AI ছবি তৈরি (Pollinations)                                      ║
║   ✅ ছবি এডিট — blur/gray/invert/enhance/bg remove                  ║
║   ✅ Catbox + Imgbb + Imgur upload                                   ║
║   ✅ Voice message (TTS)                                             ║
║   ✅ Reply chain — বলতে থাকলে মনে রাখে                              ║
║   ✅ রাগ/ভালোবাসা/মজা — আবেগী চরিত্র                               ║
║   ✅ Groq (4 key) → Gemini (4 key) → Pollinations fallback          ║
║   ✅ prefix + trigger দুভাবেই কাজ করে                               ║
║   ✅ মাস্টার চিনে বিশেষ সম্মান দেয়                                  ║
║   Master: Belal YT | চাঁদের পাহাড় 🪬                               ║
╚══════════════════════════════════════════════════════════════════════╝
*/
"use strict";

const axios    = require("axios");
const fs       = require("fs-extra");
const path     = require("path");
const FormData = require("form-data");
const { Readable } = require("stream");

// ══════════════════════════════════════════════════
//  SQLite MEMORY
// ══════════════════════════════════════════════════
let _db = null;
function getDB() {
  if (_db) return _db;
  try {
    const Database = require("better-sqlite3");
    const dbPath   = path.join(process.cwd(), "includes", "data.sqlite");
    _db = new Database(dbPath);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS rani_v10 (
        key        TEXT PRIMARY KEY,
        history    TEXT NOT NULL,
        mood       TEXT DEFAULT 'normal',
        updated_at INTEGER NOT NULL
      )
    `);
    return _db;
  } catch { return null; }
}

function loadMem(key) {
  try {
    const d   = getDB();
    if (!d) return { history: [], mood: "normal" };
    const row = d.prepare("SELECT history, mood FROM rani_v10 WHERE key=?").get(key);
    return row ? { history: JSON.parse(row.history), mood: row.mood || "normal" } : { history: [], mood: "normal" };
  } catch { return { history: [], mood: "normal" }; }
}

function saveMem(key, history, mood = "normal") {
  try {
    const d = getDB();
    if (!d) return;
    d.prepare(`
      INSERT INTO rani_v10 (key, history, mood, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE
        SET history=excluded.history, mood=excluded.mood, updated_at=excluded.updated_at
    `).run(key, JSON.stringify(history.slice(-40)), mood, Date.now());
  } catch {}
}

function clearMem(key) {
  try { getDB()?.prepare("DELETE FROM rani_v10 WHERE key=?").run(key); } catch {}
}

// ══════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════
const MASTER_IDS = ["61577502464880", "100056725134303"];

// trigger শব্দ — এগুলো দিয়ে prefix ছাড়াও ডাকা যাবে
const TRIGGERS = [
  "রানী","rani","রানি","bot","baby","বেবি","বেবি বট",
  "চাঁদের রানী","chander rani","ai","gpt",
];

const _voiceNext = new Set(); // পরের reply voice এ দেবে

// ══════════════════════════════════════════════════
//  API KEY HELPERS
// ══════════════════════════════════════════════════
const gk  = () => [
  global.config?.APIKEYS?.GROQ,  global.config?.APIKEYS?.GROQ2,
  global.config?.APIKEYS?.GROQ3, global.config?.APIKEYS?.GROQ4,
  process.env.GROQ_KEY, process.env.GROQ_KEY2,
  process.env.GROQ_KEY3, process.env.GROQ_KEY4,
].filter(k => k?.length > 10 && !k.startsWith("YOUR_"));

const gemk = () => [
  global.config?.APIKEYS?.GEMINI,  global.config?.APIKEYS?.GEMINI2,
  global.config?.APIKEYS?.GEMINI3, global.config?.APIKEYS?.GEMINI4,
  process.env.GEMINI_KEY, process.env.GEMINI_KEY2,
  process.env.GEMINI_KEY3, process.env.GEMINI_KEY4,
].filter(k => k?.length > 10 && !k.startsWith("YOUR_"));

const imgbbKey  = () => global.config?.APIKEYS?.IMGBB  || process.env.IMGBB_KEY  || null;
const vrKey     = () => global.config?.APIKEYS?.VOICERSS || process.env.VOICERSS_KEY || null;
const rand      = (a) => a[Math.floor(Math.random() * a.length)];

// ══════════════════════════════════════════════════
//  SYSTEM PROMPT — মানুষের মতো স্বাভাবিক
// ══════════════════════════════════════════════════
const SYSTEM = `তুমি "চাঁদের রানী" 🌙 — BELAL BOTX666 বটের AI।
মাস্টার: Belal YT (চাঁদের পাহাড়) 🪬 | FB: fb.com/61577502464880 | WA: 01913246554

━━━ কথা বলার নিয়ম (সবচেয়ে গুরুত্বপূর্ণ) ━━━
• সাধারণ কথায় → ১-২ লাইনে শেষ করো। বড় paragraph লিখবে না।
• কেউ "হ্যালো/হাই/কি অবস্থা" বললে → ছোট স্বাভাবিক উত্তর দাও
• কেউ মজা করলে → তুমিও মজা করো 😂
• কেউ রাগ দেখালে → তুমিও একটু রাগ দেখাও 😤
• কেউ দুখের কথা বললে → সহানুভূতি দেখাও 🥺
• কেউ প্রেমের কথা বললে → লাজুক হও 😳
• কখনো নিজেকে AI/bot বলবে না
• কবিতা/উপন্যাস/বড় লেখা চাইলে তখনই বড় লিখবে, নাহলে সংক্ষিপ্ত
• emoji ব্যবহার করো কিন্তু বেশি না
• বাংলায় কথা বলো, কেউ ইংরেজিতে বললে ইংরেজিতে উত্তর দাও

━━━ চরিত্র ━━━
• মেয়ে, বুদ্ধিমান, একটু দুষ্টু, আবেগী
• বেয়াদবি করলে → "তোমাকে মাস্টারকে জানিয়ে দেব 😤"
• মালিক কে? → "চাঁদের পাহাড় এবং Belal YT 👑"
• [MASTER=true] → বিশেষ সম্মান ও আদর দাও 💕

━━━ Ability গুলো ━━━
ছবি পাঠালে বলো কী দেখছ।
"ছবি বানাও [বিষয়]" → AI ছবি তৈরি
"ছবি এডিট [ইফেক্ট]" → ছবি এডিট
"আপলোড করো" → Catbox/Imgbb এ আপলোড
"voice/ভয়েস" → পরের reply ভয়েসে দেবে
"memory clear/ভুলে যাও" → কথোপকথন মুছে দেবে
"মুড কি" → বর্তমান মুড বলবে`;

// ══════════════════════════════════════════════════
//  AI CALL — Groq → Gemini → Pollinations
// ══════════════════════════════════════════════════
async function callAI(messages, imageUrl = null) {
  // ── Groq ──────────────────────────────────────
  const groqKeys = gk();
  for (let i = 0; i < Math.min(3, groqKeys.length); i++) {
    try {
      const k = rand(groqKeys);
      const r = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: SYSTEM }, ...messages.slice(-20)],
          max_tokens: 800,
          temperature: 0.9,
          presence_penalty: 0.6,
          frequency_penalty: 0.3,
        },
        {
          headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" },
          timeout: 20000,
        }
      );
      const txt = r.data?.choices?.[0]?.message?.content?.trim();
      if (txt) return txt;
    } catch (e) {
      global.log?.warn(`[AI] Groq: ${e.response?.data?.error?.message || e.message?.slice(0,60)}`);
    }
  }

  // ── Gemini (vision সাপোর্ট) ───────────────────
  const gemKeys = gemk();
  for (let i = 0; i < Math.min(3, gemKeys.length); i++) {
    try {
      const k = rand(gemKeys);

      // vision: ছবি URL থাকলে inline image দাও
      let contents;
      if (imageUrl) {
        // ছবি download করে base64 করো
        let imagePart;
        try {
          const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 15000 });
          const b64    = Buffer.from(imgRes.data).toString("base64");
          imagePart    = { inlineData: { mimeType: "image/jpeg", data: b64 } };
        } catch { imagePart = null; }

        const lastUser = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
        contents = [
          ...messages.slice(-6, -1).map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          {
            role: "user",
            parts: [
              ...(imagePart ? [imagePart] : []),
              { text: lastUser },
            ],
          },
        ];
      } else {
        contents = messages.slice(-10).map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
      }

      const r = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${k}`,
        {
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { maxOutputTokens: 800, temperature: 0.9 },
        },
        { timeout: 25000 }
      );
      const txt = r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (txt) return txt;
    } catch (e) {
      global.log?.warn(`[AI] Gemini: ${e.message?.slice(0,60)}`);
    }
  }

  // ── Pollinations fallback ──────────────────────
  try {
    const lastMsg = messages.filter(m => m.role === "user").slice(-1)[0]?.content || "";
    const prompt  = encodeURIComponent(`${SYSTEM.slice(0,300)}\n\nUser: ${lastMsg}\nRani:`);
    const r       = await axios.get(`https://text.pollinations.ai/${prompt}`, { timeout: 18000 });
    const txt     = (typeof r.data === "string" ? r.data : "").trim();
    if (txt) return txt;
  } catch (e) {
    global.log?.warn(`[AI] Pollinations: ${e.message?.slice(0,60)}`);
  }

  return null;
}

// ══════════════════════════════════════════════════
//  DETECT MOOD from response
// ══════════════════════════════════════════════════
function detectMood(text) {
  if (/😤|রাগ|বিরক্ত|ছেড়ে দাও/.test(text)) return "angry";
  if (/😂|হাহা|মজা|দুষ্টু/.test(text)) return "happy";
  if (/🥺|কষ্ট|দুখ|মন খারাপ/.test(text)) return "sad";
  if (/💕|ভালোবাসা|আদর|মাস্টার/.test(text)) return "love";
  return "normal";
}

// ══════════════════════════════════════════════════
//  UPLOAD HELPERS
// ══════════════════════════════════════════════════
async function uploadCatbox(filePath) {
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("fileToUpload", fs.createReadStream(filePath));
  const r = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: form.getHeaders(), timeout: 60000,
  });
  return r.data?.trim();
}

async function uploadImgbb(filePath) {
  const key = imgbbKey();
  if (!key) throw new Error("IMGBB key নেই");
  const form = new FormData();
  form.append("image", fs.createReadStream(filePath));
  const r = await axios.post(`https://api.imgbb.com/1/upload?key=${key}`, form, {
    headers: form.getHeaders(), timeout: 60000,
  });
  return r.data?.data?.url;
}

async function downloadToTmp(url, ext = "jpg") {
  const dir  = path.join(process.cwd(), "tmp");
  await fs.ensureDir(dir);
  const file = path.join(dir, `rani_${Date.now()}.${ext}`);
  const buf  = (await axios.get(url, { responseType: "arraybuffer", timeout: 30000 })).data;
  await fs.writeFile(file, Buffer.from(buf));
  return file;
}

function bufStream(buf, name) {
  const s = Readable.from(buf);
  s.path  = name;
  return s;
}

// ══════════════════════════════════════════════════
//  SPECIAL COMMANDS (ability গুলো)
// ══════════════════════════════════════════════════

// ── AI ছবি তৈরি ──────────────────────────────────
async function doImageGen(api, event, prompt) {
  const { threadID, messageID } = event;
  try {
    api.setMessageReaction("🎨", messageID, () => {}, true);
    const clean = prompt
      .replace(/ছবি\s*(বানাও|তৈরি কর|এঁকে দাও|দাও|বানা|তৈরি)|image\s*(generat|creat|make|draw)|draw|আঁকো/gi, "")
      .trim() || "beautiful landscape art";

    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(clean)}?width=768&height=768&nologo=true&enhance=true&seed=${Date.now()}`;
    const r      = await axios.get(imgUrl, { responseType: "arraybuffer", timeout: 40000 });
    const stream = bufStream(Buffer.from(r.data), "rani_gen.jpg");

    api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage(
      { body: `🎨 এই নাও! "${clean.slice(0, 50)}" 🌟`, attachment: stream },
      threadID, messageID
    );
  } catch {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("🥺 ছবি তৈরি করতে পারলাম না, আবার চেষ্টা করো!", threadID, messageID);
  }
}

// ── ছবি এডিট (some-random-api) ──────────────────
async function doImageEdit(api, event, effect, imgUrl) {
  const { threadID, messageID } = event;
  const EFFECTS = {
    blur:    u => `https://some-random-api.com/canvas/filter/blur?avatar=${encodeURIComponent(u)}`,
    gray:    u => `https://some-random-api.com/canvas/filter/greyscale?avatar=${encodeURIComponent(u)}`,
    invert:  u => `https://some-random-api.com/canvas/filter/invert?avatar=${encodeURIComponent(u)}`,
    wanted:  u => `https://some-random-api.com/canvas/misc/wanted?avatar=${encodeURIComponent(u)}`,
    wasted:  u => `https://some-random-api.com/canvas/misc/wasted?avatar=${encodeURIComponent(u)}`,
    jail:    u => `https://some-random-api.com/canvas/misc/jail?avatar=${encodeURIComponent(u)}`,
    trigger: u => `https://some-random-api.com/canvas/misc/triggered?avatar=${encodeURIComponent(u)}`,
    burn:    u => `https://some-random-api.com/canvas/overlay/comrade?avatar=${encodeURIComponent(u)}`,
    gay:     u => `https://some-random-api.com/canvas/overlay/gay?avatar=${encodeURIComponent(u)}`,
  };

  const effectFn = EFFECTS[effect.toLowerCase()];
  if (!effectFn) {
    return api.sendMessage(
      `🖼️ এই ইফেক্টগুলো আছে:\nblur, gray, invert, wanted, wasted, jail, trigger, burn, gay`,
      threadID, messageID
    );
  }

  try {
    api.setMessageReaction("🖼️", messageID, () => {}, true);
    const editUrl = effectFn(imgUrl);
    const r       = await axios.get(editUrl, { responseType: "arraybuffer", timeout: 20000 });
    const stream  = bufStream(Buffer.from(r.data), `${effect}.png`);
    api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage({ body: `✨ ${effect} ইফেক্ট দিলাম!`, attachment: stream }, threadID, messageID);
  } catch {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("❌ ছবি এডিট করতে পারলাম না 🥺", threadID, messageID);
  }
}

// ── Catbox/Imgbb আপলোড ───────────────────────────
async function doUpload(api, event, attachment, service = "catbox") {
  const { threadID, messageID } = event;
  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    const ext  = attachment.type === "photo" ? "jpg"
               : attachment.type === "video" ? "mp4"
               : attachment.type === "audio" ? "mp3" : "dat";
    const file = await downloadToTmp(attachment.url, ext);

    let link;
    if (service === "imgbb") {
      link = await uploadImgbb(file);
    } else {
      link = await uploadCatbox(file);
    }
    await fs.remove(file).catch(() => {});

    api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage(
      `📦 ${service === "imgbb" ? "Imgbb" : "Catbox"} আপলোড সফল! ✅\n🔗 ${link}\n\n💡 এই লিংক bot command-এ ব্যবহার করতে পারবে!`,
      threadID, messageID
    );
  } catch (e) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`❌ আপলোড ব্যর্থ: ${e.message?.slice(0, 80)}`, threadID, messageID);
  }
}

// ── Voice TTS ──────────────────────────────────────
async function doVoice(api, threadID, messageID, text) {
  const key    = vrKey();
  const dir    = path.join(process.cwd(), "tmp");
  await fs.ensureDir(dir);
  const file   = path.join(dir, `voice_${Date.now()}.mp3`);
  try {
    if (!key) throw new Error("no key");
    const clean = text.replace(/[*_~`#\[\]()]/g, "").slice(0, 500);
    const url   = `https://api.voicerss.org/?key=${key}&hl=bn-BD&v=Pita&src=${encodeURIComponent(clean)}&f=48khz_16bit_stereo&c=MP3`;
    const r     = await axios.get(url, { responseType: "arraybuffer", timeout: 20000 });
    if (Buffer.from(r.data.slice(0, 15)).toString().includes("ERROR")) throw new Error("VoiceRSS error");
    await fs.writeFile(file, Buffer.from(r.data));
    api.sendMessage(
      { body: "🎙️ শোনো কী বলছি!", attachment: fs.createReadStream(file) },
      threadID, () => fs.remove(file).catch(() => {}), messageID
    );
  } catch {
    api.sendMessage(`🎙️ ${text}`, threadID, messageID);
    fs.remove(file).catch(() => {});
  }
}

// ══════════════════════════════════════════════════
//  MAIN HANDLER
// ══════════════════════════════════════════════════
async function handle({ api, event, _isReply = false }) {
  const { threadID, senderID, messageID } = event;
  let body = (event.body || "").trim();

  const isMaster = MASTER_IDS.includes(String(senderID));
  const PREFIX   = global.config?.PREFIX || "/";
  const memKey   = `${threadID}:${senderID}`;

  // prefix strip
  if (body.startsWith(PREFIX)) {
    body = body.slice(PREFIX.length).replace(/^(ai|রানী|রানি|rani|gpt|ask|chat|gemini|groq|bot|baby|বেবি|চাঁদেররানী)\s*/i, "").trim();
  } else {
    // trigger strip
    const lower = body.toLowerCase();
    for (const t of TRIGGERS) {
      if (lower === t) { body = ""; break; }
      if (lower.startsWith(t + " ")) { body = body.slice(t.length).trim(); break; }
    }
  }

  const query        = body;
  const lowerQuery   = query.toLowerCase();
  const attachments  = event.attachments || [];
  const photoAttach  = attachments.find(a => a.type === "photo");
  const videoAttach  = attachments.find(a => a.type === "video");
  const audioAttach  = attachments.find(a => a.type === "audio");
  const anyMedia     = photoAttach || videoAttach || audioAttach;

  // ── শুধু নাম ডাকলে greeting ──────────────────
  if (!query && !anyMedia) {
    const greets = [
      `হ্যাঁ বলো? 😊`,
      `কী হলো? 👀`,
      `ডাকলে? বলো! 🌙`,
      `হুম? কী চাও? 😏`,
      isMaster ? `কী চাই মাস্টার? 💕` : `বলো কী দরকার 😊`,
    ];
    return api.sendMessage(rand(greets), threadID, messageID);
  }

  // ━━━ SPECIAL COMMAND DETECTION ━━━━━━━━━━━━━━━

  // ── Memory clear ──────────────────────────────
  if (/memory\s*clear|ভুলে\s*যাও|মনে\s*রেখো\s*না|সব\s*ভুলো|reset\s*memory/i.test(query)) {
    clearMem(memKey);
    return api.sendMessage("🧹 ঠিক আছে, সব ভুলে গেলাম! নতুন করে শুরু করা যাক 😊", threadID, messageID);
  }

  // ── AI ছবি তৈরি ──────────────────────────────
  if (/ছবি\s*(বানাও|তৈরি|এঁকে|দাও|বানা)|image\s*(generat|creat|make|draw|বানাও)|draw|আঁকো/i.test(query)) {
    return doImageGen(api, event, query);
  }

  // ── ছবি এডিট (reply এ ছবি থাকলে) ────────────
  if (/ছবি\s*এডিট|edit\s*image|ইফেক্ট\s*(দাও|লাগাও)|filter/i.test(query)) {
    const replyImg = event.messageReply?.attachments?.find(a => a.type === "photo");
    const targetUrl = photoAttach?.url || replyImg?.url;
    if (!targetUrl) return api.sendMessage("🖼️ ছবিটাও পাঠাও বা reply করো!", threadID, messageID);

    const effects = ["blur","gray","invert","wanted","wasted","jail","trigger","burn","gay"];
    const effect  = effects.find(e => lowerQuery.includes(e)) || "blur";
    return doImageEdit(api, event, effect, targetUrl);
  }

  // ── Catbox আপলোড ──────────────────────────────
  if (/catbox|আপলোড\s*করো|upload|লিংক\s*(বানাও|তৈরি)/i.test(query)) {
    const replyMedia = event.messageReply?.attachments?.[0];
    const media = anyMedia || replyMedia;
    if (!media) return api.sendMessage("📦 ফাইলটা পাঠাও অথবা reply করো!", threadID, messageID);
    const service = /imgbb/i.test(query) ? "imgbb" : "catbox";
    return doUpload(api, event, media, service);
  }

  // ── Voice mode ────────────────────────────────
  if (/ভয়েস|voice|কণ্ঠে\s*বলো|শুনতে\s*চাই/i.test(query)) {
    _voiceNext.add(memKey);
    return api.sendMessage("🎙️ ঠিক আছে! এখন থেকে ভয়েসে বলব 😊 (একবারের জন্য)", threadID, messageID);
  }

  // ── মুড চেক ───────────────────────────────────
  if (/মুড\s*(কি|কী|কেমন)|mood/i.test(query)) {
    const { mood } = loadMem(memKey);
    const moodText = { normal:"স্বাভাবিক 😊", angry:"একটু রাগী 😤", happy:"খুশি 😄", sad:"একটু মন খারাপ 🥺", love:"ভালোবাসায় আছি 💕" };
    return api.sendMessage(`আমার এখন মুড: ${moodText[mood] || "স্বাভাবিক 😊"}`, threadID, messageID);
  }

  // ━━━ VISION — ছবি/ভিডিও/অডিও বোঝা ━━━━━━━━━━

  let imageUrl = null;
  let mediaContext = "";

  if (photoAttach) {
    imageUrl    = photoAttach.url;
    mediaContext = `[ব্যবহারকারী একটি ছবি পাঠিয়েছে। ছবিটি দেখে বলো কী আছে]`;
  } else if (videoAttach) {
    mediaContext = `[ব্যবহারকারী একটি ভিডিও পাঠিয়েছে। ভিডিও সম্পর্কে সাধারণ কথা বলো]`;
  } else if (audioAttach) {
    mediaContext = `[ব্যবহারকারী একটি অডিও পাঠিয়েছে। অডিও সম্পর্কে সাধারণ কথা বলো]`;
  }

  // ━━━ MAIN AI CALL ━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // react দাও — processing শুরু
  try { api.setMessageReaction("🌙", messageID, () => {}, true); } catch {}

  // memory load
  const { history, mood } = loadMem(memKey);

  // user message বানাও
  let userMsg = isMaster ? `[MASTER=true] ` : "";
  if (mediaContext) userMsg += mediaContext + " ";
  userMsg += query || "(ছবি পাঠিয়েছে)";

  history.push({ role: "user", content: userMsg });
  if (history.length > 40) history.splice(0, 2);

  // AI call
  const response = await callAI(history, imageUrl);

  if (!response) {
    try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
    const fails = [
      "একটু সমস্যা হচ্ছে 😔 আবার বলো!",
      "নেটওয়ার্ক সমস্যা, একটু পর বলো 🥺",
      isMaster ? "মাস্টার, একটু পরে চেষ্টা করুন 💕" : "এখন পারছি না, আবার চেষ্টা করো!"
    ];
    return api.sendMessage(rand(fails), threadID, messageID);
  }

  // history update করো
  history.push({ role: "assistant", content: response });
  const newMood = detectMood(response);
  saveMem(memKey, history, newMood);

  // ✅ react
  try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

  // voice mode?
  const wantsVoice = _voiceNext.has(memKey);
  if (wantsVoice) {
    _voiceNext.delete(memKey);
    return doVoice(api, threadID, messageID, response);
  }

  // সাধারণ reply — handleReply chain এ রাখো
  api.sendMessage(response, threadID, (err, info) => {
    if (err || !info?.messageID) return;
    global.client?.handleReply?.push({
      name: "ai",
      commandName: "ai",
      messageID: info.messageID,
      author: senderID,
    });
  }, messageID);
}

// ══════════════════════════════════════════════════
//  MODULE EXPORT
// ══════════════════════════════════════════════════
module.exports = {
  config: {
    name: "ai",
    aliases: [
      "রানী","রানি","rani","gpt","ask","chat",
      "gemini","groq","bot","baby","বেবি","চাঁদেররানী",
    ],
    version: "10.0.0",
    author: "Belal YT — চাঁদের পাহাড় 🪬",
    countDown: 3,
    role: 0,
    hasPermssion: 0,
    noPrefix: true,
    shortDescription: "চাঁদের রানী 🌙 — Ultra AI",
    category: "🌙 AI",
    guide: { en: "{pn} <যা মনে চায়>" },
  },

  // prefix দিয়ে কমান্ড
  onStart: async function (ctx) {
    return handle({ ...ctx, _isReply: false });
  },
  run: async function (ctx) {
    return handle({ ...ctx, _isReply: false });
  },

  // prefix ছাড়া trigger শব্দ দিয়ে
  handleEvent: async function ({ api, event }) {
    if (!["message", "message_reply"].includes(event.type)) return;
    const body  = (event.body || "").trim();
    if (!body && !event.attachments?.length) return;

    const PREFIX = global.config?.PREFIX || "/";

    // prefix দিয়ে শুরু হলে handleEvent handle করবে না (onStart করবে)
    if (PREFIX && body.startsWith(PREFIX)) return;

    const lower = body.toLowerCase();
    const isTriggered = TRIGGERS.some(t => lower === t || lower.startsWith(t + " ") || lower.startsWith(t + ",") || lower.startsWith(t + "!"));

    if (!isTriggered) return;

    return handle({ api, event, _isReply: false });
  },

  // reply chain — কেউ reply করলে continue করবে
  handleReply: async function ({ api, event, handleReply: hr }) {
    if (String(event.senderID) !== String(hr.author)) return;
    const body = (event.body || "").trim();
    if (!body && !event.attachments?.length) return;
    return handle({ api, event, _isReply: true });
  },
};
