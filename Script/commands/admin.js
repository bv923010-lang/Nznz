/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  👑 admin.js — Ultra Modeling Public Master Command
  💎 Designed Specially for: MASTER BELAL
  ✨ Powered by: BELAL BOTX666 | Bot Developer of Belal Master
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
"use strict";
const path = require("path");
const fs = require("fs-extra");
const axios = require("axios");

// মাস্টারের রয়্যাল পিকচার কালেকশন (লিংকগুলো সম্পূর্ণ অক্ষুণ্ণ আছে)
const masterPics = [
  "https://i.imgur.com/FQQq8WH.jpeg",
  "https://i.imgur.com/6b6DGcW.jpeg"
];

module.exports.config = {
  name: "admin",
  aliases: ["master", "owner", "belal"],
  version: "5.0.0",
  author: "Belal YT",
  description: "Master Dashboard — সবার জন্য উন্মুক্ত পাবলিক কমান্ড",
  usage: "/admin [unsend | reload | maintenance on/off]",
  category: "👑 মাস্টার",
  cooldowns: 2,
  hasPermssion: 0, // ০ করায় এখন সবাই ব্যবহার করতে পারবে
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, messageReply } = event;

  // ৩০০+ এ টু জেড সব ধরনের রয়্যাল ও আল্ট্রা-প্রিমিয়াম ইমোজি ডাটাবেজ
  const premiumEmojis = [
    "👑","𓆩👑𓆪","🔱","⚜️","💎","🔮","🪬","🧿","✡️","✨","⚡","🔥","💥","❤️‍🔥","💘","💝","💖","💗","💓",
    "💞","💕","💟","❣️","🖤","💜","💙","💚","💛","🧡","❤️","🤍","🥂","🍾","🍷","🥃","🍹","🍨","🧁","🍒",
    "🍓","🍑","🍇","🌴","🌹","🥀","🌸","💮","🕊️","🦅","🦁","🐅","🐆","🦄","🦊","🦋","👾","🛸","🚀","🏎️",
    "🏍️","🎸","🎹","🎧","🎤","🎨","🍿","🎬","🎰","♟️","🎯","🎲","🎴","🃏","🪄","👑","🔱","💎","🔮","🪬",
    "🧿","✡️","💸","💵","🪙","🪐","🌌","✨","⚡","🔥","💥","❤️‍🔥","💘","💝","💖","💗","💓","💞","💕","💟",
    "❣️","🖤","💜","💙","💚","💛","🧡","❤️","🤍","🥂","🍾","🍷","🫗","🍹","🍨","🧁","🍒","🍓","🍑","🍇",
    "🌹","🥀","🌸","💮","🕊️","🦅","🦁","🐅","🐆","🦄","🦊","🦋","🦋","👾","🛸","🚀","🏎️","🏍️","🎸","🎹",
    "🎧","🎤","🎨","🍿","🎬","🎰","♟️","🛡️","⚔️","🏹","🎒","🎖️","🏆","🏅","🥇","🥈","🥉","🎵","🎶","🎼",
    "📯","🎷","🎺","🎻","🪕","🥁","🪗","🎸","🎹","🌟","⭐","🌙","🪐","🌜","☀️","🌤️","⛅","⛈️","🌨️","🌬️"
  ];

  const emo1 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];
  const emo2 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];
  const emo3 = premiumEmojis[Math.floor(Math.random() * premiumEmojis.length)];

  // ১০ রকমের স্পেশাল ও চমৎকার রাজকীয় মডেলিং নকশা ডিজাইন ফ্রেম
  const masterDesigns = [
    `╭─•──•──•─ 👑 ─•──•──•─╮\n\n     ✦─⃝‌‌  𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 𝕏𝟞𝟞𝟞 ✦\n\n╰─•──•──•─ ❁ ${emo1} ❁ ─•──•──•─╯`,
    `╔══════════ 𓆩 ${emo1} 𓆪 ══════════╗\n\n     ✦─꯭─⃝  𝑩𝑬𝑳𝑨𝑳 𝑩𝑶𝑻 𝑿𝟔𝟔𝟔 𓆩✨𓆪\n\n╚══════════ 𓆩 ${emo2} 𓆪 ══════════╝`,
    `┏━━━━━━━ ❃ ${emo1} ❃ ━━━━━━━┓\n\n    ✨ 𝗕𝗘𝗟𝗔𝗟 𝗕𝗢𝗧 密碼𝟲𝟲𝟲 ✨\n\n┗━━━━━━━ ❃ 👑 ❃ ━━━━━━━┛`,
    `🦋┄┅═══════❁ ${emo1} ❁═══════┅┄🦋\n\n     ✦─⃝‌‌ 𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 𝕏𝟞𝟞𝟞 💃✦\n\n🦋┄┅═══════❁ ${emo2} ❁═══════┅┄🦋`,
    `🎗️━━━━━━━━━𓆩 ${emo1} 𓆪━━━━━━━━━🎗️\n\n     ✦─꯭─⃝  𝑩𝑬𝑳𝑨𝑳 𝑩𝑶𝑻 𝑿𝟔𝟔𝟔 ✨\n\n🎗️━━━━━━━━━𓆩 ${emo2} 𓆪━━━━━━━━━🎗️`,
    `⚜️═════•𓆩 ${emo1} 𓆪•═════⚜️\n\n    ✨ ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄ ✨\n\n⚜️═════•𓆩 ${emo2} 𓆪•═════⚜️`,
    `🔱▬▬▬▬▬▬▬𓆩 ${emo1} 𓆪▬▬▬▬▬▬▬🔱\n\n     👑 𝖡𝖮𝖳 𝖣𝖤𝖵𝖤𝖫𝖮𝖯𝖤𝖱 𝖮𝖥 𝖡𝖤𝖫𝖮𝖫 𝖬𝖳 👑\n\n🔱▬▬▬▬▬▬▬𓆩 ${emo2} 𓆪▬▬▬▬▬▬▬🔱`,
    `💎𓆩🔮𓆪━━━━━━━━━━━━━━━━𓆩🔮𓆪💎\n\n     ✦─꯭─⃝  𝑩𝑬𝑳𝑨𝑳 𝑩𝑶𝑻 𝑿𝟔𝟔𝟔 🥵${emo1}\n\n💎𓆩🔮𓆪━━━━━━━━━━━━━━━━𓆩🔮𓆪💎`,
    `💠═════════•𓆩 ${emo1} 𓆪•═════════💠\n\n     ✦─⃝‌‌ 𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 𝕏𝟞𝟞𝟞 ✡️✦\n\n💠═════════•𓆩 ${emo2} 𓆪•═════════💠`,
    `✨───•𓆩 ${emo1} 𓆪•───•𓆩 ${emo2} 𓆪•───✨\n\n    ✨ ┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄ ✨\n\n✨───•𓆩 ${emo3} 𓆪•───•𓆩 ${emo1} 𓆪•───✨`
  ];
  
  const chosenFrame = masterDesigns[Math.floor(Math.random() * masterDesigns.length)];
  const sub = args[0]?.toLowerCase();

  // আল্ট্রা লেভেল ইমেজ স্ট্রিমিং মেকানিজম
  async function sendWithMasterPic(textMessage) {
    try {
      const selectedPic = masterPics[Math.floor(Math.random() * masterPics.length)];
      const imgStream = (await axios.get(selectedPic, { responseType: "stream" })).data;
      return api.sendMessage({ body: textMessage, attachment: imgStream }, threadID, messageID);
    } catch (err) {
      return api.sendMessage(textMessage, threadID, messageID);
    }
  }

  // ━━━ unsend ━━━
  if (sub === "unsend") {
    if (!messageReply) return api.sendMessage("❌ কোন মেসেজ reply করে /admin unsend লিখুন।", threadID, messageID);
    try {
      await api.unsendMessage(messageReply.messageID);
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}
      const unsendMsg = `${chosenFrame}\n\n✅ টার্গেটেড মেসেজটি সফলভাবে মুছে ফেলা হয়েছে!`;
      return sendWithMasterPic(unsendMsg);
    } catch (e) { return api.sendMessage(`❌ ত্রুটি: ${e.message}`, threadID, messageID); }
    return;
  }

  // ━━━ reload ━━━
  if (sub === "reload") {
    try { api.setMessageReaction("🔄", messageID, () => {}, true); } catch {}
    api.sendMessage("🔄 সিস্টেম রিলোড হচ্ছে...", threadID, async () => {
      try {
        global.client.commands.clear();
        global.client.eventRegistered = [];
        const cmdDir = path.join(process.cwd(), "Script", "commands");
        const files = fs.readdirSync(cmdDir).filter(f => f.endsWith(".js") && !f.startsWith("_"));
        let ok = 0;
        for (const file of files) {
          try {
            delete require.cache[require.resolve(path.join(cmdDir, file))];
            const cmd = require(path.join(cmdDir, file));
            if (!cmd.config?.name || !cmd.run) continue;
            if (cmd.handleEvent) global.client.eventRegistered.push(cmd.config.name);
            global.client.commands.set(cmd.config.name, cmd);
            ok++;
          } catch {}
        }
        const reloadMsg = `${chosenFrame}\n\n✅ রিলোড সম্পূর্ণ সাকসেসফুল!\n📦 আল্ট্রা কোড ডিরেক্টরি থেকে ${ok}টি প্রিমিয়াম কমান্ড লোড হয়েছে।`;
        return sendWithMasterPic(reloadMsg);
      } catch (e) { return api.sendMessage(`❌ রিলোড ব্যর্থ: ${e.message}`, threadID, messageID); }
    });
    return;
  }

  // ━━━ maintenance ━━━
  if (sub === "maintenance") {
    const mode = args[1]?.toLowerCase();
    if (!["on", "off"].includes(mode))
      return api.sendMessage("❌ সঠিক ব্যবহার: /admin maintenance on/off", threadID, messageID);
    global.config._maintenance = (mode === "on");
    
    const maintMsg = mode === "on"
      ? `${chosenFrame}\n\n🔧 Maintenance Mode: [ चालू / ON ]\n⚠️ বট এখন মেইনটেন্যান্স মোডে লক করা হয়েছে।`
      : `${chosenFrame}\n\n✅ Maintenance Mode: [ বন্ধ / OFF ]\n🌟 বট পুনরায় স্বাভাবিকভাবে রান করছে।`;
    
    return sendWithMasterPic(maintMsg);
  }

  // ━━━ রয়্যাল মেইন পাবলিক ড্যাশবোর্ড ━━━
  const masterDashboard = `${chosenFrame}\n` +
    `👑 𝗠𝗔𝗦𝗧𝗘𝗥 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔱 𝖱𝖾𝖺𝗅 𝖭𝖺𝗆𝖾: ${emo1} Belal\n` +
    `🦋 𝖭𝖨𝖢𝖪𝖭𝖠𝖬𝖤: চাঁদের পাহাড়\n` +
    `📅 𝖠𝗀𝖾: ১৯+ বছর\n` +
    `📍 𝖫𝗈𝖼𝖺𝗍𝗂𝗈𝗇: কুড়িগ্রাম, বাংলাদেশ\n` +
    `📧 𝖤𝗆𝖺𝗂𝗅: mzbelalmzbelal@gmail.com\n` +
    `🛸 𝖱𝗈𝗅𝖾: Bot Developer of Belal Master\n\n` +
    `🔗 𝖥𝖺𝖼𝖾𝖻联𝗈𝗄 𝖨𝖣𝗌:\n` +
    `১. fb.com/mahi.gaming.165\n` +
    `২. fb.com/profile.php?id=61577502464880\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `⚙️ 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 (𝗣𝗨𝗕𝗟𝗜𝗖):\n` +
    `• /admin unsend  ── মেসেজ Reply করে ডিলিট করো\n` +
    `• /admin reload  ── সম্পূর্ণ কমান্ড রিলোড করো\n` +
    `• /admin maintenance on/off ── বট লক/আনলক`;

  try { api.setMessageReaction("👑", messageID, () => {}, true); } catch {}
  return sendWithMasterPic(masterDashboard);
};
