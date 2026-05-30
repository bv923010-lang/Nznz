/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🤖 ai.js — AI চ্যাট কমান্ড
  BELAL BOTX666 | Master: Belal YT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
"use strict";
const axios = require("axios");

module.exports.config = {
  name: "ai",
  aliases: ["gpt", "ask", "জিজ্ঞেস", "বলো"],
  version: "3.0.0",
  author: "Belal YT",
  description: "AI দিয়ে যেকোনো প্রশ্নের উত্তর পাও",
  usage: "/ai [প্রশ্ন]",
  category: "🤖 AI",
  cooldowns: 5,
  hasPermssion: 0,
};

const conversationHistory = new Map();

module.exports.run = async function ({ api, event, args, input, config }) {
  const { threadID, messageID, senderID, messageReply } = event;

  let question = input || (messageReply?.body) || args.join(" ");
  if (!question) {
    return api.sendMessage(
      `❓ কিছু জিজ্ঞেস করুন!\n\n📌 ব্যবহার:\n• /ai বাংলাদেশের রাজধানী কী?\n• /ai কবিতা লিখে দাও`,
      threadID, messageID
    );
  }

  const thinking = await sendTemp("⏳ ভাবছি...", api, threadID);

  try {
    const history = conversationHistory.get(senderID) || [];
    history.push({ role: "user", content: question });
    if (history.length > 10) history.shift();

    const reply = await callGroq(question, history, config.APIKEYS.GROQ);
    history.push({ role: "assistant", content: reply });
    conversationHistory.set(senderID, history);

    api.unsendMessage(thinking);
    api.sendMessage(
      `🤖 ${reply}\n\n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়🪬❈┉┄`,
      threadID, messageID
    );
  } catch (err) {
    api.unsendMessage(thinking);
    api.sendMessage(
      `❌ AI থেকে উত্তর পাওয়া যায়নি!\n⚠️ ত্রুটি: ${err.message}`,
      threadID, messageID
    );
  }
};

async function callGroq(question, history, apiKey) {
  const res = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "তুমি BELAL BOTX666, একটি বাংলা AI সহকারী। Master: Belal YT। সব প্রশ্নের উত্তর বাংলায় দাও। reply করা মেসেজের উত্তর দিলে সেই প্রসঙ্গে উত্তর দাও।"
        },
        ...history,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data.choices[0].message.content;
}

async function sendTemp(msg, api, threadID) {
  return new Promise(resolve => {
    api.sendMessage(msg, threadID, (err, info) => resolve(info?.messageID));
  });
}
