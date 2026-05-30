"use strict";

module.exports = ({ api, models, Users, Threads, Currencies }) => {
  return async function handleCommand({ event }) {
    const { body = "", senderID, threadID, type } = event;
    if (!body || type === "message_unsend") return;

    // 🛡️ সম্পূর্ণ ক্র্যাশ প্রটেকশন ও ডেড-লক গার্ড সিস্টেম
    const currentConfig = global.config || {};
    const PREFIX = currentConfig.PREFIX !== undefined ? currentConfig.PREFIX : "/";
    const botID  = currentConfig.botID;

    if (botID && String(senderID) === String(botID)) return;
    if (global.data?.userBanned?.has(String(senderID))) return;
    if (global.data?.threadBanned?.has(String(threadID))) return;

    const bodyTrim  = body.trim();
    
    // ── [নো-প্রিফিক্স ও প্রিফিক্স ডুয়াল রান ইঞ্জিন লজিক] ──
    const hasPrefix = PREFIX !== "" && bodyTrim.startsWith(PREFIX);
    const withoutPrefix = hasPrefix ? bodyTrim.slice(PREFIX.length) : bodyTrim;
    const [commandName, ...args] = withoutPrefix.trim().split(/\s+/);
    // ────────────────────────────────────────────────────────
    
    if (!commandName) return;

    const cmd = global.client.commands.get(commandName.toLowerCase())
             || [...global.client.commands.values()].find(c =>
                  c.config?.aliases?.map(a => a.toLowerCase()).includes(commandName.toLowerCase())
                );
                
    // যদি কোনো কমান্ডের নাম না মেলে, তবে সাধারণ চ্যাট মনে করে বট কোনো এরর না দিয়ে চুপ থাকবে
    if (!cmd) return;

    // Cooldown — সব framework এর field name সাপোর্ট
    const now    = Date.now();
    const cdKey  = `${senderID}:${cmd.config.name}`;
    const cdSecs = cmd.config.cooldowns ?? cmd.config.countDown
                ?? cmd.config.coolDown  ?? currentConfig.COOLDOWNS?.default ?? 3;
    if (global.client.cooldowns.has(cdKey)) {
      const expiry = global.client.cooldowns.get(cdKey);
      if (now < expiry) {
        const left = ((expiry - now) / 1000).toFixed(1);
        return api.sendMessage(`⏳ ${left} সেকেন্ড পর আবার ব্যবহার করুন।`, threadID);
      }
    }
    if (cdSecs > 0) global.client.cooldowns.set(cdKey, now + cdSecs * 1000);

    // Admin guard — role/hasPermssion দুটোই সাপোর্ট
    const role = cmd.config.role ?? cmd.config.hasPermssion ?? 0;
    if (role >= 1) {
      const admins = currentConfig.ADMINBOT || [];
      if (!admins.includes(String(senderID)))
        return api.sendMessage("🔒 এই কমান্ডটি শুধুমাত্র অ্যাডমিনের জন্য।", threadID);
    }

    global.log.cmd(`[${cmd.config.name}] → ${senderID} @ ${threadID}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UNIVERSAL RUNNER — সব framework সাপোর্ট
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const ctx = {
      api, event, args, models, Users, Threads, Currencies,
      threadID, messageID: event.messageID, senderID,
      message: {
        reply:  (m) => api.sendMessage(m, threadID),
        send:   (m, tid) => api.sendMessage(m, tid || threadID),
        react:  (e) => api.setMessageReaction(e, event.messageID, () => {}, true),
        unsend: (m) => api.unsendMessage(m),
      },
    };

    try {
      const runner = cmd.onStart || cmd.run || cmd.onCall;
      if (runner) {
        await runner(ctx);
      } else if (cmd._wrapped) {
        await cmd._wrapped(ctx);
      }
    } catch (err) {
      global.log.error(`[${cmd.config.name}] ত্রুটি: ${err.message}`);
      try { api.sendMessage(`❌ ${err.message?.slice(0, 150)}`, threadID); } catch {}
    }
  };
};
