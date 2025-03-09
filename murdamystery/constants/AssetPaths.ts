/**
 * Asset path constants for the app
 * All public assets are served from CloudFront CDN
 */

// Base CloudFront URL
export const CDN_BASE_URL = 'https://d1eeqvtbgbdhsf.cloudfront.net';

// Emoji assets
export const EMOJI_PATHS = {
  // Character emojis
  GHOST: `${CDN_BASE_URL}/emojis/ghost.png`,
  THINKING: `${CDN_BASE_URL}/emojis/thinking.png`,
  SLEUTH: `${CDN_BASE_URL}/emojis/sleuth.png`,
  SKULL: `${CDN_BASE_URL}/emojis/skull.png`,
  
  // Item emojis
  COIN: `${CDN_BASE_URL}/emojis/coin_3d.png`,
  KNIFE: `${CDN_BASE_URL}/emojis/knife.png`,
  MAGNIFIER: `${CDN_BASE_URL}/emojis/magnifier.png`,
  PROHIBITED: `${CDN_BASE_URL}/emojis/prohibited.png`,
  
  // Reaction emojis
  THUMBS_UP: `${CDN_BASE_URL}/emojis/thumbs_up.png`,
  THUMBS_DOWN: `${CDN_BASE_URL}/emojis/thumbs_down.png`,
  CLAP: `${CDN_BASE_URL}/emojis/clap.png`,
  HEART: `${CDN_BASE_URL}/emojis/heart.png`,
};

// Game assets
export const GAME_ASSETS = {
  MAP_MARKER: `${CDN_BASE_URL}/game/map_marker.png`,
  MAP_PIN: `${CDN_BASE_URL}/game/map_pin.png`,
  EVIDENCE_PLACEHOLDER: `${CDN_BASE_URL}/game/evidence_placeholder.jpg`,
  LOBBY_BACKGROUND: `${CDN_BASE_URL}/game/lobby_background.jpg`,
};

// UI assets
export const UI_ASSETS = {
  LOGO: `${CDN_BASE_URL}/ui/logo.png`,
  LOADING_BG: `${CDN_BASE_URL}/ui/loading_background.jpg`,
  APP_ICON: `${CDN_BASE_URL}/ui/app_icon.png`,
};

// Role images
export const ROLE_IMAGES = {
  MAFIA: `${CDN_BASE_URL}/roles/mafia.png`,
  DETECTIVE: `${CDN_BASE_URL}/roles/detective.png`,
  CIVILIAN: `${CDN_BASE_URL}/roles/civilian.png`,
}; 