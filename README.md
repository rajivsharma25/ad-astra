# Ad Astra — AI Workspace

Ad Astra is a portfolio AI workspace with a marketing site, responsive app shell, dashboard, conversations, documents, prompt library, search, and light/dark/system themes. Authentication, chat streaming, and conversation persistence support Supabase and Vercel AI Gateway; demo mode remains available without credentials.

## Stack

- Next.js 16 App Router and React 19
- TypeScript with strict mode
- Tailwind CSS 4
- Supabase SSR and Supabase JS for authentication and per-user conversation data
- AI SDK for streamed chat responses through AI Gateway
- Lucide React icons

## Local setup

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Backend setup

1. Copy `.env.example` to `.env.local` and add your Supabase project URL and publishable key.
2. For a new Supabase project, run `supabase/schema.sql` in the SQL editor. If you already applied the earlier Phase 5 schema, run `supabase/phase6-migration.sql` to upgrade its keys and document metadata columns.
3. Configure Google OAuth in Supabase if you want Google sign-in.
4. Add `AI_GATEWAY_API_KEY` and an `AI_MODEL` supported by AI Gateway to enable live responses. Optionally set `AI_MODEL_THOUGHTFUL` for the Thoughtful composer model. Keep all model/provider credentials server-side.

Without Supabase, auth uses a browser-only demo session and chat falls back to sample replies. With Supabase configured, login/signup, recovery, OAuth callback, and per-user conversation, message, document-metadata, and prompt sync are enabled. Without AI Gateway credentials, the chat endpoint returns sample replies. File selection adds a local listing only: files are not uploaded, previewed, or processed, and chat attachments do not expose file contents to the model. Usage analytics and notification delivery are illustrative/local-only.

## Commands

```bash
npm run dev        # local development
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run build      # production build
npm run start      # serve production build
```

## Routes

- `/` — marketing landing page
- `/login`, `/signup`, `/forgot-password`, `/reset-password` — authentication and account recovery
- `/app` — workspace dashboard
- `/app/chat`, `/app/chat/[conversationId]` — new and saved conversations
- `/app/documents`, `/app/documents/[documentId]` — document library and detail views
- `/app/prompts`, `/app/prompts/[promptId]` — prompt library and details
- `/app/search` — workspace search
- `/app/analytics` — sample usage analytics
- `/app/settings`, `/app/settings/account`, `/app/settings/appearance`, `/app/settings/ai`, `/app/settings/notifications` — workspace preferences

## Deployment preparation

Deploy as a standard Next.js App Router application (for example, on Vercel). Set the Supabase public URL/key and server-side AI Gateway key/model in the hosting environment, then add the deployed `/auth/callback` URL to Supabase’s allowed redirect URLs. Keep demo mode available for previews that do not have backend credentials. The app emits baseline frame, content-type, referrer, and permissions headers. Before release, run `npm run typecheck`, `npm run lint`, and `npm run build`, then verify login/OAuth redirects and an authenticated streamed chat against the configured services.

## Styling

Component styling uses Tailwind CSS 4 utilities in the markup. Standalone CSS is reserved for theme tokens, custom scrollbar rendering, and bespoke illustration treatments.
# ad-astra
