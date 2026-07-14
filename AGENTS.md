# Fund Emotion Agent Web

## Product Positioning

Fund Emotion Agent Web is a fund-investment emotion management agent. It does not predict markets, recommend funds, or provide buy/sell advice. Its purpose is to help users record, identify, and manage investment emotions and behavioral biases.

## Technology Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui Base / Nova
- Supabase Auth and Database
- Vercel AI SDK
- DeepSeek
- Recharts

## Architecture

1. `src/app` is only for routes and page composition. Do not place business logic there.
2. Place business code in `src/features/<feature>`.
3. A feature may contain:
   - `components`
   - `hooks`
   - `services`
   - `types.ts`
   - `constants.ts`
4. Shared shadcn components belong only in `src/components/ui`.
5. Supabase clients, AI clients, and shared utilities belong in `src/lib`.
6. Never expose server secrets to the client.
7. Environment-variable files must not be committed.
8. Do not perform broad refactors of unrelated files.

## Development Rules

1. After every task, run:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
2. Do not use `any` unless there is a clear comment explaining why it is necessary.
3. All Chinese copy must be saved as UTF-8. Never replace Chinese copy with question marks or Unicode escape strings.
4. Preserve the existing behavior of `EmotionSelector`, `EmotionScore`, and `EmotionRecordForm`.
5. Keep the UI minimal, spacious, and mobile-first. Use Apple Health and Day One as references for information hierarchy and calm interaction patterns, without copying their brand styling.

## Core Business Fields

- `emotion`
- `emotion_score`
- `anxiety_score`
- `fomo_score`
- `impulse_score`
- `watch_frequency`
- `operation_impulse`
- `note`
