# SeedSlingers Asset Guide

## Overview
This guide covers all the free 2D game assets integrated into SeedSlingers, including how to use them, where they came from, and how to add more.

## Asset Categories

### 1. Custom Generated Assets (✨ Custom for SeedSlingers)

All of these were AI-generated specifically for the SeedSlingers theme:

- **Wasteland Tileset** - Post-apocalyptic ground tiles, debris, toxic puddles, broken machinery
  - Location: `ASSET_MANIFEST.tilesets.wasteland`
  - Size: 32×32 pixels per tile
  - Usage: Perfect for building the game world environment

- **Player Character Sprites** - Scavenger with plant-tech staff
  - Location: `ASSET_MANIFEST.characters.player`
  - Size: 32×32 pixels
  - Includes: 4-directional walking animations (up, down, left, right)

- **Sprout Creatures** - Bio-mechanical plant creatures
  - Location: `ASSET_MANIFEST.sprouts.sproutSheet`
  - Size: 32×32 pixels per sprite
  - Includes: 5 elemental types (Solar, Fungal, Aquatic, Mineral, Data)
  - Animations: Idle and attack poses

- **UI Elements** - Complete RPG interface kit
  - Location: `ASSET_MANIFEST.ui.elements`
  - Size: 16×16 and 32×32 icons
  - Includes: HP/MP bars, inventory slots, item icons, buttons, panels

### 2. Hyptosis Tile Collection (CC-BY 3.0)

Free pixel art from OpenGameArt.org by artist Hyptosis. **Must credit in your game!**

- **License:** Creative Commons Attribution 3.0 (CC-BY 3.0)
- **Attribution Required:** Yes - "Tiles and sprites by Hyptosis (CC-BY 3.0)"
- **Source:** https://opengameart.org/content/lots-of-free-2d-tiles-and-sprites-by-hyptosis

**What's included:**
- 32×32 pixel art tiles for RPG environments
- Interior tiles (castles, houses, dungeons)
- Exterior tiles (grass, water, mountains, caves)
- Monster sprites
- Item sprites (bombs, potions, weapons)
- Character sprites

**Available batches:**
```javascript
ASSET_MANIFEST.openGameArt.hyptosis_tiles_1  // Batch 1 - General tiles
ASSET_MANIFEST.openGameArt.hyptosis_tiles_2  // Batch 2 - More environments
ASSET_MANIFEST.openGameArt.hyptosis_tiles_3  // Batch 3 - Additional sets
ASSET_MANIFEST.openGameArt.hyptosis_tiles_4  // Batch 4 - Specialty tiles
ASSET_MANIFEST.openGameArt.hyptosis_tiles_5  // Batch 5 - 16×16 tiles
ASSET_MANIFEST.openGameArt.hyptosis_sprites  // Sprite collection
```

## How to Use Assets

### Loading Assets

Assets are automatically loaded when the game starts using the `AssetLoader` utility:

```javascript
import assetLoader from '@/utils/AssetLoader';
import { ASSET_MANIFEST } from '@/data/assetManifest';

// Register an asset
assetLoader.register('my_tileset', ASSET_MANIFEST.tilesets.wasteland);

// Load all assets
await assetLoader.loadAll();

// Get a loaded asset
const tileset = assetLoader.get('my_tileset');
```

### Extracting Sprites from Sprite Sheets

```javascript
// Extract a single sprite
const sprite = assetLoader.extractSprite(
  image,      // Source image
  32,         // X position in sheet
  64,         // Y position in sheet
  32,         // Width
  32          // Height
);

// Create a grid of all sprites
const grid = assetLoader.createSpriteGrid(
  image,      // Source image
  32,         // Sprite width
  32          // Sprite height
);

// Access individual sprites
const firstSprite = grid.sprites[0];
```

### Animating Sprites

```javascript
import { SpriteAnimator } from '@/utils/SpriteAnimator';

// Create animator with array of frames
const animator = new SpriteAnimator(frames, 8); // 8 FPS

// In your game loop
function update(timestamp) {
  animator.update(timestamp);
  const currentFrame = animator.getCurrentFrame();
  
  // Draw the current frame
  ctx.drawImage(currentFrame, x, y);
}
```

### Directional Character Animation

```javascript
import { DirectionalAnimator } from '@/utils/SpriteAnimator';

// Set up with 4-direction sprite sheets
const characterAnimator = new DirectionalAnimator({
  up: [frame1, frame2, frame3],
  down: [frame1, frame2, frame3],
  left: [frame1, frame2, frame3],
  right: [frame1, frame2, frame3]
});

// Change direction based on input
characterAnimator.setDirection('right');

// Update in game loop
characterAnimator.update(timestamp);
const frame = characterAnimator.getCurrentFrame();
```

## Where to Find More Free Assets

### Recommended Sources (All Legal & Safe)

#### 1. **OpenGameArt.org** ⭐ Best for indie devs
- **URL:** https://opengameart.org
- **License Types:** CC0, CC-BY 3.0, CC-BY-SA, GPL
- **Quality:** High - curated community submissions
- **Best For:** Complete asset packs, sprites, tilesets
- **Attribution:** Check each asset - many require credit

**Search tips:**
- Filter by license (CC0 = no attribution needed)
- Look for "asset pack" or "complete" in titles
- Sort by "Most Favorited" for quality

#### 2. **itch.io Game Assets** ⭐ Huge selection
- **URL:** https://itch.io/game-assets/free
- **License Types:** Varies (always check)
- **Quality:** Mixed - ranges from amateur to professional
- **Best For:** Modern pixel art, complete game kits
- **Attribution:** Usually required, check each asset

**Popular free packs:**
- Mystic Woods (16×16 fantasy)
- Ninja Adventure (top-down action)
- Sprout Lands (farming/cozy)
- Brackeys Platformer Bundle (complete starter kit)

#### 3. **CraftPix.net Freebies**
- **URL:** https://craftpix.net/freebies
- **License Types:** Usually royalty-free (check each)
- **Quality:** Professional
- **Best For:** Polished commercial-quality assets
- **Attribution:** Check license per pack

#### 4. **Kenney.nl** ⭐ CC0 Public Domain
- **URL:** https://kenney.nl/assets
- **License:** CC0 (Public Domain) - No attribution required!
- **Quality:** Very high, consistent style
- **Best For:** UI elements, simple sprites, prototyping
- **Attribution:** Not required but appreciated

#### 5. **Game-Icons.net** (For UI Icons)
- **URL:** https://game-icons.net
- **License:** CC-BY 3.0
- **Quality:** Excellent SVG icons
- **Best For:** Item icons, ability icons, UI elements
- **Attribution:** Required

### What to Look For

✅ **Good signs:**
- Clear license information (CC0, CC-BY 3.0, MIT)
- Active community/creator
- Multiple downloads/favorites
- Includes source files (.aseprite, .png, etc.)
- Preview images showing all assets

⚠️ **Red flags:**
- No license mentioned
- "Free for personal use only" (can't publish games)
- Watermarked previews
- No attribution information
- Suspiciously high quality (might be stolen)

## How to Add New Assets

### 1. Find and Download Assets
Download from one of the sources above. Make sure to:
- ✅ Check the license
- ✅ Note the author's name
- ✅ Save any attribution requirements

### 2. Update Asset Manifest
Edit `/apps/web/src/data/assetManifest.js`:

```javascript
export const ASSET_MANIFEST = {
  // Add your new category or asset
  myNewCategory: {
    myAsset: 'https://url-to-asset.com/image.png',
  },
  
  // ... existing assets ...
};
```

### 3. Add to Credits
Edit `/apps/web/src/app/credits/page.jsx` and add proper attribution:

```javascript
<div className="bg-[#1a1a1a] p-6 rounded-lg mb-6">
  <h3 className="text-xl font-medium mb-3">Asset Name</h3>
  <div className="text-gray-400 space-y-2">
    <p><strong>Author:</strong> Artist Name</p>
    <p><strong>License:</strong> CC-BY 3.0</p>
    <p><strong>Source:</strong> <a href="...">Link</a></p>
  </div>
</div>
```

### 4. Register and Load
In your component:

```javascript
import assetLoader from '@/utils/AssetLoader';
import { ASSET_MANIFEST } from '@/data/assetManifest';

useEffect(() => {
  assetLoader.register('my_new_asset', ASSET_MANIFEST.myNewCategory.myAsset);
  assetLoader.loadAll();
}, []);
```

## License Quick Reference

### CC0 (Public Domain)
- ✅ Use for anything
- ✅ Modify freely
- ✅ No attribution required
- ✅ Commercial use OK

### CC-BY 3.0/4.0
- ✅ Use for anything
- ✅ Modify freely
- ⚠️ Attribution REQUIRED
- ✅ Commercial use OK

### CC-BY-SA 3.0/4.0
- ✅ Use for anything
- ✅ Modify freely
- ⚠️ Attribution REQUIRED
- ⚠️ Share modifications under same license
- ✅ Commercial use OK

### GPL (GNU General Public License)
- ✅ Use for anything
- ✅ Modify freely
- ⚠️ Must make source code available
- ⚠️ Derivative works must be GPL
- ✅ Commercial use OK

## Current Asset Credits

All credits are maintained in:
- **Credits Page:** `/credits` in the game
- **Code:** `/apps/web/src/data/assetManifest.js`

### Active Credits:
1. **Hyptosis** - CC-BY 3.0 tile and sprite collection
2. **AI Generated** - Custom SeedSlingers assets

## Best Practices

### When Using Free Assets:

1. **Always Read the License** - Even "free" assets have terms
2. **Keep a Credits File** - Track every asset you use
3. **Test Assets First** - Make sure they fit your style
4. **Bundle Similar Styles** - Mix assets that look cohesive
5. **Consider Commissioning** - For unique game identity

### Asset Organization:

```
/apps/web/src/
  ├── data/
  │   └── assetManifest.js      # Central registry
  ├── utils/
  │   ├── AssetLoader.js        # Loading utility
  │   └── SpriteAnimator.js     # Animation helper
  └── app/
      └── credits/
          └── page.jsx          # Attribution page
```

## Troubleshooting

### Assets Not Loading?
1. Check browser console for errors
2. Verify URL is publicly accessible
3. Check CORS headers
4. Try loading image directly in browser

### Animations Not Working?
1. Verify sprite sheet dimensions match SPRITE_CONFIG
2. Check FPS isn't too low (try 8-12)
3. Ensure update() is called every frame

### Attribution Issues?
1. Always credit CC-BY assets
2. Include license type
3. Link to original source
4. Keep credits page up to date

## Resources

- **Asset Manifest:** `/apps/web/src/data/assetManifest.js`
- **Asset Loader:** `/apps/web/src/utils/AssetLoader.js`
- **Sprite Animator:** `/apps/web/src/utils/SpriteAnimator.js`
- **Credits Page:** `/credits` (https://your-game.com/credits)
- **This Guide:** `/apps/web/ASSET_GUIDE.md`

---

**Remember:** Respecting licenses and crediting artists keeps the free asset ecosystem alive! 🌱
