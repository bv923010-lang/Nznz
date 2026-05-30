"use strict";
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const IMGUR_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "image/gif,image/webp,image/*,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive"
};

async function downloadFile(url, filePath) {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
    headers: IMGUR_HEADERS,
    timeout: 25000,
    maxRedirects: 5
  });
  await fs.ensureDir(path.dirname(filePath));
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
    response.data.on("error", reject);
  });
}

module.exports.config = {
  name: "ccc",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "BELAL BOTX666",
  description: "র‍্যান্ডম GIF - ULTRA FAST",
  commandCategory: "fun",
  usages: "ccc [@mention]",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID, mentions } = event;

  const gifLinks = [
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
"https://i.imgur.com/9vaarKK.gif",
  ];

  const randomLink = gifLinks[Math.floor(Math.random() * gifLinks.length)];
  const filePath = path.join(process.cwd(), "tmp", `ccc_${senderID}_${Date.now()}.gif`);

  const mentionKeys = Object.keys(mentions || {});
  const tag = mentionKeys.length ? mentions[mentionKeys[0]].replace("@", "") : null;

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    await downloadFile(randomLink, filePath);

    const msgObj = {
      body: tag
        ? `╭──────•◈•───────╮\n\n  @${tag} 🖕\n\n╰──────•◈•───────╯`
        : "┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄",
      attachment: fs.createReadStream(filePath)
    };
    if (tag && mentionKeys.length) {
      msgObj.mentions = [{ tag: `@${tag}`, id: mentionKeys[0] }];
    }

    await api.sendMessage(msgObj, threadID, messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);
  } catch (err) {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(`❌ GIF আনতে ব্যর্থ। আবার চেষ্টা করুন।`, threadID, messageID);
  } finally {
    fs.remove(filePath).catch(() => {});
  }
};
