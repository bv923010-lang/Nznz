"use strict";

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const vm = require("vm");

module.exports.config = {
  name: "install",
  version: "3.0.0",
  hasPermssion: 2, // শুধু আপনি (মাস্টার) নতুন কমান্ড ইনস্টল করতে পারবেন
  credits: "Belal YT",
  description: "লিংক বা সরাসরি কোড থেকে নতুন কমান্ড ইনস্টল করার প্রিমিয়াম সিস্টেম",
  commandCategory: "admin",
  usages: "[ফাইলের_নাম.js] [লিংক/কোড]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  // আর্গুমেন্ট চেক
  if (!args[0] || !args[1]) {
    return api.sendMessage(
      "╭🌐 🛠️ [ ইনস্টলার ড্যাশবোর্ড ] 🛠️ 🌐─\n" +
      "│\n" +
      "│ ❌ ত্রুটি: ফাইলের নাম অথবা কোড/লিংক মিসিং!\n" +
      "│ 💡 ব্যবহার বিধি:\n" +
      "│ 🔹 ১. লিংক থেকে: /install auto.js [লিংক]\n" +
      "│ 🔹 ২. কোড থেকে: /install test.js [কোড]\n" +
      "│\n" +
      "╰───────────────────────────",
      threadID,
      messageID
    );
  }

  const fileName = args[0];
  const inputSource = args.slice(1).join(" ");

  // ফাইল নেম সিকিউরিটি ফিল্টার
  if (fileName.includes("..") || path.isAbsolute(fileName)) {
    return api.sendMessage("╭❌ [ সিকিউরিটি অ্যালার্ট ] ❌─\n│\n│ ⚠️ অবৈধ ফাইল পাথ বা নাম সনাক্ত হয়েছে!\n│\n╰───────────────────", threadID, messageID);
  }

  if (!fileName.endsWith(".js") && !fileName.endsWith(".json")) {
    return api.sendMessage("⚠️ শুধুমাত্র .js এবং .json ফাইল ফরম্যাট ইনস্টল করা সম্ভব!", threadID, messageID);
  }

  // ফাইল অলরেডি আছে কি না চেক করার পাথ
  const targetPath = path.join(__dirname, fileName);
  if (fs.existsSync(targetPath)) {
    return api.sendMessage(`⚠️ সিস্টেম ত্রুটি: '${fileName}' নামে ইতিমধ্যে একটি কমান্ড ফাইল রয়েছে! অন্য নাম ব্যবহার করুন।`, threadID, messageID);
  }

  let codeContent = "";
  const urlRegex = /^(http|https):\/\/[^ "]+$/;

  try {
    const loadingMsg = await api.sendMessage("⏳ সোর্স থেকে কোড যাচাই ও ডাউনলোড করা হচ্ছে...", threadID);

    // লিংক নাকি ডিরেক্ট কোড তা চেক করা
    if (urlRegex.test(inputSource)) {
      const response = await axios.get(inputSource);
      // যদি ডাটা অবজেক্ট আকারে আসে (যেমন json), সেটাকে টেক্সট বানিয়ে নেবে
      codeContent = typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data;
    } else {
      codeContent = inputSource;
    }

    // মেসেজ ডিলিট করা
    if (loadingMsg && loadingMsg.messageID) {
      setTimeout(() => api.unsendMessage(loadingMsg.messageID), 500);
    }

    // সিনট্যাক্স বা কোডের ভুল চেক করা (কোড ড্যামেজ থাকলে বটের মেইন ইঞ্জিন বাঁচাবে)
    if (fileName.endsWith(".js")) {
      try {
        new vm.Script(codeContent);
      } catch (scriptError) {
        return api.sendMessage(
          "╭❌ [ সিনট্যাক্স এরর ] ❌─\n" +
          "│\n" +
          "│ ⚠️ কোডের মধ্যে মারাত্মক ভুল বা ত্রুটি আছে!\n" +
          `│ 📝 এরর মেসেজ: ${scriptError.message}\n` +
          "│\n" +
          "╰────────────────────",
          threadID,
          messageID
        );
      }
    }

    // ফাইল রাইট করা
    await fs.writeFile(targetPath, codeContent, "utf-8");

    return api.sendMessage(
      "╭──⚡ 🎉 [ ইনস্টলেশন সফল ] 🎉 ⚡──\n" +
      "│\n" +
      `│ 📄 ফাইলের নাম: ${fileName}\n` +
      "│ 📥 সোর্স টাইপ: " + (urlRegex.test(inputSource) ? "অনলাইন ইউআরএল" : "ডিরেক্ট টেক্সট কোড") + "\n" +
      "│ ⚙️ স্ট্যাটাস: কমান্ড ডিরেক্টরিতে সেভ সম্পন্ন\n" +
      "│\n" +
      "╰───────────────────────────────",
      threadID,
      messageID
    );

  } catch (error) {
    console.error(error);
    return api.sendMessage(`❌ ইনস্টলেশন ব্যর্থ হয়েছে! এরর: ${error.message}`, threadID, messageID);
  }
};
                                                      
