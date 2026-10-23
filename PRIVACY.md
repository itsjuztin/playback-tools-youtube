# Privacy Policy

**Last Updated:** October 23, 2026

## Overview
**Playback Tools for YouTube** is an open-source, local-first browser extension created to optimize YouTube playback quality and remove interface distractions. We believe privacy is a fundamental right. This policy outlines our strict commitment to zero data collection.

## Data Collection & Storage
- **No Personal Data Collected:** We do not collect, track, log, or store any personal information, browsing history, video watch history, search queries, or user identifiers.
- **Local Storage Only:** User preferences (such as auto-resolution target and clean view toggles) are stored strictly on your local machine using the Chrome Storage API (`chrome.storage.local`). This data never leaves your device.
- **No Telemetry or Analytics:** The extension contains zero tracking pixels, analytics scripts, advertisements, or third-party tracking.

## Permissions Usage
- `storage`: Used solely to persist your local quality preferences and UI toggle states.
- `scripting` & `activeTab`: Used to inject playback quality rules and element visibility settings into active YouTube tabs.
- `*://*.youtube.com/*`: Required to interact with the YouTube player API to force selected resolutions and hide clutter overlays.

## Third-Party Services
This extension interacts only with your active YouTube session on your local device. It does not communicate with any external servers or third-party services.

## Contact & Bug Reports
For questions, suggestions, or issues, please visit our GitHub repository:  
https://github.com/itsjuztin/playback-tools-youtube/issues
