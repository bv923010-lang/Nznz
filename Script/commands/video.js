/*
 * video.js — Premium Video Command
 * ✅ Pre-download size validation (HEAD request)
 * ✅ 25MB ceiling — auto falls back to audio if exceeded
 * ✅ Zero disk write — PassThrough memory stream into Messenger
 * ✅ No freezing on oversized videos
 *
 * Usage: /video <search query or URL>
 */

"use strict";

const axios           = require("axios");
const ytSearch        = require("yt-search");
const { PassThrough } = require("stream");

const MAX_VIDEO_BYTES = 25 * 1024 * 1024;  // Messenger hard limit
const MAX_DURATION_S  = 300;               // 5 min max for video
const AUDIO_FALLBACK_MAX_S = 600;          // 10 min for audio fallback

module.exports = {
  config: {
    name:        "video",
    aliases:     ["vid", "ytdl", "yt"],
    version:     "3.0.0",
    author:      "Belal YT",
    countDown:   20,
    role:        0,
    shortDescription: "ভিডিও ডাউনলোড করে পাঠায় (25MB সীমা স্বয়ংক্রিয়)",
    longDescription:
      "YouTube ভিডিও মেমোরি স্ট্রিমে পাঠায়। " +
      "25MB এর বেশি হলে স্বয়ংক্রিয়ভাবে অডিওতে রূপান্তর করে।",
    category:    "Media",
    guide:       "{pn} <ভিডিও নাম বা URL>",
    dependencies: {
      "yt-search":   "*",
      "yt-dlp-exec": "*",
    },
  },

  async run({ api, event, args, message }) {
    const { threadID } = event;

    if (!args.length)
      return message.reply(
        "🎬 ব্যবহার: /video <ভিডিওর নাম>\n" +
        "উদাহরণ: /video Avengers Endgame trailer\n\n" +
        "⚠️ ২৫MB এর বেশি হলে অটো MP3-তে পরিবর্তিত হবে।"
      );

    const query = args.join(" ");
    await message.react("🔍");

    // ── Search ──────────────────────────────────────────────────
    let videoInfo;
    try {
      const results = await ytSearch(query);
      videoInfo     = results.videos?.[0];
      if (!videoInfo) throw new Error("কোনো ভিডিও পাওয়া যায়নি");
    } catch (e) {
      await message.react("❌");
      return message.reply(`❌ ভিডিও খুঁজে পাওয়া যায়নি: ${e.message}`);
    }

    const durSecs = videoInfo.duration?.seconds || 0;
    let mode = "video";

    if (durSecs > MAX_DURATION_S) {
      if (durSecs > AUDIO_FALLBACK_MAX_S) {
        await message.react("❌");
        return message.reply(
          `⛔ ভিডিওটি অনেক বড় (${videoInfo.duration?.timestamp})।\n` +
          `সর্বোচ্চ ৫ মিনিটের ভিডিও বা ১০ মিনিটের অডিও সাপোর্টেড।\n` +
          `🔗 ${videoInfo.url}`
        );
      }
      mode = "audio";
      await message.reply(
        `⚠️ ভিডিওটি ৫ মিনিটের বেশি।\nঅডিও হিসেবে পাঠানো হচ্ছে...`
      );
    }

    await message.react("⏳");

    // ── Get download URL via yt-dlp ──────────────────────────────
    let downloadUrl, ext;
    try {
      const ytdlp  = require("yt-dlp-exec");
      const format = mode === "video"
        ? "bestvideo[ext=mp4][filesize<25M]+bestaudio[ext=m4a]/best[ext=mp4][filesize<25M]/best"
        : "bestaudio[ext=m4a]/bestaudio/best";

      const info = await ytdlp(videoInfo.url, {
        dumpSingleJson:    true,
        noWarnings:        true,
        noCallHome:        true,
        preferFreeFormats: true,
        format,
        noPlaylist:        true,
        addHeader:         ["referer:youtube.com", "user-agent:googlebot"],
      });

      downloadUrl = info?.url || info?.requested_downloads?.[0]?.url;
      ext         = mode === "video" ? "mp4" : "mp3";
      if (!downloadUrl) throw new Error("Download URL পাওয়া যায়নি");
    } catch (e) {
      await message.react("❌");
      return message.reply(`❌ yt-dlp ব্যর্থ: ${e.message}\n🔗 ${videoInfo.url}`);
    }

    // ── Pre-flight size check (HEAD request — avoids downloading) ──
    try {
      const head = await axios.head(downloadUrl, {
        timeout: 10_000,
        headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.youtube.com/" },
        maxRedirects: 5,
      });
      const size = parseInt(head.headers["content-length"] || "0");

      if (size > MAX_VIDEO_BYTES) {
        if (mode === "video") {
          // Fallback to audio instead of failing
          await message.reply(
            `⚠️ ভিডিও ফাইল ${(size / 1048576).toFixed(1)}MB — ২৫MB সীমা অতিক্রম!\n` +
            `🎵 অডিও (MP3) ফর্ম্যাটে পাঠানো হচ্ছে...`
          );
          // Recurse as audio — set flag to prevent infinite loop
          event._videoFallback = true;
          args.unshift("--audio-only");
          mode = "audio";
          // Re-fetch audio URL
          const ytdlp   = require("yt-dlp-exec");
          const aInfo   = await ytdlp(videoInfo.url, {
            dumpSingleJson: true, noWarnings: true,
            format: "bestaudio[ext=m4a]/bestaudio/best",
            noPlaylist: true,
          });
          downloadUrl = aInfo?.url;
          ext = "mp3";
          if (!downloadUrl) throw new Error("Fallback audio URL পাওয়া যায়নি");
        } else {
          await message.react("❌");
          return message.reply(
            `❌ অডিও ফাইলও ${(size / 1048576).toFixed(1)}MB — সীমার বাইরে।\n` +
            `🔗 সরাসরি লিংক: ${videoInfo.url}`
          );
        }
      }
    } catch (headErr) {
      // HEAD failed (some servers don't support it) — proceed anyway,
      // Messenger will reject if too large.
      log.warn(`HEAD চেক ব্যর্থ (${headErr.message}), স্ট্রিম চালিয়ে যাচ্ছি।`);
    }

    // ── MEMORY STREAM — Zero Disk Write ────────────────────────
    try {
      const response = await axios.get(downloadUrl, {
        responseType: "stream",
        timeout:      60_000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer":    "https://www.youtube.com/",
        },
        maxRedirects: 5,
      });

      // Live size guard on streaming content-length
      const streamSize = parseInt(response.headers["content-length"] || "0");
      if (streamSize > MAX_VIDEO_BYTES && mode === "video") {
        response.data.destroy();
        await message.react("❌");
        return message.reply(
          `❌ ফাইল ${(streamSize / 1048576).toFixed(1)}MB — ২৫MB সীমা অতিক্রম!\n` +
          `🔗 ম্যানুয়াল লিংক: ${videoInfo.url}`
        );
      }

      const pass = new PassThrough();
      response.data.pipe(pass);
      pass.path = `${sanitizeFilename(videoInfo.title)}.${ext}`;

      const emoji = mode === "video" ? "🎬" : "🎵";
      const msgBody = {
        body:
          `${emoji} ${videoInfo.title}\n` +
          `👤 ${videoInfo.author?.name || "Unknown"}\n` +
          `⏱️ ${videoInfo.duration?.timestamp || "?"}\n` +
          (mode === "audio" ? "🔊 অডিও ফর্ম্যাট (ভিডিও ২৫MB সীমা)\n" : "") +
          `👁️ ${formatViews(videoInfo.views)} views`,
        attachment: pass,
      };

      await message.react("✅");
      return api.sendMessage(msgBody, threadID);

    } catch (streamErr) {
      await message.react("❌");
      return message.reply(
        `❌ স্ট্রিম ব্যর্থ: ${streamErr.message}\n🔗 ${videoInfo.url}`
      );
    }
  },
};

function sanitizeFilename(name) {
  return (name || "video").replace(/[^a-zA-Z0-9\u0980-\u09FF _-]/g, "").slice(0, 60);
}

function formatViews(n) {
  if (!n) return "?";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
  }
        
