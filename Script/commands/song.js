/*
 * song.js — Fixed Music Command v3.1
 * ✅ ytdl-core ব্যবহার (yt-dlp binary দরকার নেই)
 * ✅ Direct memory stream — disk write নেই
 * ✅ GitHub Actions / Render compatible
 * ✅ Error হলেও message পাঠায়, চুপ করে থাকে না
 */
"use strict";

const axios         = require("axios");
const ytSearch      = require("yt-search");
const { PassThrough } = require("stream");

module.exports = {
  config: {
    name: "song",
    aliases: ["music", "play", "mp3", "audio", "গান"],
    version: "3.1.0",
    author: "Belal YT",
    countDown: 15,
    role: 0,
    shortDescription: "গান ডাউনলোড করে পাঠায়",
    category: "Media",
    guide: "{pn} <গানের নাম>",
    dependencies: {
      "yt-search": "*",
      "@distube/ytdl-core": "*",
    },
  },

  async run({ api, event, args, message }) {
    const { threadID } = event;

    if (!args.length) {
      return api.sendMessage(
        "🎵 ব্যবহার: /song <গানের নাম>\nউদাহরণ: /song Bohemian Rhapsody",
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
      if (!videoInfo?.url) throw new Error("কোনো গান পাওয়া যায়নি");
    } catch (e) {
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
      return api.sendMessage(`❌ গান খুঁজে পাওয়া যায়নি: ${e.message}`, threadID);
    }

    // Duration guard
    const durSec = videoInfo.duration?.seconds || 0;
    if (durSec > 600) {
      try { api.setMessageReaction("❌", event.messageID, () => {}, true); } catch {}
      return api.sendMessage(
        `⛔ গানটি অনেক বড় (${videoInfo.duration?.timestamp})।\nসর্বোচ্চ ১০ মিনিটের গান সাপোর্টেড।`,
        threadID
      );
    }

    try { api.setMessageReaction("⏳", event.messageID, () => {}, true); } catch {}

    // ── Download via ytdl-core (memory stream) ──────────────
    try {
      const ytdl = require("@distube/ytdl-core");

      // Check if downloadable
      if (!ytdl.validateURL(videoInfo.url)) throw new Error("Invalid URL");

      const audioStream = ytdl(videoInfo.url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25, // 32MB buffer
      });

      const pass = new PassThrough();
      audioStream.pipe(pass);
      pass.path = `${sanitize(videoInfo.title)}.mp3`;

      // Error on stream
      audioStream.on("error", (e) => {
        log.error(`ytdl stream error: ${e.message}`);
      });

      try { api.setMessageReaction("✅", event.messageID, () => {}, true); } catch {}

      return api.sendMessage(
        {
          body:
            `🎵 ${videoInfo.title}\n` +
            `👤 ${videoInfo.author?.name || "Unknown"}\n` +
            `⏱️ ${videoInfo.duration?.timestamp || "?"}\n` +
            `🎶 উপভোগ করুন!`,
          attachment: pass,
        },
        threadID
      );

    } catch (streamErr) {
      log.error(`song stream ব্যর্থ: ${streamErr.message}`);

      // Fallback: send YouTube link
      try { api.setMessageReaction("⚠️", event.messageID, () => {}, true); } catch {}
      return api.sendMessage(
        `⚠️ সরাসরি ডাউনলোড ব্যর্থ হয়েছে।\n\n` +
        `🎵 ${videoInfo.title}\n` +
        `⏱️ ${videoInfo.duration?.timestamp}\n` +
        `🔗 YouTube Link:\n${videoInfo.url}\n\n` +
        `ত্রুটি: ${streamErr.message?.slice(0, 100)}`,
        threadID
      );
    }
  },
};

function sanitize(name) {
  return (name || "audio").replace(/[^\w\u0980-\u09FF _-]/g, "").slice(0, 60);
}
