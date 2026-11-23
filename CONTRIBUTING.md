# Contributing to Code Crawler

You want to help? Look at you, being a good citizen of the dungeon.

## Get it running

```bash
npm install
npm run dev
```

Open the link it prints. No API key needed: demo mode fakes the AI so you can work for free.

## Where things live

| Folder | What's in it |
| --- | --- |
| `prompts/` | Every AI prompt. Improve these and the whole game gets smarter. |
| `src/data/resources.json` | The curated lesson links. The AI can only pick from this list. |
| `src/data/demo.ts` | Fake AI responses for demo mode. |
| `src/lib/` | Game rules, AI calls, the code runner, save files. |
| `src/pages/` and `src/components/` | Everything you see. |

## Good first issues

- **Add OpenAI support** in `src/lib/ai.ts` (keep Anthropic as the default)
- **Add a language**: put resources in `resources.json`, add syntax highlighting in `CodeEditor.tsx`
- **More demo content**: new topics and boss fights in `demo.ts`
- **New achievements, level titles and sassy lines** in `game.ts` and `demo.ts`
- **Sound effects** for loot boxes (with a mute button, we're not monsters)

## House rules

1. Keep code readable. Beginners read this repo.
2. Never commit API keys. Ever.
3. Keep it original: no characters, names or quotes from existing books, games or shows.
4. Be kind in reviews. Roast the code, never the person.
