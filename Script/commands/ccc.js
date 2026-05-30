var mysterious = "Siegfried Sama";
const request = require("request");
const fs = require("fs")
const axios = require("axios")
module.exports.config = {
  name: "ccc",
  version: "3.0.0",
  hasPermssion: 0,
  credits: `${mysterious}`,
  description: "girl to boy slap",
  commandCategory: "...",
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.run = async({ api, event, Threads, global }) => {
  var link = [
"https://i.imgur.com/gYQEAa9.gif",
"https://i.imgur.com/4RzBwA3.gif",
"https://i.imgur.com/hdSsfvz.gif",
"https://i.imgur.com/hlCrdhk.gif",
"https://i.imgur.com/qJ8KHKX.gif",
"https://i.imgur.com/1albCLd.gif",
"https://i.imgur.com/VOAUb0Y.gif",
"https://i.imgur.com/mrFGFRT.gif",
"https://i.imgur.com/M6cXMsu.gif",
"https://i.imgur.com/P6bU8Al.gif",
"https://i.imgur.com/3Mpno6D.gif",
"https://i.imgur.com/GrcZ4Dl.gif",
"https://i.imgur.com/3LctQ4n.gif",
"https://i.imgur.com/0fJzlTv.gif",
"https://i.imgur.com/XRjGuUL.gif",
"https://i.imgur.com/6uU6g8w.gif",
"https://i.imgur.com/C8Mi9Vn.gif",
"https://i.imgur.com/su5zoIL.gif",
"https://i.imgur.com/96w64pu.gif",
"https://i.imgur.com/fjVBIT9.gif",
"https://i.imgur.com/fyGp13f.gif",
"https://i.imgur.com/eM7Awpr.gif",
"https://i.imgur.com/9vaarKK.gif",
];
   var mention = Object.keys(event.mentions);
     let tag = event.mentions[mention].replace("@", "");
    if (!mention) return api.sendMessage("Mention 1 person that you want to f*** you ", threadID, messageID);
   var callback = () => api.sendMessage({body:`╭──────•◈•───────╮\n\n\n 🖕🖕 ${tag}` + `\n\n  আই চুষে দিব 🥵 🤏\n\n\n╰──────•◈•───────╯`,mentions: [{tag: tag,id: Object.keys(event.mentions)[0]}],attachment: fs.createReadStream(__dirname + "/cache/slap.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/slap.gif"));  
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/slap.gif")).on("close",() => callback());
              }
