/** Don't change credits bro i will fix¯\_(ツ)_/¯ **/
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "wow",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "BELAL BOTX666",
  description: "SAD VIDEO STREAMS",
  commandCategory: "video",
  usages: "sad video",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async ({ api, event }) => {
  try {
    const textLines = ["┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄"];
    const textOutput = textLines[Math.floor(Math.random() * textLines.length)];

    const videoLinks = [ 
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

    const randomLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    
    // ক্যাশ ফোল্ডারের পাথ নিখুঁত করা হয়েছে
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const filePath = path.join(cacheDir, `wow_${event.senderID}.mp4`);

    api.sendMessage("Please wait master, sending your video... ⏳", event.threadID, event.messageID);

    // Axios ব্যবহার করে হাই-স্পিড মেমোরি স্ট্রিম ডাউনলোড
    const response = await axios({
      method: "GET",
      url: randomLink,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage({
        body: `「 ${textOutput} 」\n\nOwner: ${module.exports.config.credits}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // পাঠানোর পর ফাইল ডিলেট করে স্টোরেজ ক্লিন রাখবে
        }
      }, event.messageID);
    });

    writer.on("error", (err) => {
      api.sendMessage(`ফাইল রাইট করতে সমস্যা হয়েছে: ${err.message}`, event.threadID, event.messageID);
    });

  } catch (error) {
    api.sendMessage(`ভিডিওটি পাঠাতে সমস্যা হয়েছে মাস্টার! এরর: ${error.message}`, event.threadID, event.messageID);
  }
};
        
