# SeedSlingers Game Assets - Complete Setup

## ✅ What's Been Done

I've integrated a complete free asset system into your SeedSlingers game. Here's everything that's now available:

### 🎨 Custom Generated Assets (4 Sets)

1. **Wasteland Tileset** - 2K resolution
   - Post-apocalyptic ground tiles
   - Cracked concrete, rusted metal
   - Toxic puddles, broken machinery
   - Overgrown vegetation

2. **Player Character Sprites** - 2K resolution
   - Scavenger with makeshift armor
   - Plant-tech staff
   - 4-directional walking animations
   - Idle poses

3. **Sprout Creatures** - 2K resolution
   - 5 elemental types:
     * Solar (yellow flower)
     * Fungal (purple mushroom)
     * Aquatic (blue water lily)
     * Mineral (crystal growth)
     * Data (circuit patterns)
   - Idle and attack animations

4. **UI Elements** - 2K resolution
   - Inventory slots
   - HP/MP bars (plant-tech styled)
   - Item icons (scrap metal, bio-resin, data seeds)
   - Buttons, panels, borders

### 📦 Free Asset Library (CC-BY 3.0)

**Hyptosis Tile Collection** from OpenGameArt.org:
- 6 different sprite sheets
- 32×32 and 16×16 pixel art
- Fantasy RPG environments
- Interior/exterior tiles
- Monster sprites
- Item sprites (bombs, potions, weapons)
- Character sprites

**License:** CC-BY 3.0 (Attribution required)
**Proper credit is automatically shown on /credits page**

## 🛠️ New Systems Created

### 1. Asset Loading System
**File:** `/apps/web/src/utils/AssetLoader.js`

Features:
- Centralized asset registration
- Automatic loading with progress tracking
- Sprite sheet extraction
- Grid-based sprite cutting
- Image caching

Usage:
```javascript
import assetLoader from '@/utils/AssetLoader';

// Register assets
assetLoader.register('my_tileset', 'https://...');

// Load all
await assetLoader.loadAll();

// Get loaded asset
const tileset = assetLoader.get('my_tileset');
```

### 2. Sprite Animation System
**File:** `/apps/web/src/utils/SpriteAnimator.js`

Features:
- Frame-based animation
- FPS control
- Loop/one-shot modes
- Directional character animation (4-way)

Usage:
```javascript
import { SpriteAnimator, DirectionalAnimator } from '@/utils/SpriteAnimator';

// Simple animation
const animator = new SpriteAnimator(frames, 8); // 8 FPS
animator.update(timestamp);
const currentFrame = animator.getCurrentFrame();

// 4-directional character
const charAnim = new DirectionalAnimator({
  up: [...frames],
  down: [...frames],
  left: [...frames],
  right: [...frames]
});
charAnim.setDirection('right');
```

### 3. Asset Manifest
**File:** `/apps/web/src/data/assetManifest.js`

Central registry of all game assets:
- Custom generated assets (URLs populated)
- Hyptosis free assets (OpenGameArt.org)
- Sprite dimensions config
- Credits tracking

### 4. Credits Page
**URL:** `/credits`
**File:** `/apps/web/src/app/credits/page.jsx`

Features:
- Lists all custom assets
- Proper attribution for CC-BY assets
- Links to original sources
- License explanations
- Resource links (OpenGameArt, itch.io, etc.)

### 5. Loading Screen in GameCanvas
**File:** `/apps/web/src/components/GameCanvas.jsx`

Features:
- Progress bar (0-100%)
- Loading status messages
- Automatic asset loading on mount
- Only renders game when ready

### 6. Credits Button in HUD
**File:** `/apps/web/src/components/GameHUD.jsx`

Added "CREDITS" button to bottom navigation for easy access.

## 📚 Documentation Created

### ASSET_GUIDE.md (This file)
Complete guide covering:
- All asset categories and usage
- How to load and animate sprites
- Where to find more free assets
- How to add new assets
- License explanations
- Troubleshooting

### ASSET_RESOURCES.md
Curated list of best free asset sources:
- OpenGameArt.org
- itch.io
- Kenney.nl (CC0 - no attribution!)
- CraftPix.net
- Game-Icons.net

Includes:
- License guide
- Search tips
- Quality evaluation criteria
- Attribution best practices

## 🎮 How to Use in Your Game

### Quick Start

1. **Assets are auto-loaded** when GameCanvas mounts
2. **Access via assetLoader:**
   ```javascript
   const tileset = assetLoader.get('tileset_wasteland');
   const playerSprites = assetLoader.get('character_player');
   const sprouts = assetLoader.get('sprouts');
   ```

3. **Extract sprites:**
   ```javascript
   const grid = assetLoader.createSpriteGrid(tileset, 32, 32);
   const tile = grid.sprites[0]; // First tile
   ```

4. **Animate:**
   ```javascript
   const animator = new SpriteAnimator(frames, 8);
   // In game loop:
   animator.update(timestamp);
   ctx.drawImage(animator.getCurrentFrame(), x, y);
   ```

### Available Assets

**Custom Generated (Ready to Use):**
```javascript
ASSET_MANIFEST.tilesets.wasteland      // Tileset
ASSET_MANIFEST.characters.player       // Player sprites
ASSET_MANIFEST.sprouts.sproutSheet     // Creatures
ASSET_MANIFEST.ui.elements             // UI elements
```

**Hyptosis Collection (CC-BY 3.0):**
```javascript
ASSET_MANIFEST.openGameArt.hyptosis_tiles_1    // Batch 1
ASSET_MANIFEST.openGameArt.hyptosis_tiles_2    // Batch 2
ASSET_MANIFEST.openGameArt.hyptosis_tiles_3    // Batch 3
ASSET_MANIFEST.openGameArt.hyptosis_tiles_4    // Batch 4
ASSET_MANIFEST.openGameArt.hyptosis_tiles_5    // Batch 5 (16×16)
ASSET_MANIFEST.openGameArt.hyptosis_sprites    // Sprites
```

## 🔗 Important Links

### In Your App
- **Credits Page:** http://localhost:3000/credits
- **Game:** http://localhost:3000/game

### Files
- **Asset Manifest:** `/apps/web/src/data/assetManifest.js`
- **Asset Loader:** `/apps/web/src/utils/AssetLoader.js`
- **Sprite Animator:** `/apps/web/src/utils/SpriteAnimator.js`
- **Credits Page:** `/apps/web/src/app/credits/page.jsx`
- **This Guide:** `/apps/web/ASSET_GUIDE.md`
- **Resources List:** `/apps/web/ASSET_RESOURCES.md`

### External Resources
- **OpenGameArt.org:** https://opengameart.org
- **itch.io Assets:** https://itch.io/game-assets/free
- **Kenney.nl (CC0):** https://kenney.nl/assets
- **CraftPix Freebies:** https://craftpix.net/freebies
- **Game Icons:** https://game-icons.net

## ✨ What's Next?

### Option 1: Use Custom Assets
The generated assets are ready to use! Extract sprites from:
- Wasteland tileset → Build your game world
- Player sprites → Animated character
- Sprout creatures → Battle sprites
- UI elements → Interface graphics

### Option 2: Use Hyptosis Assets
Already loaded and ready:
- Fantasy tileset perfect for RPGs
- Monsters, items, environment tiles
- Just remember to credit (already done on /credits page)

### Option 3: Mix Both!
Combine custom + free assets for unique look

### Option 4: Add More Assets
See ASSET_RESOURCES.md for where to find more:
- OpenGameArt.org (thousands of free assets)
- itch.io (modern pixel art)
- Kenney.nl (CC0 - no credit needed!)

## 📝 Adding New Assets (Quick Guide)

1. **Find asset** (OpenGameArt, itch.io, etc.)
2. **Check license** (CC0, CC-BY, etc.)
3. **Add to manifest:**
   ```javascript
   // In /apps/web/src/data/assetManifest.js
   ASSET_MANIFEST.myCategory.myAsset = 'https://...';
   ```

4. **Register in component:**
   ```javascript
   assetLoader.register('my_key', ASSET_MANIFEST.myCategory.myAsset);
   ```

5. **Add credit if needed** (edit `/apps/web/src/app/credits/page.jsx`)

## ⚖️ Legal & Attribution

### ✅ You're Safe!
All assets are legally usable:
- Custom generated assets → Created for your game
- Hyptosis assets → CC-BY 3.0 (properly credited)

### Your Responsibilities:
1. **Keep credits page** - Shows attribution for CC-BY assets
2. **Don't remove credits** - Required for CC-BY license
3. **Update credits** - When adding new CC-BY assets

### CC-BY 3.0 Means:
✅ Use commercially  
✅ Modify freely  
✅ Mix with other assets  
⚠️ Must credit original author  

**We're compliant!** Credits are on /credits page with:
- Author name (Hyptosis)
- License type (CC-BY 3.0)
- Link to source
- Description of what's used

## 🎨 Asset Specifications

### Custom Assets
- **Format:** PNG
- **Resolution:** 2K (suitable for HD displays)
- **Style:** Post-apocalyptic, plant-tech theme
- **Color Palette:** Muted browns/grays + green accents

### Hyptosis Assets
- **Format:** PNG
- **Tile Size:** 32×32 or 16×16 pixels
- **Style:** Fantasy pixel art
- **Color Palette:** Vibrant, retro gaming style

## 🐛 Troubleshooting

### Assets Not Loading?
1. Check browser console for errors
2. Verify internet connection (CDN assets)
3. Check AssetLoader console logs
4. Try loading asset URL directly in browser

### Sprites Look Blurry?
Add to canvas/image:
```javascript
style={{ imageRendering: 'pixelated' }}
```

### Animation Too Fast/Slow?
Adjust FPS:
```javascript
const animator = new SpriteAnimator(frames, 12); // Try 12 FPS
```

### License Questions?
- CC0 = Use freely, no credit needed
- CC-BY = Must credit (see /credits page)
- When in doubt, check source URL

## 💡 Pro Tips

1. **Start with Kenney.nl** - CC0 means zero legal worries
2. **Keep a credits file** - Track every asset you use
3. **Test in-game first** - Make sure style matches
4. **Organize by size** - 16×16, 32×32, etc.
5. **Use sprite sheets** - Better performance than individual files

## 🌟 Resources to Bookmark

- **OpenGameArt.org** - Largest free asset library
- **itch.io/game-assets/free** - Modern indie assets
- **Kenney.nl** - 40,000+ CC0 assets
- **Game-Icons.net** - 4,000+ UI icons
- **This Guide** - /apps/web/ASSET_GUIDE.md

---

## Summary

✅ 4 custom asset sets generated (wasteland, player, sprouts, UI)  
✅ 6 Hyptosis sprite sheets loaded (CC-BY 3.0)  
✅ Asset loading system with progress bar  
✅ Sprite animation utilities  
✅ Credits page with proper attribution  
✅ Comprehensive documentation  
✅ Legal to use commercially  

**You're all set! Start building your game with these assets!** 🚀🌱
