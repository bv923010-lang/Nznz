const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
    name: "admin",
    version: "10.0.0",
    hasPermssion: 0,
    credits: "BELAL BOTX666",
    description: "👑 আল্ট্রা রয়্যাল ওনার ইনফরমেশন ড্যাশবোর্ড",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY | hh:mm A");
    const myFB1 = "https://www.facebook.com/mahi.gaming.165";
    const myFB2 = "https://www.facebook.com/profile.php?id=61577502464880";
    
    // আপনার দেওয়া পিকচার লিংক দুটি
    const masterPics = [
        "https://i.imgur.com/6b6DGcW.jpeg",
        "https://i.imgur.com/FQQq8WH.jpeg"
    ];
    
    const cachePath = __dirname + `/cache/admin_${event.senderID}.jpg`;
    
    // ৩০০+ প্রিমিয়াম ইমোজি থেকে সিলেক্টেড
    const premiumEmojis = ["👑","𓆩👑𓆪","🔱","⚜️","💎","🔮","🪬","🧿","✡️","✨","⚡","🔥","💥","🌟","🕊️"];
    const emo1 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];
    
    // ১০টি রয়্যাল মডেলিং ফ্রেম (প্রতিবার র্যান্ডমলি আসবে)
    const frames = [
        `╭─•──•──•─ 👑 ──•──•──•─╮`,
        `╔═══════ 𓆩 ${emo1} 𓆪 ═══════╗`,
        `┏━━━━━━ ❃ ${emo1} ❃ ━━━━━━┓`,
        `🦋┄┅══════ ❁ ${emo1} ❁ ══════┅┄🦋`,
        `🎗️━━━━━━━ 𓆩 ${emo1} 𓆪 ━━━━━━━🎗️`,
        `⚜️═════ 𓆩 ${emo1} 𓆪 ═════⚜️`,
        `🔱▬▬▬▬▬▬ 𓆩 ${emo1} ▬▬▬▬▬▬🔱`,
        `💎𓆩🔮𓆪━━━━━━━━━━━━━━𓆩🔮𓆪💎`,
        `💠═══════ 𓆩 ${emo1} ═══════💠`,
        `✨─── ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄ ───✨`
    ];
    const frameTop = frames[Math.floor(Math.random() * frames.length)];

    const callback = () => api.sendMessage({
        body: `${frameTop}

  👑 𝗠𝗔𝗦𝗧𝗘𝗥 𝗕𝗘𝗟𝗔𝗟 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 👑

  👤 𝗡𝗮𝗺𝗲      : 𝗕𝗘𝗟𝗔𝗟 𝗬𝗧 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱)
  🎭 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲  : ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄
  🚹 𝗚𝗲𝗻𝗱𝗲𝐫    : 𝗠𝗮𝗹𝗲 ${emo1}
  ❤️ 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻  : 𝗥𝗼𝘆𝗮𝗹 💎
  🎂 𝗔𝗴𝗲       : 𝟭𝟵+
  🕌 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻  : 𝗜𝘀𝗹𝗮𝗺 (🕋)
  🏫 𝗣𝗿𝗼𝗳𝗲𝘀𝘀𝗶𝗼𝗻 : 𝗕𝗼𝘁 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 / 𝗕𝘂𝘀𝗶𝗻𝗲𝘀𝘀 𝗠𝗮𝗻
  🏡 𝗔𝗱𝗱𝗿𝗲𝘀𝘀  : 𝗞𝘂𝗿𝗶𝗴𝗿𝗮𝗺, 𝗕𝗗 🇧🇩

  ┈─────── 🌐 𝗖𝗼𝗻𝗻𝗲𝗰𝘁 𝗠𝗲 ───────┈
  🔗 𝗙𝗕-𝟭 : ${myFB1}
  🔗 𝗙𝗕-𝟮 : ${myFB2}
  📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 : দিব না 😁
  🎬 𝗧𝗶𝗸𝗧𝗼𝗸   : চাঁদের পাহাড়

  🕒 𝗨𝗽𝗱𝗮𝘁𝗲𝗱   : ${time}
  🛡️ 𝗦𝘁𝗮𝘁𝘂𝘀   : 𝗢𝗻𝗹𝗶𝗻𝗲 & 𝗔𝗰𝘁𝗶𝘃𝗲

  💡 "যোগ্যতা অর্জনে সময় ব্যয় করুন, ভাগ্য এমনিতেই বদলে যাবে।"`,
        attachment: fs.createReadStream(cachePath)
    }, event.threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    });

    // র্যান্ডম ইমেজ সিলেক্টর
    const selectedImageURL = masterPics[Math.floor(Math.random() * masterPics.length)];

    if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");

    return request(encodeURI(selectedImageURL))
        .pipe(fs.createWriteStream(cachePath))
        .on('close', () => callback());
};
