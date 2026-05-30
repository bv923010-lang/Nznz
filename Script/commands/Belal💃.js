const axios = require("axios");
const fs = require("fs");
const request = require("request");

const link = [
 "https://i.imgur.com/iEZPh8A.mp4",
"https://i.imgur.com/imzbAKk.mp4",
"https://i.imgur.com/3Q6hgFy.mp4",
"https://i.imgur.com/0WFBzSx.mp4",
"https://i.imgur.com/eY8vVqz.mp4",
"https://i.imgur.com/kixHWSa.mp4",
"https://i.imgur.com/QXGcO1m.mp4",
"https://i.imgur.com/Hzu182c.mp4",
"https://i.imgur.com/FMH8yJF.mp4",
"https://i.imgur.com/WpJgPNQ.mp4",
"https://i.imgur.com/mxZdcpj.mp4",
"https://i.imgur.com/FGxwFjG.mp4",
"https://i.imgur.com/Dj9BdRI.mp4",
"https://i.imgur.com/wA8YR59.mp4",
"https://i.imgur.com/sA4ecVk.mp4",
"https://i.imgur.com/hXjZ3Q4.mp4",
"https://i.imgur.com/2aTl9hf.mp4",
"https://i.imgur.com/20ruFiA.mp4",
"https://i.imgur.com/eESqfMc.mp4",
"https://i.imgur.com/VTULl9O.mp4",
"https://i.imgur.com/VcwxLHV.mp4",
"https://i.imgur.com/npMypQM.mp4",
"https://i.imgur.com/KpBOYI9.mp4",
"https://i.imgur.com/O6HZpUS.mp4",
"https://i.imgur.com/kthtetX.mp4",
"https://i.imgur.com/1xzd5ay.mp4",
"https://i.imgur.com/A4A5yRB.mp4",
"https://i.imgur.com/BxV1apY.mp4",
"https://i.imgur.com/XxEqR9O.mp4",
"https://i.imgur.com/pc4Ri3D.mp4",
"https://i.imgur.com/enCBPOe.mp4",
"https://i.imgur.com/6rwxPlj.mp4",
"https://i.imgur.com/RmiU1fm.mp4",
"https://i.imgur.com/Tg2q1jz.mp4",
"https://i.imgur.com/tJVlod9.mp4",
];

module.exports.config = {
 name: "💃",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "Islamick Chat",
 description: "auto reply to salam",
 commandCategory: "noprefix",
 usages: "💃",
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
 if (body.startsWith("💃")) {
 const rahad = [
 "╭•┄┅════❁✡️❁════┅┄•╮\n \n ✦─⃝‌‌𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 ✡️✦\n\n╰•┄┅════❁✡️❁════┅┄•╯",
 "╭•┄┅════❁✡️❁════┅┄•╮\n\n ✦─꯭─⃝‌‌𝔹𝔼𝕃𝔸𝕃 𝔹𝕆𝕋 ✡️✦\n\n╰•┄┅════❁✡️❁════┅┄•╯"

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
 if (typeof data["💃"] === "undefined" || data["💃"]) data["💃"] = false;
 else data["💃"] = true;
 await Threads.setData(threadID, { data });
 global.data.threadData.set(threadID, data);
 api.sendMessage(`${(data["💃"]) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
};
