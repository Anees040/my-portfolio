# 🌟 Interactive Developer Portfolio

A modern, interactive portfolio website featuring scroll-driven animations, particle effects, sprite-based character animations, and an AI-powered chat assistant. Built with vanilla JavaScript and deployed on Netlify.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)


## ✨ Features

### Interactive Animations
- **Parallax Starfield Background** - Dynamic starfield with mouse-following effect
- **Image Atomizer Effect** - Click-to-initialize particle animation that forms the profile image
- **Sprite-Based Character** - Animated character with idle, walk, jump, and celebration cycles
- **Level-Up Mini-Game** - Interactive pixel-art game with sound effects and confetti
- **Scroll-Triggered Sections** - Smooth transitions using GSAP ScrollTrigger

### AI-Powered Features
- **Elliott AI Chat Assistant** - Conversational AI powered by vector store document embeddings
- **Real-time Responses** - Instant answers about experience, projects, and skills

### Data Visualization
- **GitHub Contribution Graph** - Live visualization of coding activity
- **Serverless Functions** - Netlify functions for contribution data fetching
- **Cron Scheduling** - Automated daily updates of GitHub stats

### Responsive Design
- **Multi-Device Support** - Optimized layouts for desktop, tablet, and mobile
- **Touch & Swipe Gestures** - Enhanced mobile experience
- **Service Worker** - Offline capability and asset caching

## 🛠️ Tech Stack

### Frontend
- **Vanilla JavaScript** - ES6+ modules
- **GSAP & ScrollTrigger** - Advanced animation library
- **Canvas API** - Custom particle effects and animations
- **CSS3** - Modern styling with custom properties

### Backend & Deployment
- **Netlify** - Hosting and serverless functions
- **Netlify Functions** - Serverless API endpoints
- **Netlify Blobs** - Data storage
- **Deno** - Runtime for edge functions

### AI & Data
- **OpenAI API** - GPT-powered chat assistant
- **LangChain** - AI orchestration framework
- **Supabase** - Vector database for embeddings
- **TikToken** - Token counting and management

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Netlify CLI (for local development)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anees040/my-portfolio.git
   cd my-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   GITHUB_TOKEN=your_github_token
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   
   Or using npx:
   ```bash
   npx netlify dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:8888](http://localhost:8888)

## 🎮 How to Use

### Interactive Features

1. **Image Atomizer**: Click on the loading spinner to trigger the particle animation
2. **Level-Up Game**: Click the platform buttons (1-5) in sequence to make the character jump
3. **AI Chat**: Ask questions about skills, experience, or projects
4. **Scroll Animations**: Scroll through sections to see smooth transitions

### Controls

- **Start Button**: Begin the game loop
- **Stop Button**: Pause animations
- **Reset Button**: Return character to starting position
- **Platform Buttons**: Trigger character jumps (must click in order)

## 📁 Project Structure

```
my-portfolio/
├── audio/                      # Sound effects
├── celebration-sprite/         # Celebration animation sprites
├── elliott-ai/                 # AI chat configuration
│   ├── documents/             # Vector store documents
│   ├── chunk-files.mjs        # Document chunking
│   └── query-vector-store.mjs # Vector search
├── functions/                  # Netlify serverless functions
│   ├── elliott-ai.js          # AI chat endpoint
│   ├── git-contributions.js   # GitHub stats API
│   └── update-git-contributions-cron.js
├── git-contrib-images/         # GitHub contribution graphs
├── git-contribution-data/      # JSON data files
├── idle-sprite/                # Idle animation sprites
├── images/                     # Static assets
├── jump-sprite/                # Jump animation sprites
├── walk-sprite/                # Walk animation sprites
├── atomizer-worker.js          # Web Worker for particles
├── confettea.js                # Confetti animation
├── elliottprogrammer-level-up-game.js  # Game logic
├── image-atomizer.js           # Particle effect engine
├── image-frame-cycler.js       # Animation frame handler
├── main.js                     # Main application logic
├── service-worker.js           # PWA service worker
├── starfield.js                # Starfield background
├── styles.css                  # Main stylesheet
├── t-writer.js                 # Typewriter effect
├── utils.js                    # Utility functions
├── index.html                  # Entry point
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🎨 Features Deep Dive

### Sprite Animation System
The portfolio features a custom sprite animation system with multiple animation states:
- **Idle**: Default looping animation
- **Walk**: Transitional movement
- **Jump**: Platform jumping with physics
- **Celebration**: Victory animation with sound

### Image Atomizer
A custom particle system that:
- Converts images to particles
- Supports click-to-initialize
- Includes mouse interaction
- Optimized with Web Workers
- Responsive scaling

### AI Chat Assistant
- Context-aware responses
- Document embedding search
- Streaming responses
- Conversation history
- Professional context

## 🚀 Deployment

### Netlify Deployment

1. **Connect Repository**
   - Link your GitHub repository to Netlify
   - Configure build settings

2. **Build Settings**
   - Build command: (none - static site)
   - Publish directory: `.` (root)

3. **Environment Variables**
   - Add all required environment variables in Netlify dashboard

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Custom Domain
Configure your custom domain in Netlify DNS settings.

## 🔧 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
The site is production-ready as-is. Netlify handles the deployment.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is **UNLICENSED** - All rights reserved.

## 👤 Author

**Muhammad Anees**
- Email: sp23-bse-030@isbstudent.comsats.edu.pk
- GitHub: [@Anees040](https://github.com/Anees040)

## 🙏 Acknowledgments

- Original design inspiration from [elliottprogrammer.com](https://elliottprogrammer.com)
- GSAP for amazing animation capabilities
- Netlify for seamless deployment
- OpenAI for AI capabilities

## 📊 Features Checklist

- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Interactive animations
- ✅ Sprite-based character
- ✅ Level-up mini-game
- ✅ AI-powered chat
- ✅ GitHub integration
- ✅ Service worker (PWA)
- ✅ Serverless functions
- ✅ Automated cron jobs

## 🐛 Known Issues

- Large sprite files (70MB+) may take time to load on slow connections
- First-time Netlify dev server installation can be slow
- Mobile touch events may need additional testing

## 🔮 Future Enhancements

- [ ] Add more animation states
- [ ] Implement analytics
- [ ] Add blog section
- [ ] Enhance AI responses
- [ ] Add unit tests
- [ ] Performance optimizations

---

Made with ❤️ using vanilla JavaScript and modern web technologies