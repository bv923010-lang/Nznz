"use strict";
const axios = require("axios");
const moment = require("moment-timezone");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "image/webp,image/apng,image/*,*/*;q=0.8"
};

// Claude-এর সেই আসল আল্ট্রা-ফাস্ট ডিরেক্ট স্ট্রিম লজিক
async function fastStream(links) {
  const pick = () => links[Math.floor(Math.random() * links.length)];
  const attempts = [pick(), pick(), pick()];
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "stream", headers: HEADERS, timeout: 15000, maxRedirects: 5 })
      .then(r => { r.data.path = "admin.jpg"; return r.data; })
  );
  return Promise.any(streams);
}

module.exports.config = {
    name: "admin",
    version: "12.0.0",
    hasPermssion: 0,
    credits: "BELAL BOTX666",
    description: "👑 আল্ট্রা রয়্যাল ওনার ইনফরমেশন ড্যাশবোর্ড (রকেট স্পিড)",
    commandCategory: "info",
    usages: "admin",
    cooldowns: 2
};

module.exports.run = async function({ api, event }) {
    const { threadID, messageID } = event;
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY | hh:mm A");
    const myFB1 = "https://www.facebook.com/mahi.gaming.165";
    const myFB2 = "https://www.facebook.com/profile.php?id=61577502464880";
    
    // আপনার দেওয়া পিকচার লিংক দুটি
    const masterPics = [
        "https://i.imgur.com/6b6DGcW.jpeg",
        "https://i.imgur.com/FQQq8WH.jpeg"
    ];
    
    // ৩০০+ প্রিমিয়াম ইমোজি থেকে সিলেক্টেড
    const premiumEmojis = ["👑","𓆩👑𓆪","🔱","⚜️","💎","🔮","🪬","🧿","✡️","✨","⚡","🔥","💥","🌟","🕊️"];
    const emo1 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];
    
    // ১০টি রাজকীয় মডেলিং ফ্রেম (টপ বর্ডার)
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
        `✨─── ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄ ───✨`
    ];
    const frameTop = frames[Math.floor(Math.random() * frames.length)];

    // অতিরিক্ত ফাঁকা জায়গা শর্ট করে একদম টাইট ও সলিড লেআউট
    const infoBody = `${frameTop}
│👑─𓆩 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 𓆪─👑
│👤 𝗡𝗮𝗺𝗲: 𓆩𝗕𝗘𝗟𝗔𝗟 𝗬𝗧 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)𓆪
│🎭 𝗡𝗶𝗰𝗸: 𓆩┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄𓆪
│🚹 𝗚𝗲𝗻𝗱𝗲𝗿: 𓆩𝗠𝗮𝗹𝗲 💎𓆪
│❤️ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻: 𓆩𝗥𝗼𝘆𝗮𝗹 💎𓆪
│🎂 𝗔𝗴𝗲: 𓆩𝟭𝟵+ 𝖸𝖾𝖺𝗋𝗌𓆪
│🕌 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻: 𓆩𝗜𝘀𝗹𝗮𝗺 (🕋)𓆪
│🏫 𝗣𝗿𝗼𝗳𝗲𝘀𝘀: 𓆩𝗕𝗼𝘁 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿/𝗕𝘂𝘀𝗶𝗻𝗲𝘀𝘀𓆪
│🏡 𝗔𝗱𝗱𝗿𝗲𝘀𝘀: 𓆩𝗞𝘂𝗿𝗶𝗴𝗿𝗮𝗺, 𝗕𝗗 🇧🇩𓆪
│🔗─𓆩 🌐 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝗠𝗘 🌐 𓆪─🔗
│🌐 𝗙𝗕-𝟭: 𓆩${myFB1}𓆪
│🌐 𝗙𝗕-𝟮: 𓆩${myFB2}𓆪
│📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽: 𓆩𝟬𝟭𝟵𝟭𝟯𝟮𝟰𝟲𝟱𝟱𝟰𓆪
│🎬 𝗧𝗶𝗸𝗧𝗼𝗸: 𓆩চাঁদের পাহাড়𓆪
│⚡─𓆩 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦 𓆪─⚡
│🕒 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: 𓆩${time}𓆪
│🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀: 𓆩𝗢𝗻𝗹𝗶𝗻𝗲 & 𝗔𝗰𝘁𝗶𝘃𝗲 💎𓆪
╰───────────────────────────────┈`;

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        
        // ডিরেক্টলি স্ট্রিম মেথডে রেসপন্স পাঠানো হচ্ছে
        const stream = await fastStream(masterPics);
        
        await api.sendMessage({ body: infoBody, attachment: stream }, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(infoBody, threadID, messageID);
    }
};
  
