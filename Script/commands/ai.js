/*
 * ai.js — Fixed AI Command v3.1
 * ✅ Groq API — axios দিয়ে direct call (SDK dependency নেই)
 * ✅ Gemini fallback
 * ✅ Async flow সম্পূর্ণ fixed — reply আসবেই
 * ✅ handleReply conversation চালু
 */
"use strict";

const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    aliases: ["gpt", "ask", "chat", "gemini", "groq"],
    version: "3.1.0",
    author: "Belal YT",
    countDown: 5,
    role: 0,
    shortDescription: "AI দিয়ে যেকোনো প্রশ্নের উত্তর পান",
    category: "AI",
    guide: "{pn} <প্রশ্ন>",
  },

  _history: new Map(),

  async run({ api, event, args, message }) {
    const { threadID, senderID, body } = event;
    const PREFIX = global.config?.PREFIX || "/";

    // body থেকে command prefix সরিয়ে query বের করা
    const query = (body || "")
      .replace(/^\/(ai|gpt|ask|chat|gemini|groq)\s*/i, "")
      .trim();

    if (!query) {
      return api.sendMessage(
        `🤖 AI সহায়তা\n\n` +
        `ব্যবহার: ${PREFIX}ai <প্রশ্ন>\n` +
        `উদাহরণ: ${PREFIX}ai বাংলাদেশের রাজধানী কোথায়?`,
        threadID
      );
    }

    // ⏳ react
    try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch {}

    // conversation history
    const histKey = `${threadID}:${senderID}`;
    if (!this._history.has(histKey)) this._history.set(histKey, []);
    const history = this._history.get(histKey);
    history.push({ role: "user", content: query });
    if (history.length > 20) history.splice(0, 2);

    let response = null;
    let usedModel = "";

    // ══════════════════════════════════════
    //  GROQ — axios direct REST call
    // ══════════════════════════════════════
    try {
      const key = global.config?.APIKEYS?.GROQ
               || process.env.GROQ_KEY
               || process.env.GROQ_API_KEY;

      if (key && !key.startsWith("YOUR_")) {
        const res = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama3-70b-8192",
            messages: [
              {
                role: "system",
                content:
                  "তুমি BELAL BOTX666, একটি বুদ্ধিমান বাংলা AI সহায়তাকারী। " +
                  "সবসময় বাংলায় উত্তর দাও। সংক্ষিপ্ত, স্পষ্ট এবং সহায়ক হও।",
              },
              ...history.slice(-10),
            ],
            max_tokens: 1024,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            timeout: 25000,
          }
        );
        response = res.data?.choices?.[0]?.message?.content?.trim();
        usedModel = "GROQ 🦙";
      }
    } catch (e) {
      log.warn(`Groq ব্যর্থ: ${e.message?.slice(0, 100)}`);
    }

    // ══════════════════════════════════════
    //  GEMINI fallback — axios direct
    // ══════════════════════════════════════
    if (!response) {
      try {
        const key = global.config?.APIKEYS?.GEMINI || process.env.GEMINI_API_KEY;
        if (key && !key.startsWith("YOUR_")) {
          const res = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
            {
              contents: [{ parts: [{ text: query }] }],
              generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
            },
            { timeout: 25000 }
          );
          response = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          usedModel = "GEMINI ✨";
        }
      } catch (e) {
        log.warn(`Gemini ব্যর্থ: ${e.message?.slice(0, 100)}`);
      }
    }

    // react ✅ বা ❌
    try {
      api.setMessageReaction(response ? "✅" : "❌", event.messageID, () => {}, true);
    } catch {}

    if (!response) {
      return api.sendMessage(
        `❌ AI উত্তর দিতে পারেনি।\n\n` +
        `সম্ভাব্য কারণ:\n` +
        `• Groq key মেয়াদ শেষ\n` +
        `• API rate limit\n` +
        `• Internet সমস্যা\n\n` +
        `কিছুক্ষণ পর আবার চেষ্টা করুন।`,
        threadID
      );
    }

    history.push({ role: "assistant", content: response });

    const outText = `🤖 ${usedModel}\n${"─".repeat(28)}\n${response}`;

    api.sendMessage(outText, threadID, (err, info) => {
      if (err || !info?.messageID) return;
      // conversation continue করার জন্য handleReply register
      global.client.handleReply.push({
        author: senderID,
        messageID: info.messageID,
        commandName: "ai",
        handler: async (ctx) => {
          const newBody = (ctx.event.body || "").trim();
          if (!newBody) return;
          await module.exports.run({
            api: ctx.api,
            event: ctx.event,
            args: [],
            message: ctx.message,
          });
        },
      });
    });
  },
};
      
