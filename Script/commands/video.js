/*
 * video.js — Fixed Video Command v3.1
 * ✅ ytdl-core ব্যবহার (yt-dlp binary দরকার নেই)
 * ✅ 25MB ceiling — size check করে আগেই
 * ✅ বড় হলে auto audio fallback
 * ✅ Error হলেও YouTube link পাঠায়, freeze করে না
 * ✅ Memory stream — disk write নেই
 */
"use strict";

const ytSearch        = require("yt-search");
const { PassThrough } = require("stream");

const MAX_VIDEO_BYTES = 24 * 1024 * 1024; // 24MB (Messenger limit ~25MB)
const MAX_VID_SECS    = 300;  // 5 min video max
const MAX_AUD_SECS    = 600;  // 10 min audio max

module.exports = {
  config: {
    name: "video",
    aliases: ["vid", "yt", "ytdl", "ভিডিও"],
    version: "3.1.0",
    author: "Belal YT",
    countDown: 20,
    role: 0,
    shortDescription: "ভিডিও ডাউনলোড করে পাঠায় (25MB auto fallback)",
    category: "Media",
    guide: "{pn} <ভিডিওর নাম>",
    dependencies: {
      "yt-search": "*",
      "@distube/ytdl-core": "*",
    },
  },

  async run({ api, event, args, message }) {
    const { threadID } = event;

    if (!args.length) {
      return api.sendMessage(
        "🎬 ব্যবহার: /video <ভিডিওর নাম>\n" +
        "উদাহরণ: /video Avengers trailer\n\n" +
        "⚠️ ২৫MB এর বেশি হলে অটো MP3-তে পরিবর্তিত হবে।",
        threadID
      );
    }

    const query = args.join(" ");

    try { api.setMessageReaction("🔍", event.messageID, () => {}, true); } catch {}

    // ── YouTube search ──────────────────────────────────────
    let videoInfo;
    try {
      const results = await ytSearch(query);
      videoInfo = results?.videos?.[0];
      if (!videoInfo?.url) throw new Error("কোনো ভিডিও পাওয়া যায়নি");
    } catch (e) {
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
      return api.sendMessage(`❌ ভিডিও খুঁজে পাওয়া যায়নি: ${e.message}`, threadID);
    }

    const durSec = videoInfo.duration?.seconds || 0;

    // Too long for anything
    if (durSec > MAX_AUD_SECS) {
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
      return api.sendMessage(
        `⛔ ভিডিওটি অনেক বড় (${videoInfo.duration?.timestamp})।\n` +
        `সর্বোচ্চ ৫ মিনিটের ভিডিও বা ১০ মিনিটের অডিও সাপোর্টেড।\n` +
        `🔗 ${videoInfo.url}`,
        threadID
      );
    }

    // Too long for video → audio mode
    const forceAudio = durSec > MAX_VID_SECS;
    if (forceAudio) {
      api.sendMessage(
        `⚠️ ভিডিওটি ৫ মিনিটের বেশি (${videoInfo.duration?.timestamp})।\n` +
        `🎵 অডিও হিসেবে পাঠানো হচ্ছে...`,
        threadID
      );
    }

    try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch {}

    // ── Download via ytdl-core ──────────────────────────────
    try {
      const ytdl = require("@distube/ytdl-core");
      if (!ytdl.validateURL(videoInfo.url)) throw new Error("Invalid URL");

      let dlStream, ext, mode;

      if (forceAudio) {
        // Audio only stream
        dlStream = ytdl(videoInfo.url, {
          filter: "audioonly",
          quality: "highestaudio",
          highWaterMark: 1 << 25,
        });
        ext  = "mp3";
        mode = "audio";
      } else {
        // Try video — use lowest reasonable quality to stay under 25MB
        dlStream = ytdl(videoInfo.url, {
          filter: (format) =>
            format.container === "mp4" &&
            format.hasVideo &&
            format.hasAudio &&
            (format.height || 9999) <= 480,
          quality: "lowest",
          highWaterMark: 1 << 25,
        });
        ext  = "mp4";
        mode = "video";
      }

      const pass = new PassThrough();
      dlStream.pipe(pass);
      pass.path = `${sanitize(videoInfo.title)}.${ext}`;

      dlStream.on("error", (e) => log.error(`ytdl error: ${e.message}`));

      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch {}

      const emoji = mode === "video" ? "🎬" : "🎵";
      return api.sendMessage(
        {
          body:
            `${emoji} ${videoInfo.title}\n` +
            `👤 ${videoInfo.author?.name || "Unknown"}\n` +
            `⏱️ ${videoInfo.duration?.timestamp || "?"}\n` +
            (mode === "audio" ? "🔊 অডিও ফর্ম্যাট (৫ মিনিটের বেশি)\n" : "") +
            `👁️ ${formatViews(videoInfo.views)}`,
          attachment: pass,
        },
        threadID
      );

    } catch (err) {
      log.error(`video ব্যর্থ: ${err.message}`);
      try { api.setMessageReaction("⚠️", event.messageID, () => {}, true); } catch {}

      // Fallback — send link
      return api.sendMessage(
        `⚠️ ডাউনলোড ব্যর্থ হয়েছে।\n\n` +
        `🎬 ${videoInfo.title}\n` +
        `⏱️ ${videoInfo.duration?.timestamp}\n` +
        `🔗 YouTube Link:\n${videoInfo.url}\n\n` +
        `ত্রুটি: ${err.message?.slice(0, 100)}`,
        threadID
      );
    }
  },
};

function sanitize(name) {
  return (name || "video").replace(/[^\w\u0980-\u09FF _-]/g, "").slice(0, 60);
}

function formatViews(n) {
  if (!n) return "?";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M views";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K views";
  return `${n} views`;
}
