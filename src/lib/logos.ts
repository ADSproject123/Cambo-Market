export const categoryLogos: Record<string, string> = {
  // Scraped DB Categories
  'google-accounts': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
  'chatgpt': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  'chatgpt-gift-cards': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
  'google-gemini': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
  'cnva-accounts': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
  'google-play-gift-cards': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Google_Play_2022_logo.svg',
  'google-antigravity': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
  'online-courses': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
  'ppq-ai': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_2012_logo.svg', // using a generic placeholder if PPQ doesn't have a wiki logo
  'claude': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Claude_AI_logo.svg',
  'capcut': 'https://upload.wikimedia.org/wikipedia/commons/c/cb/CapCut_Logo.svg',
  
  // Generic keyword fallbacks
  'google': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
  'youtube': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_play_button_icon_%282013%E2%80%932017%29.svg',
  'discord': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Discord_Nitro_logo.png',
  'telegram': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
  'xbox': 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Xbox_logo_%282019%29.svg',
  'playstation': 'https://upload.wikimedia.org/wikipedia/commons/0/00/PlayStation_logo.svg',
  'steam': 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
  'epic': 'https://upload.wikimedia.org/wikipedia/commons/3/31/Epic_Games_logo.svg',
  'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  'office': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg',
  'windows': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Windows_logo_-_2021.svg',
  'adobe': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_and_wordmark.svg',
  'creative cloud': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg',
  'nordvpn': 'https://upload.wikimedia.org/wikipedia/commons/9/90/NordVPN_logo.svg',
  'netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'spotify': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg',
  'canva': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
  'crunchyroll': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Crunchyroll_Logo.png',
  'hulu': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hulu_Logo.svg',
  'disney': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
  'prime': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
  'roblox': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg',
  'minecraft': 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png',
  'valorant': 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg',
};

export function getLogoForCategory(category: string, title?: string): string | null {
  const normalizedCategory = category.toLowerCase();
  
  if (categoryLogos[normalizedCategory]) {
    return categoryLogos[normalizedCategory];
  }
  
  // Try matching against category name keywords first
  for (const [key, logoUrl] of Object.entries(categoryLogos)) {
    if (normalizedCategory.includes(key)) {
      return logoUrl;
    }
  }
  
  // Fallback to searching the title for keywords if we have one
  if (title) {
    const normalizedTitle = title.toLowerCase();
    for (const [key, logoUrl] of Object.entries(categoryLogos)) {
      if (normalizedTitle.includes(key.replace('-', ' '))) {
        return logoUrl;
      }
    }
  }

  return null;
}
