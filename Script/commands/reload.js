/*
 * reload.js — Safe Local HotReload Command
 *
 * Drops a .js file into Script/commands/ and this command
 * detects it, validates syntax, installs deps, and loads it
 * in real-time — zero restart, zero GitHub push required.
 *
 * This is the SAFE alternative to remote-code-execution:
 * files must already exist on the server's own filesystem.
 *
 * Usage (admin only):
 *   /reload list              → lists all commands
 *   /reload <commandName>     → hot-reloads a specific command
 *   /reload all               → reloads every command
 *   /reload status            → shows load stats
 */

"use strict";

const fs   = require("fs-extra");
const path = require("path");
const { spawnSync } = require("child_process");

module.exports = {
  config: {
    name:        "reload",
    aliases:     ["hotload", "rl", "loadcmd"],
    version:     "2.0.0",
    author:      "Belal YT",
    countDown:   5,
    role:        2,   // Admin only
    shortDescription: "লাইভ কমান্ড রিলোড (সার্ভার রিস্টার্ট ছাড়া)",
    longDescription:
      "Script/commands/ ফোল্ডারে ফাইল রাখুন, তারপর /reload <name> দিয়ে " +
      "তাৎক্ষণিক লোড করুন। GitHub push বা restart দরকার নেই।",
    category:    "Admin",
    guide:
      "{pn} list\n{pn} <commandName>\n{pn} all\n{pn} status",
  },

  async run({ api, event, args, message }) {
    const { threadID, senderID } = event;
    const admins = global.config?.ADMINBOT || [];

    if (!admins.includes(String(senderID)))
      return message.reply("🔒 এই কমান্ডটি শুধুমাত্র বট অ্যাডমিনের জন্য।");

    const sub = args[0]?.toLowerCase();

    // ── /reload list ───────────────────────────────────────────
    if (!sub || sub === "list") {
      const dir   = path.join(global.client.mainPath, "Script", "commands");
      const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter(f => f.endsWith(".js") && !f.startsWith("_"))
        : [];
      const loaded   = [...global.client.commands.keys()];
      const onDisk   = files.map(f => f.replace(".js", ""));
      const notLoaded = onDisk.filter(n => !loaded.includes(n));

      return message.reply(
        `📋 কমান্ড স্ট্যাটাস\n${"═".repeat(28)}\n` +
        `✅ লোড হয়েছে (${loaded.length}): ${loaded.join(", ")}\n\n` +
        (notLoaded.length
          ? `⚠️ ডিস্কে আছে কিন্তু লোড হয়নি (${notLoaded.length}):\n${notLoaded.join(", ")}`
          : `🎯 সব ফাইল লোড হয়েছে।`)
      );
    }

    // ── /reload status ─────────────────────────────────────────
    if (sub === "status") {
      const mem = process.memoryUsage();
      return message.reply(
        `📊 সিস্টেম স্ট্যাটাস\n${"═".repeat(28)}\n` +
        `🤖 কমান্ড: ${global.client.commands.size}\n` +
        `📡 ইভেন্ট: ${global.client.events.size}\n` +
        `💬 handleReply queue: ${global.client.handleReply.length}\n` +
        `💾 RAM (heapUsed): ${(mem.heapUsed / 1048576).toFixed(1)} MB\n` +
        `🕒 Uptime: ${formatUptime(Date.now() - global.client.startTime)}`
      );
    }

    // ── /reload all ────────────────────────────────────────────
    if (sub === "all") {
      await message.react("⏳");
      const dir   = path.join(global.client.mainPath, "Script", "commands");
      if (!fs.existsSync(dir)) return message.reply("❌ Script/commands/ ফোল্ডার নেই।");

      const files = fs.readdirSync(dir).filter(f => f.endsWith(".js") && !f.startsWith("_"));
      let ok = 0, fail = 0, errors = [];

      for (const f of files) {
        const result = hotLoadSingle(path.join(dir, f), f);
        if (result.success) ok++;
        else { fail++; errors.push(`${f}: ${result.error}`); }
      }

      await message.react(fail === 0 ? "✅" : "⚠️");
      return message.reply(
        `🔄 সব কমান্ড রিলোড সম্পন্ন\n${"═".repeat(28)}\n` +
        `✅ সফল: ${ok} | ❌ ব্যর্থ: ${fail}\n` +
        (errors.length ? `\nত্রুটি:\n${errors.slice(0, 5).join("\n")}` : "")
      );
    }

    // ── /reload <commandName> ───────────────────────────────────
    const cmdName = sub;
    const dir     = path.join(global.client.mainPath, "Script", "commands");
    const filePath = path.join(dir, `${cmdName}.js`);

    if (!fs.existsSync(filePath))
      return message.reply(
        `❌ ফাইল পাওয়া যায়নি: Script/commands/${cmdName}.js\n\n` +
        `💡 ফাইলটি সার্ভারের সেই ফোল্ডারে রাখুন, তারপর আবার চেষ্টা করুন।`
      );

    await message.react("⏳");
    const result = hotLoadSingle(filePath, `${cmdName}.js`);

    if (result.success) {
      await message.react("✅");
      return message.reply(
        `✅ কমান্ড লোড সফল!\n` +
        `📦 নাম: ${result.name}\n` +
        `📁 ফাইল: ${cmdName}.js\n` +
        `🔧 ডিপেন্ডেন্সি: ${result.depsInstalled?.join(", ") || "কোনটি নেই"}`
      );
    } else {
      await message.react("❌");
      return message.reply(
        `❌ কমান্ড লোড ব্যর্থ!\n` +
        `📁 ফাইল: ${cmdName}.js\n` +
        `⚠️ ত্রুটি: ${result.error}`
      );
    }
  },
};

// ══════════════════════════════════════════════════════
//  INTERNAL: load a single file safely
// ══════════════════════════════════════════════════════
function hotLoadSingle(filePath, filename) {
  // 1. Syntax check before loading
  const syntaxCheck = spawnSync(
    process.execPath, ["--check", filePath], { stdio: "pipe" }
  );
  if (syntaxCheck.status !== 0) {
    return {
      success: false,
      error: (syntaxCheck.stderr || "").toString().slice(0, 200) || "সিনট্যাক্স ত্রুটি",
    };
  }

  try {
    delete require.cache[require.resolve(filePath)];
    const cmd = require(filePath);

    if (!cmd?.config?.name)
      return { success: false, error: "config.name সংজ্ঞায়িত নেই" };
    if (!cmd.run && !cmd.onCall)
      return { success: false, error: "run() ফাংশন নেই" };

    // Install missing deps
    const depsInstalled = [];
    if (cmd.config.dependencies) {
      for (const [pkg, ver] of Object.entries(cmd.config.dependencies)) {
        try { require(pkg); }
        catch {
          const ok = global.requireOrInstall ? !!global.requireOrInstall(pkg, ver) : false;
          if (ok) depsInstalled.push(pkg);
        }
      }
    }

    // Build wrapper and register
    cmd._wrapped = buildMinimalWrapper(cmd);
    global.client.commands.set(cmd.config.name, cmd);

    return { success: true, name: cmd.config.name, depsInstalled };
  } catch (e) {
    return { success: false, error: e.message?.slice(0, 200) };
  }
}

// Minimal wrapper for commands loaded via /reload
function buildMinimalWrapper(cmd) {
  return async (ctx) => {
    try {
      await (cmd.run || cmd.onCall)(ctx);
    } catch (e) {
      log.error(`[reload wrapper] ${cmd.config?.name}: ${e.message}`);
      try {
        ctx.api.sendMessage(`❌ ত্রুটি: ${e.message?.slice(0, 150)}`, ctx.event?.threadID);
      } catch {}
    }
  };
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  return `${m}m ${s % 60}s`;
}
