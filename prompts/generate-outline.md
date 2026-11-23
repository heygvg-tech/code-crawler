Build the dungeon map for a new crawler.

Crawler:
- Language: {{language}}
- Timeline: {{timelineWeeks}} weeks
- Time available: {{hoursPerWeek}} hours per week
- Level: {{level}}
- Goal: {{goal}}

Create EXACTLY {{floorCount}} floors that take this person from where they are to their goal, in a sensible teaching order. Each floor is one checkpoint.

Rules:
- Every 4th floor (floor 4, 8, 12...) is a BOSS floor: a small mini-project that combines skills from earlier floors. Its title starts with "BOSS: ".
- Titles are fun and dungeon-themed but must make the concept obvious. Example: "Loops: The Hallway That Never Ends".
- Each floor has 2-3 short, concrete learning goals.
- Lean the later floors toward the crawler's goal ({{goal}}).

JSON schema:
{"floors": [{"title": "string", "goals": ["string", "string"]}]}
