# Travian Scripts Project Instructions

## Project Context
- **Primary Repository:** `https://github.com/bourama1/Travian-scripts`
- **Author Branding:** `bourama1 (based on work of adipiciu)`
- **Namespace:** `https://github.com/bourama1/Travian-scripts`
- **License:** GNU GPL v3 (maintain original attribution while marking modifications).

## UI & Donation Links
- **Donation QR Code:** `https://raw.githubusercontent.com/bourama1/Travian-scripts/main/qrcode.png`
- **Integration Points:**
  - `TravianResourceBarPlus`: "About" dialog (footer).
  - `TravianTaskQueue`: Userscript menu.
  - `TravianWaveBuilder`: Footer next to version number.
- **Rules:** Never use hardcoded legacy PayPal links. Always use the QR code URL.

## Metadata Management
- Each script has a `.user.js` and a `.meta.js` file. Both MUST be kept in sync regarding `@version`, `@namespace`, and `@author`.
- Remove `@contributionURL` from metadata in favor of in-script UI links to the QR code.

## Commit Guidelines
- **Style:** Use Emoji Conventional Commits (e.g., `🚀 feat:`, `🐛 fix:`, `📝 docs:`).
- **Scope:** Clearly state which script or component is being updated in the message.

## File Organization
- `TravianAdSkipper/`: Universal ad skipper (new script added by user).
- `TravianResourceBarPlus/`: Resource tracking and management.
- `TravianTaskQueue/`: Construction and attack queuing.
- `TravianWaveBuilder/`: Wave attack timing tool.
