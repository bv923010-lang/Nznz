"use strict";

const vm = require("vm");

module.exports.config = {
  name: "test",
  version: "1.0.0",
  hasPermssion: 2, // শুধু আপনি (মাস্টার) টেস্ট করতে পারবেন
  credits: "Belal YT",
  description: "কোনো ফাইল তৈরি করা ছাড়াই চ্যাটে সরাসরি কোড রান করে টেস্ট করার শর্টকাট সিস্টেম",
  commandCategory: "admin",
  usages: "[আপনার_কোড]",
  cooldowns: 0
};

module.exports.run = async function({ api, event, args, Threads, Users, Currencies }) {
  const { threadID, messageID } = event;

  if (args.length === 0) {
    return api.sendMessage("╭📌 [ কোড টেস্টার ] ─\n│\n│ ❌ অনুগ্রহ করে টেস্ট করার জন্য কোড দিন।\n│\n╰────────────────", threadID, messageID);
  }

  const codeToTest = args.join(" ");

  try {
    // চ্যাটের কোডটিকে বটের মেমরিতে রান করানোর জন্য এনভায়রনমেন্ট তৈরি
    const context = {
      api, event, args, Threads, Users, Currencies,
      require, console, process, global,
      setTimeout, setInterval, clearTimeout, clearInterval
    };

    // কোডটি ইনস্ট্যান্ট রান হবে
    const script = new vm.Script(`(async () => { ${codeToTest} })()`);
    vm.createContext(context);
    await script.runInContext(context);

    // কোড ঠিক থাকলে রিঅ্যাক্ট দিয়ে কনফার্ম করবে
    await api.setMessageReaction("✅", messageID, () => {}, true);

  } catch (error) {
    return api.sendMessage(
      "╭─🧧 ❌ [ কোডে ভুল আছে ] ❌ ─\n" +
      "│\n" +
      `│ ⚠️ এরর: ${error.message}\n` +
      "│ 📌 আপনার কোডের সিনট্যাক্স ঠিক করুন।\n" +
      "│\n" +
      "╰──────────────────────────", 
      threadID, 
      messageID
    );
  }
};
