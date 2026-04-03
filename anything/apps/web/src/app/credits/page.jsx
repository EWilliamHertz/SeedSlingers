/**
 * Credits Page - Attribution for all game assets
 * Displays proper credits for free assets used in SeedSlingers
 */

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#4ade80]">
          SeedSlingers Credits
        </h1>

        {/* Game Info */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b border-[#4ade80] pb-2">
            Game
          </h2>
          <p className="text-gray-300">
            SeedSlingers - A post-apocalyptic creature collection RPG where you
            explore a wasteland filled with bio-mechanical plant creatures
            called Sprouts.
          </p>
        </section>

        {/* Custom Generated Assets */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b border-[#4ade80] pb-2">
            Custom Assets
          </h2>
          <div className="bg-[#1a1a1a] p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-3">
              AI-Generated Custom Assets
            </h3>
            <p className="text-gray-400 mb-4">
              The following assets were custom-generated specifically for
              SeedSlingers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Wasteland Tileset (Post-apocalyptic environment tiles)</li>
              <li>Scavenger Character Sprites (Player character animations)</li>
              <li>
                Sprout Creature Sprites (5 elemental bio-mechanical creatures)
              </li>
              <li>UI Elements (Icons, bars, buttons, panels)</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">
              Generated via: Anything Platform AI Asset Generation
            </p>
          </div>
        </section>

        {/* Free Asset Libraries */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b border-[#4ade80] pb-2">
            Free Asset Libraries
          </h2>

          {/* Hyptosis */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg mb-6">
            <h3 className="text-xl font-medium mb-3">
              Hyptosis - Pixel Art Tiles &amp; Sprites
            </h3>
            <div className="text-gray-400 space-y-2">
              <p>
                <strong className="text-white">Author:</strong> Hyptosis
              </p>
              <p>
                <strong className="text-white">License:</strong> Creative
                Commons Attribution 3.0 (CC-BY 3.0)
              </p>
              <p>
                <strong className="text-white">Source:</strong>{" "}
                <a
                  href="https://opengameart.org/content/lots-of-free-2d-tiles-and-sprites-by-hyptosis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4ade80] hover:underline"
                >
                  OpenGameArt.org
                </a>
              </p>
              <p className="text-sm mt-4">
                Includes: 32×32 and 16×16 pixel art tiles, sprites for fantasy
                RPG environments, monsters, interiors, exteriors, castles,
                caves, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Open Source Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b border-[#4ade80] pb-2">
            Asset Resources
          </h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">OpenGameArt.org</h3>
              <p className="text-sm">
                Community-driven repository of free game art assets with clear
                licensing.
                <br />
                <a
                  href="https://opengameart.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4ade80] hover:underline"
                >
                  Visit OpenGameArt.org
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">
                itch.io Game Assets
              </h3>
              <p className="text-sm">
                Huge collection of free and paid game assets from indie
                creators.
                <br />
                <a
                  href="https://itch.io/game-assets/free"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4ade80] hover:underline"
                >
                  Browse itch.io Assets
                </a>
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">CraftPix.net</h3>
              <p className="text-sm">
                Professional game assets with free and premium options.
                <br />
                <a
                  href="https://craftpix.net/freebies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4ade80] hover:underline"
                >
                  Explore CraftPix Freebies
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* License Information */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b border-[#4ade80] pb-2">
            License Information
          </h2>
          <div className="bg-[#1a1a1a] p-6 rounded-lg space-y-4 text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">
                CC-BY 3.0 (Creative Commons Attribution)
              </h3>
              <p className="text-sm">
                You are free to use, modify, and distribute the work, even
                commercially, as long as you provide appropriate credit to the
                original creator.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">
                CC0 (Public Domain)
              </h3>
              <p className="text-sm">
                No attribution required. Free to use for any purpose without
                restrictions.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">
                How We Provide Attribution
              </h3>
              <p className="text-sm">
                All CC-BY licensed assets are properly credited on this page
                with:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                <li>Author name</li>
                <li>License type</li>
                <li>Link to original source</li>
                <li>Description of what was used</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Thank You */}
        <section className="text-center py-8">
          <p className="text-gray-400">
            Thank you to all the amazing artists who share their work with the
            community! Your contributions make indie game development possible.
            🌱
          </p>
        </section>

        {/* Back to Game */}
        <div className="text-center mt-8">
          <a
            href="/game"
            className="inline-block bg-[#4ade80] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors"
          >
            Back to Game
          </a>
        </div>
      </div>
    </div>
  );
}
