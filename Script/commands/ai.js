/*
 * ai.js — Fixed v3.3
 * ✅ module-level _history (this context bug নেই)
 * ✅ axios direct REST (SDK লাগে না)
 * ✅ Groq → Gemini fallback
 * ✅ handleReply conversation চালু
 * ✅ onStart + run দুটোই আছে
 */
"use strict";

const axios = require("axios");
const _history = new Map(); // module-level — this context সমস্যা নেই

module.exports = {
  config: {
    name: "ai",
    aliases: ["gpt", "ask", "chat", "gemini", "groq"],
    version: "3.3.0",
    author: "Belal YT",
    countDown: 5,
    role: 0,
    hasPermssion: 0,
    shortDescription: "AI দিয়ে যেকোনো প্রশ্নের উত্তর পান",
    category: "AI",
    guide: { en: "{pn} <প্রশ্ন>" },
  },

  onStart: async function (ctx) {
    return module.exports.run(ctx);
  },

  run: async function ({ api, event }) {
    const { threadID, senderID, body, messageID } = event;
    const PREFIX = global.config?.PREFIX || "/";

    const query = (body || "")
      .replace(/^\/(ai|gpt|ask|chat|gemini|groq)\s*/i, "")
      .trim();

    if (!query) return api.sendMessage(
      `🤖 AI সহায়তা\n\nব্যবহার: ${PREFIX}ai <প্রশ্ন>\nউদাহরণ: ${PREFIX}ai বাংলাদেশের রাজধানী?`,
      threadID
    );

    try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

    const key = `${threadID}:${senderID}`;
    if (!_history.has(key)) _history.set(key, []);
    const hist = _history.get(key);
    hist.push({ role: "user", content: query });
    if (hist.length > 20) hist.splice(0, 2);

    let response = null, model = "";

    // Groq
    try {
      const k = global.config?.APIKEYS?.GROQ || process.env.GROQ_KEY || process.env.GROQ_API_KEY;
      if (k && !k.startsWith("YOUR_")) {
        const r = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama3-70b-8192",
            messages: [
              { role: "system", content: "তুমি BELAL BOTX666, একটি বুদ্ধিমান বাংলা AI। সবসময় বাংলায় উত্তর দাও।" },
              ...hist.slice(-10),
            ],
            max_tokens: 1024, temperature: 0.7,
          },
          { headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" }, timeout: 25000 }
        );
        response = r.data?.choices?.[0]?.message?.content?.trim();
        model = "GROQ 🦙";
      }
    } catch (e) { global.log?.warn(`Groq: ${e.message?.slice(0,80)}`); }

    // Gemini fallback
    if (!response) {
      try {
        const k = global.config?.APIKEYS?.GEMINI || process.env.GEMINI_API_KEY;
        if (k && !k.startsWith("YOUR_")) {
          const r = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${k}`,
            { contents: [{ parts: [{ text: query }] }], generationConfig: { maxOutputTokens: 1024 } },
            { timeout: 25000 }
          );
          response = r.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          model = "GEMINI ✨";
        }
      } catch (e) { global.log?.warn(`Gemini: ${e.message?.slice(0,80)}`); }
    }

    try { api.setMessageReaction(response ? "✅" : "❌", messageID, () => {}, true); } catch {}

    if (!response) return api.sendMessage(
      `❌ AI উত্তর দিতে পারেনি।\n• Groq key চেক করুন\n• কিছুক্ষণ পর আবার চেষ্টা করুন।`,
      threadID
    );

    hist.push({ role: "assistant", content: response });

    api.sendMessage(
      `🤖 ${model}\n${"─".repeat(26)}\n${response}`,
      threadID,
      (err, info) => {
        if (err || !info?.messageID) return;
        global.client.handleReply.push({
          name: "ai",
          messageID: info.messageID,
          author: senderID,
        });
      }
    );
  },

  handleReply: async function ({ api, event, handleReply }) {
    if (event.senderID !== handleReply.author) return;
    const newBody = (event.body || "").trim();
    if (!newBody) return;
    await module.exports.run({ api, event: { ...event, body: newBody } });
  },
};
