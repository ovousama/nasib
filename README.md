# Naseeb

**Naseeb** (نصیب) — an Islamic matrimonial platform built to help Muslims find their life partner in a halal, purposeful, and dignified way.

## About

Naseeb is a faith-first matrimonial platform designed for Muslims who are serious about marriage. The name "Naseeb" means destiny or fate in Arabic/Urdu, reflecting the belief that a spouse is written for you by Allah.

The platform prioritizes:
- **Islamic values** — built around the principles of nikah and modesty
- **Serious intent** — profiles and features designed for those ready for marriage
- **Privacy & dignity** — controlled visibility and guardian (wali) involvement options
- **AI-assisted matching** — intelligent compatibility suggestions grounded in deen, character, and life goals

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **AI**: Anthropic Claude (for matching and profile guidance)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Fill in your credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
nasib/
├── app/          # Next.js App Router pages and layouts
├── components/   # Reusable UI components
├── lib/          # Supabase client, Anthropic client, utilities
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

## License

Private — all rights reserved.
