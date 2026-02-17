# Image Replacement Guide for Your Portfolio

This guide explains which images need to be replaced with your own and how to maintain animation compatibility. All image files should be placed in the `/images/` directory.

## Critical: Interactive & Animated Images

### 1. **About Me Section** - Personal Avatar with Interactive Elements
These images work together as an interactive "scene":
- **`Anees040-desk-600-600.png`** ⭐ Main portrait image (person at desk working)
  - Primary background image that displays by default
  - Recommended: 600x600px PNG or similar
  
- **Eye Blinking Animation** (4 frames for the blinking effect)
  - `Anees040-desk[eyes-closed-0].png` (frame 1)
  - `Anees040-desk[eyes-closed-1].png` (frame 2)
  - `Anees040-desk[eyes-closed-2].png` (frame 3)
  - `Anees040-desk[eyes-closed-3].png` (frame 4)
  - How it works: These frames cycle when scrolling into the About Me section
  - Timing: 18 FPS with 1.7-6 second delays between cycles
  - Recommendation: Create 4 PNG frames of you with progressively closing eyes

- **Typing Hands Animation** (3+ frames for typing effect)
  - `about-me-typing-hand-0.png` (hand position 0)
  - `about-me-typing-hand-1.png` (hand position 1)
  - `about-me-typing-hand-2.png` (hand position 2)
  - How it works: Hands cycle to simulate typing on keyboard
  - Timing: 14 FPS, repeats 8 times with delays
  - Recommendation: Create 3+ frames showing different typing hand positions

- **Desk Light Animation**
  - `Anees040-desk-light-on.png` - Light turned ON
  - Is toggled by clicking - shows when light is active
  - Recommendation: PNG showing illuminated desk lamp

- **Coffee Cup Animation** (3 states)
  - `coffee-hidden.png` - Light off, coffee not visible
  - `coffee-visible.png` - Light on, coffee cup visible
  - `coffee-w-shadow.png` - Light on with shadow effect
  - How it works: Coffee visibility changes with light state transitions
  - Recommendation: PNG sequence showing coffee cup appearing/disappearing

### 2. **What Sets Me Apart Section** - Searching/Debugging Character
- **`Anees040-searching-bugs-605x804.png`** ⭐ Main search/debug image
  - Shows person at desk debugging/searching for bugs
  - Primary background image for this section
  
- **Eye Blinking Animation** (4 frames)
  - `Anees040-searching_eyes-closed-0.png`
  - `Anees040-searching_eyes-closed-1.png`
  - `Anees040-searching_eyes-closed-2.png`
  - `Anees040-searching_eyes-closed-3.png`
  - Timing: 20 FPS with 1.7-5 second delays
  - Recommendation: Eyes closing frames while searching/debugging

- **Ceiling Fan Animation** (3 frames for spinning)
  - `Anees040-searching-bugs-fan-0.png` (frame 3)
  - `Anees040-searching-bugs-fan-1.png` (frame 2)
  - `Anees040-searching-bugs-fan-2.png` (frame 1)
  - How it works: Continuously spins when section is visible
  - Timing: 20 FPS, continuous loop
  - Recommendation: 3-frame ceiling fan rotation animation

- **Fan Dome Light**
  - `ceiling-fan-light_both-off.png` (both off)
  - `ceiling-fan-light_right-on.png` (fan on, light off)
  - `ceiling-fan-light_left-on.png` (light on, fan off)  
  - `ceiling-fan-light_both-on.png` (both on)
  - How it works: Changes based on light/fan toggle state
  - Recommendation: Light switch toggle images

- **Magnifying Glass Arm** (for searching animation)
  - `magnify-arm.png` - Main arm position
  - `magnify-arm-hand.png` - Hand gripping magnifier
  - How it works: Rotates across the bug to emphasize debugging
  - Recommendation: SVG or PNG of arm with magnifying glass

- **The Bug** 
  - `bug.png` - Interactive bug that appears on click
  - Recommendation: Cute bug illustration

### 3. **Work Experience Section** - Globe & Buildings
This section uses horizontal scroll with rotating globe:

- **`web-globe-svg.svg`** ⭐ Rotating globe
  - Central visual that rotates as you scroll through work history
  - Rotates 540 degrees (1.5 full rotations) as you scroll
  - File format: SVG (recommended for smooth rotation)
  
- **Building SVGs** (Back layer - appears behind globe)
  - `automattic-building.svg`
  - `two-sigma-building.svg`
  - `facecake-building.svg`
  - `narconon-fresh-start-building.svg`
  - Position: Behind the globe, rotates with it
  
- **Building SVGs** (Front layer - appears in front)
  - `automattic-building__front.svg`
  - `two-sigma-building__front.svg`
  - `facecake-building__front.svg`
  - `narconon-fresh-start-building__front.svg`
  - Position: Front layer with work details
  - Contains: Work position titles, dates, tech stack
  - Recommendation: Update text in HTML for your companies, OR create new SVGs

### 4. **Contact Section - Avatar with Tracking Eyes**
This section has interactive eye-tracking:
- **`Anees040-wave-round.png`** - Main circular avatar (round background)
- **`Anees040-wave-round-bg.png`** - Background layer
- **`Anees040-wave-round-shadow.png`** - Shadow effect
- **`Anees040-wave-round-bg-shadow.png`** - Background with shadow

Eyes that track mouse/touch movement:
- **`Anees040-left-eye.png`** - Left eye
- **`Anees040-left-pupil.png`** - Left pupil (moves with mouse)
- **`Anees040-right-eye.png`** - Right eye
- **`Anees040-right-pupil.png`** - Right pupil (moves with mouse)

Logo rings that rotate:
- **`Anees040.com-logo-outer.png`** - Outer text ring (rotates)
- **`Anees040.com-logo-outer-shadow.png`** - Outer ring shadow
- How it works: Ring rotates continuously (360° every 40 seconds)

---

## Important: Non-Animated Images (Can be safely replaced)

### Profile Images
- `stack-overflow-user_bryan-elliott.jpeg` - Stack Overflow avatar
- `github-user_Anees040.png` - GitHub avatar

### Section Headers & Decorative
- `level-up-title.png` - "Level Up" game title
- `level-up-complete.webp` - "Challenge Complete" banner
- `ask-anees-ai-logo[small].png` - AI assistant logo
- `elliott-AI-character[profile]150.png` - AI character avatar

### Icons & Small Graphics
- `blogger-icon-round.svg` - Blog/About icon
- `linkedin-logo.svg` - LinkedIn logo
- `github-logo-white.svg` - GitHub logo
- `x-logo-white.svg` - X/Twitter logo
- `prog.ai-logo.png` - prog.ai logo
- `star-1.svg` - Twinkle effect stars
- `finger-tap-icon.svg` - Mobile tap indicator
- `hover-me-text-with-arrow.png` - Hero section hover prompt
- `click-me-1.png` - Click prompt arrow
- `waterline-cover-02-2024.png` - Magazine cover photo

---

## How to Replace Images Safely

### Step 1: Backup Original Images
```bash
# Create a backup folder
mkdir images_backup
cp images/* images_backup/
```

### Step 2: Replace Images
1. Replace interactive section images (About Me, What Sets Me Apart, Contact avatars)
2. Keep frame sequences properly numbered (0, 1, 2, 3)
3. Maintain original file names or update selectors in HTML

### Step 3: Important Animation Compatibility Notes

#### For Eye Blinking Frames:
- Need exactly 4 PNG files in sequence
- Each file must be the same dimensions
- File names must match the selector patterns in HTML:
  - About eyes: `.eyes-0`, `.eyes-1`, `.eyes-2`, `.eyes-3` classes/selectors
  - Searching eyes: Same pattern
- FPS: 18 for about-me, 20 for searching section
- **DO NOT change FPS unless you update main.js**

#### For Typing Hand Frames:
- Need 3+ PNG files
- Classes/selectors: `.typing-hand-0`, `.typing-hand-1`, `.typing-hand-2`
- FPS: 14 (defined in main.js at line 483)
- **DO NOT change FPS unless you update main.js**

#### For Ceiling Fan Frames:
- Need exactly 3 PNG files (frames)
- Classes/selectors: `.fan-0`, `.fan-1`, `.fan-2`
- Note: Fan frame order is REVERSED in HTML (2, 1, 0)
- FPS: 20 (defined in main.js at line 536)
- **Continuous spin - no delays**

#### For Eye Tracking (Contact Section):
- Left eye image and left pupil must align vertically
- Right eye image and right pupil must align vertically
- Pupils use CSS classes: `.pupil` (tracks mouse movement)
- Updates occur on mousemove/touchmove events
- **NO modifications needed if dimensions stay similar**

#### For Rotating Globe:
- SVG format recommended for smooth rotation
- Rotates -540 degrees during experience section scroll
- Does NOT need to be animated - GSAP handles the rotation

---

## Step-by-Step Replacement Example

### Example: Replace About Me Images
1. Create 4 eye-closing frames:
   - Frame 0 (eyes wide open)
   - Frame 1 (eyes 1/3 closed)
   - Frame 2 (eyes 2/3 closed)
   - Frame 3 (eyes fully closed)
   
2. Save as:
   ```
   images/Anees040-desk[eyes-closed-0].png
   images/Anees040-desk[eyes-closed-1].png
   images/Anees040-desk[eyes-closed-2].png
   images/Anees040-desk[eyes-closed-3].png
   ```

3. Create 3 typing hand frames:
   ```
   images/about-me-typing-hand-0.png
   images/about-me-typing-hand-1.png
   images/about-me-typing-hand-2.png
   ```

4. No code changes needed! Images are referenced by file name in HTML.

---

## Troubleshooting

### Animations Not Appearing?
- ✓ Check file names match HTML exactly (case-sensitive)
- ✓ Verify images are in `/images/` directory
- ✓ Ensure PNG dimensions are reasonable (not too large)
- ✓ Check browser console for 404 errors on images
- ✓ Verify frame count is correct (4 for eyes, 3 for fan, etc.)

### Animations Running Too Fast/Slow?
- FPS values defined in main.js:
  - About eyes: line 472, fps: 18
  - Typing hands: line 483, fps: 14
  - Searching eyes: line 493, fps: 20
  - Fan: line 536, fps: 20
  - To change: modify the `fps:` value, then restart dev server/rebuild

### Images Distorted or Wrong Size?
- CSS aspect-ratio and image dimensions must work together
- Check that new images have similar aspect ratio to originals
- Some images use `.responsive` class - they scale with viewport

---

## Advanced: If You Want to Change Animation Behavior

To modify the frame cycling timing, edit these lines in `main.js`:

- **About blinking eyes** (line 472-477):
  ```javascript
  const eyesBlinker1 = imageFrameCyclerV2(eyesFrames1, {
      fps: 18,           // Change FPS here
      shouldReverse: true,
      cycleCount: 2,          // Number of blinks
      delayRange: { min: 1700, max: 6000 },  // Delay between blinks (ms)
      autoStart: false,
  });
  ```

- **Typing hands** (line 483-489):
  ```javascript
  const typingHands = imageFrameCyclerV2(typingHandsFrames, {
      fps: 14,           // Change FPS here
      shouldReverse: true,
      cycleCount: 8,          // How many typing cycles
      delayRange: { min: 1700, max: 3700 },  // Delay between cycles
      autoStart: false,
  });
  ```

---

## Summary of Required Image Files

**Critical for animations (must replace):**
- About Me: 1 main + 4 eyes frames + 3 typing hand frames = 8 files
- What Sets Me Apart: 1 main + 4 eyes frames + 3 fan frames + 4 light states = 12 files  
- Contact: 1+4 circular avatars + 2 eye pairs + 2 logo rings + misc = 11 files
- Experience: 1 globe + 8 building SVGs = 9 files
- **Total Animated: ~40 files**

**Nice to update (not animated):**
- Profile pics, logos, icons, etc. = ~20 files
- **Total: ~60 image files**

---

## Questions?

If animations break after image replacement:
1. Check console for errors (F12 → Console)
2. Verify file names match selectors in HTML exactly
3. Ensure all frame sequence files exist
4. Check image paths don't have spaces or special characters
5. Try clearing browser cache (Ctrl+Shift+Del)
