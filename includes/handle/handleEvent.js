"use strict";

// ══════════════════════════════════════════════════════════════
//  BELAL BOTX666 — handleEvent.js
//  Version: 7.0.0 ULTRA | Master: Belal YT — চাঁদের পাহাড় 🪬
//  PREFIX crash-proof + Full event + command.handleEvent dispatch
// ══════════════════════════════════════════════════════════════

module.exports = function ({ api, models, Users, Threads, Currencies }) {
  return async function handleEvent({ event }) {
    try {
      // ✅ CRASH-PROOF: global.client অথবা তার properties undefined হলেও চলবে
      const { events, eventRegistered, commands } = global.client || {};

      if (!events && !commands) return;

      // ✅ CRASH-PROOF PREFIX — যদি config late-load হয় বা undefined হয়
      const PREFIX = _safePrefix();

      // ── Bot self-event guard ──────────────────────────────────
      const botID = global.config?.botID || global.botID;
      if (botID && event?.senderID && String(event.senderID) === String(botID)) return;

      // ── Ban check for event triggers ──────────────────────────
      if (event?.senderID) {
        if (global.data?.userBanned?.has(String(event.senderID))) return;
      }
      if (event?.threadID) {
        if (global.data?.threadBanned?.has(String(event.threadID))) return;
      }

      const sharedCtx = {
        api, event, models, Users, Threads, Currencies, PREFIX,
        config: global.config || {},
        client: global.client || {},
      };

      // ──────────────────────────────────────────────────────────
      //  PART 1: Registered Script/events/*.js files
      // ──────────────────────────────────────────────────────────
      if (events && events.size > 0) {
        for (const [name, evt] of events) {
          // Disabled event check
          if ((global.config?.EVENT_DISABLED || []).includes(name)) continue;

          try {
            // handleEvent অথবা onEvent অথবা run — সব style support
            const handler =
              evt.handleEvent ||
              evt.onEvent     ||
              evt.run         ||
              evt.onStart;

            if (typeof handler === "function") {
              await handler(sharedCtx);
            } else if (typeof evt === "function") {
              await evt(sharedCtx);
            }
          } catch (err) {
            global.log?.error?.(`[Event:${name}] ত্রুটি: ${err.message}`);
          }
        }
      }

      // ──────────────────────────────────────────────────────────
      //  PART 2: Commands with handleEvent (commands ফাইলে handleEvent থাকলে)
      // ──────────────────────────────────────────────────────────
      if (commands && eventRegistered && Array.isArray(eventRegistered)) {
        for (const name of eventRegistered) {
          if (!name) continue;

          // Disabled command check
          if ((global.config?.COMMAND_DISABLED || []).includes(name)) continue;

          const cmd = commands.get(name);
          if (!cmd) continue;

          const evtHandler = cmd.handleEvent || cmd.onEvent;
          if (typeof evtHandler !== "function") continue;

          try {
            await evtHandler({
              ...sharedCtx,
              // Extra: pass PREFIX and prefix both (framework compatibility)
              prefix: PREFIX,
              Prefix: PREFIX,
              threadID: event?.threadID,
              senderID: event?.senderID,
              messageID: event?.messageID,
              // GoatBot message helpers
              message: {
                reply:  (m) => api.sendMessage(m, event?.threadID),
                send:   (m, tid) => api.sendMessage(m, tid || event?.threadID),
                react:  (emoji) => {
                  try {
                    api.setMessageReaction(emoji, event?.messageID, () => {}, true);
                  } catch {}
                },
              },
            });
          } catch (err) {
            global.log?.error?.(`[CmdEvent:${name}] ত্রুটি: ${err.message}`);
          }
        }
      }

    } catch (outerErr) {
      // Ultimate outer catch — কোনো অবস্থায় bot crash করবে না
      global.log?.error?.(`[handleEvent OUTER] ${outerErr?.message || outerErr}`);
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
    return p; // "" empty string = no-prefix mode (valid)
  } catch {
    return "/";
  }
  }
