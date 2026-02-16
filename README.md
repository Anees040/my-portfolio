# Muhammad Anees - Portfolio Website

A modern, interactive portfolio site built with vanilla HTML, CSS, and JavaScript. Features smooth animations, an interactive game, AI-powered chat assistant, and engaging UI elements.

## 🚀 Demo

Visit the live site: [anees040.github.io/my-portfolio](https://anees040.github.io/my-portfolio) (or your custom domain)

## ✨ Features

- **Smooth Scroll Animations** - GSAP-powered scroll triggers and animations
- **Interactive Illustrations** - Eye-blinking character, typing hands, light switches
- **Horizontal Timeline** - Experience/work history with company profiles
- **Level-Up Platformer Game** - Chrome Dino-style mini-game with sprites and sound effects
- **Ask Anees-AI Chat** - RAG-powered chatbot trained on your career documents
- **Responsive Design** - Mobile, tablet, and desktop optimized layouts
- **Confetti Celebrations** - Particle effects and animations
- **Custom Fonts & Theming** - Visual Sans VF and Impact fonts
- **Service Worker Ready** - Progressive Web App support

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Animations**: GSAP 3.13.0 + ScrollTrigger, Lenis smooth scroll
- **Audio**: Web Audio API for game sound effects
- **Deployment**: Netlify (with serverless functions for AI chat)
- **Tools**: Git, GitHub Pages/custom hosting

## 📋 Prerequisites

- Node.js 14+ (for local dev server, optional)
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)

## 🏃 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Anees040/my-portfolio.git
cd my-portfolio
```

### 2. Run Locally

**Option A: Simple HTTP Server (Recommended)**

Using Python 3:
```bash
python -m http.server 8000
```

Using Python 2:
```bash
python -m SimpleHTTPServer 8000
```

Using Node.js (with `http-server`):
```bash
npx http-server -p 8000
```

Using PHP:
```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

**Option B: Live Server in VS Code**

1. Install the "Live Server" extension by Ritwick Dey
2. Right-click on `index.html` → "Open with Live Server"

### 3. View Your Site

The portfolio will open at `http://localhost:8000` with full animations, interactive elements, and game functionality.

## 📝 Customization

### Update Personal Information

1. **Open `index.html`** and replace:
   - Your name (currently "Muhammad Anees")
   - Job title (currently "Flutter Developer")
   - Bio and about section
   - Experience details and company names
   - Social media links
   - Email and contact info

2. **Update Images**:
   - Replace headshot images in `/images/` folder
   - Update character illustrations for animations
   - Modify social media icons if needed

3. **Modify Styling**:
   - Edit colors and fonts in `styles.css`
   - Adjust animations and timing
   - Customize layout for your brand

### Configure Netlify Functions (AI Chat)

The `Ask Anees-AI` chat feature requires:
1. A `.netlify/functions/anees-ai.js` serverless function
2. Your career docs/embeddings uploaded to a vector database
3. API keys configured in Netlify environment variables

For local testing, the chat will show placeholder responses.

## 📦 Project Structure

```
├── index.html                    # Main portfolio page
├── styles.css                    # All styling (3200+ lines)
├── main.js                       # Core animations & interactions (2300+ lines)
├── elliottprogrammer-level-up-game.js  # Platformer game
├── starfield.js                  # Background starfield effect
├── image-atomizer.js             # Image particle effects
├── confettea.js                  # Confetti celebrations
├── t-writer.js                   # Typewriter text animation
├── utils.js                      # Helper utilities
├── audio/                        # Game sound effects
├── images/                       # All portfolio images & assets
├── fonts/                        # Custom fonts (WFVF, Impact)
├── celebration-sprite/           # Sprite assets for animations
├── package.json                  # Project dependencies
├── netlify.toml                  # Netlify deployment config
└── service-worker.js             # PWA service worker
```

## 🎮 Features Explained

### Interactive Illustrations
- **About Me Section**: Character blinks, types on keyboard, waves
- **Bug-Finding Puzzle**: Interactive illustration to click through sections
- **Light Switch**: Toggleable light effect on desk lamp

### Experience Timeline
- Horizontal scroll showcase of work history
- Company profiles with tech stacks
- Animated transitions between companies

### Level-Up Game
- Browser-based platformer (Chrome Dino-style)
- Collect items, avoid obstacles
- Sound effects and sprite animations
- High score tracking

### Anees-AI Chatbot
- RAG (Retrieval-Augmented Generation) chatbot
- Trained on your resume, project docs, career data
- Streaming responses with typing animation
- Fallback to static responses if training data unavailable

## 🚀 Deployment

### Deploy to GitHub Pages

```bash
# Push to main branch
git add .
git commit -m "Update portfolio"
git push origin main

# In GitHub repo settings, enable GitHub Pages from main branch
```

### Deploy to Netlify

```bash
# Option 1: Connect GitHub repo to Netlify dashboard
# and enable automatic deployments

# Option 2: Deploy via CLI
npm install -g netlify-cli
netlify deploy
```

### Custom Domain

1. Update DNS records to point to your hosting
2. Configure SSL certificate (automatic with Netlify)
3. Update social meta tags in `index.html`

## 🎨 Animation Libraries & Techniques

- **GSAP ScrollTrigger** - Scroll-based animations and parallax
- **Lenis** - Smooth scrolling physics
- **Canvas API** - Custom starfield and particle effects
- **CSS Animations** - Keyframes for lightweight effects
- **RequestAnimationFrame** - Smooth 60fps interactions

## 🔧 Development Tips

### Debug Mode

Open browser DevTools (F12) to:
- Inspect animations and GSAP timeline
- Monitor performance (animations panel)
- Test responsive layouts (device emulation)
- Profile JavaScript execution

### Disable Animations for Testing

Comment out animation imports in `main.js` to quickly test layout changes.

### Modify Game Difficulty

Edit `elliottprogrammer-level-up-game.js`:
- Adjust enemy spawn rate
- Change jump height/fall speed
- Modify score multipliers

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

This project is based on [elliottprogrammer.com](https://github.com/elliottprogrammer/elliottprogrammer.com) with customizations. Check the original repo for license details.

## 🙋 Questions?

- Check the original [elliottprogrammer.com repo](https://github.com/elliottprogrammer/elliottprogrammer.com) for deep dives into specific features
- Create an issue in this repo for customization help
- Refer to [GSAP docs](https://gsap.com/docs/) for animation modifications

---

**Ready to customize?** Start by editing `index.html` with your information and images, then run locally to see changes in real-time!
