/**
 * Asset Manifest - Registry of all game assets
 * This will be populated with generated asset URLs
 */

export const ASSET_MANIFEST = {
  // Tilesets
  tilesets: {
    wasteland:
      "https://raw.createusercontent.com/43e80027-3c97-4cea-9ac6-38f36beddb80/", // Post-apocalyptic wasteland tileset
  },

  // Character sprites
  characters: {
    player:
      "https://raw.createusercontent.com/98563e8e-5755-4a04-a7ec-2e3d68b982bf/", // Scavenger character sprite sheet
  },

  // Creature/Sprout sprites
  sprouts: {
    sproutSheet:
      "https://raw.createusercontent.com/5ccd6a54-2941-47b2-b8bb-f7ca674a8fae/", // Bio-mechanical plant creatures
  },

  // UI elements
  ui: {
    elements:
      "https://raw.createusercontent.com/edeeff70-e50c-4edc-8911-9d4347da0ead/", // RPG UI icons and elements
  },

  // Free assets from OpenGameArt (CC-BY 3.0)
  // These are hosted CDN URLs that are safe to use
  openGameArt: {
    // Hyptosis tile collection - CC-BY 3.0
    hyptosis_tiles_1:
      "https://opengameart.org/sites/default/files/hyptosis_tile-art-batch-1.png",
    hyptosis_tiles_2:
      "https://opengameart.org/sites/default/files/hyptosis_til-art-batch-2.png",
    hyptosis_tiles_3:
      "https://opengameart.org/sites/default/files/hyptosis_tile-art-batch-3_0.png",
    hyptosis_tiles_4:
      "https://opengameart.org/sites/default/files/hyptosis_tile-art-batch-4.png",
    hyptosis_tiles_5:
      "https://opengameart.org/sites/default/files/hyptosis_tile-art-batch-5.png",
    hyptosis_sprites:
      "https://opengameart.org/sites/default/files/hyptosis_sprites-and-tiles-for-you.png",
  },

  // Placeholder for user-uploaded assets
  custom: {},
};

/**
 * Asset credits - Always attribute creators!
 */
export const ASSET_CREDITS = {
  hyptosis: {
    author: "Hyptosis",
    license: "CC-BY 3.0",
    source:
      "https://opengameart.org/content/lots-of-free-2d-tiles-and-sprites-by-hyptosis",
    attribution: "Tiles and sprites by Hyptosis (CC-BY 3.0)",
  },
  generated: {
    author: "AI Generated via Anything Platform",
    license: "Custom",
    attribution: "Custom generated assets for SeedSlingers",
  },
};

/**
 * Sprite dimensions configuration
 */
export const SPRITE_CONFIG = {
  TILE_SIZE: 32,
  SMALL_TILE_SIZE: 16,
  CHARACTER_WIDTH: 32,
  CHARACTER_HEIGHT: 32,
  SPROUT_WIDTH: 32,
  SPROUT_HEIGHT: 32,
};

export default ASSET_MANIFEST;
