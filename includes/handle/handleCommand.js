"use strict";

// ══════════════════════════════════════════════════════════════
//  BELAL BOTX666 — handleCommand.js
//  Version: 7.0.0 ULTRA | Master: Belal YT — চাঁদের পাহাড় 🪬
//  PREFIX crash-proof + Dynamic prefix/no-prefix engine
// ══════════════════════════════════════════════════════════════

module.exports = ({ api, models, Users, Threads, Currencies }) => {
  return async function handleCommand({ event }) {
    try {
      const { body = "", senderID, threadID, type, messageID } = event;

      // ── Early exits ──────────────────────────────────────────
      if (!body || type === "message_unsend") return;

      // ✅ CRASH-PROOF PREFIX — global.config যদি late-load হয় বা undefined হয়,
      //    তাহলেও "/" ফলব্যাক নিশ্চিত। কোনো অবস্থায় crash হবে না।
      const PREFIX = _safePrefix();
      const botID  = _safeGet("global.config.botID") || _safeGet("global.botID");
      const noPrefix = PREFIX === "" || PREFIX === null || PREFIX === undefined;

      // ── Bot self-reply guard ─────────────────────────────────
      if (botID && String(senderID) === String(botID)) return;

      // ── Ban check ────────────────────────────────────────────
      if (global.data?.userBanned?.has(String(senderID))) return;
      if (global.data?.threadBanned?.has(String(threadID))) return;

      const bodyTrim  = body.trim();
      const bodyLower = bodyTrim.toLowerCase();

      // ── Special "prefix" keyword trigger (prefix ছাড়াই) ─────
      if (
        bodyLower === "prefix"       ||
        bodyLower === "no prefix"    ||
        bodyLower === "noprefix"     ||
        bodyLower.startsWith("prefix +") ||
        bodyLower.startsWith("prefix -")
      ) {
        const prefixCmd = global.client?.commands?.get("prefix");
        if (prefixCmd) {
          const ctx = buildCtx({
            api, event,
            args: bodyTrim.split(/\s+/).slice(1),
            models, Users, Threads, Currencies, PREFIX,
          });
          try { await runCmd(prefixCmd, ctx); } catch (e) {
            global.log?.error(`[prefix cmd] ${e.message}`);
          }
        }
        return;
      }

      // ── MAIN PREFIX ENGINE ───────────────────────────────────
      let commandName, args;

      if (noPrefix) {
        // ── Situation B: No-Prefix Mode ─────────────────────────
        // Raw text execution — যেকোনো বার্তার প্রথম শব্দ command হিসেবে চলে
        const parts = bodyTrim.split(/\s+/);
        commandName  = parts[0]?.toLowerCase()?.replace(/[^\w\u0980-\u09FF]/g, "");
        args         = parts.slice(1);
      } else {
        // ── Situation A: Prefix Mode ────────────────────────────
        // PREFIX দিয়ে শুরু না হলে block করো
        if (!bodyTrim.startsWith(PREFIX)) return;
        const withoutPrefix = bodyTrim.slice(PREFIX.length).trimStart();
        const parts = withoutPrefix.split(/\s+/);
        commandName  = parts[0]?.toLowerCase();
        args         = parts.slice(1);
      }

      if (!commandName) return;

      // ── COMMAND LOOKUP — name + aliases ──────────────────────
      let cmd = global.client?.commands?.get(commandName);
      if (!cmd) {
        // Alias search
        for (const c of (global.client?.commands?.values() || [])) {
          const aliases = c.config?.aliases || c.config?.alias || [];
          if (aliases.map(a => String(a).toLowerCase()).includes(commandName)) {
            cmd = c;
            break;
          }
        }
      }
      if (!cmd) return;

      // ── DISABLED CHECK ────────────────────────────────────────
      const disabledList = global.config?.COMMAND_DISABLED || [];
      if (disabledList.includes(cmd.config?.name)) return;

      // ── COOLDOWN ENGINE ───────────────────────────────────────
      const now    = Date.now();
      const cdKey  = `${senderID}:${cmd.config?.name}`;
      const cdSecs = cmd.config?.cooldowns
                  ?? cmd.config?.countDown
                  ?? cmd.config?.coolDown
                  ?? global.config?.COOLDOWNS?.[cmd.config?.name]
                  ?? global.config?.COOLDOWNS?.default
                  ?? 3;

      if (global.client?.cooldowns?.has(cdKey)) {
        const expiry = global.client.cooldowns.get(cdKey);
        if (now < expiry) {
          const left = ((expiry - now) / 1000).toFixed(1);
          return api.sendMessage(
            `⏳ ${left} সেকেন্ড অপেক্ষা করুন তারপর আবার চেষ্টা করো।`,
            threadID
          );
        }
      }
      if (cdSecs > 0) {
        global.client?.cooldowns?.set(cdKey, now + cdSecs * 1_000);
      }

      // ── PERMISSION / ROLE CHECK ────────────────────────────────
      const role = cmd.config?.role ?? cmd.config?.hasPermssion ?? 0;
      const admins = global.config?.ADMINBOT || global.config?.ADMIN || [];

      if (role >= 2) {
        // Super admin (NDH) only
        const ndh = global.config?.NDH || admins;
        if (!ndh.includes(String(senderID))) {
          return api.sendMessage("🔒 এই কমান্ডটি শুধুমাত্র সুপার অ্যাডমিনের জন্য।", threadID);
        }
      } else if (role >= 1) {
        // Admin only
        if (!admins.includes(String(senderID))) {
          return api.sendMessage("🔒 এই কমান্ডটি শুধুমাত্র বট অ্যাডমিনের জন্য।", threadID);
        }
      }

      // ── SPAM RATE LIMIT (global config থেকে) ─────────────────
      try {
        const rlEnabled = global.config?.PERFORMANCE?.rateLimit?.enabled;
        if (rlEnabled) {
          const rlKey = `rl:${senderID}`;
          if (!global._rateLimit) global._rateLimit = new Map();
          const rl = global._rateLimit.get(rlKey) || { count: 0, reset: now + 60_000 };
          if (now > rl.reset) { rl.count = 0; rl.reset = now + 60_000; }
          rl.count++;
          global._rateLimit.set(rlKey, rl);
          const maxPerMin = global.config.PERFORMANCE.rateLimit.maxPerMinute || 30;
          if (rl.count > maxPerMin) return; // silently drop
        }
      } catch {}

      // ── LOGGING ───────────────────────────────────────────────
      if (global.config?.SYSTEM?.showCommandLog !== false) {
        global.log?.cmd?.(`[${cmd.config?.name}] ▶ ${senderID} @ ${threadID}`);
      }

      // ── BUILD CONTEXT & RUN ───────────────────────────────────
      const ctx = buildCtx({ api, event, args, models, Users, Threads, Currencies, PREFIX });

      try {
        await runCmd(cmd, ctx);
      } catch (err) {
        global.log?.error?.(`[${cmd.config?.name}] ত্রুটি: ${err.message}`);
        try {
          api.sendMessage(
            `❌ কমান্ড রান করতে সমস্যা হয়েছে:\n${String(err.message).slice(0, 200)}`,
            threadID
          );
        } catch {}
      }

    } catch (outerErr) {
      // Ultimate outer catch — কোনো অবস্থায় bot crash করবে না
      global.log?.error?.(`[handleCommand OUTER] ${outerErr?.message || outerErr}`);
    }
  };
};

// ══════════════════════════════════════════════════════════════
//  HELPER: Crash-proof PREFIX reader
// ══════════════════════════════════════════════════════════════
function _safePrefix() {
  try {
    const p = global?.config?.PREFIX;
    if (p === undefined || p === null) return "/";
    return p; // empty string "" is valid (no-prefix mode)
  } catch {
    return "/";
  }
}

function _safeGet(path) {
  try {
    return path.split(".").reduce((o, k) => o?.[k], global);
  } catch {
    return undefined;
  }
}

// ══════════════════════════════════════════════════════════════
//  HELPER: Build full context object for commands
// ══════════════════════════════════════════════════════════════
function buildCtx({ api, event, args, models, Users, Threads, Currencies, PREFIX }) {
  const { threadID, senderID, messageID } = event;

  // Convenience message helpers (GoatBot style)
  const message = {
    reply:  (m, opts)    => api.sendMessage(m, threadID, opts),
    send:   (m, tid)     => api.sendMessage(m, tid || threadID),
    react:  (emoji)      => { try { api.setMessageReaction(emoji, messageID, () => {}, true); } catch {} },
    unsend: (mid)        => { try { api.unsendMessage(mid); } catch {} },
    delete: (mid)        => { try { api.unsendMessage(mid); } catch {} },
  };

  return {
    // Core
    api,
    event,
    args,
    models,
    Users,
    Threads,
    Currencies,
    // Shortcuts
    threadID,
    senderID,
    messageID,
    // Prefix (both spellings used by different frameworks)
    prefix:  PREFIX,
    Prefix:  PREFIX,
    // Config
    config:  global.config || {},
    // GoatBot style helpers
    message,
    // Mirai style: global client
    client:  global.client || {},
  };
}

// ══════════════════════════════════════════════════════════════
//  HELPER: Run command — supports Mirai, GoatBot, Hybrid styles
// ══════════════════════════════════════════════════════════════
async function runCmd(cmd, ctx) {
  const runner =
    cmd.onStart    ||  // GoatBot
    cmd.run        ||  // Mirai
    cmd.onCall     ||  // Legacy
    cmd.execute    ||  // Custom
    cmd._wrapped;      // Internal

  if (typeof runner === "function") {
    return await runner(ctx);
  }

  // Module-level export fallback (module.exports.run)
  if (typeof cmd === "function") {
    return await cmd(ctx);
  }
        }
    
