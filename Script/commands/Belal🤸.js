const axios = require("axios");
const fs = require("fs");
const request = require("request");

const link = [
  "https://i.imgur.com/giKJlOB.mp4",
  "https://i.imgur.com/GJRpFP7.mp4",
  "https://i.imgur.com/IvXcCMx.mp4",
  "https://i.imgur.com/LYeHtTY.mp4",
  "https://i.imgur.com/DORQ8JG.mp4",
  "https://i.imgur.com/GxSgHOA.mp4",
  "https://i.imgur.com/ok6OSr1.mp4",
  "https://i.imgur.com/hJZ8cFG.mp4",
  "https://i.imgur.com/J8UzgFX.mp4",
  "https://i.imgur.com/Y96D5C6.mp4",
  "https://i.imgur.com/nmJ2HWk.mp4",
  "https://i.imgur.com/dkul1H4.mp4",
  "https://i.imgur.com/HrDQxwz.mp4",
  "https://i.imgur.com/KEQJKhj.mp4",
  "https://i.imgur.com/jAlNviD.mp4",
  "https://i.imgur.com/zsk9wFY.mp4",
  "https://i.imgur.com/wWKFTYQ.mp4",
  "https://i.imgur.com/4lPTQxb.mp4",
  "https://i.imgur.com/P6vgcRQ.mp4",
  "https://i.imgur.com/Qb1kDre.mp4",
  "https://i.imgur.com/rgYTOy8.mp4"
];

module.exports.config = {
 name: "🤸",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "BELAL BOTX666",
 description: "auto reply to salam",
 commandCategory: "noprefix",
 usages: "🤸",
 cooldowns: 5,
 dependencies: {
 "request":"",
 "fs-extra":"",
 "axios":""
 }
};

module.exports.handleEvent = async ({ api, event, Threads }) => {
 const content = event.body ? event.body : '';
 const body = content.toLowerCase();
 if (body.startsWith("🤸")) {
 const rahad = [
 "╭•┄┅════❁🌺❁════┅┄•╮\n \n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄\n\n╰•┄┅════❁🌺❁════┅┄•╯",
 "╭•┄┅════❁🌺❁════┅┄•╮\n\n┄┉❈✡️⋆⃝চাঁদেড়~পাহাড়✿⃝🪬❈┉┄\n\n╰•┄┅════❁🌺❁════┅┄•╯"

 ];
 const rahad2 = rahad[Math.floor(Math.random() * rahad.length)];

 const callback = () => api.sendMessage({
 body: `${rahad2}`,
 attachment: fs.createReadStream(__dirname + "/cache/2024.mp4")
 }, event.threadID, () => fs.unlinkSync(__dirname + "/cache/2024.mp4"), event.messageID);

 const requestStream = request(encodeURI(link[Math.floor(Math.random() * link.length)]));
 requestStream.pipe(fs.createWriteStream(__dirname + "/cache/2024.mp4")).on("close", () => callback());
 return requestStream;
 }
};

module.exports.languages = {
 "vi": {
 "on": "Dùng sai cách rồi lêu lêu",
 "off": "sv ngu, đã bão dùng sai cách",
 "successText": `🧠`,
 },
 "en": {
 "on": "on",
 "off": "off",
 "successText": "success!",
 }
};

module.exports.run = async ({ api, event, Threads, getText }) => {
 const { threadID, messageID } = event;
 let data = (await Threads.getData(threadID)).data;
 if (typeof data["🤸"] === "undefined" || data["🤸"]) data["🤸"] = false;
 else data["🤸"] = true;
 await Threads.setData(threadID, { data });
 global.data.threadData.set(threadID, data);
 api.sendMessage(`${(data["🤸"]) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
