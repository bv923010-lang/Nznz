"use strict";

const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "file",
  version: "1.0.0",
  hasPermssion: 2, // শুধু আপনি (বটের অ্যাডমিন) এই কমান্ড ব্যবহার করতে পারবেন, অন্য কেউ ফাইল দেখতে পারবে না
  credits: "Belal YT",
  description: "গ্রুপ বা চ্যাটে বসে বটের যেকোনো ফাইলের কোড চেক করা",
  commandCategory: "admin",
  usages: "[ফাইলের নাম/পাথ]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;
  
  // চেক করার জন্য ফাইলের নাম না দিলে গাইড দেখাবে
  if (!args[0]) {
    return api.sendMessage("❌ দয়া করে যে ফাইলটি দেখতে চান তার নাম বা পাথ দিন।\nযেমন: /file config.json অথবা /file commands/autoreact.js", threadID, messageID);
  }

  const fileName = args.join(" ");
  const filePath = path.resolve(__dirname, "..", fileName); // বটের রুট ডিরেক্টরি থেকে ফাইল খুঁজবে

  try {
    // ফাইলটি সার্ভারে আছে কি না চেক করবে
    if (!fs.existsSync(filePath)) {
      // যদি সরাসরি না পায়, তবে বর্তমান ডিরেক্টরি বা রুট ডিরেক্টরিতে আরেকবার খুঁজবে
      const fallbackPath = path.resolve(process.cwd(), fileName);
      if (!fs.existsSync(fallbackPath)) {
        return api.sendMessage(`❌ দুঃখিত বেলাল ভাই, '${fileName}' নামে কোনো ফাইল খুঁজে পাওয়া যায়নি!`, threadID, messageID);
      }
      var finalPath = fallbackPath;
    } else {
      var finalPath = filePath;
    }

    // ফাইলের ডাটা রিড করা
    const fileContent = fs.readFileSync(finalPath, "utf-8");

    // মেসেঞ্জার ক্যারেক্টার লিমিট (১০,০০০) হ্যান্ডেল করার জন্য কোডটিকে সুন্দর করে পাঠানো
    if (fileContent.length > 4000) {
      // ফাইল অনেক বড় হলে পার্ট পার্ট করে পাঠাবে যাতে কেটে না যায়
      const chunks = fileContent.match(/[\s\S]{1,4000}/g);
      api.sendMessage(`📄 বেলাল ভাই, '${fileName}' ফাইলের কোডগুলো নিচে পার্ট পার্ট করে দেওয়া হলো:`, threadID);
      for (const chunk of chunks) {
        await api.sendMessage(`\`\`\`json\n${chunk}\n\`\`\``, threadID);
      }
    } else {
      return api.sendMessage(`📄 ফাইলের নাম: ${fileName}\n\n\`\`\`javascript\n${fileContent}\n\`\`\``, threadID, messageID);
    }

  } catch (error) {
    return api.sendMessage(`❌ ফাইলটি রিড করতে সমস্যা হয়েছে! এরর: ${error.message}`, threadID, messageID);
  }
};
