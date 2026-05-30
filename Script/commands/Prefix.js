"use strict";
const axios = require("axios");
const moment = require("moment-timezone");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "video/mp4,video/*;q=0.9,*/*;q=0.8"
};

// Claude-এর আল্ট্রা-ফাস্ট ডিরেক্ট মেমোরি স্ট্রিম লজিক (wow ফাইলের হুবহু লজিক)
async function fastStream(links) {
  const pick = () => links[Math.floor(Math.random() * links.length)];
  const attempts = [pick(), pick(), pick()];
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "stream", headers: HEADERS, timeout: 15000, maxRedirects: 5 })
      .then(r => { r.data.path = "prefix.mp4"; return r.data; })
  );
  return Promise.any(streams);
}

// ⚙️ ডায়নামিক প্রিফিক্স সেটিংস সিস্টেম (চিহ্ন বা টেক্সট এডিট বা নতুন অ্যাড করার অপশন)
global.prefixSettings = global.prefixSettings || {
  allowedPrefixes: ["prefix", "prefix + /", "prefix + $", "prefix + #", "prefix + !", "no prefix"]
};

// 👑 শুধুমাত্র আপনার নিজের দুটি রয়্যাল ফেসবুক ইউআইডি (UID) প্রটেকশন লিস্ট
const MY_EXCLUSIVE_UIDS = ["61577502464880", "100056725134303"]; // এখানে আপনার মূল আইডি দুটির UID সেট করা আছে

module.exports.config = {
  name: "prefix", 
  version: "24.0.0", 
  hasPermssion: 2, // সুপ্রিম অ্যাডমিন পারমিশন স্তর
  credits: "BELAL BOTX666", 
  description: "🤖 বটের রয়্যাল ইনফরমেশন ও ওনার এক্সক্লুসিভ কন্ট্রোল প্যানেল",
  commandCategory: "owner", 
  usages: "prefix", 
  cooldowns: 2
};

// 👑 ১০০% গ্যারান্টিড ডায়নামিক নো-প্রিফিক্স ও কাস্টম চিহ্ন হ্যান্ডলার
module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  const msg = event.body.toLowerCase().trim();
  
  // চেক করা হচ্ছে মেসেজটি আপনার অনুমোদিত লিস্টের কোনো চিহ্নের সাথে মেলে কিনা
  const matchesPrefix = global.prefixSettings.allowedPrefixes.some(p => msg === p);
  
  if (matchesPrefix) {
    // 🔒 কড়া নিরাপত্তা গার্ড: আপনি ছাড়া অন্য কোনো বট অ্যাডমিন ট্রাই করলেও লক মেসেজ দেবে
    if (!MY_EXCLUSIVE_UIDS.includes(String(event.senderID))) {
      return api.sendMessage("🔒 এই কমান্ডটি শুধুমাত্র মাস্টার বেলাল (Oᴡɴᴇʀ) এর জন্য সুরক্ষিত।", event.threadID);
    }
    return module.exports.run({ api, event, args: [] });
  }
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY | hh:mm A");
  
  // 🔒 রান ফাংশনের ভেতরের সেকেন্ডারি সিকিউরিটি গার্ড (১০০% প্রুফ লক)
  if (!MY_EXCLUSIVE_UIDS.includes(String(senderID))) {
    return api.sendMessage("🔒 এই কমান্ডটি শুধুমাত্র মাস্টার বেলাল (Oᴡɴᴇʀ) এর জন্য সুরক্ষিত।", threadID, messageID);
  }

  const currentPrefix = global.config?.PREFIX === "" ? "No Prefix" : global.config?.PREFIX;

  // আপনার ১৪টি প্রিমিয়াম ভিডিও লিংক সম্পূর্ণ অক্ষুণ্ণ ও সম্পূর্ণ সুরক্ষিত আছে
  const botVideos = [
    "https://i.imgur.com/qUJvQud.mp4", "https://i.imgur.com/HFudaEm.mp4",
    "https://i.imgur.com/i8nxwCR.mp4", "https://i.imgur.com/zygQoCK.mp4",
    "https://i.imgur.com/qYTXUUb.mp4", "https://i.imgur.com/zqVszYj.mp4",
    "https://i.imgur.com/AmXhkTP.mp4", "https://i.imgur.com/T3yb7jy.mp4",
    "https://i.imgur.com/Bfq83Nl.mp4", "https://i.imgur.com/iWRa1uU.mp4",
    "https://i.imgur.com/YniEZIV.mp4", "https://i.imgur.com/gBrSoBB.mp4",
    "https://i.imgur.com/uetKIMp.mp4", "https://i.imgur.com/2YJexzw.mp4"
  ];

  const premiumEmojis = ["👑","𓆩👑𓆪","🔱","⚜️","💎","🔮","🪬","🧿✨","⚡","🔥"];
  const emo1 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];
  
  // ১০টি রাজকীয় ও আকর্ষণীয় মডেলিং ফ্রেম (কোনো বাড়তি ফাঁকা জায়গা ছাড়া একদম সোজা ও টাইট)
  const frames = [
    `╭─•──•──•─ 👑 ──•──•──•─╮`,
    `╔═══════ 𓆩 ${emo1} 𓆪 ═══════╗`,
    `┏━━━━━━ ❃ ${emo1} ❃ ━━━━━━┓`,
    `🦋┄┅══════ ❁ ${emo1} ❁ ══════┅┄🦋`,
    `🎗️━━━━━━━ 𓆩 ${emo1} 𓆪 ━━━━━━━🎗️`,
    `⚜️═════ 𓆩 ${emo1} 𓆪 ═════⚜️`,
    `🔱▬▬▬▬▬▬ 𓆩 ${emo1} 𓆪 ▬▬▬▬▬▬🔱`,
    `💎𓆩🔮𓆪━━━━━━━━━━━━━━𓆩🔮𓆪💎`,
    `💠═══════ 𓆩 ${emo1} 𓆪 ═══════💠`,
    `✨── ┄┉❈✡️👑চাঁদেড়~পাহাড়✿⃝🪬❈┉┄ ──✨`
  ];
  const frameTop = frames[Math.floor(Math.random() * frames.length)];

  // মেসেঞ্জারে যেন লাইন বিন্দুমাত্র না ভেঙে মোবাইল স্ক্রিনে নিখুঁত ফিট দেখায়
  const prefixBody = `${frameTop}
│ 🤖 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 𝗫𝟲𝟲𝟲 𝗡𝗘𝗧𝗪𝗢𝗥𝗞
│ ⚙️ 𝗣𝗿𝗲𝗳𝗶𝘅: 𓆩 ${currentPrefix} 𓆪
│ 🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲𝗱 💎
│ 👑 𝗢owner: 𝗕𝗘𝗟𝗔𝗟 𝗬𝗧 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
│ 🎭 𝗡𝗶𝗰𝗸: চাঁদেড়~পাহাড়✿⃝🪬
│ 🕒 𝗧𝗶𝗺𝗲: ${time}
╰───────────────────────────────┈`;

  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
    
    // ভিডিও লোড লেট হওয়া বন্ধ করতে সরাসরি মেমোরি স্ট্রিম (wow লজিক)
    const stream = await fastStream(botVideos);
    
    await api.sendMessage({ body: prefixBody, attachment: stream }, threadID, messageID);
    api.setMessageReaction("✅", messageID, () => {}, true);
  } catch {
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage(prefixBody, threadID, messageID);
  }
};
    
