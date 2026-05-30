"use strict";
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wow",
    aliases: ["sad", "sadvideo"],
    version: "3.3.0", // আপনার ফর্মের নিয়ম অনুযায়ী আপডেট
    author: "BELAL BOTX666",
    countDown: 5,
    role: 0,
    hasPermssion: 0,
    shortDescription: "র্যান্ডম স্যাড ভিডিও দেখার কমান্ড",
    category: "video",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    // ১. শুরুতে ⏳ রিয়্যাকশন দিয়ে প্রসেসিং স্টার্ট করা
    try { api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

    const hi = ["HOT girls] \n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄"];
    const know = hi[Math.floor(Math.random() * hi.length)];
    
    const link = [ 
      "https://i.imgur.com/wplkWei.mp4",
      "https://i.imgur.com/rJvUfXX.mp4",
      "https://i.imgur.com/YqsGcBv.mp4",
      "https://i.imgur.com/PAJGtA6.mp4",
      "https://i.imgur.com/yViwByW.mp4",
      "https://i.imgur.com/S4lsfkT.mp4",
      "https://i.imgur.com/HpkE2V0.mp4",
      "https://i.imgur.com/UJ7sm8I.mp4",
      "https://i.imgur.com/nBLn7xd.mp4",
      "https://i.imgur.com/gH2Mbjo.mp4",
      "https://i.imgur.com/hsAV4ka.mp4",
      "https://i.imgur.com/nh5MDCE.mp4",
      "https://i.imgur.com/GiuSSoD.mp4",
      "https://i.imgur.com/N53aPZ4.mp4",
      "https://i.imgur.com/Q8XHg6w.mp4",
      "https://i.imgur.com/sz6UNIl.mp4",
      "https://i.imgur.com/qqhCxOS.mp4",
      "https://i.imgur.com/nm5NgXM.mp4",
      "https://i.imgur.com/c1UshIs.mp4",
      "https://i.imgur.com/buyPh3t.mp4",
      "https://i.imgur.com/MUt0UUh.mp4",
      "https://i.imgur.com/gMd2FVP.mp4",
      "https://i.imgur.com/gNG8aJQ.mp4",
      "https://i.imgur.com/syezUGL.mp4",
      "https://i.imgur.com/sVGMQTp.mp4",
      "https://i.imgur.com/IKp5CTz.mp4",
      "https://i.imgur.com/5zavCWI.mp4",
      "https://i.imgur.com/9y2c7Or.mp4",
      "https://i.imgur.com/q9c09K9.mp4",
      "https://i.imgur.com/OOBZN84.mp4",
      "https://i.imgur.com/kAwlbDl.mp4",
      "https://i.imgur.com/RTfRNzT.mp4",
      "https://i.imgur.com/yHEgMu8.mp4",
      "https://i.imgur.com/qLoblI9.mp4",
      "https://i.imgur.com/pupXfkf.mp4",
      "https://i.imgur.com/gQh3AYn.mp4",
      "https://i.imgur.com/Iu9GTTP.mp4",
      "https://i.imgur.com/9ZAKqxG.mp4",
      "https://i.imgur.com/hvAnPAO.mp4",
      "https://i.imgur.com/gQQ7aaa.mp4",
      "https://i.imgur.com/r5nLQiu.mp4",
      "https://i.imgur.com/QyEdrLb.mp4",
      "https://i.imgur.com/eaEPjVF.mp4",
      "https://i.imgur.com/DqRe9FH.mp4",
      "https://i.imgur.com/bw2IKyT.mp4",
      "https://i.imgur.com/YgFNkXZ.mp4",
      "https://i.imgur.com/6L49nb5.mp4",
      "https://i.imgur.com/laoIcyQ.mp4",
      "https://i.imgur.com/REzprP2.mp4",
      "https://i.imgur.com/aNvdg0s.mp4",
      "https://i.imgur.com/efZDbRU.mp4",
      "https://i.imgur.com/pCNo8fv.mp4",
      "https://i.imgur.com/B2fPeJ0.mp4",
      "https://i.imgur.com/ad19GLo.mp4",
      "https://i.imgur.com/wKCaeGT.mp4",
      "https://i.imgur.com/Y0E2SVr.mp4",
      "https://i.imgur.com/GcjqrCL.mp4",
      "https://i.imgur.com/ypFYIVd.mp4",
      "https://i.imgur.com/ZeVGrct.mp4",
      "https://i.imgur.com/z74a749.mp4",
      "https://i.imgur.com/6oyyC9w.mp4",
      "https://i.imgur.com/GYvnR9n.mp4",
      "https://i.imgur.com/nF0q6GO.mp4",
      "https://i.imgur.com/PguATkL.mp4",
      "https://i.imgur.com/tDtakqt.mp4",
      "https://i.imgur.com/DfsIZ9k.mp4",
      "https://i.imgur.com/GOtICEA.mp4",
      "https://i.imgur.com/jbjNisc.mp4",
      "https://i.imgur.com/6WehYIx.mp4",
      "https://i.imgur.com/Ak5xzd5.mp4",
      "https://i.imgur.com/N7djXx3.mp4",
      "https://i.imgur.com/3PC4iIZ.mp4",
      "https://i.imgur.com/NDUXHzX.mp4",
      "https://i.imgur.com/IpuQCuP.mp4",
      "https://i.imgur.com/TuoZMSW.mp4",
      "https://i.imgur.com/1txGexI.mp4",
      "https://i.imgur.com/038f9fd.mp4",
      "https://i.imgur.com/rxmPaZ4.mp4",
      "https://i.imgur.com/Mmg7rtG.mp4",
      "https://i.imgur.com/ShwIxcr.mp4",
      "https://i.imgur.com/vFPmj0p.mp4",
      "https://i.imgur.com/B5CtmFK.mp4",
      "https://i.imgur.com/iPzDfGY.mp4",
      "https://i.imgur.com/drtiUKZ.mp4",
      "https://i.imgur.com/QqKuye7.mp4",
      "https://i.imgur.com/i8pimPi.mp4",
      "https://i.imgur.com/yJVtpUd.mp4",
      "https://i.imgur.com/eU1ICjP.mp4"
    ];

    const randomLink = link[Math.floor(Math.random() * link.length)];
    
    // আপনার ফর্মের নিয়ম অনুযায়ী অফিশিয়াল 'tmp' ফোল্ডার পাথ
    const cacheDir = path.join(process.cwd(), "tmp");
    await fs.ensureDir(cacheDir);
    
    // ইউনিক ফাইল নেম (যাতে কোনো জ্যাম বা ওভাররাইট না হয়)
    const filePath = path.join(cacheDir, `wow_${senderID}_${Date.now()}.mp4`);

    try {
      // আধুনিক Axios Stream Pipe পদ্ধতি (৩০ সেকেন্ড টাইমআউট সহ)
      const response = await axios.get(randomLink, {
        responseType: "stream",
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // সফল হলে ✅ রিয়্যাকশন
      try { api.setMessageReaction("✅", messageID, () => {}, true); } catch {}

      // ভিডিও সেন্ড করা
      return api.sendMessage({
        body: `「 ${know} 」`,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        // পাঠানোর সাথে সাথে ক্যাশ ফাইল ডিলিট
        fs.remove(filePath).catch(() => {});
      }, messageID);

    } catch (e) {
      try { api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      if (fs.existsSync(filePath)) await fs.remove(filePath).catch(() => {});
      return api.sendMessage(`❌ ত্রুটি: ভিডিও লোড করা সম্ভব হয়নি।`, threadID, messageID);
    }
  }
};
      
