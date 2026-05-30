"use strict";

const EMOJIS = [
  "🤥","🙆","😅","🙂","😝","🤢","🤔","🤣","😁",
  "😘","😉","🥳","🥹","🫠","☺️","😊","😋","😎",
  "🤩","😏","😒","😞","😔","😟","😕","🙁",
  "🥺","😢","😭","😤","😠","😡","🤬","🤯","😳",
  "👍","🔥","❤️","🥰","👑","✨","💯","🥀","⚡"
];

module.exports.config = {
  name: "auto",
  version: "5.5.0",
  author: "Belal YT",
  countDown: 0,
  role: 0,
  description: "মেসেজ অটোমেটিক সিন করবে এবং রিয়্যাক্ট দেবে (অটো রিপ্লাই ছাড়া)",
  category: "system",
  guide: ""
};

module.exports.onChat = async function ({ api, event }) {
  try {
    // শুধু সাধারণ মেসেজ এবং টেক্সট ফিল্টার
    if (!event.body || event.type !== "message") return;
    
    const { messageID, senderID, threadID } = event;

    // বট নিজের মেসেজে রিয়্যাক্ট বা সিন করবে না
    if (String(senderID) === String(api.getCurrentUserID())) return;

    // ১. অটোমেটিক মেসেজ সিন/রিড করা
    await api.markAsRead(true, threadID);

    // ২. অটোমেটিক রিয়্যাক্ট সিস্টেম (Random Emoji React)
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    await api.setMessageReaction(emoji, messageID, () => {}, true);

  } catch (error) {
    console.log("Auto React/Read Error: " + error);
  }
};
  
