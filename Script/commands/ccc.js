"use strict";
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mysterious = "Siegfried Sama";

module.exports = {
  config: {
    name: "ccc",
    aliases: ["slap", "chora"],
    version: "3.7.0",
    author: `${mysterious}`,
    countDown: 3,     
    role: 0,          
    hasPermssion: 0,
    shortDescription: "কাউকে ট্যাগ করে থাপ্পড় মারার ফিক্সড GIF কমান্ড",
    category: "fun",
    guide: { en: "{pn} @tag" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, mentions, senderID } = event;

    // ১. শুরুতে ⏳ রিয়্যাকশন দিয়ে ইউজারকে প্রসেসিং জানানো
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
    
    // ফর্মের রুলস অনুযায়ী 'tmp' ডিরেক্টরি পাথ তৈরি
    const cacheDir = path.join(process.cwd(), "tmp");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `slap_${senderID}_${Date.now()}.gif`);
    
    const randomLink = link[Math.floor(Math.random() * link.length)];
    let response = null;
    let retries = 2;

    // Axios রিকোয়েস্ট উইথ রিট্রাই এবং ৩০ সেকেন্ড টাইমআউট
    while (retries > 0 && !response) {
      try {
        response = await axios.get(randomLink, {
          responseType: "stream",
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
      } catch (err) {
        retries--;
        if (retries === 0) {
          try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
          return api.sendMessage(`❌ ত্রুটি: ইমেগুর সার্ভার রেসপন্স করছে না। আবার চেষ্টা করুন।`, threadID, messageID);
        }
      }
    }

    // আপনার ফর্মের অফিসিয়াল Method 2 অনুযায়ী Stream Pipe রাইটিং
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    try {
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // সফল রিয়্যাকশন টিক (✅)
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

      // মেসেজ ও এটাচমেন্ট পাঠানো
      return api.sendMessage({
        body: `╭──────•◈•───────╮\n\n\n 🖕🖕 @${tag}\n\n  আই চুষে দিব 🥵 🤏\n\n\n╰──────•◈•───────╯`,
        mentions: [{ tag: `@${tag}`, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        // ফাইল পাঠানো শেষে অটো ডিলিট (ক্লিনআপ)
        fs.remove(filePath).catch(() => {});
      }, messageID);

    } catch (e) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      if (fs.existsSync(filePath)) await fs.remove(filePath).catch(() => {});
      return api.sendMessage(`❌ ত্রুটি: ফাইল প্রসেস বা সেন্ড করতে সমস্যা হয়েছে।`, threadID, messageID);
    }
  }
};
          
