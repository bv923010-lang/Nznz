"use strict";
const axios = require("axios");

const mysterious = "Siegfried Sama";

module.exports = {
  config: {
    name: "ccc",
    aliases: ["slap", "chora"],
    version: "3.4.0",
    author: `${mysterious}`,
    countDown: 2,     
    role: 0,          
    hasPermssion: 0,
    shortDescription: "কাউকে ট্যাগ করে থাপ্পড় মারার আল্ট্রা-ফাস্ট GIF কমান্ড",
    category: "fun",
    guide: { en: "{pn} @tag" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, mentions } = event;

    // ১. শুরুতে ⏳ রিয়্যাকশন দিয়ে ইউজারকে জানানো
    try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

    const link = [
      "https://i.imgur.com/gYQEAa9.gif",
      "https://i.imgur.com/4RzBwA3.gif",
      "https://i.imgur.com/hdSsfvz.gif",
      "https://i.imgur.com/hlCrdhk.gif",
      "https://i.imgur.com/qJ8KHKX.gif",
      "https://i.imgur.com/1albCLd.gif",
      "https://i.imgur.com/VOAUb0Y.gif",
      "https://i.imgur.com/mrFGFRT.gif",
      "https://i.imgur.com/M6cXMsu.gif",
      "https://i.imgur.com/P6bU8Al.gif",
      "https://i.imgur.com/3Mpno6D.gif",
      "https://i.imgur.com/GrcZ4Dl.gif",
      "https://i.imgur.com/3LctQ4n.gif",
      "https://i.imgur.com/0fJzlTv.gif",
      "https://i.imgur.com/XRjGuUL.gif",
      "https://i.imgur.com/6uU6g8w.gif",
      "https://i.imgur.com/C8Mi9Vn.gif",
      "https://i.imgur.com/su5zoIL.gif",
      "https://i.imgur.com/96w64pu.gif",
      "https://i.imgur.com/fjVBIT9.gif",
      "https://i.imgur.com/fyGp13f.gif",
      "https://i.imgur.com/eM7Awpr.gif",
      "https://i.imgur.com/9vaarKK.gif"
    ];

    // Mention চেক করা
    const mentionIDs = Object.keys(mentions || {});
    if (!mentionIDs.length) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      return api.sendMessage("❌ দয়া করে আপনি যাকে থাপ্পড় মারতে চান তাকে ট্যাগ করুন!", threadID, messageID);
    }

    const targetID = mentionIDs[0];
    const tag = (mentions[targetID] || "").replace("@", "");
    const randomLink = link[Math.floor(Math.random() * link.length)];

    try {
      // ✅ সুপার মেথড: সার্ভারে কোনো ফাইল ডাউনলোড বা রাইট হবে না।
      // সরাসরি URL থেকে ফেসবুক ১ সেকেন্ডে GIF রেন্ডার করে গ্রুপে পাঠিয়ে দেবে!
      const stream = (await axios.get(randomLink, { 
        responseType: "stream",
        timeout: 15000 
      })).data;

      // সফল রিয়্যাকশন টিক (✅)
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

      return api.sendMessage({
        body: `╭──────•◈•───────╮\n\n\n 🖕🖕 @${tag}\n\n  আই চুষে দিব 🥵 🤏\n\n\n╰──────•◈•───────╯`,
        mentions: [{ tag: `@${tag}`, id: targetID }],
        attachment: stream // ডিরেক্ট ক্যাশলেস স্ট্রিম পুশ
      }, threadID, messageID);

    } catch (e) {
      // এরর হ্যান্ডেলিং এবং ❌ রিয়্যাকশন
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      return api.sendMessage(`❌ ত্রুটি: ইমেগুর সার্ভার থেকে GIF লোড করা যায়নি। আবার চেষ্টা করুন।`, threadID, messageID);
    }
  }
};
        
