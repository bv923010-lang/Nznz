/*
 * song.js — Fixed v3.3
 * ✅ External API দিয়ে download
 * ✅ GoatWrapper নেই
 * ✅ handleReply কাজ করে
 */
const axios = require("axios");
const fs    = require("fs-extra");
const path  = require("path");

const getApi = async () => {
  const r = await axios.get(
    "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json",
    { timeout: 10000 }
  );
  return r.data.api;
};

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play", "mp3", "audio", "গান"],
    version: "3.3.0",
    author: "Belal YT",
    countDown: 10,
    role: 0,
    hasPermssion: 0,
    shortDescription: "গান সার্চ করে ডাউনলোড করে পাঠায়",
    category: "media",
    guide: { en: "{pn} <গানের নাম>" },
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    if (!args.length) return api.sendMessage(
      "🎵 ব্যবহার: /song <গানের নাম>\nউদাহরণ: /song Bohemian Rhapsody", threadID, messageID
    );

    const keyword = args.join(" ").trim();
    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);
      const base = await getApi();
      const results = (await axios.get(
        `${base}/ytFullSearch?songName=${encodeURIComponent(keyword)}`, { timeout: 15000 }
      )).data.slice(0, 6);

      if (!results.length) return api.sendMessage(`⭕ "${keyword}" এর কোনো গান পাওয়া যায়নি।`, threadID, messageID);

      let msg = `🎵 "${keyword}"\n${"─".repeat(22)}\n\n`;
      const thumbs = [];
      for (let i = 0; i < results.length; i++) {
        thumbs.push(streamImg(results[i].thumbnail, `st${i+1}.jpg`));
        msg += `${i+1}. ${results[i].title}\n⏱️ ${results[i].time} | ${results[i].channel?.name||"?"}\n\n`;
      }
      msg += "👉 নম্বর দিয়ে reply করুন (১-৬)";

      const imgs = await Promise.all(thumbs);
      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage({ body: msg, attachment: imgs }, threadID, (err, info) => {
        if (err || !info) return;
        global.client.handleReply.push({
          name: "song",
          messageID: info.messageID,
          author: senderID,
          result: results,
        });
      }, messageID);
    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage(`❌ Search ব্যর্থ: ${e.message?.slice(0,100)}`, threadID, messageID);
    }
  },

  handleReply: async function ({ api, event, handleReply }) {
    const { threadID, messageID, senderID, body } = event;
    if (senderID !== handleReply.author) return;
    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > handleReply.result.length)
      return api.sendMessage("❌ সঠিক নম্বর দিন (১-৬)।", threadID, messageID);

    const vid = handleReply.result[choice - 1];
    try { await api.unsendMessage(handleReply.messageID); } catch {}

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const base = await getApi();
      const { data: { title, downloadLink, quality } } = await axios.get(
        `${base}/ytDl3?link=${vid.id}&format=mp3&quality=3`, { timeout: 40000 }
      );
      const cacheDir = path.join(process.cwd(), "tmp");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `song_${Date.now()}.mp3`);
      const buf = (await axios.get(downloadLink, { responseType: "arraybuffer", timeout: 60000 })).data;
      await fs.writeFile(filePath, Buffer.from(buf));
      await api.sendMessage(
        { body: `🎵 ${title}\n📊 ${quality}\n🎶 উপভোগ করুন!`, attachment: fs.createReadStream(filePath) },
        threadID, () => fs.remove(filePath).catch(()=>{}), messageID
      );
      api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (e) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      api.sendMessage(`❌ ডাউনলোড ব্যর্থ: ${e.message?.slice(0,100)}`, threadID, messageID);
    }
  },
};

async function streamImg(url, name) {
  const r = await axios.get(url, { responseType: "stream", timeout: 10000 });
  r.data.path = name;
  return r.data;
                       }
    
