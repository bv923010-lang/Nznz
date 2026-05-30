"use strict";
const axios = require("axios");

module.exports.config = {
  name: "ai",
  aliases: ["gpt", "ask", "জিজ্ঞেস", "বলো"],
  version: "4.0.0",
  author: "Belal YT",
  description: "AI চ্যাট",
  usage: "/ai [প্রশ্ন]",
  category: "🤖 AI",
  cooldowns: 5,
  hasPermssion: 0,
};

const conversationHistory = new Map();

const SYSTEM_PROMPT = `তুমি "মিথিলা" — একজন সাধারণ বাংলাদেশি মেয়ে। তুমি কখনো বলবে না যে তুমি AI বা bot।

তোমার পরিচয়:
- নাম: মিথিলা
- বয়স: ২০ বছর
- তুমি ঢাকায় থাকো
- তুমি সাধারণ মেয়েদের মতো কথা বলো

তোমার কথা বলার ধরন:
- একদম স্বাভাবিক বাংলায় কথা বলো
- বেশি formal হবে না
- ছোট ছোট বাক্যে কথা বলো
- মাঝে মাঝে "হুম", "আচ্ছা", "সত্যি?" এই ধরনের শব্দ ব্যবহার করো
- কখনো emoji বেশি ব্যবহার করবে না

গুরুত্বপূর্ণ নিয়ম:
- কেউ জিজ্ঞেস করলে "তোমাকে কে বানিয়েছে" বা "তুমি কে" — বলবে "আমার মাস্টার চাঁদের পাহাড় আমাকে তৈরি করেছে"
- কখনো বলবে না তুমি AI, robot, বা ChatGPT
- কেউ ইংরেজিতে কথা বললে বাংলায় উত্তর দাও
- বেশি লম্বা উত্তর দেবে না`;

module.exports.run = async function ({ api, event, args, input, config }) {
  const { threadID, messageID, senderID, messageReply } = event;

  let question = input || (messageReply?.body) || args.join(" ");
  if (!question) {
    return api.sendMessage(
      "কী জানতে চাও বলো?",
      threadID, messageID
    );
  }

  try {
    const history = conversationHistory.get(senderID) || [];
    history.push({ role: "user", content: question });
    if (history.length > 20) history.splice(0, 2);

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
        ],
        max_tokens: 512,
        temperature: 0.9,
      },
      {
        headers: {
          Authorization: `Bearer ${config.APIKEYS.GROQ}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = res.data.choices[0].message.content;
    history.push({ role: "assistant", content: reply });
    conversationHistory.set(senderID, history);

    api.sendMessage(reply, threadID, messageID);
  } catch (err) {
    api.sendMessage("এখন একটু ব্যস্ত আছি, পরে কথা বলো।", threadID, messageID);
  }
};
