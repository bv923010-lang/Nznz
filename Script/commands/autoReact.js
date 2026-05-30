"use strict";

module.exports.config = {
  name: "autoreact",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "Belal YT",
  description: "মেসেজ অটোমেটিক সিন করবে এবং রিয়্যাক্ট দেবে (কোনো অন/অফ ঝামেলা ছাড়া)",
  commandCategory: "noprefix",
  cooldowns: 0
};

module.exports.handleEvent = async ({ api, event }) => {
  try {
    // নিরাপত্তা ফিল্টার: মেসেজ আইডি এবং থ্রেড আইডি না থাকলে ব্যাক করবে
    if (!event.messageID || !event.threadID) return;

    // বট নিজের মেসেজে রিয়্যাক্ট বা সিন করবে না
    const botID = typeof api.getCurrentUserID === "function" ? api.getCurrentUserID() : null;
    if (botID && String(event.senderID) === String(botID)) return;

    // ১. অটোমেটিক মেসেজ সিন/রিড করা (Auto Seen System)
    if (typeof api.markAsRead === "function") {
      await api.markAsRead(true, event.threadID);
    }

    // ২. অটোমেটিক রিয়্যাক্ট সিস্টেম (Auto React System)
    const emojis = [
      "🥰","😗","🍂","💜","☺️","🖤","🤗","😇","🌺","🥹","😻",
      "😘","🫣","😽","😺","👀","❤️","🧡","💛","💚","💙","💜",
      "🤎","🤍","💫","💦","🫶","🫦","👄","✨","💯","🥀","⚡"
    ];

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    await api.setMessageReaction(randomEmoji, event.messageID, (err) => {
      if (err) console.error("❌ Reaction Error:", err);
    }, true);

  } catch (error) {
    console.error("❌ Auto React/Seen Error:", error);
  }
};

module.exports.run = async ({ api, event }) => {
  // অন/অফ বা অতিরিক্ত কমান্ডের কোনো প্রয়োজন নেই, ফাইলটি ব্যাকগ্রাউন্ডে সবসময় লাইভ থাকবে
  return api.sendMessage("🤖 BELAL BOTX666 এর অটো-সিন এবং অটো-রিয়্যাক্ট সিস্টেম ব্যাকগ্রাউন্ডে সফলভাবে চালু আছে!", event.threadID, event.messageID);
};
                             
