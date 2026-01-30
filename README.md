# Flowstate ⚡

> AI-powered task management for the distracted mind.

![Flowstate](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- 🎯 **Focus Mode** - One task at a time. No distractions.
- 🧠 **Natural Language Input** - Type "call mom tomorrow !high" and watch the magic.
- 📊 **Smart Prioritization** - Automatically surfaces what matters most.
- 🌙 **Dark Mode** - Easy on the eyes, day or night.
- 📱 **Mobile Responsive** - Works beautifully on any device.
- 🔒 **Privacy First** - Works offline. Your data stays on your device.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Stackked239/flowstate.git

# Install dependencies
cd flowstate
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State:** Zustand (with persistence)
- **Icons:** Lucide React

## Natural Language Tips

Flowstate understands natural language! Try these:

- `Buy groceries tomorrow` → Sets due date to tomorrow
- `Call mom next monday !high` → Monday, high priority
- `Finish report !urgent` → Urgent priority
- `Review code in 3 days` → Due in 3 days

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Stackked239/flowstate)

1. Push to GitHub
2. Import project in Vercel
3. Deploy!

### Environment Variables (Optional)

For cloud sync features (coming soon):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Roadmap

- [x] Core task management
- [x] Focus mode
- [x] Natural language input
- [x] Dark mode
- [ ] Cloud sync with Supabase
- [ ] AI daily planner
- [ ] Recurring tasks
- [ ] Team collaboration
- [ ] Mobile apps (React Native)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2026 Flowstate

---

Built with ❤️ by the Flowstate team
