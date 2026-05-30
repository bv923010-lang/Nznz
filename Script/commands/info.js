/*
╔══════════════════════════════════════════════════════════════════╗
║       🔍 info.js — সুপার ইনফো কমান্ড                           ║
║    Wikipedia • Dictionary • Crypto • IP • Color • Joke          ║
║    BELAL BOTX666 | Master: Belal YT | Version: 2.0.0            ║
║    ✅ Zero API Key  ✅ Ultra Fast  ✅ Promise.race timeout       ║
╚══════════════════════════════════════════════════════════════════╝
*/
"use strict";

const axios = require("axios");

// ══════════════════════════════════════════════════════
//  FAST HTTP — shared axios instance, aggressive timeout
// ══════════════════════════════════════════════════════
const http = axios.create({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; BelalBot/7.0)",
    "Accept-Language": "bn,en;q=0.9",
  },
});

// timeout wrapper — যদি API slow হয় তাহলে দ্রুত fail করবে
const fetchWithTimeout = (promise, ms = 7000) =>
  Promise.race([
    promise,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("⏱️ সময় শেষ")), ms)
    ),
  ]);

// ══════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════
module.exports.config = {
  name: "info",
  aliases: ["তথ্য", "search", "খুঁজো", "wiki", "crypto", "ip", "color", "joke", "জোকস"],
  version: "2.0.0",
  author: "Belal YT",
  description: "সুপার ইনফো — Wiki, Dictionary, Crypto, IP, Color, Joke একসাথে",
  usage:
    "/info wiki [বিষয়]\n" +
    "/info crypto [coin]\n" +
    "/info ip [IP address]\n" +
    "/info dict [word]\n" +
    "/info color [hex]\n" +
    "/info joke\n" +
    "/info country [দেশের নাম]",
  category: "🔍 তথ্য",
  cooldowns: 4,
  hasPermssion: 0,
};

// ══════════════════════════════════════════════════════
//  SUB-COMMAND HANDLERS
// ══════════════════════════════════════════════════════

// ── Wikipedia ──
async function cmdWiki(query) {
  if (!query) return "❌ বিষয় লিখুন।\nউদাহরণ: /info wiki বাংলাদেশ";

  // প্রথমে বাংলা উইকি, না পেলে ইংরেজি
  const langs = ["bn", "en"];
  for (const lang of langs) {
    try {
      const { data } = await fetchWithTimeout(
        http.get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
      );
      if (data?.extract) {
        const extract = data.extract.slice(0, 600);
        return (
          `📖 উইকিপিডিয়া — ${data.title}\n` +
          `${"─".repeat(28)}\n` +
          `${extract}${data.extract.length > 600 ? "..." : ""}\n\n` +
          `🔗 ${data.content_urls?.mobile?.page || ""}`
        );
      }
    } catch {}
  }
  return `❌ "${query}" সম্পর্কে উইকিতে কিছু পাওয়া যায়নি।`;
}

// ── Crypto Price ──
async function cmdCrypto(coin) {
  if (!coin) return "❌ Coin লিখুন।\nউদাহরণ: /info crypto bitcoin";

  const coinMap = {
    btc: "bitcoin", eth: "ethereum", bnb: "binancecoin",
    usdt: "tether", sol: "solana", xrp: "ripple",
    ada: "cardano", doge: "dogecoin", trx: "tron",
    matic: "matic-network",
  };
  const id = coinMap[coin.toLowerCase()] || coin.toLowerCase();

  try {
    const { data } = await fetchWithTimeout(
      http.get(
        `https://api.coingecko.com/api/v3/simple/price` +
        `?ids=${id}&vs_currencies=usd,bdt&include_24hr_change=true&include_market_cap=true`
      )
    );
    const d = data?.[id];
    if (!d) return `❌ "${coin}" কয়েন পাওয়া যায়নি।`;

    const change = d.usd_24h_change?.toFixed(2) ?? "N/A";
    const arrow = parseFloat(change) >= 0 ? "📈" : "📉";
    const cap = d.usd_market_cap
      ? `$${(d.usd_market_cap / 1e9).toFixed(2)}B`
      : "N/A";

    return (
      `💰 ক্রিপ্টো — ${id.toUpperCase()}\n` +
      `${"─".repeat(28)}\n` +
      `💵 USD: $${d.usd?.toLocaleString()}\n` +
      `🇧🇩 BDT: ৳${d.bdt?.toLocaleString()}\n` +
      `${arrow} ২৪ঘ পরিবর্তন: ${change}%\n` +
      `📊 মার্কেট ক্যাপ: ${cap}`
    );
  } catch (e) {
    return `❌ Crypto তথ্য পাওয়া যায়নি। (${e.message})`;
  }
}

// ── IP Lookup ──
async function cmdIP(ip) {
  const target = ip?.trim() || "";
  const url = target
    ? `https://ipapi.co/${target}/json/`
    : `https://ipapi.co/json/`;

  try {
    const { data } = await fetchWithTimeout(http.get(url));
    if (data?.error) return `❌ IP "${target}" এর তথ্য পাওয়া যায়নি।`;

    return (
      `🌐 IP তথ্য — ${data.ip}\n` +
      `${"─".repeat(28)}\n` +
      `🏳️ দেশ: ${data.country_name} (${data.country_code})\n` +
      `🏙️ শহর: ${data.city || "অজানা"}\n` +
      `📍 অঞ্চল: ${data.region || "অজানা"}\n` +
      `🌍 অক্ষাংশ/দ্রাঘিমা: ${data.latitude}, ${data.longitude}\n` +
      `🏢 ISP: ${data.org || "অজানা"}\n` +
      `🕒 টাইমজোন: ${data.timezone || "অজানা"}\n` +
      `💱 মুদ্রা: ${data.currency || "অজানা"}`
    );
  } catch (e) {
    return `❌ IP তথ্য পাওয়া যায়নি। (${e.message})`;
  }
}

// ── English Dictionary ──
async function cmdDict(word) {
  if (!word) return "❌ শব্দ লিখুন।\nউদাহরণ: /info dict beautiful";

  try {
    const { data } = await fetchWithTimeout(
      http.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    );
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry) return `❌ "${word}" শব্দটি পাওয়া যায়নি।`;

    const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || "";
    let result =
      `📚 অভিধান — ${entry.word}\n` +
      `${"─".repeat(28)}\n` +
      (phonetic ? `🔊 উচ্চারণ: ${phonetic}\n\n` : "\n");

    let count = 0;
    for (const meaning of entry.meanings || []) {
      if (count >= 3) break;
      result += `📌 ${meaning.partOfSpeech}\n`;
      const defs = meaning.definitions?.slice(0, 2) || [];
      for (const def of defs) {
        result += `  • ${def.definition}\n`;
        if (def.example) result += `    উদা: "${def.example}"\n`;
      }
      result += "\n";
      count++;
    }

    const synonyms = entry.meanings?.[0]?.synonyms?.slice(0, 5);
    if (synonyms?.length) result += `🔄 সমার্থক: ${synonyms.join(", ")}`;

    return result.trim();
  } catch (e) {
    return `❌ Dictionary তথ্য পাওয়া যায়নি। (${e.message})`;
  }
}

// ── Color Info ──
async function cmdColor(hex) {
  if (!hex) return "❌ Hex কোড লিখুন।\nউদাহরণ: /info color ff5733";

  const clean = hex.replace("#", "").trim();
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(clean))
    return "❌ সঠিক Hex কোড লিখুন। যেমন: ff5733 বা f53";

  try {
    const { data } = await fetchWithTimeout(
      http.get(`https://www.thecolorapi.com/id?hex=${clean}&format=json`)
    );

    const r = data.rgb.r, g = data.rgb.g, b = data.rgb.b;
    const h = data.hsl.h, s = data.hsl.s, l = data.hsl.l;

    return (
      `🎨 রঙ তথ্য — #${clean.toUpperCase()}\n` +
      `${"─".repeat(28)}\n` +
      `📛 নাম: ${data.name.value}\n` +
      `🔴 RGB: (${r}, ${g}, ${b})\n` +
      `🌈 HSL: (${h}°, ${s}%, ${l}%)\n` +
      `🖌️ CMYK: (${data.cmyk.c||0}, ${data.cmyk.m||0}, ${data.cmyk.y||0}, ${data.cmyk.k||0})\n` +
      `🔗 দেখুন: https://www.color-hex.com/color/${clean}`
    );
  } catch (e) {
    return `❌ রঙ তথ্য পাওয়া যায়নি। (${e.message})`;
  }
}

// ── Random Joke ──
async function cmdJoke() {
  try {
    // দুটো API একসাথে race — যেটা আগে আসে সেটা নেব
    const [res] = await Promise.any([
      fetchWithTimeout(
        http.get("https://v2.jokeapi.dev/joke/Any?safe-mode&type=twopart&lang=en"),
        5000
      ),
      fetchWithTimeout(
        http.get("https://official-joke-api.appspot.com/random_joke"),
        5000
      ),
    ]);

    const d = res.data;
    // JokeAPI format
    if (d.setup && d.delivery) {
      return `😂 মজার জোকস!\n${"─".repeat(28)}\n❓ ${d.setup}\n\n💡 ${d.delivery}`;
    }
    // Official Joke API format
    if (d.setup && d.punchline) {
      return `😂 মজার জোকস!\n${"─".repeat(28)}\n❓ ${d.setup}\n\n💡 ${d.punchline}`;
    }
    // Single joke
    if (d.joke) {
      return `😂 মজার জোকস!\n${"─".repeat(28)}\n${d.joke}`;
    }
    return "❌ জোকস পাওয়া যায়নি।";
  } catch {
    return "❌ জোকস লোড করা যায়নি।";
  }
}

// ── Country Info ──
async function cmdCountry(name) {
  if (!name) return "❌ দেশের নাম লিখুন।\nউদাহরণ: /info country bangladesh";

  try {
    const { data } = await fetchWithTimeout(
      http.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false`)
    );
    const c = Array.isArray(data) ? data[0] : null;
    if (!c) return `❌ "${name}" দেশ পাওয়া যায়নি।`;

    const langs = Object.values(c.languages || {}).join(", ") || "অজানা";
    const currencies = Object.values(c.currencies || {})
      .map(x => `${x.name} (${x.symbol || "?"})`)
      .join(", ") || "অজানা";
    const pop = c.population?.toLocaleString() || "অজানা";
    const capital = c.capital?.[0] || "অজানা";
    const region = c.region || "অজানা";
    const area = c.area?.toLocaleString() + " km²" || "অজানা";
    const callingCode = c.idd?.root
      ? `${c.idd.root}${c.idd.suffixes?.[0] || ""}`
      : "অজানা";

    return (
      `🌍 দেশ তথ্য — ${c.name.common}\n` +
      `${"─".repeat(28)}\n` +
      `📛 আনুষ্ঠানিক নাম: ${c.name.official}\n` +
      `🏙️ রাজধানী: ${capital}\n` +
      `🌐 অঞ্চল: ${region} › ${c.subregion || ""}\n` +
      `👥 জনসংখ্যা: ${pop}\n` +
      `📐 আয়তন: ${area}\n` +
      `🗣️ ভাষা: ${langs}\n` +
      `💰 মুদ্রা: ${currencies}\n` +
      `📞 কলিং কোড: ${callingCode}\n` +
      `🚗 গাড়ি চালানো: ${c.car?.side === "left" ? "বাম পাশে" : "ডান পাশে"}\n` +
      `🕒 টাইমজোন: ${c.timezones?.[0] || "অজানা"}`
    );
  } catch (e) {
    return `❌ দেশ তথ্য পাওয়া যায়নি। (${e.message})`;
  }
}

// ══════════════════════════════════════════════════════
//  HELP MESSAGE
// ══════════════════════════════════════════════════════
function showHelp(prefix = "/") {
  return (
    `╔══════════════════════════════╗\n` +
    `║   🔍 INFO — সুপার কমান্ড   ║\n` +
    `╚══════════════════════════════╝\n\n` +
    `📖 ${prefix}info wiki [বিষয়]\n` +
    `   → উইকিপিডিয়া তথ্য\n\n` +
    `💰 ${prefix}info crypto [coin]\n` +
    `   → Bitcoin, ETH, BNB দাম\n\n` +
    `🌐 ${prefix}info ip [আইপি]\n` +
    `   → IP লোকেশন ও ISP তথ্য\n\n` +
    `📚 ${prefix}info dict [word]\n` +
    `   → ইংরেজি শব্দের অর্থ\n\n` +
    `🎨 ${prefix}info color [hex]\n` +
    `   → রঙের RGB, HSL তথ্য\n\n` +
    `😂 ${prefix}info joke\n` +
    `   → মজার জোকস\n\n` +
    `🌍 ${prefix}info country [দেশ]\n` +
    `   → দেশের সব তথ্য\n\n` +
    `💡 উদাহরণ:\n` +
    `  ${prefix}info wiki বাংলাদেশ\n` +
    `  ${prefix}info crypto btc\n` +
    `  ${prefix}info ip 8.8.8.8\n` +
    `  ${prefix}info dict beautiful\n` +
    `  ${prefix}info country bangladesh`
  );
}

// ══════════════════════════════════════════════════════
//  MAIN RUNNER
// ══════════════════════════════════════════════════════
module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = global.config?.PREFIX || "/";

  const sub = args[0]?.toLowerCase();
  const rest = args.slice(1).join(" ").trim();

  // কোন sub-command নেই → help দেখাও
  if (!sub) {
    return api.sendMessage(showHelp(prefix), threadID, messageID);
  }

  // ⏳ Loading react — দ্রুত feedback
  try {
    api.setMessageReaction("⏳", messageID, () => {}, true);
  } catch {}

  const start = Date.now();
  let result = "";

  // Sub-command dispatch
  switch (sub) {
    case "wiki":
    case "উইকি":
      result = await cmdWiki(rest);
      break;

    case "crypto":
    case "coin":
    case "ক্রিপ্টো":
      result = await cmdCrypto(rest);
      break;

    case "ip":
      result = await cmdIP(rest);
      break;

    case "dict":
    case "dictionary":
    case "অর্থ":
      result = await cmdDict(rest);
      break;

    case "color":
    case "colour":
    case "রঙ":
      result = await cmdColor(rest);
      break;

    case "joke":
    case "jokes":
    case "জোকস":
    case "মজা":
      result = await cmdJoke();
      break;

    case "country":
    case "দেশ":
      result = await cmdCountry(rest);
      break;

    default:
      // Unknown sub → wiki তে পাঠিয়ে দাও
      result = await cmdWiki([sub, rest].filter(Boolean).join(" "));
  }

  const ms = Date.now() - start;

  // ✅ Success react
  try {
    api.setMessageReaction("✅", messageID, () => {}, true);
  } catch {}

  // Footer with speed
  const footer = `\n\n⚡ সময়: ${ms}ms | 🤖 BELAL BOTX666`;

  return api.sendMessage(result + footer, threadID, messageID);
};

// GoatBot compat
module.exports.onStart = module.exports.run;
