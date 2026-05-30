/*
 * handleCommand.js — Sandboxed Command Dispatcher
 * Part of BELAL BOTX666 v7.0.0 Premium Ultra Max
 */

"use strict";

module.exports = ({ api, models, Users, Threads, Currencies }) => {
  return async function handleCommand({ event }) {
    const { body = "", senderID, threadID, type } = event;
    if (!body || type === "message_unsend") return;

    const PREFIX = global.config?.PREFIX || "/";
    const botID  = global.config?.botID;

    // Ignore own messages
    if (senderID === botID) return;

    // Banned checks
    if (global.data.userBanned.has(String(senderID))) return;
    if (global.data.threadBanned.has(String(threadID))) return;

    const bodyTrim  = body.trim();
    const hasPrefix = bodyTrim.startsWith(PREFIX);
    if (!hasPrefix && !global.config.BOT_MODES?.noPrefix) return;

    const withoutPrefix = hasPrefix ? bodyTrim.slice(PREFIX.length) : bodyTrim;
    const [commandName, ...args] = withoutPrefix.trim().split(/\s+/);
    if (!commandName) return;

    const cmd = global.client.commands.get(commandName.toLowerCase())
             || [...global.client.commands.values()].find(
                  c => c.config?.aliases?.includes(commandName.toLowerCase())
                );
    if (!cmd) return;

    // Cooldown check
    const now     = Date.now();
    const coolMap = global.client.cooldowns;
    const cdKey   = `${senderID}:${cmd.config.name}`;
    const cdSecs  = cmd.config.cooldowns ?? cmd.config.coolDown
                 ?? global.config.COOLDOWNS?.default ?? 3;
    if (coolMap.has(cdKey)) {
      const expiry = coolMap.get(cdKey);
      if (now < expiry) {
        const remaining = ((expiry - now) / 1000).toFixed(1);
        return api.sendMessage(
          `⏳ ${remaining} সেকেন্ড পর আবার ব্যবহার করুন।`,
          threadID
        );
      }
    }
    if (cdSecs > 0) coolMap.set(cdKey, now + cdSecs * 1000);

    // Admin-only guard
    if (cmd.config.role >= 1 || cmd.config.adminOnly) {
      const admins = global.config?.ADMINBOT || [];
      if (!admins.includes(String(senderID))) {
        return api.sendMessage("🔒 এই কমান্ডটি শুধুমাত্র অ্যাডমিনের জন্য।", threadID);
      }
    }

    log.cmd(`[${cmd.config.name}] → ${senderID} @ ${threadID}`);

    // Execute through the universal sandboxed wrapper
    await cmd._wrapped({ api, event, args, models, Users, Threads, Currencies });
  };
};
                           
