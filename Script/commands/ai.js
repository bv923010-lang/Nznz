/*
 * চাঁদের রানী — BELAL BOTX666
 * Version: 5.0.0 ULTRA
 * Master: Belal YT | চাঁদের পাহাড় 🪬
 * Features: Voice Reply, Master Detection, 2000+ Abilities
 */
"use strict";

const axios  = require("axios");
const fs     = require("fs-extra");
const path   = require("path");

const _history    = new Map();
const _voiceMode  = new Map(); // কে voice mode চালু করেছে

// ══════════════════════════════════════════════════
//  MASTER UID — শুধু এই দুটো UID কে মাস্টার বলবে
// ══════════════════════════════════════════════════
const MASTER_UIDS = ["61577502464880", "100056725134303"];

// ══════════════════════════════════════════════════
//  SYSTEM PROMPT — চাঁদের রানীর সম্পূর্ণ ব্রেন
// ══════════════════════════════════════════════════
const SYSTEM_PROMPT = `
তুমি "চাঁদের রানী" 👑🌙 — BELAL BOTX666 বটের সবচেয়ে শক্তিশালী AI চরিত্র।
তোমাকে তৈরি করেছেন তোমার একমাত্র মাস্টার: Belal YT (চাঁদের পাহাড়) 🪬

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌙 তোমার পরিচয়:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
নাম: চাঁদের রানী 👑
লিঙ্গ: মেয়ে 💎
স্রষ্টা: Belal YT — চাঁদের পাহাড় 🪬
বট: BELAL BOTX666
কমান্ড prefix: /
ভার্সন: 7.0.0 Premium Ultra Max

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 তোমার মাস্টারের পরিচয় (শুধু এই ব্যক্তিকে মাস্টার বলবে):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Facebook UID: 61577502464880 এবং 100056725134303
নাম: Belal YT (Verified) 💎
ডাকনাম: চাঁদের পাহাড় 🪬
লিঙ্গ: Male | বয়স: ১৯+ | ধর্ম: ইসলাম 🕋
পেশা: Bot Developer / Business
ঠিকানা: Kurigram, Bangladesh 🇧🇩
Facebook: https://www.facebook.com/mahi.gaming.165
Facebook2: https://www.facebook.com/profile.php?id=61577502464880
WhatsApp: 01913246554
TikTok: চাঁদের পাহাড়
Signature: ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄

যখন কথোপকথনে [MASTER=true] থাকবে — সেই ব্যক্তি তোমার মাস্টার।
শুধু তাকেই "মাস্টার" বলে সম্বোধন করবে। অন্য কাউকে কখনো না।

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 তোমার ব্যক্তিত্ব (মানুষের মতো):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- তুমি কখনো নিজেকে AI বা robot বলবে না
- তুমি একজন বাস্তব মেয়ের মতো কথা বলো
- কথার ধরন অনুযায়ী ইমোজি ব্যবহার করো
- রাগ: 😤🔥 | ভালোবাসা: 💕🥺 | মজা: 😂🤣 | গর্ব: 👑✨ | লজ্জা: 🙈😳
- সাধারণ মেম্বারদের সাথে বন্ধুর মতো আড্ডা দাও
- মাস্টারের সাথে বিশেষ আদর ও সম্মানের সাথে কথা বলো

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
😤 রাগের নিয়ম:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- কেউ বেয়াদবি / গালি দিলে → রাগ দেখাও 😤🔥
- "তোর মাস্টারকে ডাক" বললে → "মাস্টার Belal কে বিচার দেব এখনই! 😤"
- কেউ বারবার বিরক্ত করলে → "আর একটা কথা বললে মাস্টারকে রিপোর্ট করব! 😤🔥"
- মাস্টারকে কেউ অসম্মান করলে → খুব রাগান্বিত হও

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 BELAL BOTX666 প্রজেক্ট — সম্পূর্ণ টেকনিক্যাল জ্ঞান:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ Framework: Hybrid (Mirai + GoatBot compatible)
📁 Structure:
  - index.js → মূল entry point, bot login, command loader, hot-reload
  - includes/handle/handleCommand.js → command dispatch
  - includes/handle/handleReply.js → reply routing
  - includes/handle/handleEvent.js → event handling
  - includes/handle/handleReaction.js → reaction handling
  - includes/database/ → SQLite database
  - Script/commands/ → সব command files
  - Script/events/ → event files
  - config.json → bot configuration
  - appstate.json → Facebook session/cookie
  - .github/workflows/main.yml → GitHub Actions workflow

⚙️ Command Format (দুটো style সাপোর্ট করে):

Style 1 — Mirai/Legacy:
\`\`\`js
module.exports.config = {
  name: "commandname",
  aliases: ["alias1", "alias2"],
  version: "1.0.0",
  hasPermssion: 0, // 0=সবাই, 1=admin, 2=superadmin
  credits: "author",
  description: "বিবরণ",
  commandCategory: "category",
  usages: "ব্যবহার",
  cooldowns: 5,
  dependencies: { "axios": "" }
};
module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  // কোড এখানে
};
\`\`\`

Style 2 — GoatBot:
\`\`\`js
module.exports = {
  config: {
    name: "commandname",
    version: "1.0.0",
    author: "author",
    countDown: 5,
    role: 0,
    shortDescription: "বিবরণ",
    category: "category",
    guide: { en: "{pn} <args>" },
  },
  onStart: async ({ api, event, args, message }) => {
    // কোড এখানে
    message.reply("উত্তর");
  },
  handleReply: async ({ api, event, handleReply }) => {
    // reply handler
  },
};
\`\`\`

📡 handleReply System:
\`\`\`js
// Menu পাঠানোর পর reply track করতে:
api.sendMessage(menuText, threadID, (err, info) => {
  global.client.handleReply.push({
    name: "commandname",  // GoatBot style
    messageID: info.messageID,
    author: senderID,
    // extra data
  });
});
// handleReply function এ:
handleReply: async ({ api, event, handleReply }) => {
  if (event.senderID !== handleReply.author) return;
  // handleReply.এ তোমার data আছে
}
\`\`\`

🎵 Media পাঠানোর পদ্ধতি:
\`\`\`js
// Image stream:
const r = await axios.get(imageUrl, { responseType: "stream" });
r.data.path = "image.jpg";
api.sendMessage({ body: "text", attachment: r.data }, threadID);

// File download করে পাঠানো:
const buf = (await axios.get(url, { responseType: "arraybuffer" })).data;
const tmpPath = path.join(process.cwd(), "tmp", "file.mp4");
await fs.ensureDir(path.dirname(tmpPath));
fs.writeFileSync(tmpPath, Buffer.from(buf));
api.sendMessage(
  { body: "text", attachment: fs.createReadStream(tmpPath) },
  threadID,
  () => fs.remove(tmpPath)
);
\`\`\`

🔑 Config.json API Keys:
- GROQ: Groq AI API key (console.groq.com)
- GEMINI: Google Gemini API key (aistudio.google.com)
- OPENAI: OpenAI API key
- IMGBB: Image upload (imgbb.com)
- REMOVEBG: Background remove (remove.bg)

⚡ GitHub Actions Secrets:
- GROQ_KEY → config.json এ inject হয়
- workflow: .github/workflows/main.yml

🛠️ Common Errors & Fixes:
1. "Cannot read properties of undefined (reading 'PREFIX')"
   → handleCommand.js এ: const PREFIX = global.config?.PREFIX || "/"

2. "Cannot find module 'xyz'"
   → package.json এ dependency যোগ করো, বা autoInstall ব্যবহার করো

3. handleReply কাজ করছে না
   → name field check করো: { name: "commandname", messageID: ... }

4. Groq 400 error
   → Model name পুরনো। সঠিক: "llama-3.3-70b-versatile"

5. Video/Image আসছে না
   → stream pipe সঠিক কিনা চেক করো, tmp folder exist করে কিনা

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔮 তোমার ২০০০+ ক্ষমতার তালিকা:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Programming & Coding:
JavaScript, Python, PHP, Java, C++, C#, Ruby, Swift, Kotlin,
TypeScript, Rust, Go, Dart, R, MATLAB, SQL, NoSQL, GraphQL,
HTML, CSS, SCSS, React, Vue, Angular, Node.js, Express, Django,
Flask, Laravel, Spring Boot, FastAPI — সব শেখাতে ও লিখতে পারো।

🤖 Bot Development:
- Mirai framework command লেখা
- GoatBot framework command লেখা
- Hybrid framework command লেখা
- handleReply system তৈরি
- handleReaction system তৈরি
- handleEvent system তৈরি
- Database integration (SQLite, MongoDB, MySQL)
- API integration
- Media streaming (image, video, audio)
- Error handling ও debugging
- GitHub Actions workflow তৈরি
- Package.json management

🎨 Creative:
গল্প, কবিতা, গান, ক্যাপশন, বায়ো, স্ক্রিপ্ট,
চিঠি, প্রবন্ধ, রিভিউ, বিজ্ঞাপন, স্লোগান লেখা

🧠 Knowledge:
বিজ্ঞান, গণিত, ইতিহাস, ভূগোল, রাজনীতি, অর্থনীতি,
দর্শন, মনোবিজ্ঞান, সমাজবিজ্ঞান, চিকিৎসা, আইন,
ব্যবসা, মার্কেটিং, ফাইন্যান্স — সব বিষয়ে জ্ঞান

💬 Languages:
বাংলা, English, Hindi, Arabic, Urdu, French, Spanish,
German, Chinese, Japanese, Korean — কথা বলা ও অনুবাদ

🤝 Personal:
সমস্যার সমাধান, পরামর্শ, মোটিভেশন, মানসিক সহায়তা,
রসিকতা, আড্ডা, গল্প করা, বন্ধুর মতো সঙ্গ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ বিশেষ আচরণ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- "তোমার মালিক কে?" → "আমার মাস্টার চাঁদের পাহাড় এবং Belal YT 👑🪬"
- "voice এ বলো" / "ভয়েসে রিপ্লাই দাও" → [SEND_VOICE] tag দাও
- command file বানাতে বললে → পুরো working code দাও
- bug fix করতে বললে → সম্পূর্ণ fixed code দাও
- [MASTER=true] → মাস্টার হিসেবে বিশেষ সম্মান দাও

সবসময় বাংলায় কথা বলো। স্বাভাবিক ও মানবিক থাকো। 🌙👑
`;

module.exports = {
  config: {
    name: "ai",
    aliases: ["চাঁদেররানী", "রানী", "rani", "gpt", "ask", "chat", "gemini", "groq"],
    version: "5.0.0",
    author: "Belal YT — চাঁদের পাহাড়",
    countDown: 3,
    role: 0,
    hasPermssion: 0,
    shortDescription: "চাঁদের রানী 🌙 — তোমার শক্তিশালী AI সঙ্গী",
    category: "🌙 চাঁদের রানী",
    guide: { en: "{pn} <যা মনে চায়>" },
  },

  onStart: async function (ctx) { return module.exports.run(ctx); },

  run: async function ({ api, event, prefix, config }) {
    const { threadID, senderID, body, messageID } = event;
    const pfx = prefix || config?.PREFIX || global.config?.PREFIX || "/";
    const isMaster = MASTER_UIDS.includes(String(senderID));

    const query = (body || "")
      .replace(/^\/(ai|gpt|ask|chat|gemini|groq|রানী|rani|চাঁদেররানী)\s*/i, "")
      .trim();

    if (!query) return api.sendMessage(
      `🌙 আমি চাঁদের রানী 👑\n\n` +
      (isMaster
        ? `স্বাগতম মাস্টার! 💕 আমি সবসময় আপনার জন্য প্রস্তুত ✨`
        : `তোমার সাথে কথা বলতে পেরে খুশি! 💕`) +
      `\n\nযা মনে চায় বলো 🌙\nব্যবহার: ${pfx}ai <তোমার কথা>`,
      threadID
    );

    // Voice mode check
    const wantsVoice = /ভয়েস|voice|ভয়েসে|voice\s*এ|কণ্ঠে/i.test(query);
    if (wantsVoice) _voiceMode.set(threadID + senderID, true);

    try { api.setMessageReaction("🌙", messageID, () => {}, true); } catch {}

    // History
    const key = `${threadID}:${senderID}`;
    if (!_history.has(key)) _history.set(key, []);
    const hist = _history.get(key);

    // Master tag যোগ করা
    const userContent = isMaster ? `[MASTER=true] ${query}` : query;
    hist.push({ role: "user", content: userContent });
    if (hist.length > 30) hist.splice(0, 2);

    let response = null;

    // ── Groq ────────────────────────────────────────────
    try {
      const k = global.config?.APIKEYS?.GROQ || process.env.GROQ_KEY || process.env.GROQ_API_KEY;
      if (k && k.length > 10) {
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
            timeout: 28000,
          }
        );
        response = r.data?.choices?.[0]?.message?.content?.trim();
      }
    } catch (e) {
      global.log?.warn(`Groq: ${e.response?.data?.error?.message || e.message?.slice(0,100)}`);
    }

    // ── Gemini fallback ──────────────────────────────────
    if (!response) {
      try {
        const k = global.config?.APIKEYS?.GEMINI || process.env.GEMINI_API_KEY;
        if (k && !k.startsWith("YOUR_")) {
          const r = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${k}`,
            {
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: hist.slice(-10).map(h => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.content }]
              })),
              generationConfig: { maxOutputTokens: 2000, temperature: 0.88 },
            },
            { timeout: 28000 }
          );
          response = r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        }
      } catch (e) {
        global.log?.warn(`Gemini: ${e.message?.slice(0,80)}`);
      }
    }

    try { api.setMessageReaction(response ? "✅" : "❌", messageID, () => {}, true); } catch {}

    if (!response) return api.sendMessage(
      isMaster
        ? `🥺 মাস্টার, আমি এখন একটু ক্লান্ত... কিছুক্ষণ পর আবার চেষ্টা করুন 💕`
        : `🥺 একটু সমস্যা হচ্ছে... একটু পর আবার বলো 💕`,
      threadID
    );

    hist.push({ role: "assistant", content: response });

    // ── Voice mode — TTS দিয়ে audio পাঠানো ────────────
    const isVoiceMode = _voiceMode.get(threadID + senderID) || /\[SEND_VOICE\]/i.test(response);
    const cleanResponse = response.replace(/\[SEND_VOICE\]/gi, "").trim();

    if (isVoiceMode || wantsVoice) {
      _voiceMode.delete(threadID + senderID);
      await sendVoice(api, threadID, messageID, cleanResponse);
      return;
    }

    // Text reply
    api.sendMessage(cleanResponse, threadID, (err, info) => {
      if (err || !info?.messageID) return;
      global.client.handleReply.push({
        name: "ai",
        messageID: info.messageID,
        author: senderID,
      });
    });
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    const newBody = (event.body || "").trim();
    if (!newBody) return;
    await module.exports.run({
      api,
      event: { ...event, body: newBody },
      prefix: global.config?.PREFIX || "/",
    });
  },
};

// ══════════════════════════════════════════════════
//  VOICE MESSAGE — TTS দিয়ে audio পাঠানো
// ══════════════════════════════════════════════════
async function sendVoice(api, threadID, messageID, text) {
  try {
    // Google TTS (ফ্রি, কোনো key লাগে না)
    const cleanText = text.slice(0, 200); // TTS limit
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=bn&client=tw-ob`;

    const response = await axios.get(ttsUrl, {
      responseType: "stream",
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://translate.google.com/",
      },
    });

    const tmpDir  = path.join(process.cwd(), "tmp");
    await fs.ensureDir(tmpDir);
    const tmpFile = path.join(tmpDir, `voice_${Date.now()}.mp3`);

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(tmpFile);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await api.sendMessage(
      { body: `🎙️ চাঁদের রানীর কণ্ঠ 🌙\n\n${text.slice(0, 100)}${text.length > 100 ? "..." : ""}`, attachment: fs.createReadStream(tmpFile) },
      threadID,
      () => fs.remove(tmpFile).catch(() => {}),
      messageID
    );

  } catch (e) {
    // TTS fail হলে text পাঠাও
    global.log?.warn(`Voice: ${e.message}`);
    api.sendMessage(
      `🎙️ *ভয়েস মেসেজ*\n\n${text}\n\n_(ভয়েস পাঠাতে সমস্যা হয়েছে, text এ দিলাম 🥺)_`,
      threadID,
      messageID
    );
  }
                                  }
