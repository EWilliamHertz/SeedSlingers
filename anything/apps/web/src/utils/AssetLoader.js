/**
 * Asset Loader - Centralized asset management for SeedSlingers
 * Handles sprite sheets, tilesets, and game assets
 */

class AssetLoader {
  constructor() {
    this.assets = new Map();
    this.loaded = false;
    this.loadingPromises = [];
  }

  /**
   * Register an asset to be loaded
   */
  register(key, url, type = "image") {
    this.assets.set(key, {
      url,
      type,
      data: null,
      loaded: false,
    });
  }

  /**
   * Load a single image asset
   */
  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Load all registered assets
   */
  async loadAll() {
    const promises = Array.from(this.assets.entries()).map(
      async ([key, asset]) => {
        try {
          if (asset.type === "image") {
            asset.data = await this.loadImage(asset.url);
            asset.loaded = true;
          }
        } catch (error) {
          console.error(`Failed to load asset: ${key}`, error);
        }
      },
    );

    await Promise.all(promises);
    this.loaded = true;
    return this;
  }

  /**
   * Get a loaded asset
   */
  get(key) {
    const asset = this.assets.get(key);
    return asset?.loaded ? asset.data : null;
  }

  /**
   * Check if all assets are loaded
   */
  isLoaded() {
    return this.loaded;
  }

  /**
   * Extract a sprite from a sprite sheet
   */
  extractSprite(image, x, y, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return canvas;
  }

  /**
   * Create a sprite sheet grid
   */
  createSpriteGrid(image, spriteWidth, spriteHeight) {
    const cols = Math.floor(image.width / spriteWidth);
    const rows = Math.floor(image.height / spriteHeight);
    const sprites = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        sprites.push(
          this.extractSprite(
            image,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
          ),
        );
      }
    }

    return {
      sprites,
      cols,
      rows,
      spriteWidth,
      spriteHeight,
    };
  }
}

// Singleton instance
const assetLoader = new AssetLoader();

export default assetLoader;
