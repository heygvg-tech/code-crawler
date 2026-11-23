// DEMO MODE: realistic fake AI responses so anyone can try Code Crawler
// without an API key, and contributors can work without paying for API calls.
import type { Crawler, Floor } from "../lib/types";
import type { OutlineFloor, RawFloorDetails, RawLesson, RawReplan, RawReview } from "../lib/validate";
import { BOSS_EVERY } from "../lib/config";

// Joins lines of example code. Keeps the examples below easy to read and edit.
const code = (...lines: string[]) => lines.join("\n");

type DemoLesson = { title: string; explain: string; keyPoints: string[]; py: string; js: string };

type Topic = {
  tag: string;
  title: string;
  goals: string[];
  lessons: DemoLesson[];
  prompt: string;
  py: string;
  js: string;
  doneWhen: string[];
  example: { py: string; js: string }; // a SIMILAR problem, solved
};

const BOSS_LESSON: DemoLesson = {
  title: "How to beat a boss floor",
  explain:
    "Boss floors mix everything you've learned so far. The trick is to never write the whole thing at once. Build one tiny piece, run it, check the output, then add the next piece.",
  keyPoints: ["The done-when list is your checklist. Read it first.", "Build one step, run it, then add the next", "Stuck? Revisit the earlier floor that covers that skill"],
  py: code("# Step 1: set up your data", "gold = 0", "# Step 2: change it one piece at a time", "gold = gold + 40", 'print("After chest 1:", gold)', "# Step 3: decide at the end", 'print("RICH" if gold > 100 else "Keep looting")'),
  js: code("// Step 1: set up your data", "let gold = 0;", "// Step 2: change it one piece at a time", "gold = gold + 40;", 'console.log("After chest 1:", gold);', "// Step 3: decide at the end", 'console.log(gold > 100 ? "RICH" : "Keep looting");'),
};

const TOPICS: Topic[] = [
  {
    tag: "basics",
    title: "Hello, Dungeon: Variables & Printing",
    goals: ["Store values in variables", "Print messages to the screen"],
    lessons: [
      {
        title: "Variables are labeled boxes",
        explain:
          "A variable is a name that holds a value, like a labeled box. Put something in once, then use the name anywhere instead of retyping the value. Put something new in and the old value is replaced.",
        keyPoints: [
          "Python: name = value",
          "JavaScript: const name = value (use let if it will change)",
          "Text goes in quotes. Numbers don't.",
          "Name it after what's inside: health, not h",
        ],
        py: code('name = "Grimble"', "health = 42", "print(name)", "print(health + 8)"),
        js: code('const name = "Grimble";', "let health = 42;", "console.log(name);", "console.log(health + 8);"),
      },
      {
        title: "Printing makes the computer talk",
        explain:
          "Printing shows a value on the screen. It's how your program talks to the player, and it's also your best debugging tool: when something seems weird, print it and look.",
        keyPoints: [
          "Python uses print(), JavaScript uses console.log()",
          'Drop variables into text: f"{name}" in Python, `${name}` in JavaScript',
          "Print often while learning. It's free.",
        ],
        py: code('name = "Grimble"', "health = 42", 'print(f"{name} has {health} HP")'),
        js: code('const name = "Grimble";', "const health = 42;", "console.log(`${name} has ${health} HP`);"),
      },
    ],
    prompt: "Create variables for your crawler's name, health (a number) and favorite weapon. Print a dramatic intro that uses all three.",
    py: `# Floor 1: introduce yourself to the dungeon\n# TODO: make a variable called name\n# TODO: make a variable called health (a number)\n# TODO: make a variable called weapon\n\n# TODO: print a sentence that uses all three\n`,
    js: `// Floor 1: introduce yourself to the dungeon\n// TODO: make a variable called name\n// TODO: make a variable called health (a number)\n// TODO: make a variable called weapon\n\n// TODO: console.log a sentence that uses all three\n`,
    doneWhen: ["Has 3 variables: name, health, weapon", "health is a number, not text", "Prints one sentence that uses all three"],
    example: {
      py: code("# Similar problem, solved: introduce a MONSTER", 'monster = "Soggy Goblin"', "damage = 7", 'smell = "old socks"', 'print(f"A wild {monster} appears! It hits for {damage} and smells like {smell}.")'),
      js: code("// Similar problem, solved: introduce a MONSTER", 'const monster = "Soggy Goblin";', "const damage = 7;", 'const smell = "old socks";', "console.log(`A wild ${monster} appears! It hits for ${damage} and smells like ${smell}.`);"),
    },
  },
  {
    tag: "strings",
    title: "Strings & Snark: Talking Back",
    goals: ["Combine and format text", "Use string methods like upper/lowercase"],
    lessons: [
      {
        title: "Strings are text",
        explain:
          "A string is text inside quotes. You can glue strings together, measure how long they are, and change their case. Methods like upper() don't change the original. They hand you back a new string.",
        keyPoints: ["Glue strings with +", "Length: len(s) in Python, s.length in JavaScript", "Upper case: s.upper() in Python, s.toUpperCase() in JavaScript"],
        py: code('item = "rusty spoon"', "print(item.upper())", "print(len(item))", 'print("You found: " + item)'),
        js: code('const item = "rusty spoon";', "console.log(item.toUpperCase());", "console.log(item.length);", 'console.log("You found: " + item);'),
      },
      {
        title: "Formatting messages",
        explain:
          "Building a sentence out of pieces is so common that both languages have a shortcut: put the variables right inside the text. It's much easier to read than gluing pieces with +.",
        keyPoints: ['Python: f"Hi {name}" (note the f)', "JavaScript: `Hi ${name}` (note the backticks)", "You can put expressions inside too, like {price * 2}"],
        py: code('item = "spoon"', 'rarity = "common"', 'print(f"YOU FOUND: {item.upper()} [{rarity}]")'),
        js: code('const item = "spoon";', 'const rarity = "common";', "console.log(`YOU FOUND: ${item.toUpperCase()} [${rarity}]`);"),
      },
    ],
    prompt: "Write a loot announcer. Given an item name, print it in ALL CAPS with a rarity tag, like: 'YOU FOUND: RUSTY SPOON [COMMON]'.",
    py: `item = "rusty spoon"\nrarity = "common"\n\n# TODO: print "YOU FOUND: RUSTY SPOON [COMMON]" using item and rarity\n# Hint: strings have an .upper() method\n`,
    js: `const item = "rusty spoon";\nconst rarity = "common";\n\n// TODO: log "YOU FOUND: RUSTY SPOON [COMMON]" using item and rarity\n// Hint: strings have a .toUpperCase() method\n`,
    doneWhen: ["Uses the item and rarity variables (no retyping the words)", "Output is in all caps", "Rarity appears in square brackets"],
    example: {
      py: code("# Similar problem, solved: whisper a spell in lowercase, school in parentheses", 'spell = "FIREBALL"', 'school = "Evocation"', 'print(f"you cast: {spell.lower()} ({school.lower()})")'),
      js: code("// Similar problem, solved: whisper a spell in lowercase, school in parentheses", 'const spell = "FIREBALL";', 'const school = "Evocation";', "console.log(`you cast: ${spell.toLowerCase()} (${school.toLowerCase()})`);"),
    },
  },
  {
    tag: "conditionals",
    title: "Making Decisions: Fight or Flee",
    goals: ["Use if / else if / else", "Compare numbers"],
    lessons: [
      {
        title: "if / else: making choices",
        explain:
          "An if statement runs code only when something is true. Add else for what happens otherwise, and elif (Python) or else if (JavaScript) to check more options in order. The first true one wins and the rest are skipped.",
        keyPoints: ["Python: if / elif / else, with a colon and indentation", "JavaScript: if / else if / else, with { } braces", "Order matters: check the most specific case first"],
        py: code("health = 15", "if health > 50:", '    print("Feeling great")', "elif health > 10:", '    print("A little scratched")', "else:", '    print("Find a potion!")'),
        js: code(
          "const health = 15;",
          "if (health > 50) {",
          '  console.log("Feeling great");',
          "} else if (health > 10) {",
          '  console.log("A little scratched");',
          "} else {",
          '  console.log("Find a potion!");',
          "}",
        ),
      },
      {
        title: "Comparing things",
        explain:
          "Conditions are built from comparisons that come out true or false. You can combine them with and/or to ask bigger questions, like \"do I have enough gold AND the key?\"",
        keyPoints: ["> < >= <= compare numbers", "Equal: == in Python, === in JavaScript", "Combine: and / or in Python, && / || in JavaScript"],
        py: code("gold = 30", "has_key = True", "print(gold >= 25)", "print(gold >= 25 and has_key)", "print(gold == 100)"),
        js: code("const gold = 30;", "const hasKey = true;", "console.log(gold >= 25);", "console.log(gold >= 25 && hasKey);", "console.log(gold === 100);"),
      },
    ],
    prompt: "Given your health and a monster's power, print 'FIGHT' if your health is at least double its power, 'DODGE' if it's at least equal, and 'RUN' otherwise.",
    py: `health = 40\nmonster_power = 25\n\n# TODO: decide FIGHT, DODGE or RUN and print it\n`,
    js: `const health = 40;\nconst monsterPower = 25;\n\n// TODO: decide FIGHT, DODGE or RUN and log it\n`,
    doneWhen: ["Uses an if / else if / else chain", "Prints exactly one of FIGHT, DODGE or RUN", "Works if you change the numbers"],
    example: {
      py: code("# Similar problem, solved: pick a potion you can afford", "gold = 35", "if gold >= 50:", '    print("BIG POTION")', "elif gold >= 20:", '    print("small potion")', "else:", '    print("tap water")'),
      js: code(
        "// Similar problem, solved: pick a potion you can afford",
        "const gold = 35;",
        "if (gold >= 50) {",
        '  console.log("BIG POTION");',
        "} else if (gold >= 20) {",
        '  console.log("small potion");',
        "} else {",
        '  console.log("tap water");',
        "}",
      ),
    },
  },
  {
    tag: "projects",
    title: "BOSS: The Loot Calculator",
    goals: ["Combine variables, conditionals and math", "Build something that feels like a real tool"],
    lessons: [BOSS_LESSON],
    prompt: "Build a loot calculator. Start with gold = 0. Add gold for three treasure chests (pick amounts). If total gold is over 100, print 'RICH'; otherwise print how much more you need to reach 100.",
    py: `gold = 0\n\n# TODO: open three chests (add gold each time)\n\n# TODO: if gold > 100 print "RICH"\n# otherwise print how much more is needed\n`,
    js: `let gold = 0;\n\n// TODO: open three chests (add gold each time)\n\n// TODO: if gold > 100 log "RICH"\n// otherwise log how much more is needed\n`,
    doneWhen: ["Gold starts at 0 and increases three times", "Prints RICH when gold > 100", "Otherwise prints the correct amount still needed", "Code has at least one helpful comment"],
    example: {
      py: code("# Similar problem, solved: an XP tracker", "xp = 0", "xp = xp + 30  # battle 1", "xp = xp + 25  # battle 2", "xp = xp + 10  # battle 3", "if xp >= 100:", '    print("LEVEL UP")', "else:", '    print(f"{100 - xp} XP to go")'),
      js: code(
        "// Similar problem, solved: an XP tracker",
        "let xp = 0;",
        "xp = xp + 30; // battle 1",
        "xp = xp + 25; // battle 2",
        "xp = xp + 10; // battle 3",
        "if (xp >= 100) {",
        '  console.log("LEVEL UP");',
        "} else {",
        "  console.log(`${100 - xp} XP to go`);",
        "}",
      ),
    },
  },
  {
    tag: "loops",
    title: "Loops: The Hallway That Never Ends",
    goals: ["Repeat actions with for and while loops", "Avoid infinite loops"],
    lessons: [
      {
        title: "for loops: do it N times",
        explain:
          "A loop repeats code so you don't copy and paste it. A for loop is perfect when you know how many times to repeat, like checking 10 doors. A variable counts for you as it goes.",
        keyPoints: ["Python: for n in range(1, 11) gives 1 through 10 (it stops before 11)", "JavaScript: for (let n = 1; n <= 10; n++)", "n % 2 === 0 (or == in Python) means n is even"],
        py: code("for n in range(1, 4):", '    print(f"Opening door {n}")'),
        js: code("for (let n = 1; n <= 3; n++) {", "  console.log(`Opening door ${n}`);", "}"),
      },
      {
        title: "while loops (and the never-ending hallway)",
        explain:
          "A while loop repeats as long as a condition stays true. Something inside the loop must eventually make it false, or it runs forever. Code Crawler stops runaway loops after 8 seconds, but real programs just freeze.",
        keyPoints: ["Use while when you don't know how many repeats you need", "Always change the thing you're checking inside the loop", "Frozen program? You probably made an infinite loop."],
        py: code("torches = 3", "while torches > 0:", '    print(f"{torches} torches left")', "    torches = torches - 1", 'print("Darkness.")'),
        js: code("let torches = 3;", "while (torches > 0) {", "  console.log(`${torches} torches left`);", "  torches = torches - 1;", "}", 'console.log("Darkness.");'),
      },
    ],
    prompt: "A hallway has 10 doors. Loop through door numbers 1 to 10 and print 'Door N: TRAP' for even numbers and 'Door N: safe' for odd numbers.",
    py: `# TODO: loop from 1 to 10\n# TODO: print TRAP for even doors, safe for odd doors\n# Hint: n % 2 == 0 means n is even\n`,
    js: `// TODO: loop from 1 to 10\n// TODO: log TRAP for even doors, safe for odd doors\n// Hint: n % 2 === 0 means n is even\n`,
    doneWhen: ["Uses a loop (no copy-pasting 10 lines)", "Covers doors 1 through 10", "Even doors are TRAP, odd doors are safe"],
    example: {
      py: code("# Similar problem, solved: every 3rd stair creaks", "for step in range(1, 7):", "    if step % 3 == 0:", '        print(f"Step {step}: CREAK")', "    else:", '        print(f"Step {step}: quiet")'),
      js: code(
        "// Similar problem, solved: every 3rd stair creaks",
        "for (let step = 1; step <= 6; step++) {",
        "  if (step % 3 === 0) {",
        "    console.log(`Step ${step}: CREAK`);",
        "  } else {",
        "    console.log(`Step ${step}: quiet`);",
        "  }",
        "}",
      ),
    },
  },
  {
    tag: "collections",
    title: "Lists: The Inventory Problem",
    goals: ["Store many items in a list/array", "Add, remove and loop over items"],
    lessons: [
      {
        title: "Lists hold many things",
        explain:
          "A list (called an array in JavaScript) keeps many values in order. Each item has a position number called an index, and counting starts at 0, not 1. Yes, really.",
        keyPoints: ['Make one with square brackets: ["torch", "rope"]', "Get an item by index: items[0] is the FIRST one", "Count items: len(items) in Python, items.length in JavaScript"],
        py: code('inventory = ["torch", "rope", "bread"]', "print(inventory[0])", "print(len(inventory))"),
        js: code('const inventory = ["torch", "rope", "bread"];', "console.log(inventory[0]);", "console.log(inventory.length);"),
      },
      {
        title: "Adding, removing and looping",
        explain: "Lists can grow and shrink. Add to the end, remove what you don't need, then loop over everything that's left.",
        keyPoints: ["Add: append() in Python, push() in JavaScript", "Remove by value: remove() in Python, splice() with the index in JavaScript", "Loop: for item in items / for (const item of items)"],
        py: code('inventory = ["torch", "rope"]', 'inventory.append("potion")', 'inventory.remove("rope")', "for item in inventory:", "    print(item)"),
        js: code('const inventory = ["torch", "rope"];', 'inventory.push("potion");', 'inventory.splice(inventory.indexOf("rope"), 1);', "for (const item of inventory) {", "  console.log(item);", "}"),
      },
    ],
    prompt: "Make an inventory list with 3 items. Add a 'healing potion', remove one item, then print each remaining item with its position number.",
    py: `inventory = ["torch", "rope", "stale bread"]\n\n# TODO: add "healing potion"\n# TODO: remove one item\n# TODO: print each item with its number (1, 2, 3...)\n`,
    js: `const inventory = ["torch", "rope", "stale bread"];\n\n// TODO: add "healing potion"\n// TODO: remove one item\n// TODO: log each item with its number (1, 2, 3...)\n`,
    doneWhen: ["Adds healing potion to the list", "Removes one item", "Prints every remaining item with a number"],
    example: {
      py: code("# Similar problem, solved: a numbered spell book", 'spells = ["spark", "shield"]', 'spells.append("blink")', 'spells.remove("spark")', "for number, spell in enumerate(spells, start=1):", '    print(f"{number}. {spell}")'),
      js: code(
        "// Similar problem, solved: a numbered spell book",
        'const spells = ["spark", "shield"];',
        'spells.push("blink");',
        'spells.splice(spells.indexOf("spark"), 1);',
        "spells.forEach((spell, i) => {",
        "  console.log(`${i + 1}. ${spell}`);",
        "});",
      ),
    },
  },
  {
    tag: "functions",
    title: "Functions: Spells You Can Reuse",
    goals: ["Write functions with parameters", "Return values instead of just printing"],
    lessons: [
      {
        title: "Functions are reusable spells",
        explain:
          "A function is a named block of code you can run whenever you want. Parameters are the inputs it needs. Write it once, then cast it as many times as you like with different inputs.",
        keyPoints: ["Python: def name(params):", "JavaScript: function name(params) { }", 'Call it with its name and parentheses: greet("Pip")'],
        py: code("def greet(name):", '    print(f"Welcome to the dungeon, {name}")', "", 'greet("Pip")', 'greet("Grimble")'),
        js: code("function greet(name) {", "  console.log(`Welcome to the dungeon, ${name}`);", "}", "", 'greet("Pip");', 'greet("Grimble");'),
      },
      {
        title: "return vs print",
        explain:
          "print shows a value on the screen and that's it. return hands a value back to whoever called the function, so they can save it and use it. Most useful functions return something.",
        keyPoints: ["return ends the function and sends a value back", "Save the result: total = add(2, 3)", "max(0, x) or Math.max(0, x) keeps a number from going negative"],
        py: code("def heal(hp, amount):", "    return min(100, hp + amount)", "", "new_hp = heal(90, 25)", "print(new_hp)"),
        js: code("function heal(hp, amount) {", "  return Math.min(100, hp + amount);", "}", "", "const newHp = heal(90, 25);", "console.log(newHp);"),
      },
    ],
    prompt: "Write a function damage(power, armor) that returns power minus armor, but never less than 0. Call it three times with different numbers and print the results.",
    py: `def damage(power, armor):\n    # TODO: return power - armor, but never below 0\n    pass\n\n# TODO: call damage three times and print the results\n`,
    js: `function damage(power, armor) {\n  // TODO: return power - armor, but never below 0\n}\n\n// TODO: call damage three times and log the results\n`,
    doneWhen: ["damage takes two parameters", "Uses return (not just print)", "Never returns a negative number", "Called three times with output shown"],
    example: {
      py: code("# Similar problem, solved: healing that never goes over 100", "def heal(hp, potion):", "    return min(100, hp + potion)", "", "print(heal(50, 20))", "print(heal(90, 30))", "print(heal(0, 5))"),
      js: code(
        "// Similar problem, solved: healing that never goes over 100",
        "function heal(hp, potion) {",
        "  return Math.min(100, hp + potion);",
        "}",
        "",
        "console.log(heal(50, 20));",
        "console.log(heal(90, 30));",
        "console.log(heal(0, 5));",
      ),
    },
  },
  {
    tag: "projects",
    title: "BOSS: Monster Name Generator",
    goals: ["Combine lists, loops and functions", "Make something fun to show off"],
    lessons: [BOSS_LESSON],
    prompt: "Write a function that builds monster names by combining a word from a 'prefixes' list and a 'suffixes' list. Print 5 different monster names using a loop.",
    py: `prefixes = ["Grim", "Soggy", "Ultra", "Tiny"]\nsuffixes = ["fang", "goblin", "toaster", "lord"]\n\ndef monster_name(i):\n    # TODO: build a name from the lists using i\n    pass\n\n# TODO: print 5 different names with a loop\n`,
    js: `const prefixes = ["Grim", "Soggy", "Ultra", "Tiny"];\nconst suffixes = ["fang", "goblin", "toaster", "lord"];\n\nfunction monsterName(i) {\n  // TODO: build a name from the lists using i\n}\n\n// TODO: log 5 different names with a loop\n`,
    doneWhen: ["Uses a function that returns a name", "Uses both lists", "Prints 5 names with a loop", "The 5 names aren't all the same"],
    example: {
      py: code(
        "# Similar problem, solved: a loot name generator",
        'adjectives = ["Rusty", "Shiny", "Cursed"]',
        'items = ["spoon", "boot", "crown"]',
        "",
        "def loot_name(i):",
        "    # % wraps around so we never run off the end of a list",
        '    return f"{adjectives[i % 3]} {items[(i + 1) % 3]}"',
        "",
        "for i in range(4):",
        "    print(loot_name(i))",
      ),
      js: code(
        "// Similar problem, solved: a loot name generator",
        'const adjectives = ["Rusty", "Shiny", "Cursed"];',
        'const items = ["spoon", "boot", "crown"];',
        "",
        "function lootName(i) {",
        "  // % wraps around so we never run off the end of an array",
        "  return `${adjectives[i % 3]} ${items[(i + 1) % 3]}`;",
        "}",
        "",
        "for (let i = 0; i < 4; i++) {",
        "  console.log(lootName(i));",
        "}",
      ),
    },
  },
  {
    tag: "dicts",
    title: "Dictionaries & Objects: Monster Stat Sheets",
    goals: ["Store labeled data in key/value pairs", "Read and update values by key"],
    lessons: [
      {
        title: "Key/value pairs",
        explain:
          "A dictionary (Python) or object (JavaScript) stores labeled values. Instead of a position number, you look things up by name, like reading a character sheet.",
        keyPoints: ['Make one with curly braces: {"hp": 30}', 'Read a value: monster["hp"] (JavaScript also allows monster.hp)', "Change a value by assigning to its key"],
        py: code('monster = {"name": "Soggy Goblin", "hp": 30}', 'print(monster["name"])', 'monster["hp"] = monster["hp"] - 10', 'print(monster["hp"])'),
        js: code('const monster = { name: "Soggy Goblin", hp: 30 };', "console.log(monster.name);", "monster.hp = monster.hp - 10;", "console.log(monster.hp);"),
      },
      {
        title: "Looping over keys",
        explain: "You can walk through every key and value to print a full stat sheet, without naming each one by hand.",
        keyPoints: ["Python: for key, value in monster.items()", "JavaScript: for (const [key, value] of Object.entries(monster))", "Adding a brand-new key just works"],
        py: code('monster = {"name": "Grim Toaster", "hp": 20}', 'monster["attack"] = 4', "for key, value in monster.items():", '    print(f"{key}: {value}")'),
        js: code('const monster = { name: "Grim Toaster", hp: 20 };', "monster.attack = 4;", "for (const [key, value] of Object.entries(monster)) {", "  console.log(`${key}: ${value}`);", "}"),
      },
    ],
    prompt: "Create a monster with name, hp and attack stored as key/value pairs. Lower its hp by 15, then print a stat sheet line for each key.",
    py: `monster = {\n    # TODO: name, hp, attack\n}\n\n# TODO: lower hp by 15\n# TODO: print each key and value\n`,
    js: `const monster = {\n  // TODO: name, hp, attack\n};\n\n// TODO: lower hp by 15\n// TODO: log each key and value\n`,
    doneWhen: ["Monster has name, hp and attack", "hp is reduced by 15", "Prints every key with its value"],
    example: {
      py: code("# Similar problem, solved: a potion's price tag", 'potion = {"name": "Fizzy Red", "heals": 25, "price": 10}', 'potion["price"] = potion["price"] + 5', "for key, value in potion.items():", '    print(f"{key}: {value}")'),
      js: code(
        "// Similar problem, solved: a potion's price tag",
        'const potion = { name: "Fizzy Red", heals: 25, price: 10 };',
        "potion.price = potion.price + 5;",
        "for (const [key, value] of Object.entries(potion)) {",
        "  console.log(`${key}: ${value}`);",
        "}",
      ),
    },
  },
  {
    tag: "errors",
    title: "Errors: When the Floor Bites Back",
    goals: ["Read error messages", "Handle errors with try/except or try/catch"],
    lessons: [
      {
        title: "Reading error messages",
        explain:
          "Errors aren't insults, they're clues. The message says what went wrong and usually which line. Read the last line first: that's the actual problem. Run this example and read the error on purpose.",
        keyPoints: ["The error type (ValueError, TypeError...) names the problem", "The line number tells you where to look", "Fix one error at a time, then run again"],
        py: code("# This crashes on purpose. Read the error!", 'hp = "ten"', "print(int(hp))"),
        js: code("// This crashes on purpose. Read the error!", "const monster = null;", "console.log(monster.hp);"),
      },
      {
        title: "Catching errors",
        explain:
          "When something might fail, like turning text into a number, you can catch the error and handle it instead of letting the whole program crash.",
        keyPoints: ["Python: try: ... except ValueError: ...", "JavaScript: try { } catch (err) { }", 'Heads up: JavaScript\'s Number("banana") doesn\'t crash. It gives NaN. Check with Number.isNaN()'],
        py: code('text = "banana"', "try:", "    print(int(text))", "except ValueError:", '    print(f"\'{text}\' is not a number. Nice try.")'),
        js: code('const n = Number("banana");', "if (Number.isNaN(n)) {", "  console.log(\"'banana' is not a number. Nice try.\");", "} else {", "  console.log(n);", "}"),
      },
    ],
    prompt: "Write a function that converts a string like '42' to a number. If the text isn't a number, catch the error and print a friendly message instead of crashing. Test it with '42' and 'banana'.",
    py: `def to_number(text):\n    # TODO: try converting with int(text)\n    # TODO: if it fails, print a friendly message and return None\n    pass\n\nprint(to_number("42"))\nprint(to_number("banana"))\n`,
    js: `function toNumber(text) {\n  // TODO: convert text to a number\n  // TODO: if it isn't a number, log a friendly message and return null\n  // Hint: Number("banana") gives NaN instead of an error. Check with Number.isNaN\n}\n\nconsole.log(toNumber("42"));\nconsole.log(toNumber("banana"));\n`,
    doneWhen: ["'42' becomes the number 42", "'banana' doesn't crash the program", "Prints a friendly message for bad input"],
    example: {
      py: code(
        "# Similar problem, solved: split loot without crashing on zero people",
        "def share_loot(gold, people):",
        "    try:",
        "        return gold // people",
        "    except ZeroDivisionError:",
        '        print("Nobody to share with. More for you!")',
        "        return gold",
        "",
        "print(share_loot(100, 4))",
        "print(share_loot(100, 0))",
      ),
      js: code(
        "// Similar problem, solved: read a scroll without crashing on garbage",
        "function readScroll(text) {",
        "  try {",
        "    return JSON.parse(text);",
        "  } catch (err) {",
        '    console.log("That scroll is unreadable. Moving on.");',
        "    return null;",
        "  }",
        "}",
        "",
        "console.log(readScroll('{\"gold\": 5}'));",
        'console.log(readScroll("oops"));',
      ),
    },
  },
  {
    tag: "classes",
    title: "Classes: Build Your Own Crawler",
    goals: ["Define a class with properties and methods", "Create objects from a class"],
    lessons: [
      {
        title: "Classes are blueprints",
        explain:
          "A class is a blueprint for making objects that bundle data and actions together. One Crawler class can make as many crawlers as you want, each with its own name and HP.",
        keyPoints: [
          "Python: __init__ sets up a new object, and self means 'this one'",
          "JavaScript: constructor sets it up, and this means 'this one'",
          'Make one: Crawler("Pip", 50) in Python, new Crawler("Pip", 50) in JavaScript',
        ],
        py: code("class Crawler:", "    def __init__(self, name, hp):", "        self.name = name", "        self.hp = hp", "", 'pip = Crawler("Pip", 50)', "print(pip.name, pip.hp)"),
        js: code("class Crawler {", "  constructor(name, hp) {", "    this.name = name;", "    this.hp = hp;", "  }", "}", "", 'const pip = new Crawler("Pip", 50);', "console.log(pip.name, pip.hp);"),
      },
      {
        title: "Methods: things objects can do",
        explain: "Methods are functions that live inside a class. They can read and change the object's own data, so the object takes care of itself.",
        keyPoints: ["In Python, every method's first parameter is self", "In JavaScript, use this.something inside methods", "Call it with a dot: pip.take_hit(10) / pip.takeHit(10)"],
        py: code(
          "class Crawler:",
          "    def __init__(self, name, hp):",
          "        self.name = name",
          "        self.hp = hp",
          "",
          "    def drink_potion(self):",
          "        self.hp = min(100, self.hp + 25)",
          "",
          'pip = Crawler("Pip", 90)',
          "pip.drink_potion()",
          "print(pip.hp)",
        ),
        js: code(
          "class Crawler {",
          "  constructor(name, hp) {",
          "    this.name = name;",
          "    this.hp = hp;",
          "  }",
          "",
          "  drinkPotion() {",
          "    this.hp = Math.min(100, this.hp + 25);",
          "  }",
          "}",
          "",
          'const pip = new Crawler("Pip", 90);',
          "pip.drinkPotion();",
          "console.log(pip.hp);",
        ),
      },
    ],
    prompt: "Create a Crawler class with name and hp. Add a take_hit(amount) / takeHit(amount) method that lowers hp (not below 0) and an is_alive / isAlive method. Create two crawlers and test it.",
    py: `class Crawler:\n    def __init__(self, name, hp):\n        # TODO: store name and hp\n        pass\n\n    # TODO: take_hit(self, amount)\n    # TODO: is_alive(self)\n\n# TODO: create two crawlers and test the methods\n`,
    js: `class Crawler {\n  constructor(name, hp) {\n    // TODO: store name and hp\n  }\n\n  // TODO: takeHit(amount)\n  // TODO: isAlive()\n}\n\n// TODO: create two crawlers and test the methods\n`,
    doneWhen: ["Class stores name and hp", "Hit method never drops hp below 0", "Alive method returns true/false", "Two crawlers created and tested"],
    example: {
      py: code(
        "# Similar problem, solved: a torch that burns out",
        "class Torch:",
        "    def __init__(self, fuel):",
        "        self.fuel = fuel",
        "",
        "    def burn(self, minutes):",
        "        self.fuel = max(0, self.fuel - minutes)",
        "",
        "    def is_lit(self):",
        "        return self.fuel > 0",
        "",
        "t = Torch(10)",
        "t.burn(4)",
        "print(t.fuel, t.is_lit())",
        "t.burn(20)",
        "print(t.fuel, t.is_lit())",
      ),
      js: code(
        "// Similar problem, solved: a torch that burns out",
        "class Torch {",
        "  constructor(fuel) {",
        "    this.fuel = fuel;",
        "  }",
        "",
        "  burn(minutes) {",
        "    this.fuel = Math.max(0, this.fuel - minutes);",
        "  }",
        "",
        "  isLit() {",
        "    return this.fuel > 0;",
        "  }",
        "}",
        "",
        "const t = new Torch(10);",
        "t.burn(4);",
        "console.log(t.fuel, t.isLit());",
        "t.burn(20);",
        "console.log(t.fuel, t.isLit());",
      ),
    },
  },
  {
    tag: "projects",
    title: "BOSS: Inventory Manager",
    goals: ["Combine classes, lists and functions", "Write code someone else could read"],
    lessons: [BOSS_LESSON],
    prompt: "Build an Inventory with add, remove and show methods. Removing an item that isn't there should print a sassy message instead of crashing. Demo every method.",
    py: `class Inventory:\n    def __init__(self):\n        self.items = []\n\n    # TODO: add(self, item)\n    # TODO: remove(self, item) with a sassy message if missing\n    # TODO: show(self)\n\n# TODO: demo every method\n`,
    js: `class Inventory {\n  constructor() {\n    this.items = [];\n  }\n\n  // TODO: add(item)\n  // TODO: remove(item) with a sassy message if missing\n  // TODO: show()\n}\n\n// TODO: demo every method\n`,
    doneWhen: ["Has add, remove and show", "Removing a missing item prints a message, no crash", "Every method is demoed", "Names are clear and readable"],
    example: {
      py: code(
        "# Similar problem, solved: a spell book you can learn from and forget",
        "class Spellbook:",
        "    def __init__(self):",
        "        self.spells = []",
        "",
        "    def learn(self, spell):",
        "        self.spells.append(spell)",
        "",
        "    def forget(self, spell):",
        "        if spell in self.spells:",
        "            self.spells.remove(spell)",
        "        else:",
        '            print(f"You never knew {spell}. Bold of you.")',
        "",
        "    def show(self):",
        '        print("Spells:", ", ".join(self.spells) or "none")',
        "",
        "book = Spellbook()",
        'book.learn("spark")',
        'book.forget("meteor")',
        "book.show()",
      ),
      js: code(
        "// Similar problem, solved: a spell book you can learn from and forget",
        "class Spellbook {",
        "  constructor() {",
        "    this.spells = [];",
        "  }",
        "",
        "  learn(spell) {",
        "    this.spells.push(spell);",
        "  }",
        "",
        "  forget(spell) {",
        "    const i = this.spells.indexOf(spell);",
        "    if (i === -1) {",
        "      console.log(`You never knew ${spell}. Bold of you.`);",
        "    } else {",
        "      this.spells.splice(i, 1);",
        "    }",
        "  }",
        "",
        "  show() {",
        '    console.log("Spells:", this.spells.join(", ") || "none");',
        "  }",
        "}",
        "",
        "const book = new Spellbook();",
        'book.learn("spark");',
        'book.forget("meteor");',
        "book.show();",
      ),
    },
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
  const practice = resourceIds.find((r) => r.tags.includes("practice"));
  // JavaScript learners see JavaScript examples. Everyone else sees Python.
  const useJs = crawler.language === "JavaScript";

  const lessons: RawLesson[] = t.lessons.map((l, i) => ({
    title: l.title,
    explain: l.explain,
    keyPoints: l.keyPoints,
    example: useJs ? l.js : l.py,
    resourceId: (matching[i] ?? practice)?.id ?? "",
  }));

  const comment = crawler.language === "Python" ? "#" : "//";
  const starter =
    crawler.language === "Python"
      ? t.py
      : crawler.language === "JavaScript"
        ? t.js
        : `${comment} Write your ${crawler.language} solution here.\n${comment} (Review-only language: you'll run this on your own computer.)\n`;

  return {
    lessons,
    exercise: { prompt: t.prompt, starterCode: starter, doneWhen: t.doneWhen, example: useJs ? t.example.js : t.example.py },
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
        { severity: "low", note: "Stuck? Hit \"Show me an example\" to see a similar problem solved." },
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
