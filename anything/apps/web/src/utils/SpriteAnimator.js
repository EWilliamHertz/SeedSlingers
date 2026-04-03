/**
 * Sprite Animator - Handles sprite animation playback
 */

export class SpriteAnimator {
  constructor(frames, fps = 8) {
    this.frames = frames; // Array of canvas elements or images
    this.fps = fps;
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.playing = true;
    this.loop = true;
  }

  /**
   * Update animation based on elapsed time
   */
  update(timestamp) {
    if (!this.playing || this.frames.length === 0) return;

    const frameDuration = 1000 / this.fps;

    if (timestamp - this.lastFrameTime >= frameDuration) {
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        if (this.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = this.frames.length - 1;
          this.playing = false;
        }
      }

      this.lastFrameTime = timestamp;
    }
  }

  /**
   * Get current frame
   */
  getCurrentFrame() {
    return this.frames[this.currentFrame];
  }

  /**
   * Play animation
   */
  play() {
    this.playing = true;
  }

  /**
   * Pause animation
   */
  pause() {
    this.playing = false;
  }

  /**
   * Reset to first frame
   */
  reset() {
    this.currentFrame = 0;
    this.lastFrameTime = 0;
  }

  /**
   * Set animation speed
   */
  setFPS(fps) {
    this.fps = fps;
  }
}

/**
 * Direction-based animation controller
 * Useful for character movement with 4-directional sprites
 */
export class DirectionalAnimator {
  constructor(spriteSheets) {
    // spriteSheets: { up: [], down: [], left: [], right: [] }
    this.animators = {};

    for (const [direction, frames] of Object.entries(spriteSheets)) {
      this.animators[direction] = new SpriteAnimator(frames);
    }

    this.currentDirection = "down";
  }

  /**
   * Set current direction
   */
  setDirection(direction) {
    if (this.animators[direction]) {
      this.currentDirection = direction;
    }
  }

  /**
   * Update current animation
   */
  update(timestamp) {
    this.animators[this.currentDirection].update(timestamp);
  }

  /**
   * Get current frame
   */
  getCurrentFrame() {
    return this.animators[this.currentDirection].getCurrentFrame();
  }

  /**
   * Play all animations
   */
  play() {
    Object.values(this.animators).forEach((animator) => animator.play());
  }

  /**
   * Pause all animations
   */
  pause() {
    Object.values(this.animators).forEach((animator) => animator.pause());
  }
}

export default SpriteAnimator;
