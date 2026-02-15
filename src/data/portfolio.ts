export const PORTFOLIO_DATA = {
  personal: {
    name: "Muhammad Anees",
    title: "Flutter Developer",
    bio: "Building high-performance, cross-platform mobile applications. Expert in Flutter, Dart, and Firebase.",
    longBio: [
      "Hey there! I'm Muhammad Anees 👋",
      "I'm a Flutter Developer with a deep passion for crafting beautiful, high-performance mobile applications. I speak fluent Dart, dream in widgets, and have a strong love for clean architecture and pixel-perfect UIs.",
      "I first started programming during my university years, and since then I've been hooked on building things that people love to use. From weather apps to e-commerce platforms, I've shipped cross-platform apps serving thousands of users.",
      "I believe great apps are built by curious people with passion and determination — people who care about quality, about users, and about the craft. If that sounds like you too, let's connect!",
    ],
    email: "aneesashfaq040@gmail.com",
    social: {
      github: "https://github.com/Anees040",
      linkedin: "https://linkedin.com/in/muhammad-anees",
    },
  },
  skills: {
    title: "What Sets Me Apart",
    subtitle:
      "Sure, plenty of developers can write good code... but I bring something extra to the table.",
    items: [
      {
        icon: "🔍",
        title: "The Eagle Eye Advantage",
        description:
          "I have an almost uncanny ability to catch the little things others miss. The one-pixel misalignment in a UI, the subtle performance bottleneck lurking in a widget tree, or the state management bug hiding in plain sight.",
      },
      {
        icon: "🛡️",
        title: "Architecture-First Thinking",
        description:
          "I don't just think about what works now — I think about what might break later. That means clean separation of concerns, scalable state management with Riverpod/BLoC, and components that won't turn into spaghetti.",
      },
      {
        icon: "⚡",
        title: "Performance Obsessed",
        description:
          "I obsess over frame rates, widget rebuild counts, and app startup times. Every millisecond matters when you're aiming for that buttery-smooth 60fps experience on every device.",
      },
      {
        icon: "🎨",
        title: "Pixel-Perfect UI Craftsmanship",
        description:
          "From custom animations to complex responsive layouts, I translate designs into flawless cross-platform experiences. Figma to Flutter, every single time.",
      },
    ],
  },
  experience: [
    {
      company: "TechSolutions (Pvt) Ltd",
      role: "Flutter Developer",
      period: "Jan 2024 – Present",
      description:
        "Led development of 3 cross-platform apps serving 10K+ users. Implemented Riverpod state management and CI/CD pipelines.",
      tech: [
        "Flutter",
        "Dart",
        "Riverpod",
        "Firebase",
        "REST APIs",
        "CI/CD",
      ],
      color: "#4FC3F7",
    },
    {
      company: "Digital Innovations",
      role: "Mobile Developer",
      period: "Jun 2022 – Dec 2023",
      description:
        "Built 5+ Flutter applications from scratch. Improved app performance by 40% through widget optimization and lazy loading.",
      tech: ["Flutter", "Dart", "GetX", "SQLite", "Google Maps API", "Stripe"],
      color: "#81C784",
    },
  ],
  projects: [
    {
      title: "Flutter Weather App",
      description:
        "A beautiful weather application with location-based forecasts, animated weather widgets, and a 7-day forecast view. Features smooth page transitions and dynamic theming based on weather conditions.",
      tech: ["Flutter", "OpenWeather API", "Riverpod", "Lottie"],
      link: "https://github.com/Anees040/flutter-weather-app",
      gradient: ["#667eea", "#764ba2"],
    },
    {
      title: "TaskFlow Manager",
      description:
        "An offline-first task management app with real-time team collaboration, push notifications, and a Kanban board interface. Syncs seamlessly when back online.",
      tech: ["Flutter", "Firebase", "GetX", "Hive"],
      link: "https://github.com/Anees040/taskflow-app",
      gradient: ["#f093fb", "#f5576c"],
    },
    {
      title: "E-Commerce App",
      description:
        "A full-featured shopping application with product browsing, cart management, Stripe payment integration, and order tracking. Includes admin dashboard.",
      tech: ["Flutter", "Stripe", "Node.js", "MongoDB"],
      link: "#",
      gradient: ["#4facfe", "#00f2fe"],
    },
  ],
  stats: [
    { label: "Apps Shipped", value: "8+", icon: "📱" },
    { label: "Users Served", value: "10K+", icon: "👥" },
    { label: "GitHub Repos", value: "20+", icon: "📦" },
    { label: "Lines of Dart", value: "50K+", icon: "💻" },
  ],
};
