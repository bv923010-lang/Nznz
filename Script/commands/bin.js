"use strict";

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "bin",
  version: "2.6.0",
  hasPermssion: 2,
  credits: "Belal YT",
  description: "বটের যেকোনো ফাইলকে অনলাইন পেস্টবিন লিংকে রূপান্তর করুন",
  commandCategory: "admin",
  usages: "[ফাইলের_নাম.js]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (args.length === 0) {
    return api.sendMessage(
      "╭─🧧 📁 [ পেস্টবিন সিস্টেম ] 📁 ─\n" +
      "│\n" +
      "│ ❌ অনুগ্রহ করে ফাইলের সঠিক নাম দিন।\n" +
      "│ 💡 ব্যবহার বিধি: /bin <ফাইলের_নাম.js>\n" +
      "│\n" +
      "╰───────────────────────────", 
      threadID, 
      messageID
    );
  }

  const targetFile = args[0];
  const rootDir = process.cwd();
  
  // সম্ভাব্য সব ফোল্ডারের পাথ চেক করা
  const pathsToSearch = [
    path.join(rootDir, "modules", "commands", targetFile),
    path.join(rootDir, "modules", "events", targetFile),
    path.join(rootDir, "commands", targetFile),
    path.join(rootDir, "events", targetFile),
    path.join(rootDir, targetFile)
  ];

  let finalPath = null;

  // ফাইলটি কোন ফোল্ডারে আছে তা খুঁজে বের করা
  for (const p of pathsToSearch) {
    if (fs.existsSync(p)) {
      finalPath = p;
      break;
    }
    // যদি শেষে .js না দেওয়া হয় তবে স্বয়ংক্রিয়ভাবে চেক করবে
    if (fs.existsSync(p + ".js")) {
      finalPath = p + ".js";
      break;
    }
  }

  if (!finalPath) {
    return api.sendMessage(
      "╭─🧧 ❌ [ এরর মেসেজ ] ❌ ─\n" +
      "│\n" +
      "│ 🔍 ফাইলটি সার্ভারে খুঁজে পাওয়া যায়নি!\n" +
      "│ 📌 নাম এবং এক্সটেনশন (.js/.json) চেক করুন।\n" +
      "│\n" +
      "╰──────────────────────────", 
      threadID, 
      messageID
    );
  }

  try {
    const loadingMsg = await api.sendMessage(
      "⚡ সার্ভার থেকে কোড প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", 
      threadID
    );

    const fileCode = await fs.readFile(finalPath, "utf8");
    const baseApi = "https://pastebin-api.vercel.app";
    
    // অনলাইন সার্ভারে কোড আপলোড
    const response = await axios.post(`${baseApi}/paste`, { text: fileCode });

    // লোডিং মেসেজটি ডিলিট করা
    if (loadingMsg && loadingMsg.messageID) {
      setTimeout(() => api.unsendMessage(loadingMsg.messageID), 500);
    }

    if (response.data && response.data.id) {
      const rawLink = `${baseApi}/raw/${response.data.id}`;
      
      return api.sendMessage(
        "╭──⚡ 🌐 [ বিন আপলোড সাকসেস ] 🌐 ⚡──\n" +
        "│\n" +
        `│ 📄 ফাইলের নাম: ${path.basename(finalPath)}\n` +
        "│ ⚙️ স্ট্যাটাস: সফলভাবে লাইভ করা হয়েছে\n" +
        "│ 🔗 লিংক: " + rawLink + "\n" +
        "│\n" +
        "╰───────────────────────────────",
        threadID,
        messageID
      );
    } else {
      return api.sendMessage("⚠️ সার্ভার রেসপন্স ত্রুটি! আপলোড সম্পন্ন করা সম্ভব হয়নি।", threadID, messageID);
    }

  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ প্রসেসিং এরর: ${error.message}`, threadID, messageID);
  }
};
