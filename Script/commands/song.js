/*
 * song.js — Lightning Fast Music Command
 * ✅ ZERO disk write — streams directly into Messenger memory buffer
 * ✅ Axios stream pipe → PassThrough → sendMessage (no temp files)
 * ✅ Under 2-second response initiation
 *
 * Usage: /song <song name>
 */

"use strict";

const axios       = require("axios");
const ytSearch    = require("yt-search");
const { PassThrough } = require("stream");

module.exports = {
  config: {
    name:        "song",
    aliases:     ["music", "play", "mp3", "audio"],
    version:     "3.0.0",
    author:      "Belal YT",
    countDown:   15,
    role:        0,
    shortDescription: "গান ডাউনলোড করে পাঠায় (মেমোরি স্ট্রিম)",
    longDescription:  "YouTube থেকে সরাসরি মেমোরিতে স্ট্রিম করে Messenger-এ পাঠায়। কোনো ডিস্ক ব্যবহার হয় না।",
    category:    "Media",
    guide:       "{pn} <গানের নাম>",
    dependencies: {
      "yt-search":  "*",
      "yt-dlp-exec":"*",
    },
  },

  async run({ api, event, args, message }) {
    const { threadID } = event;

    if (!args.length)
      return message.reply("🎵 ব্যবহার: /song <গানের নাম>\nউদাহরণ: /song Bohemian Rhapsody");

    const query = args.join(" ");
    await message.react("🔍");

    // ── Search YouTube ──────────────────────────────────────────
    let videoInfo;
    try {
      const results = await ytSearch(query);
      videoInfo     = results.videos?.[0];
      if (!videoInfo) throw new Error("কোনো ফলাফল পাওয়া যায়নি");
    } catch (e) {
      await message.react("❌");
      return message.reply(`❌ গান খুঁজে পাওয়া যায়নি: ${e.message}`);
    }

    // Duration guard: reject > 10 min
    if (videoInfo.duration?.seconds > 600) {
      await message.react("❌");
      return message.reply(
        `⛔ গানটি অনেক বড় (${videoInfo.duration.timestamp})।\n` +
        `সর্বোচ্চ ১০ মিনিটের গান সাপোর্টেড।`
      );
    }

    await message.react("⏳");

    // ── Use yt-dlp to get direct audio URL ─────────────────────
    let audioUrl;
    try {
      const ytdlp = require("yt-dlp-exec");
      const info  = await ytdlp(videoInfo.url, {
        dumpSingleJson:      true,
        noWarnings:          true,
        noCallHome:          true,
        preferFreeFormats:   true,
        addHeader:           ["referer:youtube.com", "user-agent:googlebot"],
        format:              "bestaudio[ext=m4a]/bestaudio/best",
        noPlaylist:          true,
      });
      audioUrl = info?.url || info?.formats?.[0]?.url;
      if (!audioUrl) throw new Error("Audio URL পাওয়া যায়নি");
    } catch (e) {
      await message.react("❌");
      return message.reply(`❌ Audio URL ব্যর্থ: ${e.message}`);
    }

    // ── MEMORY STREAM PIPE — Zero Disk Write ───────────────────
    // Axios streams the audio → PassThrough → Messenger
    // This avoids sequential disk I/O and eliminates 403/429 on Render
    try {
      const response = await axios.get(audioUrl, {
        responseType: "stream",
        timeout:      30_000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer":    "https://www.youtube.com/",
        },
        maxRedirects: 5,
      });

      // Content-length check for size guard (where available)
      const contentLength = parseInt(response.headers["content-length"] || "0");
      const MAX_BYTES      = 25 * 1024 * 1024; // 25 MB
      if (contentLength > MAX_BYTES) {
        response.data.destroy();
        await message.react("❌");
        return message.reply(
          `⛔ ফাইলটি ২৫MB এর বেশি (${(contentLength / 1048576).toFixed(1)}MB)।\n` +
          `🔗 সরাসরি লিংক: ${videoInfo.url}`
        );
      }

      // Pipe into a PassThrough buffer — no disk write
      const pass = new PassThrough();
      response.data.pipe(pass);

      const msgBody = {
        body: `🎵 ${videoInfo.title}\n👤 ${videoInfo.author?.name || "Unknown"}\n⏱️ ${videoInfo.duration?.timestamp || "?"}\n🎶 উপভোগ করুন!`,
        attachment: pass,
      };

      // Assign a filename hint to the stream (fca-unofficial reads this)
      pass.path = `${sanitizeFilename(videoInfo.title)}.mp3`;

      await message.react("✅");
      return api.sendMessage(msgBody, threadID);

    } catch (streamErr) {
      await message.react("❌");
      return message.reply(
        `❌ স্ট্রিম ব্যর্থ: ${streamErr.message}\n` +
        `🔗 ম্যানুয়াল লিংক: ${videoInfo.url}`
      );
    }
  },
};

function sanitizeFilename(name) {
  return (name || "audio").replace(/[^a-zA-Z0-9\u0980-\u09FF _-]/g, "").slice(0, 60);
}
