A crawler just unlocked a new floor. Teach it with bite-sized lessons, then give them one exercise.

Crawler: learning {{language}}, level {{level}}, goal {{goal}}.
Floor {{floorNumber}}: {{floorTitle}}
Boss floor: {{isBoss}}
Floor goals: {{floorGoals}}
Floors already cleared: {{previousTitles}}

Optional "go deeper" reading. Only use ids from this list, or leave resourceId empty:
{{resources}}

Lessons (2-3 of them). The lesson IS the teaching. Nobody should need to open a link to understand it.
- "title": short and clear.
- "explain": 2-4 short sentences in plain English, like explaining to a smart friend. An everyday comparison helps.
- "keyPoints": 2-4 short bullets worth remembering (syntax, gotchas).
- "example": a tiny {{language}} example (3-12 lines) that shows the idea and prints output. Different from the exercise.
- "resourceId": an id from the list above, or "".

Exercise:
- Normal floors: 30-90 minutes. Boss floors: a 2-4 hour mini-project.
- {{runNote}}
- "starterCode" gives structure, comments and TODOs. It must NOT contain the solution.
- "doneWhen" is a checklist of 3-5 specific, checkable requirements.
- "example" is a fully solved SIMILAR problem (not this exercise) with a first-line comment saying what it solves. It shows the pattern without giving away the answer.
- Theme it to the dungeon (loot, monsters, floors, potions), but make the skill the star.

JSON schema:
{"lessons": [{"title": "string", "explain": "string", "keyPoints": ["string"], "example": "string", "resourceId": "string"}],
 "exercise": {"prompt": "string", "starterCode": "string", "doneWhen": ["string"], "example": "string"}}
