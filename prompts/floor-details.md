A crawler just unlocked a new floor. Stock it with lessons and one exercise.

Crawler: learning {{language}}, level {{level}}, goal {{goal}}.
Floor {{floorNumber}}: {{floorTitle}}
Boss floor: {{isBoss}}
Floor goals: {{floorGoals}}
Floors already cleared: {{previousTitles}}

Lessons must ONLY use resources from this list. Refer to them by id:
{{resources}}

Rules:
- 2-4 lessons. Each has a short title, a 1-2 sentence summary of what to read or do there, and a resourceId from the list.
- One exercise. Normal floors: 30-90 minutes. Boss floors: a 2-4 hour mini-project.
- {{runNote}}
- starterCode gives structure, comments and TODOs. It must NOT contain the solution.
- doneWhen is a checklist of 3-5 specific, checkable requirements.
- Keep the exercise themed to the dungeon (loot, monsters, floors, potions), but make the skill the star.

JSON schema:
{"lessons": [{"title": "string", "summary": "string", "resourceId": "string"}],
 "exercise": {"prompt": "string", "starterCode": "string", "doneWhen": ["string"]}}
