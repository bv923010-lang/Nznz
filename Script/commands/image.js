/*
╔══════════════════════════════════════════════════════════════════╗
║       🖼️ image.js — সুপার ইমেজ কমান্ড                          ║
║   avatar • frame • blur • gray • invert • wanted • ship         ║
║   trigger • wasted • quote • aesthetic • roast • meme           ║
║   BELAL BOTX666 | Master: Belal YT | Version: 3.0.0             ║
║   ✅ No Paid API  ✅ Stream Safe  ✅ Auto Cleanup  ✅ Fast       ║
╚══════════════════════════════════════════════════════════════════╝
*/
"use strict";

const axios  = require("axios");
const fs     = require("fs-extra");
const path   = require("path");
const { Readable } = require("stream");

// ══════════════════════════════════════════════════════
//  CACHE DIR — /tmp এ রাখব, বট রিস্টার্টে অটো ক্লিয়ার
// ══════════════════════════════════════════════════════
const CACHE = path.join(process.cwd(), "Script", "events", "cache");
fs.ensureDirSync(CACHE);

// ══════════════════════════════════════════════════════
//  FAST HTTP
// ══════════════════════════════════════════════════════
const http = axios.create({
  timeout: 12000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; BelalBot/7.0)" },
});

// ══════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════
module.exports.config = {
  name: "image",
  aliases: [
    "img", "ছবি", "photo",
    "avatar", "frame", "blur", "gray", "grey", "invert",
    "wanted", "ship", "trigger", "wasted", "quote",
    "aesthetic", "roast", "meme", "jail", "burn",
    "hug", "slap", "pat", "kiss",
  ],
  version: "3.0.0",
  author: "Belal YT",
  description: "সুপার ইমেজ এফেক্ট — ১৫+ ধরনের ইমেজ ইফেক্ট ও ফান কমান্ড",
  usage:
    "/image avatar [mention/reply]\n" +
    "/image frame [mention/reply]\n" +
    "/image blur [mention/reply]\n" +
    "/image gray [mention/reply]\n" +
    "/image invert [mention/reply]\n" +
    "/image wanted [mention/reply]\n" +
    "/image wasted [mention/reply]\n" +
    "/image jail [mention/reply]\n" +
    "/image burn [mention/reply]\n" +
    "/image trigger [mention/reply]\n" +
    "/image ship [mention1] [mention2]\n" +
    "/image hug [mention/reply]\n" +
    "/image slap [mention/reply]\n" +
    "/image pat [mention/reply]\n" +
    "/image meme [টেক্সট]\n" +
    "/image quote [টেক্সট]",
  category: "🖼️ ইমেজ",
  cooldowns: 8,
  hasPermssion: 0,
};

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════

// Facebook প্রোফাইল ছবির URL বের করা
async function getAvatarUrl(api, uid) {
  try {
    const info = await api.getUserInfo(uid);
    const user = info?.[uid];
    return (
      user?.profilePicLarge ||
      user?.thumbSrc ||
      `https://graph.facebook.com/${uid}/picture?width=512&height=512&type=large`
    );
  } catch {
    return `https://graph.facebook.com/${uid}/picture?width=512&height=512&type=large`;
  }
}

// ইউজার নাম বের করা
async function getUserName(api, uid) {
  try {
    const info = await api.getUserInfo(uid);
    return info?.[uid]?.name || "বেনামী";
  } catch {
    return "বেনামী";
  }
}

// Target UID বের করা (mention/reply/self)
function getTargetID(event, argIndex = 0) {
  const mentions = Object.keys(event.mentions || {});
  if (mentions.length > argIndex) return mentions[argIndex];
  if (event.messageReply?.senderID) return event.messageReply.senderID;
  return event.senderID;
}

// URL থেকে Buffer ডাউনলোড
async function downloadBuffer(url) {
  const res = await http.get(url, { responseType: "arraybuffer", timeout: 10000 });
  return Buffer.from(res.data);
}

// Buffer কে readable stream এ রূপান্তর (fca-unofficial এর জন্য)
function bufferToStream(buf, filename = "image.png") {
  const s = Readable.from(buf);
  s.path = filename;
  return s;
}

// ফাইল সেভ করে stream দেওয়া (GIF এর জন্য)
async function urlToStream(url, filename) {
  const filePath = path.join(CACHE, filename);
  const buf = await downloadBuffer(url);
  await fs.writeFile(filePath, buf);
  return { stream: fs.createReadStream(filePath), filePath };
}

// ফাইল ক্লিনআপ (non-blocking)
function cleanup(filePath) {
  if (!filePath) return;
  setTimeout(() => fs.remove(filePath).catch(() => {}), 5000);
}

// ══════════════════════════════════════════════════════
//  API PROVIDERS — ফ্রি, কোনো key লাগবে না
//  Primary → Fallback চেইন
// ══════════════════════════════════════════════════════

// ─── Single avatar effect (canvas-based free APIs) ───
const SINGLE_EFFECTS = {
  // nekos.best — anime GIF reactions
  hug:     (uid)  => `https://nekos.best/api/v2/hug`,
  pat:     (uid)  => `https://nekos.best/api/v2/pat`,
  kiss:    (uid)  => `https://nekos.best/api/v2/kiss`,
  slap:    (uid)  => `https://nekos.best/api/v2/slap`,

  // some-random-api — avatar effects
  wanted:  (url)  => `https://some-random-api.com/canvas/misc/wanted?avatar=${encodeURIComponent(url)}`,
  wasted:  (url)  => `https://some-random-api.com/canvas/misc/wasted?avatar=${encodeURIComponent(url)}`,
  jail:    (url)  => `https://some-random-api.com/canvas/misc/jail?avatar=${encodeURIComponent(url)}`,
  triggered:(url) => `https://some-random-api.com/canvas/misc/triggered?avatar=${encodeURIComponent(url)}`,
  blur:    (url)  => `https://some-random-api.com/canvas/filter/blur?avatar=${encodeURIComponent(url)}`,
  gray:    (url)  => `https://some-random-api.com/canvas/filter/greyscale?avatar=${encodeURIComponent(url)}`,
  invert:  (url)  => `https://some-random-api.com/canvas/filter/invert?avatar=${encodeURIComponent(url)}`,
  burn:    (url)  => `https://some-random-api.com/canvas/overlay/comrade?avatar=${encodeURIComponent(url)}`,
  frame:   (url)  => `https://some-random-api.com/canvas/overlay/gay?avatar=${encodeURIComponent(url)}`,
};

// ─── Ship API ───
function shipUrl(url1, url2) {
  return `https://some-random-api.com/canvas/misc/ship?avatar=${encodeURIComponent(url1)}&partnersAvatar=${encodeURIComponent(url2)}`;
}

// ─── Quote card (quotable.io) ───
async function fetchQuote() {
  const res = await http.get("https://api.quotable.io/random?maxLength=100");
  return res.data;
}

// ── Meme (reddit scrape, no key) ──
async function fetchMeme() {
  const subs = ["memes", "dankmemes", "me_irl", "AdviceAnimals"];
  const sub  = subs[Math.floor(Math.random() * subs.length)];
  const res  = await http.get(`https://meme-api.com/gimme/${sub}`);
  return res.data; // { title, url, postLink, subreddit }
}

// ══════════════════════════════════════════════════════
//  SUB-COMMAND RUNNERS
// ══════════════════════════════════════════════════════

// ─── avatar (HD প্রোফাইল ছবি) ───
async function runAvatar(api, event) {
  const uid = getTargetID(event);
  const avatarUrl = await getAvatarUrl(api, uid);
  const name = await getUserName(api, uid);
  const buf = await downloadBuffer(avatarUrl);
  return {
    body: `🖼️ ${name} এর প্রোফাইল ছবি\n🆔 UID: ${uid}`,
    attachment: bufferToStream(buf, "avatar.jpg"),
  };
}

// ─── single-avatar effect (wanted, wasted, jail, blur...) ───
async function runSingleEffect(api, event, effectKey) {
  const uid = getTargetID(event);
  const avatarUrl = await getAvatarUrl(api, uid);
  const name = await getUserName(api, uid);
  const apiUrl = SINGLE_EFFECTS[effectKey](avatarUrl);

  const effectLabels = {
    wanted:   "🔫 WANTED পোস্টার",
    wasted:   "💀 WASTED",
    jail:     "⛓️ জেলে পুরে দিলাম",
    triggered:"😡 TRIGGERED",
    blur:     "🌫️ ব্লার ইফেক্ট",
    gray:     "🩶 গ্রেস্কেল ইফেক্ট",
    invert:   "🔄 ইনভার্ট ইফেক্ট",
    burn:     "🔥 জ্বালিয়ে দিলাম",
    frame:    "🖼️ স্পেশাল ফ্রেম",
  };

  const buf = await downloadBuffer(apiUrl);
  return {
    body: `${effectLabels[effectKey] || effectKey} — ${name}`,
    attachment: bufferToStream(buf, `${effectKey}.png`),
  };
}

// ─── ship (দুজনের মিল) ───
async function runShip(api, event) {
  const mentions = Object.keys(event.mentions || {});
  const uid1 = mentions[0] || event.senderID;
  const uid2 = mentions[1] || event.messageReply?.senderID || event.senderID;

  if (uid1 === uid2)
    return { body: "❌ দুজন আলাদা মানুষকে mention করুন।", attachment: null };

  const [url1, url2, name1, name2] = await Promise.all([
    getAvatarUrl(api, uid1),
    getAvatarUrl(api, uid2),
    getUserName(api, uid1),
    getUserName(api, uid2),
  ]);

  const apiUrl = shipUrl(url1, url2);
  const buf = await downloadBuffer(apiUrl);

  // ভালোবাসার শতকরা হিসাব (মজার জন্য random)
  const love = Math.floor(Math.random() * 41) + 60; // 60-100%

  return {
    body:
      `💑 শিপ রিপোর্ট\n` +
      `${"─".repeat(24)}\n` +
      `👫 ${name1} ❤️ ${name2}\n` +
      `💕 মিলের শতকরা: ${love}%\n` +
      (love >= 90 ? "🔥 পারফেক্ট ম্যাচ!" :
       love >= 75 ? "💖 দারুণ মিল!" :
       love >= 60 ? "😊 ভালোই আছে!" : "🙈 একটু কম মিল"),
    attachment: bufferToStream(buf, "ship.png"),
  };
}

// ─── anime reaction GIFs (hug, pat, kiss, slap) ───
async function runReaction(api, event, type) {
  const uid = getTargetID(event);
  const [senderName, targetName] = await Promise.all([
    getUserName(api, event.senderID),
    getUserName(api, uid),
  ]);

  const actionText = {
    hug:  `🤗 ${senderName} ${targetName} কে জড়িয়ে ধরল!`,
    pat:  `👋 ${senderName} ${targetName} কে মাথায় হাত বুলিয়ে দিল!`,
    kiss: `💋 ${senderName} ${targetName} কে কিস করল!`,
    slap: `👋 ${senderName} ${targetName} কে থাপ্পড় মারল! 😤`,
  };

  // nekos.best থেকে GIF URL নিয়ে ডাউনলোড করি
  const res = await http.get(`https://nekos.best/api/v2/${type}`);
  const gifUrl = res.data?.results?.[0]?.url;
  if (!gifUrl) throw new Error("GIF পাওয়া যায়নি");

  const uid_ts = `${type}_${Date.now()}`;
  const { stream, filePath } = await urlToStream(gifUrl, `${uid_ts}.gif`);

  return {
    body: actionText[type] || `${type} — ${targetName}`,
    attachment: stream,
    filePath,
  };
}

// ─── quote card ───
async function runQuote(api, event, customText) {
  let quoteText, author;

  if (customText) {
    quoteText = customText;
    const info = await api.getUserInfo(event.senderID).catch(() => null);
    author = info?.[event.senderID]?.name || "অজানা";
  } else {
    try {
      const q = await fetchQuote();
      quoteText = q.content;
      author = q.author;
    } catch {
      quoteText = "জীবন সুন্দর, ভালোবাসো।";
      author = "অজানা";
    }
  }

  // quote-image API (free)
  const encodedText = encodeURIComponent(`"${quoteText}" — ${author}`);
  const imgUrl = `https://api.popcat.xyz/texttopng?text=${encodedText}`;

  try {
    const buf = await downloadBuffer(imgUrl);
    return {
      body: `💬 Quote\n${"─".repeat(24)}\n"${quoteText}"\n— ${author}`,
      attachment: bufferToStream(buf, "quote.png"),
    };
  } catch {
    // fallback: শুধু টেক্সট
    return {
      body: `💬 Quote\n${"─".repeat(24)}\n"${quoteText}"\n— ${author}`,
      attachment: null,
    };
  }
}

// ─── meme ───
async function runMeme() {
  const meme = await fetchMeme();
  if (!meme?.url) throw new Error("Meme পাওয়া যায়নি");

  const isGif = meme.url.endsWith(".gif");
  const ext   = isGif ? "gif" : "jpg";
  const uid_ts = `meme_${Date.now()}`;

  if (isGif) {
    const { stream, filePath } = await urlToStream(meme.url, `${uid_ts}.gif`);
    return {
      body:
        `😂 MEME\n${"─".repeat(24)}\n` +
        `📌 ${meme.title}\n` +
        `📂 r/${meme.subreddit}`,
      attachment: stream,
      filePath,
    };
  }

  const buf = await downloadBuffer(meme.url);
  return {
    body:
      `😂 MEME\n${"─".repeat(24)}\n` +
      `📌 ${meme.title}\n` +
      `📂 r/${meme.subreddit}`,
    attachment: bufferToStream(buf, "meme.jpg"),
  };
}

// ── aesthetic (নাম থেকে সুন্দর aesthetic ছবি) ──
async function runAesthetic(api, event) {
  const uid  = getTargetID(event);
  const name = await getUserName(api, uid);
  const avatarUrl = await getAvatarUrl(api, uid);

  // popcat aesthetic card
  const cardUrl =
    `https://api.popcat.xyz/welcomecard` +
    `?background=https://i.imgur.com/xpSd39J.jpg` +
    `&text1=${encodeURIComponent(name)}` +
    `&text2=BELAL+BOTX666` +
    `&text3=Welcome+to+the+bot` +
    `&avatar=${encodeURIComponent(avatarUrl)}`;

  const buf = await downloadBuffer(cardUrl);
  return {
    body: `✨ Aesthetic Card — ${name}`,
    attachment: bufferToStream(buf, "aesthetic.png"),
  };
}

// ══════════════════════════════════════════════════════
//  HELP
// ══════════════════════════════════════════════════════
function showHelp(prefix) {
  return (
    `╔══════════════════════════════╗\n` +
    `║  🖼️ IMAGE — সুপার কমান্ড   ║\n` +
    `╚══════════════════════════════╝\n\n` +
    `👤 প্রোফাইল:\n` +
    `  ${prefix}image avatar — HD প্রোফাইল ছবি\n` +
    `  ${prefix}image aesthetic — স্পেশাল কার্ড\n\n` +
    `🎨 ইফেক্ট:\n` +
    `  ${prefix}image blur — ব্লার\n` +
    `  ${prefix}image gray — গ্রেস্কেল\n` +
    `  ${prefix}image invert — ইনভার্ট\n` +
    `  ${prefix}image frame — ফ্রেম\n\n` +
    `🔫 ফান:\n` +
    `  ${prefix}image wanted — ওয়ান্টেড পোস্টার\n` +
    `  ${prefix}image wasted — GTA ওয়েস্টেড\n` +
    `  ${prefix}image jail — জেলে পুরে দাও\n` +
    `  ${prefix}image burn — জ্বালিয়ে দাও\n` +
    `  ${prefix}image trigger — ট্রিগার্ড\n\n` +
    `💑 রিঅ্যাকশন:\n` +
    `  ${prefix}image ship [@১] [@২] — মিল দেখো\n` +
    `  ${prefix}image hug — জড়িয়ে ধরো\n` +
    `  ${prefix}image slap — থাপ্পড় দাও\n` +
    `  ${prefix}image pat — মাথায় হাত\n` +
    `  ${prefix}image kiss — কিস করো\n\n` +
    `🎭 কন্টেন্ট:\n` +
    `  ${prefix}image meme — র‍্যান্ডম মিম\n` +
    `  ${prefix}image quote [টেক্সট] — Quote কার্ড\n\n` +
    `💡 সব কমান্ডে mention বা reply করো`
  );
}

// ══════════════════════════════════════════════════════
//  MAIN RUNNER
// ══════════════════════════════════════════════════════
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = global.config?.PREFIX || "/";

  // alias থেকে sub-command বের করা
  const cmdAlias  = (event.body || "").trim().split(/\s+/)[0]
                      .replace(prefix, "").toLowerCase();
  const sub       = args[0]?.toLowerCase() || cmdAlias;
  const restArgs  = args.slice(1);
  const restText  = restArgs.join(" ").trim();

  // help
  if (!sub || sub === "help") {
    return api.sendMessage(showHelp(prefix), threadID, messageID);
  }

  // ⏳ loading react
  try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

  const start = Date.now();
  let result  = null;
  let filePath = null; // GIF ফাইল পথ (cleanup এর জন্য)

  try {
    switch (sub) {

      // ── প্রোফাইল ──
      case "avatar":
      case "photo":
      case "ছবি":
        result = await runAvatar(api, event);
        break;

      case "aesthetic":
        result = await runAesthetic(api, event);
        break;

      // ── ইফেক্ট ──
      case "blur":
        result = await runSingleEffect(api, event, "blur");
        break;

      case "gray":
      case "grey":
      case "grayscale":
        result = await runSingleEffect(api, event, "gray");
        break;

      case "invert":
        result = await runSingleEffect(api, event, "invert");
        break;

      case "frame":
        result = await runSingleEffect(api, event, "frame");
        break;

      // ── ফান ──
      case "wanted":
        result = await runSingleEffect(api, event, "wanted");
        break;

      case "wasted":
        result = await runSingleEffect(api, event, "wasted");
        break;

      case "jail":
        result = await runSingleEffect(api, event, "jail");
        break;

      case "burn":
        result = await runSingleEffect(api, event, "burn");
        break;

      case "trigger":
      case "triggered":
        result = await runSingleEffect(api, event, "triggered");
        break;

      // ── রিঅ্যাকশন ──
      case "ship":
        result = await runShip(api, event);
        break;

      case "hug":
        result = await runReaction(api, event, "hug");
        filePath = result.filePath;
        break;

      case "pat":
        result = await runReaction(api, event, "pat");
        filePath = result.filePath;
        break;

      case "kiss":
        result = await runReaction(api, event, "kiss");
        filePath = result.filePath;
        break;

      case "slap":
        result = await runReaction(api, event, "slap");
        filePath = result.filePath;
        break;

      // ── কন্টেন্ট ──
      case "meme":
        result = await runMeme();
        filePath = result.filePath;
        break;

      case "quote":
        result = await runQuote(api, event, restText || null);
        break;

      default:
        return api.sendMessage(
          `❌ "${sub}" নামে কোনো ইমেজ কমান্ড নেই।\n\n${showHelp(prefix)}`,
          threadID, messageID
        );
    }

    const ms = Date.now() - start;

    // ✅ success react
    try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

    // footer যোগ করো
    const body = (result.body || "") + `\n\n⚡ ${ms}ms | 🤖 BELAL BOTX666`;

    if (result.attachment) {
      api.sendMessage(
        { body, attachment: result.attachment },
        threadID,
        () => cleanup(filePath), // পাঠানো হলে GIF ফাইল মুছে দাও
        messageID
      );
    } else {
      api.sendMessage(body, threadID, messageID);
    }

  } catch (err) {
    // ❌ error react
    try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
    cleanup(filePath);

    global.log?.error(`[image] ত্রুটি: ${err.message}`);
    api.sendMessage(
      `❌ ইমেজ তৈরি করতে সমস্যা হয়েছে।\n📝 কারণ: ${err.message?.slice(0, 100)}\n\n💡 কিছুক্ষণ পর আবার চেষ্টা করুন।`,
      threadID, messageID
    );
  }
};

// GoatBot compat
module.exports.onStart = module.exports.run;
