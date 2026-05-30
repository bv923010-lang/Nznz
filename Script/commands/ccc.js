"use strict";
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mysterious = "Siegfried Sama";

module.exports = {
  config: {
    name: "ccc",
    aliases: ["slap", "chora"],
    version: "3.3.0", // আপনার ফর্মের রুলস অনুযায়ী ভার্সন আপডেট
    author: `${mysterious}`,
    countDown: 3,     // ফর্ম অনুযায়ী অপ্টিমাইজড কুলডাউন
    role: 0,          // সবাই ব্যবহার করতে পারবে
    hasPermssion: 0,
    shortDescription: "কাউকে ট্যাগ করে থাপ্পড় মারার মজার GIF কমান্ড",
    category: "fun",
    guide: { en: "{pn} @tag" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, mentions, senderID } = event;

    // ১. শুরুতে ⏳ রিয়্যাকশন দিয়ে ইউজারকে জানানো
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

    // ফর্মের রুলস অনুযায়ী 'tmp' ডিরেক্টরি ব্যবহার নিশ্চিত করা
    const cacheDir = path.join(process.cwd(), "tmp");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `slap_${senderID}_${Date.now()}.gif`);
    
    const randomLink = link[Math.floor(Math.random() * link.length)];
    let response = null;
    let retries = 2; // ২ বার এরর রিট্রাই লজিক

    // Axios রিকোয়েস্ট উইথ রিট্রাই এবং টাইমআউট
    while (retries > 0 && !response) {
      try {
        response = await axios.get(randomLink, {
          responseType: "stream",
          timeout: 30000, // ফর্মের রুলস অনুযায়ী ৩০ সেকেন্ড টাইমআউট
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
      } catch (err) {
        retries--;
        if (retries === 0) throw err;
      }
    }

    // স্ট্রিম পাইপিং মেথড (দ্রুততম উপায়)
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // মেসেজ সেন্ড এবং রিয়্যাকশন টিক (✅)
    try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

    return api.sendMessage({
      body: `╭──────•◈•───────╮\n\n\n 🖕🖕 @${tag}\n\n  আই চুষে দিব 🥵 🤏\n\n\n╰──────•◈•───────╯`,
      mentions: [{ tag: `@${tag}`, id: targetID }],
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      // সেন্ড করার সাথে সাথে অটো ফাইল ডিলিট
      fs.remove(filePath).catch(() => {});
    }, messageID);

    try {
    } catch (e) {
      // এরর হ্যান্ডেলিং এবং ❌ রিয়্যাকশন
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      if (fs.existsSync(filePath)) await fs.remove(filePath).catch(() => {});
      return api.sendMessage(`❌ ত্রুটি: GIF লোড করা সম্ভব হয়নি। আবার চেষ্টা করুন।`, threadID, messageID);
    }
  }
};
