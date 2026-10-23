# Playback Tools for YouTube

> A fast, lightweight Manifest V3 Chrome extension that locks YouTube to your preferred highest resolution (4K, 1440p, 1080p), stops bitrate downgrades, and declutters the interface.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20Local-green.svg)](#privacy--security)

---

## Why This Exists

YouTube's default "Auto" quality algorithm frequently forces videos into 480p or 720p despite having high-speed broadband connections. Furthermore, the modern watch experience is filled with aggressive Shorts shelves and oversized end-screen recommendation cards that cover up the final 20 seconds of videos.

**Playback Tools for YouTube** hooks directly into the YouTube HTML5 player to guarantee high-fidelity playback and provide a distraction-free experience.

---

## Features

- **Auto-Max Resolution:** Automatically detects and locks the highest available stream tier (4K / 2160p, 1440p, 1080p60) the instant playback begins.
- **Auto-Guard Throttling Protection:** If YouTube's auto-bitrate algorithm attempts to silently downgrade your resolution mid-stream, Playback Tools immediately reasserts your target quality.
- **Hide YouTube Shorts:** Cleanly removes Shorts shelves, sidebar links, and feed distractions.
- **Hide End-Screen Overlays:** Blocks large video recommendation tiles from obscuring the outro.
- **Target Ceilings:** Pick your preferred ceiling (Max 4K/8K, 1440p, or 1080p).
- **Single Page App (SPA) Support:** Hooks into internal YouTube transitions (`yt-navigate-finish`) so every clicked video instantly receives your settings.

---

## Installation

### Manual Install (Developer Mode)
1. Clone or download this repository.
2. In Google Chrome, go to `chrome://extensions/`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** (top-left) and select this folder.

---

## Privacy & Security

- **100% Local Execution:** Injected client-side using Chrome's native content script architecture.
- **Zero Data Collection:** No watch history, video metadata, or personal information is ever collected or transmitted.

---

## The Developer Utility Suite

Check out the other tools in this open-source suite:
- [**Volume Booster & Equalizer for Tabs**](https://github.com/itsjuztin/volume-booster-tab) — Boost tab audio up to 1000% with soft-limiter anti-clipping and 3-band EQ.
- [**Playback Tools for Plex**](https://github.com/itsjuztin/playback-tools-plex) — Silent auto-skip for intros and credits, countdown bypass, and 1-click Picture-in-Picture.
- [**Independent Tab Zoom**](https://github.com/itsjuztin/independent-tab-zoom) — Per-tab isolated zoom control without syncing across the same domain.

---

## License

[MIT](LICENSE) © 2026 Justin
