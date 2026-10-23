/**
 * Auto HD for YouTube - Popup Controller
 * Manages resolution targets and live playback status.
 */

const QUALITY_LABELS = {
  highres: '8K (4320p)',
  hd2880: '5K (2880p)',
  hd2160: '4K (2160p)',
  hd1440: '1440p (QHD)',
  hd1080: '1080p (FHD)',
  hd720: '720p (HD)',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p',
  auto: 'Auto'
};

function formatQuality(tier, videoHeight) {
  if (videoHeight && videoHeight > 0) {
    if (videoHeight >= 2160) return `4K (${videoHeight}p)`;
    if (videoHeight >= 1440) return `1440p (${videoHeight}p)`;
    if (videoHeight >= 1080) return `1080p (${videoHeight}p)`;
    if (videoHeight >= 720) return `720p (${videoHeight}p)`;
    return `${videoHeight}p`;
  }

  if (!tier || tier === 'unknown') {
    return 'Active';
  }

  return QUALITY_LABELS[tier] || tier.toUpperCase();
}

function updateButtons(activeCeiling, buttons) {
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ceiling === activeCeiling);
  });
}

function renderStatus(status, badgeEl, listEl) {
  if (!status) {
    badgeEl.textContent = 'No video detected';
    listEl.innerHTML = '';
    return;
  }

  const currentLabel = formatQuality(status.currentQuality, status.videoHeight);
  badgeEl.textContent = `${currentLabel} active`;

  if (status.availableLevels && status.availableLevels.length > 0) {
    listEl.innerHTML = '';
    status.availableLevels.forEach(tier => {
      if (tier === 'auto') return;
      const chip = document.createElement('span');
      chip.className = 'avail-chip';
      chip.textContent = QUALITY_LABELS[tier] || tier;
      listEl.appendChild(chip);
    });
  }
}

async function injectScriptsIfMissing(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/main_hook.js'],
      world: 'MAIN'
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/bridge.js']
    });
    return true;
  } catch (err) {
    return false;
  }
}

function queryTabStatus(tabId, badgeEl, listEl, retried = false) {
  chrome.tabs.sendMessage(tabId, {
    target: 'apex_content',
    action: 'GET_STATUS'
  }, async (res) => {
    if (chrome.runtime.lastError || !res || !res.status) {
      if (!retried) {
        // Tab was opened before extension loaded; auto-inject scripts right now
        const injected = await injectScriptsIfMissing(tabId);
        if (injected) {
          setTimeout(() => queryTabStatus(tabId, badgeEl, listEl, true), 150);
          return;
        }
      }
      badgeEl.textContent = 'Waiting for video playback...';
      return;
    }
    renderStatus(res.status, badgeEl, listEl);
  });
}

async function initPopup() {
  const currentBadge = document.getElementById('currentTierBadge');
  const availableList = document.getElementById('availableTiersList');
  const buttons = document.querySelectorAll('.tier-btn');
  const toggleShorts = document.getElementById('toggleShorts');
  const toggleEndCards = document.getElementById('toggleEndCards');

  const stored = await chrome.storage.local.get({
    targetCeiling: 'max',
    hideShorts: true,
    hideEndCards: true
  });

  updateButtons(stored.targetCeiling, buttons);
  toggleShorts.checked = stored.hideShorts;
  toggleEndCards.checked = stored.hideEndCards;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isYouTube = activeTab && activeTab.url && activeTab.url.includes('youtube.com');

  if (isYouTube) {
    queryTabStatus(activeTab.id, currentBadge, availableList);
  } else {
    currentBadge.textContent = 'Open YouTube to activate';
  }

  function saveAndSyncSettings(partial) {
    chrome.storage.local.set(partial);
    if (isYouTube) {
      chrome.tabs.sendMessage(activeTab.id, {
        target: 'apex_content',
        action: 'UPDATE_SETTINGS',
        settings: partial
      }, () => {});
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const ceiling = btn.dataset.ceiling;
      updateButtons(ceiling, buttons);
      saveAndSyncSettings({ targetCeiling: ceiling });
    });
  });

  toggleShorts.addEventListener('change', () => {
    saveAndSyncSettings({ hideShorts: toggleShorts.checked });
  });

  toggleEndCards.addEventListener('change', () => {
    saveAndSyncSettings({ hideEndCards: toggleEndCards.checked });
  });
}

document.addEventListener('DOMContentLoaded', initPopup);
