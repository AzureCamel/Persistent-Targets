/**
 * Persistent Targets Module (Aggressive / Continuous Mode)
 * Fixes compatibility with systems that clear targets early (Imperium Maledictum, WFRP, etc.)
 * Updated for V13 API stability
 */

const MODULE_ID = "persistent-targets";

// Store the last known non-empty set of targets
let lastKnownTargets = new Set();
// Detailed logging for debugging
const DEBUG = false;

Hooks.once("init", () => {
  console.log(
    `${MODULE_ID} | Initializing Persistent Targets (Aggressive Mode)`
  );

  game.settings.register(MODULE_ID, "preventDeselect", {
    name: "Prevent Target Deselection",
    hint: "Keep targets selected after rolling. (Toggle with Ctrl+Shift+T)",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
  });

  game.keybindings.register(MODULE_ID, "togglePersistentTargets", {
    name: "Toggle Persistent Targets",
    editable: [{ key: "KeyT", modifiers: ["Control", "Shift"] }],
    onDown: () => {
      const current = game.settings.get(MODULE_ID, "preventDeselect");
      game.settings.set(MODULE_ID, "preventDeselect", !current);
      ui.notifications.info(
        `Persistent Targets: ${!current ? "Enabled" : "Disabled"}`
      );
      return true;
    },
  });
});

/**
 * STRATEGY: Continuous Tracking
 * We don't wait for a roll to capture. We capture every time you target something.
 */
Hooks.on("targetToken", (user, token, targeted) => {
  if (!game.settings.get(MODULE_ID, "preventDeselect")) return;
  if (user.id !== game.user.id) return;

  // If we have targets selected, save them as our "Restore Point"
  if (user.targets.size > 0) {
    lastKnownTargets = new Set(user.targets.map((t) => t.id));
    if (DEBUG)
      console.log(`${MODULE_ID} | Tracked ${lastKnownTargets.size} targets`);
  }
});

/**
 * STRATEGY: Restore on Roll
 */
Hooks.on("createChatMessage", (message, options, userId) => {
  if (!game.settings.get(MODULE_ID, "preventDeselect")) return;
  if (userId !== game.user.id) return;

  // Detect if this is a roll
  const isRoll =
    message.isRoll ||
    message.rolls?.length > 0 ||
    (message.flags && message.flags["imperium-maledictum"]);

  if (isRoll) {
    // If the system cleared our targets (current size is 0), but we have a memory of targets
    if (game.user.targets.size === 0 && lastKnownTargets.size > 0) {
      if (DEBUG)
        console.log(`${MODULE_ID} | System cleared targets. Restoring...`);
      restoreTargets();
    }
  }
});

/**
 * Helper function to restore targets efficiently
 * Includes fallback for V13/V12 compatibility
 */
function restoreTargets() {
  const targetsToRestore = Array.from(lastKnownTargets);
  const canvasTokens = canvas.tokens;

  // Filter to ensure tokens still exist on this scene
  const validTargetIds = targetsToRestore.filter((id) => canvasTokens.get(id));

  if (validTargetIds.length === 0) return;

  // METHOD 1: Try the modern atomic update (V11/V12+)
  if (typeof game.user.updateTokenTargets === "function") {
    game.user.updateTokenTargets(validTargetIds);
  }
  // METHOD 2: Fallback for V13 or systems where the API changed
  else {
    validTargetIds.forEach((id) => {
      const token = canvasTokens.get(id);
      if (token) {
        // releaseOthers: false ensures we add to the selection rather than wiping it
        token.setTarget(true, { releaseOthers: false, groupSelection: true });
      }
    });
  }

  if (DEBUG) console.log(`${MODULE_ID} | Restored targets via fallback`);
}

/**
 * EXTRA: API for Macros
 */
Hooks.once("setup", () => {
  game.modules.get(MODULE_ID).api = {
    toggle: () => {
      const s = !game.settings.get(MODULE_ID, "preventDeselect");
      game.settings.set(MODULE_ID, "preventDeselect", s);
      return s;
    },
    clearMemory: () => lastKnownTargets.clear(),
  };
});
