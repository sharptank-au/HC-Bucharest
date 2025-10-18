POC + project structure tailored for Cursor that you can paste in and run. It’s a minimal, working scaffold for your Sora Prompt Library using Next.js (App Router) + Convex (DB + auth + server) with Snackprompt-style cards, search, filters, copy counts, votes, and autoplay video previews.

Project structure

├─ app/
│  ├─ api/
│  │  └─ iphash/route.ts                # server route to hash client IP for rate-limiting
│  ├─ p/[slug]/page.tsx                 # prompt detail page
│  ├─ layout.tsx
│  ├─ page.tsx                          # home: search + filter + grid
│  ├─ providers.tsx
│  └─ globals.css
├─ components/
│  ├─ PromptCard.tsx
│  ├─ SearchBar.tsx
│  ├─ FilterSidebar.tsx
│  └─ VideoAuto.tsx
├─ convex/
│  ├─ schema.ts                         # collections & indexes
│  ├─ prompts.ts                        # list/search/create/get
│  ├─ votes.ts                          # toggle upvote
│  ├─ events.ts                         # copy/view logging + counters
│  ├─ users.ts                          # ensure user profile row
│  └─ _generated/                       # created by `npx convex dev`
├─ lib/
│  ├─ slug.ts
│  └─ types.ts
├─ public/
│  └─ placeholder.jpg
├─ .env.local.example
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ README.md