"use strict";
const axios = require("axios");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "image/gif,image/webp,image/*,*/*;q=0.8"
};

async function fastStream(links) {
  const pick = () => links[Math.floor(Math.random() * links.length)];
  const attempts = [pick(), pick(), pick()];
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "stream", headers: HEADERS, timeout: 15000, maxRedirects: 5 })
      .then(r => { r.data.path = "ccc.gif"; return r.data; })
  );
  return Promise.any(streams);
}

module.exports.config = {
  name: "ccc", version: "3.0.0", hasPermssion: 0,
  credits: "BELAL BOTX666", description: "র‍্যান্ডম GIF ULTRA FAST",
  commandCategory: "fun", usages: "ccc", cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID } = event;
  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
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
    const stream = await fastStream(gifLinks);
    await api.sendMessage({ body: "┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄", attachment: stream }, threadID, messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);
  } catch {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("❌ GIF আনতে ব্যর্থ, আবার চেষ্টা করুন।", threadID, messageID);
  }
};
