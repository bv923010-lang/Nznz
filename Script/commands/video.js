const axios = require("axios");
const fs = require("fs");

// বেস API URL (আপনার দেওয়া দ্বিতীয় ফাইল থেকে নেওয়া)
const getBaseApi = async () => {
  const res = await axios.get("https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json");
  return res.data.api;
};

module.exports = {
  config: {
    name: "video",
    aliases: ["vid", "yt", "ভিডিও"],
    version: "3.2.0",
    author: "Belal YT (API fixed)",
    countDown: 15,
    role: 0,
    shortDescription: "YouTube ভিডিও ডাউনলোড করে (API based)",
    category: "Media",
    guide: "{pn} <ভিডিওর নাম বা লিংক>",
  },

  async run({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) {
      return api.sendMessage(
        "🎬 ব্যবহার: /video <ভিডিওর নাম বা ইউটিউব লিংক>\nউদাহরণ: /video Arijit Singh songs",
        threadID
      );
    }

    try { api.setMessageReaction("🔍", messageID, () => {}, true); } catch {}

    // চেক করা লিংক নাকি কিওয়ার্ড
    const ytRegex = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/;
    const match = query.match(ytRegex);
    let videoId = match ? match[1] : null;

    try {
      const baseApi = await getBaseApi();

      // যদি লিংক না হয়, তাহলে সার্চ করে প্রথম ভিডিওর আইডি নিয়ে নিচ্ছি
      if (!videoId) {
        const searchRes = await axios.get(`${baseApi}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        const videos = searchRes.data;
        if (!videos || videos.length === 0) throw new Error("কোন ভিডিও পাওয়া যায়নি");
        videoId = videos[0].id;
      }

      // ডাউনলোড লিংক আনার জন্য API কল
      const { data: dlData } = await axios.get(`${baseApi}/ytDl3?link=${videoId}&format=mp4&quality=3`);
      if (!dlData.downloadLink) throw new Error("ডাউনলোড লিংক পাওয়া যায়নি");

      // টেম্প ফাইল নাম
      const fileName = `yt_${videoId}.mp4`;
      const filePath = `/tmp/${fileName}`;  // রিপ্লিটে /tmp কাজ করে

      // ডাউনলোড করে ফাইল সেভ
      const response = await axios.get(dlData.downloadLink, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      // মেসেঞ্জারে পাঠানো
      await api.sendMessage(
        {
          body: `🎬 ${dlData.title}\n📀 Quality: ${dlData.quality || "480p"}`,
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => {
          // ফাইল ডিলিট করে দেওয়া
          try { fs.unlinkSync(filePath); } catch(e) {}
        },
        messageID
      );

      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

    } catch (err) {
      console.error("Video error:", err);
      try { api.setMessageReaction("⚠️", messageID, () => {}, true); } catch {}
      return api.sendMessage(
        `❌ ভিডিও ডাউনলোড ব্যর্থ হয়েছে।\n${err.message || "অজানা ত্রুটি"}`,
        threadID
      );
    }
  },
};
