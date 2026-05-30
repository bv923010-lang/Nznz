const axios = require("axios");
const fs = require("fs-extra");
const moment = require("moment-timezone");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Referer": "https://imgur.com/",
  "Accept": "video/mp4,video/*;q=0.8"
};

// মাস্টারের আসল ফেসবুক আইডি দুটি (এই আইডি ছাড়া প্রিফিক্স চেঞ্জ হবে না)
const MASTER_IDS = ["100056725134303", "61577502464880"];

async function fastVideoStream(links) {
  const pick = () => links[Math.floor(Math.random() * links.length)];
  const attempts = [pick(), pick(), pick(), pick()];
  const streams = attempts.map(url =>
    axios({ method: "GET", url, responseType: "arraybuffer", headers: HEADERS, timeout: 12000, maxRedirects: 5 })
      .then(r => r.data)
  );
  return Promise.any(streams);
}

module.exports.config = {
    name: "prefix",
    version: "16.0.0",
    hasPermssion: 0,
    credits: "BELAL BOTX666",
    description: "🤖 বটের রয়্যাল ইনফরমেশন ও প্রিফিক্স কন্ট্রোল প্যানেল",
    commandCategory: "system",
    usages: "prefix [no / /]",
    cooldowns: 2
};

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body) return;
    const msg = event.body.toLowerCase().trim();
    if (msg === "prefix") {
        return module.exports.run({ api, event, args: [] });
    }
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY | hh:mm A");
    const uptime = process.uptime();
    const hours = Math.floor(uptime / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);

    const configPath = process.cwd() + "/config.json";
    let botConfig = fs.readJsonSync(configPath);

    // ━━━ শুধুমাত্র মাস্টারের জন্য অন-দ্য-স্পট প্রিফিক্স চেঞ্জার ━━━
    if (args[0]) {
        if (!MASTER_IDS.includes(String(senderID))) {
            return api.sendMessage("⛔ দুঃখিত! এই প্রিফিক্স কন্ট্রোল সিস্টেম শুধুমাত্র বট মাস্টার ব্যবহার করতে পারবেন।", threadID, messageID);
        }
        const action = args[0].toLowerCase();
        if (action === "no") {
            botConfig.PREFIX = "";
            fs.writeJsonSync(configPath, botConfig, { spaces: 2 });
            global.config.PREFIX = "";
            return api.sendMessage("✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! বটের সমস্ত চিহ্ন রিমুভ করা হয়েছে। এখন বট (No Prefix) মোডে চলবে।", threadID, messageID);
        } else if (action === "/") {
            botConfig.PREFIX = "/";
            fs.writeJsonSync(configPath, botConfig, { spaces: 2 });
            global.config.PREFIX = "/";
            return api.sendMessage("✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! বটের প্রিফিক্স পুনরায় [ / ] মোডে সেট করা হয়েছে।", threadID, messageID);
        } else {
            return api.sendMessage("❌ সঠিক নিয়ম: 'prefix no' অথবা 'prefix /' লিখুন।", threadID, messageID);
        }
    }

    const currentPrefix = global.config?.PREFIX === "" ? "No Prefix (কোনো চিহ্ন নেই)" : global.config?.PREFIX;
    const cachePath = __dirname + `/cache/prefix_${senderID}.mp4`;

    const botVideos = [
        "https://i.imgur.com/qUJvQud.mp4", "https://i.imgur.com/HFudaEm.mp4",
        "https://i.imgur.com/i8nxwCR.mp4", "https://i.imgur.com/zygQoCK.mp4",
        "https://i.imgur.com/qYTXUUb.mp4", "https://i.imgur.com/zqVszYj.mp4",
        "https://i.imgur.com/AmXhkTP.mp4", "https://i.imgur.com/T3yb7jy.mp4",
        "https://i.imgur.com/Bfq83Nl.mp4", "https://i.imgur.com/iWRa1uU.mp4",
        "https://i.imgur.com/YniEZIV.mp4", "https://i.imgur.com/gBrSoBB.mp4",
        "https://i.imgur.com/uetKIMp.mp4", "https://i.imgur.com/2YJexzw.mp4"
    ];

    const luxuryEmojis = ["🤖","𓆩👑𓆪","🔱","⚜️","💎","🔮","🪬","🧿","✡️","✨","⚡","🔥","💥","🌟","🪐"];
    const emo1 = luxuryEmojis[Math.floor(Math.random() * luxuryEmojis.length)];

    const prefixFrames = [
        `╭─•──•──•─ 🤖 ──•──•──•─╮`,
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
    const topBorder = prefixFrames[Math.floor(Math.random() * prefixFrames.length)];

    // অতিরিক্ত ফাঁকা জায়গা ছাড়া একদম ঠাসা ও কমপ্যাক্ট লেআউট
    const prefixBody = `${topBorder}
│ 🤖───𓆩 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 𝗫𝟲𝟲𝟲 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 𓆪───🤖
│ ⚙️ 𝗕𝗼𝘁 𝗣𝗿𝗲𝗳𝗶𝘅 ••𓆩  ${currentPrefix}  𓆪
│ 🛡️ 𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘂𝘀 •𓆩 𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗦𝗲𝗰𝘂𝗿𝗲𝗱 💎 𓆪
│ 🔮 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲 •••𓆩 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 𝗫𝟲𝟲𝟲 𓆪
│ 👑 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 •𓆩 𝗕𝗘𝗟𝗔𝗟 𝗬𝗧 (𝗩𝗲𝗿𝗶𝗳𝗶𝗲𝗱) 𓆪
│ 🎭 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 ••𓆩 ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄ 𓆪
│ ⏳ 𝗨𝗽𝘁𝗶𝗺𝗲 •••••𓆩 ${hours}h ${minutes}m ${seconds}s 𓆪
│ 📡 𝗣𝗶𝗻𝗴 ••••••𓆩 𝗦𝘂𝗽𝗲𝗿 𝗙𝗮𝘀𝘁 (𝟮𝟰𝗺𝘀) 𓆪
│ 🔗───𓆩 🌐 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 𓆪───🔗
│ ⚡ 𝗘𝗻𝗴𝗶𝗻𝗲 •••••𓆩 𝖭𝗈𝖽𝖾.𝗃𝗌 𓆪
│ 📊 𝗟𝗶𝗯𝗿𝗮𝗿𝘆 ••••𓆩 𝖦𝖼𝖺-𝖧𝗈𝗋𝗂𝗓𝗈𝗇-𝖱𝖾𝗆𝖺𝖼𝗄 𓆪
│ 💎 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 ••𓆩 𝖠𝗅𝗅 𝖯𝗋𝖾𝗆𝗂𝗎𝗆 𝖢𝗈𝖽𝖾𝗌 𓆪
│ 🌌 𝗘𝗻𝘃𝗶𝗿𝗼𝗻 •••𓆩 𝖫𝗂𝗇𝗎𝖿 / 𝖵𝖯𝖲 𝖲𝖾𝗋𝖵𝖾𝗋 𓆪
│ 🕒───𓆩 𝗗𝗔𝗧𝗘 𝗔𝗡𝗗 𝗧𝗜𝗠𝗘 𓆪───🕒
│ ⏰ 𝗧𝗶𝗺𝗲𝗭𝗼𝗻𝗲 ••𓆩 𝖠𝗌𝗂𝖺 / 𝖣𝗁𝖺𝗄𝖺 🇧🇩 𓆪
│ 📅 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 •••𓆩 ${time} 𓆪
│ 🛠️───𓆩 𝗠𝗔𝗦𝗧𝗘𝗥 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗦𝗬𝗦𝗧𝗘𝗠 𓆪───🛠️
│ 👑 শুধুমাত্র মাস্টারের জন্য প্রিফিক্স চেঞ্জ কমান্ড:
│ 👉 prefix no ── চিহ্ন ছাড়া বটের কমান্ড চালানো
│ 👉 prefix /  ── স্ল্যাশ প্রিফিক্স অ্যাক্টিভেট করা
╰───────────────────────────────┈`;

    try {
        if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");

        const videoData = await fastVideoStream(botVideos);
        await fs.writeFile(cachePath, Buffer.from(videoData));

        return api.sendMessage({
            body: prefixBody,
            attachment: fs.createReadStream(cachePath)
        }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        }, messageID);

    } catch (error) {
        return api.sendMessage(prefixBody, threadID, messageID);
    }
};
