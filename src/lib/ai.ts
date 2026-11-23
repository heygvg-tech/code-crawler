// Talks to the Anthropic API straight from the browser using the crawler's own key.
// The key goes ONLY to api.anthropic.com. There is no server in between.
import { AI_MAX_TOKENS, AI_MODEL } from "./config";
import { getApiKey } from "./storage";
import { ValidationError } from "./validate";
import systemVoice from "../../prompts/system-voice.md?raw";

export class FriendlyError extends Error {}

// Fills {{placeholders}} in a prompt template.
export function fill(template: string, vars: Record<string, string | number | boolean>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{{${k}}}`));
}

async function callClaude(prompt: string): Promise<string> {
  const key = getApiKey();
  if (!key) throw new FriendlyError("No API key found. Add one in Settings, or keep playing in demo mode.");

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        // Required for calling the API from a browser. Safe here because
        // each person uses their OWN key on their own device.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        system: systemVoice,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch {
    throw new FriendlyError("Couldn't reach the AI. Check your internet connection and try again.");
  }

  if (res.status === 401) throw new FriendlyError("The System rejects your key. Double-check it in Settings.");
  if (res.status === 429) throw new FriendlyError("Rate limited. Even dungeons need a breather. Try again in a minute.");
  if (res.status === 529 || res.status >= 500) throw new FriendlyError("The AI is overloaded right now. Try again shortly.");
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json())?.error?.message ?? "";
    } catch {
      /* ignore */
    }
    throw new FriendlyError(`The AI said no (${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  const text = (data?.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");
  return text;
}

// Pulls the JSON object out of the reply, even if the model wrapped it in fences.
function extractJSON(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new ValidationError("No JSON in the reply");
  return JSON.parse(text.slice(start, end + 1));
}

// Ask for JSON, validate it, retry once if it comes back broken.
export async function askJSON<T>(prompt: string, validate: (x: unknown) => T): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await callClaude(
      attempt === 0 ? prompt : `${prompt}\n\nYour last reply was not valid JSON for the schema. Reply with ONLY the JSON object.`,
    );
    try {
      return validate(extractJSON(text));
    } catch (err) {
      lastErr = err; // SyntaxError or ValidationError: try once more
    }
  }
  console.warn("AI returned unusable JSON twice:", lastErr);
  throw new FriendlyError("The System mumbled something unreadable twice in a row. Hit retry.");
}
