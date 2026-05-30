"use strict";

const mysterious = "Siegfried Sama";

module.exports = {
  config: {
    name: "ccc",
    aliases: ["slap", "chora"],
    version: "3.7.5",
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

    const request = global.nodemodule["request"] || require("request");
    const fs = global.nodemodule["fs-extra"] || require("fs-extra");
    const path = require("path");

    // শুরুতে ⏳ রিয়্যাকশন
    try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

    const link = [
      "https://i.imgur.com/gYQEAa9.gif", "https://i.imgur.com/4RzBwA3.gif", "https://i.imgur.com/hdSsfvz.gif",
      "https://i.imgur.com/hlCrdhk.gif", "https://i.imgur.com/qJ8KHKX.gif", "https://i.imgur.com/1albCLd.gif",
      "https://i.imgur.com/VOAUb0Y.gif", "https://i.imgur.com/mrFGFRT.gif", "https://i.imgur.com/M6cXMsu.gif",
      "https://i.imgur.com/P6bU8Al.gif", "https://i.imgur.com/3Mpno6D.gif", "https://i.imgur.com/GrcZ4Dl.gif",
      "https://i.imgur.com/3LctQ4n.gif", "https://i.imgur.com/0fJzlTv.gif", "https://i.imgur.com/XRjGuUL.gif",
      "https://i.imgur.com/6uU6g8w.gif", "https://i.imgur.com/C8Mi9Vn.gif", "https://i.imgur.com/su5zoIL.gif",
      "https://i.imgur.com/96w64pu.gif", "https://i.imgur.com/fjVBIT9.gif", "https://i.imgur.com/fyGp13f.gif",
      "https://i.imgur.com/eM7Awpr.gif", "https://i.imgur.com/9vaarKK.gif"
    ];

    const mentionIDs = Object.keys(mentions || {});
    if (!mentionIDs.length) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      return api.sendMessage("❌ দয়া করে আপনি যাকে থাপ্পড় মারতে চান তাকে ট্যাগ করুন!", threadID, messageID);
    }

    const targetID = mentionIDs[0];
    const tag = (mentions[targetID] || "").replace("@", "");
    const randomLink = link[Math.floor(Math.random() * link.length)];
    
    const cacheDir = path.join(process.cwd(), "tmp");
    await fs.ensureDir(cacheDir);
    const filePath = path.join(cacheDir, `slap_${senderID}_${Date.now()}.gif`);

    // রিমোট ফাইল পাইপিং মেথড
    var callback = () => {
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}
      return api.sendMessage({
        body: `╭──────•◈•───────╮\n\n\n 🖕🖕 @${tag}\n\n  আই চুষে দিব 🥵 🤏\n\n\n╰──────•◈•───────╯`,
        mentions: [{ tag: `@${tag}`, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.remove(filePath).catch(() => {}), messageID);
    };

    request(encodeURI(randomLink))
      .pipe(fs.createWriteStream(filePath))
      .on("close", () => callback())
      .on("error", (err) => {
        try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
        return api.sendMessage(`❌ ত্রুটি: GIF লোড করা সম্ভব হয়নি।`, threadID, messageID);
      });
  }
};
