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
  const attempts = [pick(), pick(), pick()]; // একসাথে ৩টি আলাদা রিকোয়েস্ট রেসিং করবে
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "stream", headers: HEADERS, timeout: 18000, maxRedirects: 5 })
      .then(r => { r.data.path = "dance.mp4"; return r.data; })
  );
  return Promise.any(streams);
}

const link = [
  "https://i.imgur.com/iEZPh8A.mp4","https://i.imgur.com/imzbAKk.mp4","https://i.imgur.com/3Q6hgFy.mp4",
  "https://i.imgur.com/0WFBzSx.mp4","https://i.imgur.com/eY8vVqz.mp4","https://i.imgur.com/kixHWSa.mp4",
  "https://i.imgur.com/QXGcO1m.mp4","https://i.imgur.com/Hzu182c.mp4","https://i.imgur.com/FMH8yJF.mp4",
  "https://i.imgur.com/WpJgPNQ.mp4","https://i.imgur.com/mxZdcpj.mp4","https://i.imgur.com/FGxwFjG.mp4",
  "https://i.imgur.com/Dj9BdRI.mp4","https://i.imgur.com/wA8YR59.mp4","https://i.imgur.com/sA4ecVk.mp4",
  "https://i.imgur.com/hXjZ3Q4.mp4","https://i.imgur.com/2aTl9hf.mp4","https://i.imgur.com/20ruFiA.mp4",
  "https://i.imgur.com/eESqfMc.mp4","https://i.imgur.com/VTULl9O.mp4","https://i.imgur.com/VcwxLHV.mp4",
  "https://i.imgur.com/npMypQM.mp4","https://i.imgur.com/KpBOYI9.mp4","https://i.imgur.com/O6HZpUS.mp4",
  "https://i.imgur.com/kthtetX.mp4","https://i.imgur.com/1xzd5ay.mp4","https://i.imgur.com/A4A5yRB.mp4",
  "https://i.imgur.com/BxV1apY.mp4","https://i.imgur.com/XxEqR9O.mp4","https://i.imgur.com/pc4Ri3D.mp4",
  "https://i.imgur.com/enCBPOe.mp4","https://i.imgur.com/6rwxPlj.mp4","https://i.imgur.com/RmiU1fm.mp4",
  "https://i.imgur.com/Tg2q1jz.mp4","https://i.imgur.com/tJVlod9.mp4"
];

module.exports.config = {
  name: "💃",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "BELAL BOTX666",
  description: "💃 ইমোজি পাঠালে আল্ট্রা-ফাস্ট ভিডিও অটো রিপ্লাই এবং অন/অফ সিস্টেম",
  commandCategory: "noprefix",
  usages: "💃",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.toLowerCase().startsWith("💃")) {
    // থ্রেড ডাটা থেকে চেক করা কমান্ডটি এই গ্রুপে অফ আছে কি না
    let data = (await Threads.getData(threadID)).data || {};
    if (data["💃"] === true) return; // যদি অফ থাকে তবে রিপ্লাই করবে না

    try {
      // শুরুতে ⏳ রিয়্যাকশন
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

      // প্রিমিয়াম এবং গর্জিয়াস নতুন নকশা কালেকশন
      const designs = [
        "╭•┄┅══════❁🦋❁══════┅┄•╮\n\n     ✦─⃝‌‌ 𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 𝕏𝟞𝟞𝟞 ✨✦\n\n╰•┄┅══════❁🦋❁══════┅┄•╯",
        "╔═════════𓆩👑𓆪═════════╗\n\n     ✦─꯭─⃝  𝑩𝑬𝑳𝑨𝑳 𝑩𝑶𝑻 𝑿𝟔𝟔𝟔 🩸✦\n\n╚═════════𓆩👑𓆪═════════╝",
        "┏━━━•❃°•°❀°•°❃•━━━┓\n\n    ✨ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 𝗫𝟲𝟲𝟲 🕊️\n\n┗━━━•❃°•°❀°•°❃•━━━┛"
      ];
      const selectedDesign = designs[Math.floor(Math.random() * designs.length)];

      // মেমরি থেকে সরাসরি সুপারফাস্ট স্ট্রিমিং
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
    "on": "⚙️ 💃 ইমোজি অটো-রিপ্লাই সফলভাবে চালু (ON) করা হয়েছে!",
    "off": "⚙️ 💃 ইমোজি অটো-রিপ্লাই সফলভাবে বন্ধ (OFF) করা হয়েছে!",
    "successText": "✅"
  }
};

// /💃 কমান্ড দিয়ে গ্রুপে অন বা অফ করার মেইন রান ফাংশন
module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let threadData = (await Threads.getData(threadID)) || {};
  let data = threadData.data || {};

  // অন-অফ স্টেট টগল করা
  if (typeof data["💃"] === "undefined" || data["💃"] === false) {
    data["💃"] = true; // ট্রু মানে ইভেন্ট ব্লক (OFF)
    var statusText = getText("off");
  } else {
    data["💃"] = false; // ফলস মানে ইভেন্ট সচল (ON)
    var statusText = getText("on");
  }

  await Threads.setData(threadID, { data });
  if (global.data && global.data.threadData) {
    global.data.threadData.set(threadID, data);
  }

  return api.sendMessage(`${statusText}`, threadID, messageID);
};
   
