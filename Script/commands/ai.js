/*
 * ai.js — Smart AI Command
 * Groq → Gemini → OpenAI fallback chain.
 * Never crashes on missing keys — gracefully degrades.
 *
 * Usage: /ai <your question>
 *        /ai model groq|gemini|openai
 */

"use strict";

module.exports = {
  config: {
    name:        "ai",
    aliases:     ["gpt", "ask", "chat", "gemini", "groq"],
    version:     "3.0.0",
    author:      "Belal YT",
    countDown:   5,
    role:        0,
    shortDescription: "AI দিয়ে যেকোনো প্রশ্নের উত্তর পান",
    longDescription:  "Groq/Gemini/OpenAI ব্যবহার করে বুদ্ধিমান উত্তর দেয়। কোনো key না থাকলেও বিকল্পে চলে।",
    category:    "AI",
    guide:       "{pn} <প্রশ্ন>\n{pn} model groq|gemini|openai",
  },

  // Conversation history per thread (in-memory)
  _history: new Map(),

  async run({ api, event, args, message }) {
    const { threadID, senderID, body } = event;
    const PREFIX = global.config?.PREFIX || "/";

    const fullArgs   = body.replace(/^\/ai\s*/i, "").trim();

    // /ai model <provider>
    if (args[0]?.toLowerCase() === "model") {
      const m = args[1]?.toLowerCase();
      if (!["groq", "gemini", "openai"].includes(m))
        return message.reply("❓ মডেল: groq | gemini | openai");
      global.temp[`ai_model_${senderID}`] = m;
      return message.reply(`✅ AI মডেল পরিবর্তিত: ${m.toUpperCase()}`);
    }

    if (!fullArgs) return message.reply(
      `🤖 AI সহায়তা\n\n` +
      `ব্যবহার: ${PREFIX}ai <প্রশ্ন>\n` +
      `মডেল: ${PREFIX}ai model groq|gemini|openai\n\n` +
      `উদাহরণ: ${PREFIX}ai বাংলাদেশের রাজধানী কোথায়?`
    );

    await message.react("⏳");

    // Build conversation history
    const histKey = `${threadID}:${senderID}`;
    if (!this._history.has(histKey)) this._history.set(histKey, []);
    const history = this._history.get(histKey);
    history.push({ role: "user", content: fullArgs });
    if (history.length > 20) history.splice(0, 2); // keep last 10 turns

    const preferredModel = global.temp[`ai_model_${senderID}`]
                        || global.config?.MODULES?.ai?.model
                        || "groq";

    let response = null;
    const tried  = [];

    // ── Try providers in order ──────────────────────────────────
    const providers = preferredModel === "gemini"
      ? ["gemini", "groq", "openai"]
      : preferredModel === "openai"
        ? ["openai", "groq", "gemini"]
        : ["groq", "gemini", "openai"];

    for (const provider of providers) {
      tried.push(provider);
      try {
        response = await callProvider(provider, history, fullArgs);
        if (response) break;
      } catch (e) {
        log.warn(`AI [${provider}] ব্যর্থ: ${e.message?.slice(0, 80)}`);
      }
    }

    await message.react("✅");

    if (!response) {
      return message.reply(
        `❌ সব AI প্রদানকারী ব্যর্থ হয়েছে (${tried.join(", ")})।\n` +
        `config.json-এ APIKEYS চেক করুন অথবা GROQ_KEY env সেট করুন।`
      );
    }

    // Store assistant reply in history
    history.push({ role: "assistant", content: response });

    const modelUsed = tried[tried.length - 1]?.toUpperCase() || "AI";
    const out = `🤖 ${modelUsed}\n${"─".repeat(30)}\n${response}`;

    return api.sendMessage(out, threadID, (err, info) => {
      if (err || !info) return;
      // Register handleReply so user can continue the conversation
      global.client.handleReply.push({
        author:      senderID,
        messageID:   info.messageID,
        commandName: "ai",
        handler:     async (ctx) => {
          // Re-run with the reply body as the new question
          const newArgs = (ctx.event.body || "").trim().split(/\s+/);
          await module.exports.run({
            ...ctx,
            args:    newArgs,
            message: ctx.message,
          });
        },
      });
    });
  },
};

// ══════════════════════════════════════════════════════
//  PROVIDER IMPLEMENTATIONS
// ══════════════════════════════════════════════════════
async function callProvider(provider, history, prompt) {
  switch (provider) {
    case "groq":    return callGroq(history, prompt);
    case "gemini":  return callGemini(history, prompt);
    case "openai":  return callOpenAI(history, prompt);
    default:        return null;
  }
}

async function callGroq(history, prompt) {
  const key = global.config?.APIKEYS?.GROQ
           || process.env.GROQ_KEY
           || process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ key নেই");

  const Groq = require("groq-sdk");
  const groq  = new Groq({ apiKey: key });

  const messages = [
    {
      role: "system",
      content:
        "তুমি BELAL BOTX666, একটি বাংলা AI সহায়তাকারী। " +
        "বাংলায় উত্তর দাও, স্পষ্ট এবং সহায়ক হও।",
    },
    ...history.slice(-10),
  ];

  const completion = await groq.chat.completions.create({
    model:       "llama3-70b-8192",
    messages,
    max_tokens:  1024,
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content?.trim() || null;
}

async function callGemini(history, prompt) {
  const key = global.config?.APIKEYS?.GEMINI
           || process.env.GEMINI_API_KEY;
  if (!key || key.startsWith("YOUR_")) throw new Error("GEMINI key নেই");

  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // Gemini uses its own history format
  const gemHistory = history.slice(-10, -1).map(h => ({
    role:  h.role === "assistant" ? "model" : "user",
    parts: [{ text: h.content }],
  }));

  const chat  = model.startChat({ history: gemHistory });
  const result = await chat.sendMessage(prompt);
  return result.response?.text()?.trim() || null;
}

async function callOpenAI(history, prompt) {
  const key = global.config?.APIKEYS?.OPENAI
           || process.env.OPENAI_API_KEY;
  if (!key || key.startsWith("YOUR_")) throw new Error("OPENAI key নেই");

  const OpenAI = require("openai");
  const openai = new OpenAI({ apiKey: key });

  const messages = [
    {
      role: "system",
      content: "You are BELAL BOTX666, a helpful Bangla AI assistant. Reply in Bangla.",
    },
    ...history.slice(-10),
  ];

  const completion = await openai.chat.completions.create({
    model:       "gpt-3.5-turbo",
    messages,
    max_tokens:  1024,
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content?.trim() || null;
    }
