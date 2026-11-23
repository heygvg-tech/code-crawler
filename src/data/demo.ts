// DEMO MODE: realistic fake AI responses so anyone can try Code Crawler
// without an API key, and contributors can work without paying for API calls.
import type { Crawler, Floor } from "../lib/types";
import type { OutlineFloor, RawFloorDetails, RawReplan, RawReview } from "../lib/validate";
import { BOSS_EVERY } from "../lib/config";

type Topic = {
  tag: string;
  title: string;
  goals: string[];
  prompt: string;
  py: string;
  js: string;
  doneWhen: string[];
};

const TOPICS: Topic[] = [
  {
    tag: "basics",
    title: "Hello, Dungeon: Variables & Printing",
    goals: ["Store values in variables", "Print messages to the screen"],
    prompt: "Create variables for your crawler's name, health (a number) and favorite weapon. Print a dramatic intro that uses all three.",
    py: `# Floor 1: introduce yourself to the dungeon\n# TODO: make a variable called name\n# TODO: make a variable called health (a number)\n# TODO: make a variable called weapon\n\n# TODO: print a sentence that uses all three\n`,
    js: `// Floor 1: introduce yourself to the dungeon\n// TODO: make a variable called name\n// TODO: make a variable called health (a number)\n// TODO: make a variable called weapon\n\n// TODO: console.log a sentence that uses all three\n`,
    doneWhen: ["Has 3 variables: name, health, weapon", "health is a number, not text", "Prints one sentence that uses all three"],
  },
  {
    tag: "strings",
    title: "Strings & Snark: Talking Back",
    goals: ["Combine and format text", "Use string methods like upper/lowercase"],
    prompt: "Write a loot announcer. Given an item name, print it in ALL CAPS with a rarity tag, like: 'YOU FOUND: RUSTY SPOON [COMMON]'.",
    py: `item = "rusty spoon"\nrarity = "common"\n\n# TODO: print "YOU FOUND: RUSTY SPOON [COMMON]" using item and rarity\n# Hint: strings have an .upper() method\n`,
    js: `const item = "rusty spoon";\nconst rarity = "common";\n\n// TODO: log "YOU FOUND: RUSTY SPOON [COMMON]" using item and rarity\n// Hint: strings have a .toUpperCase() method\n`,
    doneWhen: ["Uses the item and rarity variables (no retyping the words)", "Output is in all caps", "Rarity appears in square brackets"],
  },
  {
    tag: "conditionals",
    title: "Making Decisions: Fight or Flee",
    goals: ["Use if / else if / else", "Compare numbers"],
    prompt: "Given your health and a monster's power, print 'FIGHT' if your health is at least double its power, 'DODGE' if it's at least equal, and 'RUN' otherwise.",
    py: `health = 40\nmonster_power = 25\n\n# TODO: decide FIGHT, DODGE or RUN and print it\n`,
    js: `const health = 40;\nconst monsterPower = 25;\n\n// TODO: decide FIGHT, DODGE or RUN and log it\n`,
    doneWhen: ["Uses an if / else if / else chain", "Prints exactly one of FIGHT, DODGE or RUN", "Works if you change the numbers"],
  },
  {
    tag: "projects",
    title: "BOSS: The Loot Calculator",
    goals: ["Combine variables, conditionals and math", "Build something that feels like a real tool"],
    prompt: "Build a loot calculator. Start with gold = 0. Add gold for three treasure chests (pick amounts). If total gold is over 100, print 'RICH'; otherwise print how much more you need to reach 100.",
    py: `gold = 0\n\n# TODO: open three chests (add gold each time)\n\n# TODO: if gold > 100 print "RICH"\n# otherwise print how much more is needed\n`,
    js: `let gold = 0;\n\n// TODO: open three chests (add gold each time)\n\n// TODO: if gold > 100 log "RICH"\n// otherwise log how much more is needed\n`,
    doneWhen: ["Gold starts at 0 and increases three times", "Prints RICH when gold > 100", "Otherwise prints the correct amount still needed", "Code has at least one helpful comment"],
  },
  {
    tag: "loops",
    title: "Loops: The Hallway That Never Ends",
    goals: ["Repeat actions with for and while loops", "Avoid infinite loops"],
    prompt: "A hallway has 10 doors. Loop through door numbers 1 to 10 and print 'Door N: TRAP' for even numbers and 'Door N: safe' for odd numbers.",
    py: `# TODO: loop from 1 to 10\n# TODO: print TRAP for even doors, safe for odd doors\n# Hint: n % 2 == 0 means n is even\n`,
    js: `// TODO: loop from 1 to 10\n// TODO: log TRAP for even doors, safe for odd doors\n// Hint: n % 2 === 0 means n is even\n`,
    doneWhen: ["Uses a loop (no copy-pasting 10 lines)", "Covers doors 1 through 10", "Even doors are TRAP, odd doors are safe"],
  },
  {
    tag: "collections",
    title: "Lists: The Inventory Problem",
    goals: ["Store many items in a list/array", "Add, remove and loop over items"],
    prompt: "Make an inventory list with 3 items. Add a 'healing potion', remove one item, then print each remaining item with its position number.",
    py: `inventory = ["torch", "rope", "stale bread"]\n\n# TODO: add "healing potion"\n# TODO: remove one item\n# TODO: print each item with its number (1, 2, 3...)\n`,
    js: `const inventory = ["torch", "rope", "stale bread"];\n\n// TODO: add "healing potion"\n// TODO: remove one item\n// TODO: log each item with its number (1, 2, 3...)\n`,
    doneWhen: ["Adds healing potion to the list", "Removes one item", "Prints every remaining item with a number"],
  },
  {
    tag: "functions",
    title: "Functions: Spells You Can Reuse",
    goals: ["Write functions with parameters", "Return values instead of just printing"],
    prompt: "Write a function damage(power, armor) that returns power minus armor, but never less than 0. Call it three times with different numbers and print the results.",
    py: `def damage(power, armor):\n    # TODO: return power - armor, but never below 0\n    pass\n\n# TODO: call damage three times and print the results\n`,
    js: `function damage(power, armor) {\n  // TODO: return power - armor, but never below 0\n}\n\n// TODO: call damage three times and log the results\n`,
    doneWhen: ["damage takes two parameters", "Uses return (not just print)", "Never returns a negative number", "Called three times with output shown"],
  },
  {
    tag: "projects",
    title: "BOSS: Monster Name Generator",
    goals: ["Combine lists, loops and functions", "Make something fun to show off"],
    prompt: "Write a function that builds monster names by combining a word from a 'prefixes' list and a 'suffixes' list. Print 5 different monster names using a loop.",
    py: `prefixes = ["Grim", "Soggy", "Ultra", "Tiny"]\nsuffixes = ["fang", "goblin", "toaster", "lord"]\n\ndef monster_name(i):\n    # TODO: build a name from the lists using i\n    pass\n\n# TODO: print 5 different names with a loop\n`,
    js: `const prefixes = ["Grim", "Soggy", "Ultra", "Tiny"];\nconst suffixes = ["fang", "goblin", "toaster", "lord"];\n\nfunction monsterName(i) {\n  // TODO: build a name from the lists using i\n}\n\n// TODO: log 5 different names with a loop\n`,
    doneWhen: ["Uses a function that returns a name", "Uses both lists", "Prints 5 names with a loop", "The 5 names aren't all the same"],
  },
  {
    tag: "dicts",
    title: "Dictionaries & Objects: Monster Stat Sheets",
    goals: ["Store labeled data in key/value pairs", "Read and update values by key"],
    prompt: "Create a monster with name, hp and attack stored as key/value pairs. Lower its hp by 15, then print a stat sheet line for each key.",
    py: `monster = {\n    # TODO: name, hp, attack\n}\n\n# TODO: lower hp by 15\n# TODO: print each key and value\n`,
    js: `const monster = {\n  // TODO: name, hp, attack\n};\n\n// TODO: lower hp by 15\n// TODO: log each key and value\n`,
    doneWhen: ["Monster has name, hp and attack", "hp is reduced by 15", "Prints every key with its value"],
  },
  {
    tag: "errors",
    title: "Errors: When the Floor Bites Back",
    goals: ["Read error messages", "Handle errors with try/except or try/catch"],
    prompt: "Write a function that converts a string like '42' to a number. If the text isn't a number, catch the error and print a friendly message instead of crashing. Test it with '42' and 'banana'.",
    py: `def to_number(text):\n    # TODO: try converting with int(text)\n    # TODO: if it fails, print a friendly message and return None\n    pass\n\nprint(to_number("42"))\nprint(to_number("banana"))\n`,
    js: `function toNumber(text) {\n  // TODO: convert text to a number\n  // TODO: if it isn't a number, log a friendly message and return null\n  // Hint: Number("banana") gives NaN instead of an error. Check with Number.isNaN\n}\n\nconsole.log(toNumber("42"));\nconsole.log(toNumber("banana"));\n`,
    doneWhen: ["'42' becomes the number 42", "'banana' doesn't crash the program", "Prints a friendly message for bad input"],
  },
  {
    tag: "classes",
    title: "Classes: Build Your Own Crawler",
    goals: ["Define a class with properties and methods", "Create objects from a class"],
    prompt: "Create a Crawler class with name and hp. Add a take_hit(amount) / takeHit(amount) method that lowers hp (not below 0) and an is_alive / isAlive method. Create two crawlers and test it.",
    py: `class Crawler:\n    def __init__(self, name, hp):\n        # TODO: store name and hp\n        pass\n\n    # TODO: take_hit(self, amount)\n    # TODO: is_alive(self)\n\n# TODO: create two crawlers and test the methods\n`,
    js: `class Crawler {\n  constructor(name, hp) {\n    // TODO: store name and hp\n  }\n\n  // TODO: takeHit(amount)\n  // TODO: isAlive()\n}\n\n// TODO: create two crawlers and test the methods\n`,
    doneWhen: ["Class stores name and hp", "Hit method never drops hp below 0", "Alive method returns true/false", "Two crawlers created and tested"],
  },
  {
    tag: "projects",
    title: "BOSS: Inventory Manager",
    goals: ["Combine classes, lists and functions", "Write code someone else could read"],
    prompt: "Build an Inventory with add, remove and show methods. Removing an item that isn't there should print a sassy message instead of crashing. Demo every method.",
    py: `class Inventory:\n    def __init__(self):\n        self.items = []\n\n    # TODO: add(self, item)\n    # TODO: remove(self, item) with a sassy message if missing\n    # TODO: show(self)\n\n# TODO: demo every method\n`,
    js: `class Inventory {\n  constructor() {\n    this.items = [];\n  }\n\n  // TODO: add(item)\n  // TODO: remove(item) with a sassy message if missing\n  // TODO: show()\n}\n\n// TODO: demo every method\n`,
    doneWhen: ["Has add, remove and show", "Removing a missing item prints a message, no crash", "Every method is demoed", "Names are clear and readable"],
  },
];

const BOSSES = TOPICS.filter((t) => t.tag === "projects");
const REGULAR = TOPICS.filter((t) => t.tag !== "projects");

function topicFor(title: string): Topic {
  const base = title.replace(/ \(Part \d+\)$/, "");
  return TOPICS.find((t) => t.title === base) ?? REGULAR[0];
}

export function demoOutline(floorCount: number): OutlineFloor[] {
  const out: OutlineFloor[] = [];
  let r = 0;
  let b = 0;
  for (let n = 1; n <= floorCount; n++) {
    const isBoss = n % BOSS_EVERY === 0;
    const pool = isBoss ? BOSSES : REGULAR;
    const idx = isBoss ? b++ : r++;
    const t = pool[idx % pool.length];
    const round = Math.floor(idx / pool.length);
    out.push({ title: round > 0 ? `${t.title} (Part ${round + 1})` : t.title, goals: t.goals });
  }
  return out;
}

export function demoFloorDetails(crawler: Crawler, floor: Floor, resourceIds: { id: string; tags: string[] }[]): RawFloorDetails {
  const t = topicFor(floor.title);
  const matching = resourceIds.filter((r) => r.tags.includes(t.tag));
  const picks = (matching.length ? matching : resourceIds).slice(0, 2);
  const practice = resourceIds.find((r) => r.tags.includes("practice"));
  if (practice && !picks.includes(practice)) picks.push(practice);

  const comment = crawler.language === "Python" ? "#" : "//";
  const starter =
    crawler.language === "Python"
      ? t.py
      : crawler.language === "JavaScript"
        ? t.js
        : `${comment} Write your ${crawler.language} solution here.\n${comment} (Review-only language: you'll run this on your own computer.)\n`;

  return {
    lessons: picks.map((r, i) => ({
      title: i === picks.length - 1 && r === practice ? "Bonus practice reps" : `Read: ${t.goals[i % t.goals.length]}`,
      summary:
        r === practice
          ? "Optional. Do one or two easy problems here if you want extra reps."
          : "Skim the parts that match this floor's goals. You don't need to memorize it, just get the idea.",
      resourceId: r.id,
    })),
    exercise: { prompt: t.prompt, starterCode: starter, doneWhen: t.doneWhen },
  };
}

const PASS_LINES = [
  "THE SYSTEM IS... IMPRESSED? Recalibrating sarcasm levels.",
  "Ugh. It works. Fine. Take your loot.",
  "Floor cleared. The audience at home is mildly entertained.",
  "Against all odds and several TODO comments, you did it.",
];
const FAIL_LINES = [
  "The System squints at your code. The code squints back.",
  "Bold strategy: submitting the starter code and hoping. Denied.",
  "Close! Like, 'tripped on the stairs' close. Try again.",
];
const ACHIEVEMENTS = [
  "NEW ACHIEVEMENT! It Runs On My Machine: You wrote code that does the thing. Write it on your fridge.",
  "NEW ACHIEVEMENT! Tiny Wizard: You bent the computer to your will. Mostly.",
  "NEW ACHIEVEMENT! Debugged and Dangerous: The bugs fear you now. Some of them.",
  "NEW ACHIEVEMENT! Stairwell Located: You may proceed downward. Downward is progress here.",
];
const LOOT = [
  { kind: "tip" as const, content: "Read error messages from the BOTTOM up. The last line usually says what actually broke." },
  { kind: "challenge" as const, content: "Stretch challenge: rewrite your solution in fewer lines without making it harder to read." },
  { kind: "tip" as const, content: "Name variables like you're leaving notes for a tired future you. 'monster_hp' beats 'x'." },
  { kind: "challenge" as const, content: "Stretch challenge: make your program handle one weird input you didn't plan for." },
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// The demo "reviewer" uses simple checks so the flow feels real.
export function demoReview(code: string, starter: string): RawReview {
  const strip = (s: string) =>
    s
      .split("\n")
      .filter((l) => !/^\s*(#|\/\/)/.test(l))
      .join("\n")
      .replace(/\s+/g, "");
  const written = strip(code).length - strip(starter).length;
  const stillTodo = /TODO/.test(code) && written < 40;
  const tooShort = written < 25;

  if (tooShort || stillTodo) {
    return {
      verdict: "needs-revision",
      systemMessage: pick(FAIL_LINES),
      achievement: null,
      works: written > 0 ? ["You started, and starting is the hardest floor."] : [],
      problems: [
        { severity: "high", note: "Most of the TODOs aren't done yet. Work through them one at a time, top to bottom." },
        { severity: "low", note: "Run your code after each small change so you catch problems early." },
      ],
      studyNext: ["Re-read this floor's first lesson"],
      loot: null,
    };
  }
  return {
    verdict: "pass",
    systemMessage: pick(PASS_LINES),
    achievement: pick(ACHIEVEMENTS),
    works: ["Your code covers the exercise's main steps.", "You replaced the TODOs with real code."],
    problems: [{ severity: "low", note: "Demo mode can't truly read code. Add an API key in Settings for a real review." }],
    studyNext: ["Try explaining your solution out loud, line by line"],
    loot: pick(LOOT),
  };
}

export function demoReplan(remaining: Floor[]): RawReplan {
  return {
    systemMessage: "The dungeon has been... rearranged. Same floors, saner pace. You're welcome.",
    floors: remaining.map((f) => ({ title: f.title, goals: f.goals })),
  };
}
