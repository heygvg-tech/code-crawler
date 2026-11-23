# 🗝️ Code Crawler

**Learn to code like it's a dungeon. Because it kind of is.**

You pick a language and a timeline. The System builds you a dungeon. Every floor is a checkpoint with lessons and a coding challenge. Write code, run it right in your browser, then submit it to an AI reviewer that's half senior engineer, half game-show host with no indoor voice. Pass, and you get loot. Fall behind, and the floor starts collapsing (politely).

### ▶️ [PLAY IT NOW](https://heygvg-tech.github.io/code-crawler/)

No download. No account. No excuses.

---

## What's in the dungeon

- 🗺️ **A custom map.** Pick Python, JavaScript, Java, C#, Go or Rust, plus how many weeks and hours you've got. Floors get due dates.
- 🐸 **The Safe Room.** Pip, the keeper, tells you exactly what to do today. No staring at a blank screen wondering where to start.
- ⌨️ **A real code editor.** Python and JavaScript run right in the browser. Infinite loop? We kill it after 8 seconds. You're welcome.
- 🧙 **AI code reviews.** What works, what's broken (ranked), what to study next. Hints, not answers. You're here to learn, not copy.
- 🎁 **Loot boxes, XP, levels, streaks.** Plus a boss floor every 4th floor. Streaks forgive 2 missed days a week, because life.
- ⚠️ **Floor collapse.** Fall behind and you get two choices: push your deadlines back, or let the System re-plan the rest so you still finish on time. Zero guilt trips.
- 📜 **Save Scrolls.** Download your progress as a file. Load it on another computer.

---

## 🧒 How to play (the 3-step version)

1. **Click the [PLAY IT NOW](https://heygvg-tech.github.io/code-crawler/) link.**
2. **Answer the questions.** Name, language, goal, timeline. Can't pick a language? Hit "Help me choose." We won't judge. Out loud.
3. **Click ENTER THE DUNGEON.** Then do whatever the frog says.

That's it. You're playing in **demo mode**, where everything works but the AI reviewer is a pretend one. Want the real, extra-sassy one? Keep reading.

## 🔑 Turn on the real AI (optional, but way better)

The real reviewer actually reads your code. It needs an API key. An API key is like a library card for the AI.

1. Go to **[console.anthropic.com](https://console.anthropic.com)** and make an account.
2. Add a little money to your account. A few dollars lasts a long time. Reviews usually cost a few cents or less.
3. **Set a monthly spending limit** while you're in there. Future you says thanks.
4. Find **API Keys**, click **Create Key**, and copy it. It starts with `sk-ant-`.
5. In Code Crawler, click **Settings**, paste the key and hit **Save**.

**Where does my key go?** It stays in *your* browser and only ever goes to Anthropic. It's never on GitHub, never in your Save Scroll, never anywhere else. Don't paste it in a group chat either. We've all seen things.

---

## 🏰 Put your own copy on GitHub

So you want your own dungeon with your name on it. Bold. Pick one path.

### Path A: The Clicky Way (no typing commands)

1. **Get GitHub Desktop.** Download it from [desktop.github.com](https://desktop.github.com) and sign in. No GitHub account? Make one at [github.com](https://github.com). It's free.
2. **Download this repo:** click the green **Code** button up top → **Download ZIP**. Unzip it somewhere you'll find it again. Not your Downloads abyss.
3. In GitHub Desktop, click **File → Add Local Repository** and pick the `code-crawler` folder.
4. It'll say "this isn't a Git repository." Click **create a repository**, then **Create Repository**. Don't touch the other options.
5. Click **Publish repository**. **UNCHECK "Keep this code private."** The free live website only works on public repos. Click **Publish**.
6. On [github.com](https://github.com), open your new repo. Click **Settings → Pages**. Under **Source**, pick **GitHub Actions**.
7. Click the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow** → the green **Run workflow** button.
8. Wait about 2 minutes. Go get a snack. When the dot turns green ✅, your game is live at `https://YOUR-USERNAME.github.io/code-crawler/`.
9. **Fix the link in this README:** click `README.md` on GitHub, click the ✏️ pencil, swap `heygvg-tech` for your actual username, and click **Commit changes**.

### Path B: The Magic Spell (for people who aren't scared of Terminal)

You need the GitHub CLI first. On a Mac with [Homebrew](https://brew.sh): `brew install gh`. Everyone else: [cli.github.com](https://cli.github.com).

1. Open **Terminal**. (Mac: press ⌘ + Space, type `Terminal`, hit Enter.)
2. Type `cd ` (with a space after it), **drag the code-crawler folder into the Terminal window**, and press Enter. Yes, dragging works. Magic.
3. Type this and press Enter:
   ```bash
   bash publish.sh
   ```
4. If it asks you to log in, pick **GitHub.com → HTTPS → Login with a web browser** and follow along.
5. The spell creates your repo, uploads everything, turns on the website, fixes the README link and tells you your live link. In about 2 minutes, you're famous.

**Anytime you change something later:** in GitHub Desktop, write a summary, click **Commit**, then **Push**. The website updates itself. Automatically. Like a grown-up.

---

## 💻 Run it on your own computer (for tinkerers)

You need [Node.js](https://nodejs.org) (download the **LTS** version, click Next a bunch of times).

```bash
npm install     # downloads the stuff it needs. Takes a minute. Be patient.
npm run dev     # starts the game. Open the link it prints.
```

To stop it, click the Terminal and press **Ctrl + C**.

---

## 🧭 How it's built

Vite + React + TypeScript. No server, no database, no accounts. Everything runs in your browser.

| Thing | Where |
| --- | --- |
| AI prompts (make the System smarter) | `prompts/` |
| Lesson links the AI is allowed to use | `src/data/resources.json` |
| Fake AI for demo mode | `src/data/demo.ts` |
| XP, levels, streaks, deadlines | `src/lib/game.ts` |
| Talking to the AI | `src/lib/ai.ts` |
| Running Python and JavaScript | `src/lib/runner.ts` |
| The model it uses (change it here) | `src/lib/config.ts` |

The AI can only link to lessons from a hand-picked list, so you never get sent to a page that doesn't exist. Every AI answer is checked before it's saved, and if it comes back garbled, the app asks again once.

## 🤝 Help make it better

Read [CONTRIBUTING.md](CONTRIBUTING.md). Good first quests: add OpenAI support, add a new language, write more sassy achievements.

## 📜 The fine print

MIT licensed. Use it, fork it, remix it. Inspired by dungeon-crawler LitRPG books. Every character, line and joke in here is original.

Built by [Genevieve Garcia](https://www.linkedin.com/in/gvgarcia).
