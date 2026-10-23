/**
 * Auto HD for YouTube - Isolated Bridge Script
 * Bridges extension storage/messaging and applies CSS tweaks.
 */

const DEFAULT_SETTINGS = {
  targetCeiling: 'max',
  hideShorts: true,
  hideEndCards: true
};

let currentSettings = { ...DEFAULT_SETTINGS };

let latestStatus = {
  currentQuality: 'unknown',
  videoHeight: 0,
  targetQuality: 'max',
  availableLevels: []
};

let styleElement = null;

function getStyleSheet() {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'auto-hd-styles';
    (document.head || document.documentElement).appendChild(styleElement);
  }
  return styleElement;
}

function updateInjectedStyles() {
  const sheet = getStyleSheet();
  let css = '';

  if (currentSettings.hideShorts) {
    css += `
      ytd-rich-shelf-renderer[is-shorts],
      ytd-reel-shelf-renderer,
      ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]),
      ytd-guide-entry-renderer:has(a[title="Shorts"]),
      ytd-mini-guide-entry-renderer[aria-label="Shorts"],
      #endpoint[title="Shorts"] {
        display: none !important;
      }
    `;
  }

  if (currentSettings.hideEndCards) {
    css += `
      .ytp-ce-element,
      .ytp-ce-covering-image,
      .ytp-ce-element-show,
      .ytp-ce-video,
      .ytp-ce-channel {
        display: none !important;
      }
    `;
  }

  sheet.textContent = css;
}

function getActiveVideoInfo() {
  const video = document.querySelector('video');
  if (video && video.videoHeight > 0) {
    latestStatus.videoHeight = video.videoHeight;
    if (latestStatus.currentQuality === 'unknown') {
      latestStatus.currentQuality = `${video.videoHeight}p`;
    }
  }
  return latestStatus;
}

// Initial settings load
chrome.storage.local.get(DEFAULT_SETTINGS, (stored) => {
  currentSettings = { ...DEFAULT_SETTINGS, ...stored };
  updateInjectedStyles();

  window.postMessage({
    source: 'APEX_QUALITY_BRIDGE',
    type: 'SET_CEILING',
    ceiling: currentSettings.targetCeiling
  }, '*');
});

// Forward status updates from main_hook.js
window.addEventListener('message', (event) => {
  if (!event.data || event.data.source !== 'APEX_QUALITY_MAIN') {
    return;
  }

  if (event.data.type === 'STATUS_UPDATE') {
    latestStatus = {
      currentQuality: event.data.currentQuality,
      videoHeight: event.data.videoHeight || 0,
      targetQuality: event.data.targetQuality,
      availableLevels: event.data.availableLevels || []
    };
  }
});

// Extension runtime listener
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'apex_content') {
    return false;
  }

  if (message.action === 'GET_STATUS') {
    window.postMessage({ source: 'APEX_QUALITY_BRIDGE', type: 'REQUEST_STATUS' }, '*');
    const info = getActiveVideoInfo();
    sendResponse({ success: true, status: info, settings: currentSettings });
    return false;
  }

  if (message.action === 'UPDATE_SETTINGS') {
    currentSettings = { ...currentSettings, ...message.settings };
    chrome.storage.local.set(currentSettings);
    updateInjectedStyles();

    if (message.settings.targetCeiling) {
      window.postMessage({
        source: 'APEX_QUALITY_BRIDGE',
        type: 'SET_CEILING',
        ceiling: message.settings.targetCeiling
      }, '*');
    }

    sendResponse({ success: true, settings: currentSettings });
    return false;
  }

  return false;
});
