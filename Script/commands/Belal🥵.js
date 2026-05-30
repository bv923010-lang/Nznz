"use strict";
const axios = require("axios");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "video/mp4,video/*;q=0.9,*/*;q=0.8"
};

async function fastStream(links) {
  const pick = () => links[Math.floor(Math.random() * links.length)];
  const attempts = [pick(), pick(), pick()];
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "stream", headers: HEADERS, timeout: 18000, maxRedirects: 5 })
      .then(r => { r.data.path = "hot.mp4"; return r.data; })
  );
  return Promise.any(streams);
}

// মাস্টার, আপনার দেওয়া সব কয়টি লিংক হুবহু এখানে অক্ষুণ্ণ আছে
const link = [
  "https://i.imgur.com/7iSEVbJ.mp4",
  "https://i.imgur.com/LPzGxdH.mp4",
  "https://i.imgur.com/h35gNwV.mp4",
  "https://i.imgur.com/zn0OM6Q.mp4",
  "https://i.imgur.com/luAKUui.mp4",
  "https://i.imgur.com/MKrOU6c.mp4",
  "https://i.imgur.com/loyKW60.mp4",
  "https://i.imgur.com/iH6Fw42.mp4",
  "https://i.imgur.com/sHhBFTZ.mp4",
  "https://i.imgur.com/CAZdrYq.mp4"
];

module.exports.config = {
  name: "🥵", version: "3.6.0", hasPermssion: 0, credits: "BELAL BOTX666",
  description: "🥵 ইমোজি পাঠালে আল্ট্রা-ফাস্ট ভিডিও অটো... এবং অন/অফ সিস্টেম", commandCategory: "noprefix", usages: "🥵", cooldowns: 5
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
  const { threadID, messageID, body } = event;
  if (!body) return;

  if (body.toLowerCase().startsWith("🥵")) {
    let threadData = (await Threads.getData(threadID)) || {};
    let data = threadData.data || {};
    if (data["🥵"] === true) return;

    try {
      try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

      // ৩০০+ এ টু জেড সব ধরনের সুপার-প্রিমিয়াম ইমোজি ডাটাবেজ
      const premiumEmojis = [
        "👑","𓆩👑𓆪","🔱","⚜️","💎","💎","🔮","🪬","🧿","✡️","💎","💵","💸","🪙","🪐","🌌","🪐","⚡","🔥","💥",
        "❤️‍🔥","💘","💝","💖","💗","💓","💞","💕","💟","❣️","🖤","💜","💙","💚","💛","🧡","❤️","🤍","🥂","🍾",
        "🍷","🥃","🍹","🍨","🧁","🍒","🍓","🍑","🍇","🌴","🌹","🥀","🌸","💮","🕊️","🦅","🦁","🐅","🐆","🦄",
        "🦊","🦋","🦋","👾","🛸","🚀","🏎️","🏍️","🎸","🎹","🎧","🎤","🎨","🍿","🎬","🎰","♟️","🎯","🎮","⚔️",
        "🏹","🗡️","⚔️","🛡️","💎","🔮","🪬","🧿","✡️","💸","💵","🪙","🪐","🌌","🪐","⚡","🔥","💥","❤️‍🔥","💘",
        "💝","💖","💗","💓","💞","💕","💟","❣️","🖤","💜","💙","💚","💛","🧡","❤️","🤍","🥂","🍾","🍷","🥃",
        "🍹","🍨","🧁","🍒","🍓","🍑","🍇","🌴","🌹","🥀","🌸","💮","🕊️","🦅","🦁","🐅","🐆","🦄","🦊","🦋",
        "🎈","🎉","🎊","🏮","🧧","✉️","📩","📨","📦","🏷️","🛎️","🧳","⌛","⏳","⌚","⏰","🧭","🗺️","🌋","🧱",
        "🪨","🪵","🛖","🏘️","🏰","🏟️","🎪","🎭","🎨","🎰","🎳","🎮","♟️","🎯","🎰","🎲","🎴","🃏","🪄","🔮",
        "💎","🪬","🧿","✡️","👑","🔱","⚜️","𓆩👑𓆪","✨","⚡","🔥","💥","🌟","⭐","🌙","🪐","🌜","☀️","🌤️","⛈️"
      ];
      const emo1 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];
      const emo2 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];

      const designs = [
        `💎𓆩🔮𓆪━━━━━━━━━━━━━━━━𓆩🔮𓆪💎\n\n     ✦─꯭─⃝  𝑩𝑬𝑳𝑨𝑳 𝑩𝑶𝑻 𝑿𝟔𝟔𝟔 🥵${emo1}\n\n💎𓆩🔮𓆪━━━━━━━━━━━━━━━━𓆩🔮𓆪💎`,
        `💠═════════•𓆩 ${emo1} 𓆪•═════════💠\n\n     ✦─⃝‌‌ 𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 𝕏𝟞𝟞𝟞 🥵✡️✦\n\n💠═════════•𓆩 ${emo2} 𓆪•═════════💠`,
        `✨───•𓆩 ${emo1} 𓆪•───•𓆩 ${emo2} 𓆪•───✨\n\n    ✨ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 密碼𝟲𝟲𝟲 🕊️✡️\n\n✨───•𓆩 ${emo1} 𓆪•───•𓆩 ${emo2} 𓆪•───✨`
      ];
      const selectedDesign = designs[Math.floor(Math.random() * designs.length)];

      const stream = await fastStream(link);
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}
      return api.sendMessage({ body: selectedDesign, attachment: stream }, threadID, messageID);
    } catch (error) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      return api.sendMessage("❌ ভিডিও লোড করা সম্ভব হয়নি!", threadID, messageID);
    }
  }
};

module.exports.languages = {
  "vi": { "on": "Bật", "off": "Tắt", "successText": "thành công!" },
  "en": {
    "on": "⚙️ 🥵 ইমোজি অটো-রিপ্লাই সফলভাবে চালু (ON) করা হয়েছে!",
    "off": "⚙️ 🥵 ইমোজি অটো-রিপ্লাই সফলভাবে বন্ধ (OFF) করা হয়েছে!",
    "successText": "✅"
  }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
  const { threadID, messageID } = event;
  let threadData = (await Threads.getData(threadID)) || {};
  let data = threadData.data || {};

  if (typeof data["🥵"] === "undefined" || data["🥵"] === false) {
    data["🥵"] = true;
    var statusText = getText("off");
  } else {
    data["🥵"] = false;
    var statusText = getText("on");
  }

  await Threads.setData(threadID, { data });
  if (global.data && global.data.threadData) global.data.threadData.set(threadID, data);
  return api.sendMessage(`${statusText}`, threadID, messageID);
};
