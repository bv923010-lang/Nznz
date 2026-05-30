/*
 * video.js — Fixed v3.3
 * ✅ GoatWrapper নেই — সরাসরি কাজ করে
 * ✅ onStart ফাংশন (GoatBot style)
 * ✅ External API দিয়ে download (ytdl লাগে না)
 * ✅ cache/ folder auto-create
 * ✅ handleReply — number দিয়ে select
 */
const axios  = require("axios");
const fs     = require("fs-extra");
const path   = require("path");

const getApi = async () => {
  const r = await axios.get(
    "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json",
    { timeout: 10000 }
  );
  return r.data.api;
};

module.exports = {
  config: {
    name: "video",
    version: "3.3.0",
    author: "Belal YT",
    countDown: 10,
    role: 0,
    hasPermssion: 0,
    shortDescription: "YouTube ভিডিও/অডিও ডাউনলোড",
    longDescription: "YouTube search করে ভিডিও বা অডিও ডাউনলোড করে পাঠায়",
    category: "media",
    guide: { en: "{pn} -v <নাম>  |  {pn} -a <নাম>  |  {pn} -i <নাম>" },
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    let action = args[0]?.toLowerCase() || "-v";
    if (!["-v","video","mp4","-a","audio","mp3","-i","info"].includes(action)) {
      args.unshift("-v");
      action = "-v";
    }

    const ytReg = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
    const isUrl = args[1] ? ytReg.test(args[1]) : false;

    // ── Direct URL ──────────────────────────────────────────
    if (isUrl) {
      const fmt = ["-v","video","mp4"].includes(action) ? "mp4" : "mp3";
      const vid = args[1].match(ytReg)?.[1];
      if (!vid) return api.sendMessage("❌ YouTube লিংক সঠিক নয়।", threadID, messageID);
      try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        const base = await getApi();
        const { data: { title, downloadLink, quality } } = await axios.get(
          `${base}/ytDl3?link=${vid}&format=${fmt}&quality=3`, { timeout: 40000 }
        );
        const cacheDir = path.join(process.cwd(), "tmp");
        await fs.ensureDir(cacheDir);
        const filePath = path.join(cacheDir, `vid_${Date.now()}.${fmt}`);
        const buf = (await axios.get(downloadLink, { responseType: "arraybuffer", timeout: 60000 })).data;
        await fs.writeFile(filePath, Buffer.from(buf));
        await api.sendMessage(
          { body: `${fmt==="mp4"?"🎬":"🎵"} ${title}\n📊 ${quality}`, attachment: fs.createReadStream(filePath) },
          threadID, () => fs.remove(filePath).catch(()=>{}), messageID
        );
        api.setMessageReaction("✅", messageID, () => {}, true);
      } catch (e) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage(`❌ ডাউনলোড ব্যর্থ: ${e.message?.slice(0,100)}`, threadID, messageID);
      }
      return;
    }

    // ── Search ──────────────────────────────────────────────
    args.shift();
    const keyword = args.join(" ").trim();
    if (!keyword) return api.sendMessage(
      "❌ উদাহরণ:\n/video -v Bangla remix\n/video -a Bohemian Rhapsody", threadID, messageID
    );

    try {
      api.setMessageReaction("🔍", messageID, () => {}, true);
      const base = await getApi();
      const results = (await axios.get(
        `${base}/ytFullSearch?songName=${encodeURIComponent(keyword)}`, { timeout: 15000 }
      )).data.slice(0, 6);

      if (!results.length) return api.sendMessage(`⭕ "${keyword}" এর কোনো ফলাফল নেই।`, threadID, messageID);

      let msg = `🔎 "${keyword}"\n${"─".repeat(22)}\n\n`;
      const thumbs = [];
      for (let i = 0; i < results.length; i++) {
        thumbs.push(streamImg(results[i].thumbnail, `t${i+1}.jpg`));
        msg += `${i+1}. ${results[i].title}\n⏱️ ${results[i].time} | ${results[i].channel?.name||"?"}\n\n`;
      }
      msg += "👉 নম্বর দিয়ে reply করুন (১-৬)";

      const imgs = await Promise.all(thumbs);
      api.setMessageReaction("✅", messageID, () => {}, true);
      api.sendMessage({ body: msg, attachment: imgs }, threadID, (err, info) => {
        if (err || !info) return;
        global.client.handleReply.push({
          name: "video",
          messageID: info.messageID,
          author: senderID,
          result: results,
          action,
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
    const { result, action } = handleReply;
    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > result.length)
      return api.sendMessage("❌ সঠিক নম্বর দিন (১-৬)।", threadID, messageID);

    const vid = result[choice - 1];
    try { await api.unsendMessage(handleReply.messageID); } catch {}

    // Info mode
    if (["-i","info"].includes(action)) {
      try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        const base = await getApi();
        const { data: d } = await axios.get(`${base}/ytfullinfo?videoID=${vid.id}`, { timeout: 15000 });
        const thumb = await streamImg(d.thumbnail, "info.jpg");
        api.sendMessage({
          body: `✨ ${d.title}\n⏳ ${(d.duration/60).toFixed(1)} min\n👀 ${d.view_count} views\n👍 ${d.like_count} likes\n📢 ${d.channel}\n🔗 ${d.webpage_url}`,
          attachment: thumb,
        }, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
      } catch (e) {
        api.sendMessage(`❌ ব্যর্থ: ${e.message?.slice(0,100)}`, threadID, messageID);
      }
      return;
    }

    const fmt = ["-v","video","mp4"].includes(action) ? "mp4" : "mp3";
    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);
      const base = await getApi();
      const { data: { title, downloadLink, quality } } = await axios.get(
        `${base}/ytDl3?link=${vid.id}&format=${fmt}&quality=3`, { timeout: 40000 }
      );
      const cacheDir = path.join(process.cwd(), "tmp");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `vid_${Date.now()}.${fmt}`);
      const buf = (await axios.get(downloadLink, { responseType: "arraybuffer", timeout: 60000 })).data;
      await fs.writeFile(filePath, Buffer.from(buf));
      await api.sendMessage(
        { body: `${fmt==="mp4"?"🎬":"🎵"} ${title}\n📊 ${quality}`, attachment: fs.createReadStream(filePath) },
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
