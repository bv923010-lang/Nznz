"use strict";
const axios = require("axios");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "video/mp4,video/*;q=0.9,*/*;q=0.8"
};

// ক্লদ স্টাইল আল্ট্রা-ফাস্ট প্যারালাল স্ট্রিমিং মেকানিজম
async function fastStream(links) {
  const pick = () => links[Math.floor(Math.random() * links.length)];
  const attempts = [pick(), pick(), pick()]; // একসাথে ৩টি আলাদা লিঙ্ক রেস করবে
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "stream", headers: HEADERS, timeout: 18000, maxRedirects: 5 })
      .then(r => { r.data.path = "flip.mp4"; return r.data; })
  );
  return Promise.any(streams);
}

const link = [
  "https://i.imgur.com/giKJlOB.mp4",
  "https://i.imgur.com/GJRpFP7.mp4",
  "https://i.imgur.com/IvXcCMx.mp4",
  "https://i.imgur.com/LYeHtTY.mp4",
  "https://i.imgur.com/DORQ8JG.mp4",
  "https://i.imgur.com/GxSgHOA.mp4",
  "https://i.imgur.com/ok6OSr1.mp4",
  "https://i.imgur.com/hJZ8cFG.mp4",
  "https://i.imgur.com/J8UzgFX.mp4",
  "https://i.imgur.com/Y96D5C6.mp4",
  "https://i.imgur.com/nmJ2HWk.mp4",
  "https://i.imgur.com/dkul1H4.mp4",
  "https://i.imgur.com/HrDQxwz.mp4",
  "https://i.imgur.com/KEQJKhj.mp4",
  "https://i.imgur.com/jAlNviD.mp4",
  "https://i.imgur.com/zsk9wFY.mp4",
  "https://i.imgur.com/wWKFTYQ.mp4",
  "https://i.imgur.com/4lPTQxb.mp4",
  "https://i.imgur.com/P6vgcRQ.mp4",
  "https://i.imgur.com/Qb1kDre.mp4",
  "https://i.imgur.com/rgYTOy8.mp4"
];

module.exports.config = {
  name: "🤸",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "BELAL BOTX666",
  description: "🤸 ইমোজি পাঠালে আল্ট্রা-ফাস্ট ভিডিও অটো রিপ্লাই এবং অন/অফ সিস্টেম",
  commandCategory: "noprefix",
  usages: "🤸",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.toLowerCase().startsWith("🤸")) {
    // গ্রুপ ডাটা চেক (কমান্ড অফ থাকলে রিটার্ন করবে)
    let data = (await Threads.getData(threadID)).data || {};
    if (data["🤸"] === true) return;

    try {
      // শুরুতে ⏳ রিয়্যাকশন
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

      // সম্পূর্ণ নতুন এবং গর্জিয়াস ৩টি আলাদা স্টাইলিশ ফ্রেম
      const designs = [
        "╭•┄┅══════❁🕉️❁══════┅┄•╮\n\n   ✦─⃝‌‌ 𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 𝕏𝟞𝟞𝟞 🪬✦\n\n╰•┄┅══════❁🕉️❁══════┅┄•╯",
        "┏━━━━━━•❃°•°👑°•°❃•━━━━━━┓\n\n    ✨ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 密码𝟲𝟲𝟲 🕊️\n\n┗━━━━━━•❃°•°👑°•°❃•━━━━━━┛",
        "╔═════════𓆩⚡𓆪═════════╗\n\n   ✦─꯭─⃝  𝑩𝑬𝑳𝑨𝑳 𝑩𝑶𝑻 𝑿𝟔𝟔𝟔 🩸✦\n\n╚═════════𓆩⚡𓆪═════════╝"
      ];
      const selectedDesign = designs[Math.floor(Math.random() * designs.length)];

      // মেমরি থেকে সরাসরি সুপারফাস্ট লাইভ স্ট্রিমিং
      const stream = await fastStream(link);

      // সফল রিয়্যাকশন টিক (✅)
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

      return api.sendMessage({
        body: selectedDesign,
        attachment: stream
      }, threadID, messageID);

    } catch (error) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      return api.sendMessage("❌ ইমেগুর সার্ভার জ্যামের কারণে ভিডিওটি লোড করা যায়নি!", threadID, messageID);
    }
  }
};

module.exports.languages = {
  "vi": { "on": "Bật", "off": "Tắt", "successText": "thành công!" },
  "en": {
    "on": "⚙️ 🤸 ইমোজি অটো-রিপ্লাই সফলভাবে চালু (ON) করা হয়েছে!",
    "off": "⚙️ 🤸 ইমোজি অটো-রিপ্লাই সফলভাবে বন্ধ (OFF) করা হয়েছে!",
    "successText": "✅"
  }
};

// অন/অফ করার মেইন রান ফাংশন
module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let threadData = (await Threads.getData(threadID)) || {};
  let data = threadData.data || {};

  if (typeof data["🤸"] === "undefined" || data["🤸"] === false) {
    data["🤸"] = true; // ট্রু মানে ইভেন্ট বন্ধ (OFF)
    var statusText = getText("off");
  } else {
    data["🤸"] = false; // ফলস মানে ইভেন্ট চালু (ON)
    var statusText = getText("on");
  }

  await Threads.setData(threadID, { data });
  if (global.data && global.data.threadData) {
    global.data.threadData.set(threadID, data);
  }

  return api.sendMessage(`${statusText}`, threadID, messageID);
};
        
