var mysterious = "Siegfried Sama";
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "ccc",
  version: "3.1.0",
  hasPermssion: 0,
  credits: `${mysterious}`,
  description: "girl to boy slap",
  commandCategory: "...",
  usages: "[tag]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, mentions } = event;

  const link = [
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
    "https://i.imgur.com/9vaarKK.gif"
  ];

  // mention চেক
  const mentionIDs = Object.keys(mentions || {});
  if (!mentionIDs.length) {
    return api.sendMessage("❌ Mention 1 person that you want to slap!", threadID, messageID);
  }

  const targetID = mentionIDs[0];
  const tag = (mentions[targetID] || "").replace("@", "");

  // cache ফোল্ডার তৈরি
  const cacheDir = path.join(process.cwd(), "cache");
  await fs.ensureDir(cacheDir);

  const filePath = path.join(cacheDir, `slap_${event.senderID}_${Date.now()}.gif`);
  const randomLink = link[Math.floor(Math.random() * link.length)];

  try {
    // axios দিয়ে GIF ডাউনলোড
    const response = await axios({
      method: "get",
      url: randomLink,
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });

    await fs.writeFile(filePath, Buffer.from(response.data));

    return api.sendMessage({
      body: `╭──────•◈•───────╮\n\n\n 🖕🖕 @${tag}\n\n  আই চুষে দিব 🥵 🤏\n\n\n╰──────•◈•───────╯`,
      mentions: [{ tag: `@${tag}`, id: targetID }],
      attachment: fs.createReadStream(filePath)
    }, threadID, () => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, messageID);

  } catch (error) {
    console.error(error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return api.sendMessage(`❌ GIF লোড করতে ব্যর্থ: ${error.message}`, threadID, messageID);
  }
};
