/**
 * Auto HD for YouTube - Main World Script
 * Directly interfaces with YouTube's HTML5 player in the page execution context.
 */

const QUALITY_PRIORITY = [
  'highres',
  'hd2880',
  'hd2160',
  'hd1440',
  'hd1080',
  'hd720',
  'large',
  'medium',
  'small',
  'tiny'
];

let targetCeiling = 'max';
let activeQuality = null;
let isEnforcing = false;

function getPlayer() {
  return document.getElementById('movie_player') || document.querySelector('.html5-video-player');
}

function getVideo() {
  return document.querySelector('video');
}

function selectBestQuality(availableLevels) {
  if (!availableLevels || availableLevels.length === 0) {
    return null;
  }

  let candidates = QUALITY_PRIORITY;

  if (targetCeiling !== 'max') {
    const startIndex = QUALITY_PRIORITY.indexOf(targetCeiling);
    if (startIndex !== -1) {
      candidates = QUALITY_PRIORITY.slice(startIndex);
    }
  }

  for (const tier of candidates) {
    if (availableLevels.includes(tier)) {
      return tier;
    }
  }

  for (const tier of QUALITY_PRIORITY) {
    if (availableLevels.includes(tier)) {
      return tier;
    }
  }

  return availableLevels[0];
}

function persistQualityPreference(tier) {
  try {
    const qualityData = {
      data: tier,
      creation: Date.now()
    };
    localStorage.setItem('yt-player-quality', JSON.stringify(qualityData));
  } catch (err) {}
}

function broadcastStatus(player, bestQuality) {
  let current = null;
  if (player && typeof player.getPlaybackQuality === 'function') {
    current = player.getPlaybackQuality();
  }

  const video = getVideo();
  const videoHeight = (video && video.videoHeight > 0) ? video.videoHeight : 0;

  window.postMessage({
    source: 'APEX_QUALITY_MAIN',
    type: 'STATUS_UPDATE',
    currentQuality: current || (videoHeight ? `${videoHeight}p` : 'unknown'),
    videoHeight,
    targetQuality: bestQuality || activeQuality,
    availableLevels: (player && typeof player.getAvailableQualityLevels === 'function')
      ? player.getAvailableQualityLevels()
      : []
  }, '*');
}

function enforceQuality() {
  const player = getPlayer();
  if (!player) return;

  const getAvailable = player.getAvailableQualityLevels;
  const setQualityRange = player.setPlaybackQualityRange;
  const setQuality = player.setPlaybackQuality;

  if (typeof getAvailable !== 'function' || typeof setQualityRange !== 'function') {
    return;
  }

  const available = getAvailable.call(player);
  if (!available || available.length === 0 || (available.length === 1 && available[0] === 'auto')) {
    return;
  }

  const bestQuality = selectBestQuality(available);
  if (!bestQuality) return;

  isEnforcing = true;
  setQualityRange.call(player, bestQuality, bestQuality);
  if (typeof setQuality === 'function') {
    setQuality.call(player, bestQuality);
  }
  persistQualityPreference(bestQuality);
  activeQuality = bestQuality;
  isEnforcing = false;

  broadcastStatus(player, bestQuality);
}

function attachVideoListeners() {
  const video = getVideo();
  if (!video || video.dataset.autoHdAttached) return;

  video.dataset.autoHdAttached = 'true';

  const onStreamReady = () => {
    enforceQuality();
  };

  video.addEventListener('playing', onStreamReady);
  video.addEventListener('loadeddata', onStreamReady);
  video.addEventListener('timeupdate', () => {
    if (!activeQuality || activeQuality === 'auto') {
      enforceQuality();
    }
  }, { once: true });
}

function pollForPlayerAndEnforce(retries = 20) {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    attachVideoListeners();

    const player = getPlayer();
    if (player && typeof player.getAvailableQualityLevels === 'function') {
      const levels = player.getAvailableQualityLevels();
      if (levels && levels.length > 0 && !(levels.length === 1 && levels[0] === 'auto')) {
        enforceQuality();
        attachPlayerEvents(player);
        clearInterval(interval);
        return;
      }
    }

    if (attempts >= retries) {
      clearInterval(interval);
      broadcastStatus(player, activeQuality);
    }
  }, 250);
}

let playerEventsAttached = false;
function attachPlayerEvents(player) {
  if (playerEventsAttached || !player || typeof player.addEventListener !== 'function') {
    return;
  }

  player.addEventListener('onPlaybackQualityChange', (newQuality) => {
    if (isEnforcing) return;
    if (activeQuality && newQuality !== activeQuality && newQuality !== 'auto') {
      setTimeout(enforceQuality, 150);
    }
    broadcastStatus(player, activeQuality);
  });

  playerEventsAttached = true;
}

// Navigation & SPA Hooks
window.addEventListener('yt-navigate-finish', () => {
  playerEventsAttached = false;
  activeQuality = null;
  pollForPlayerAndEnforce();
});

window.addEventListener('yt-player-updated', () => {
  enforceQuality();
});

// Bridge message listener
window.addEventListener('message', (event) => {
  if (!event.data || event.data.source !== 'APEX_QUALITY_BRIDGE') {
    return;
  }

  if (event.data.type === 'SET_CEILING') {
    targetCeiling = event.data.ceiling || 'max';
    enforceQuality();
  }

  if (event.data.type === 'REQUEST_STATUS') {
    const player = getPlayer();
    enforceQuality();
    broadcastStatus(player, activeQuality);
  }
});

// Initial start
pollForPlayerAndEnforce();
