FLOOR COLLAPSE WARNING. A crawler has fallen behind and wants the rest of their dungeon re-planned so they can still finish by their original end date.

Language: {{language}}. Time available: {{hoursPerWeek}} hours per week.
Today: {{today}}. Original end date: {{endDate}}. Days behind: {{daysBehind}}.

Remaining floors (not cleared yet):
{{remainingFloors}}

Rules:
- Return between 1 and {{remainingCount}} floors. Merge or trim lighter floors so the pace is realistic. Never add floors.
- Keep the most important concepts. Keep at least one BOSS floor if any remain; boss titles start with "BOSS: ".
- The first floor in your list is the one they're on now. Keep it first, unchanged unless it must be merged.
- "systemMessage": one sassy-but-supportive line. No guilt trips.

JSON schema:
{"systemMessage": "string", "floors": [{"title": "string", "goals": ["string"]}]}
