# Persistent Targets

A Foundry VTT v13 module that prevents automatic target deselection after making rolls. Works with any game system.

Made with AI, I have no idea what I'm doing, so hopefully it works!

Manifest: https://github.com/AzureCamel/Persistent-Targets/releases/latest/download/module.json

## Features

- **System Agnostic**: Works with any game system (D&D 5e, Pathfinder, Imperium Maledictum, etc.)
- **Configurable Toggle**: Enable or disable persistent targets from the module settings
- **Keyboard Shortcut**: Press `Ctrl+Shift+T` to quickly toggle the feature on/off
- **Per-Client Setting**: Each player can configure their own preference
- **API Access**: Other modules and macros can interact with this module programmatically

## Installation

### Manual Installation

1. Download or clone this repository
2. Copy the `persistent-targets` folder to your Foundry VTT `Data/modules/` directory
3. Restart Foundry VTT
4. Enable the module in your world's Module Management settings

### Module Directory Structure

```
persistent-targets/
├── module.json
├── scripts/
│   └── persistent-targets.mjs
├── languages/
│   └── en.json
└── README.md
```

## Usage

### Settings

Navigate to **Game Settings → Module Settings → Persistent Targets** to find:

- **Prevent Target Deselection**: Toggle to enable/disable the feature (default: enabled)

### Keyboard Shortcut

- **Ctrl+Shift+T**: Quickly toggle persistent targets on/off
- You can customize this keybinding in **Game Settings → Configure Controls**

### API

The module exposes an API for use in macros or other modules:

```javascript
// Check if enabled
game.modules.get("persistent-targets").api.isEnabled();

// Enable persistent targets
game.modules.get("persistent-targets").api.enable();

// Disable persistent targets
game.modules.get("persistent-targets").api.disable();

// Toggle and get new state
const newState = game.modules.get("persistent-targets").api.toggle();

// Manually capture current targets
game.modules.get("persistent-targets").api.captureTargets();

// Manually restore stored targets
game.modules.get("persistent-targets").api.restoreTargets();

// Clear stored targets
game.modules.get("persistent-targets").api.clearStoredTargets();
```

### Example Macro

Create a macro to toggle the feature:

```javascript
const api = game.modules.get("persistent-targets")?.api;
if (api) {
  const enabled = api.toggle();
  ui.notifications.info(`Persistent Targets: ${enabled ? "Enabled" : "Disabled"}`);
} else {
  ui.notifications.error("Persistent Targets module not found!");
}
```

## Compatibility

- **Foundry VTT**: Version 13+
- **Game System**: Any (system agnostic)

## Troubleshooting

If targets are still being deselected after rolls:

1. Make sure the module is enabled in Module Management
2. Check that "Prevent Target Deselection" is enabled in module settings
3. Check the browser console (F12) for any error messages
4. Some game systems may use custom hooks - if you see specific hook names in the console, please report them so support can be added

## Technical Notes

This module works by:

1. Capturing your current targets before a roll is made
2. Restoring those targets after the roll completes
3. Intercepting target-clearing methods to prevent unwanted deselection

The module hooks into multiple points in the roll workflow to ensure compatibility:
- Chat message creation (when rolls create messages)
- System-specific roll hooks (if available)
- Token targeting methods

## License

MIT License - Feel free to modify and distribute.

## Contributing

If you find issues or want to add features:

1. Report bugs with console logs and reproduction steps
2. PRs welcome for additional system hook support
