// Talks to the IBM watsonx Orchestrate agent (IBM Granite). Server-only: the IBM key never
// reaches the browser.

let cached: { token: string; exp: number } | null = null;

async function iamToken(apiKey: string): Promise<string> {
  const now = Date.now() / 1000;
  if (cached && now < cached.exp - 120) return cached.token;
  const r = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: apiKey,
    }),
  });
  if (!r.ok) throw new Error(`IBM IAM token request failed (${r.status})`);
  const j = (await r.json()) as { access_token: string; expires_in?: number };
  cached = { token: j.access_token, exp: now + (j.expires_in ?? 3600) };
  return cached.token;
}

export type AgentReply = { answer: string | null; thread_id: string | null; error: string | null };

export async function callOrchestrate(message: string, threadId?: string | null): Promise<AgentReply> {
  const apiKey = process.env["WXO_API_KEY"];
  const instance = (process.env["WXO_INSTANCE_URL"] ?? "").replace(/\/+$/, "");
  const agentId = process.env["WXO_AGENT_ID"];
  if (!apiKey || !instance || !agentId) {
    return {
      answer: null,
      thread_id: null,
      error: "The agent isn't connected yet: the IBM API key still needs to be added.",
    };
  }
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await iamToken(apiKey)}`,
      "Content-Type": "application/json",
    };
    if (threadId) headers["X-IBM-THREAD-ID"] = threadId;
    const r = await fetch(`${instance}/v1/orchestrate/${agentId}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages: [{ role: "user", content: message }], stream: false }),
    });
    if (!r.ok) {
      console.error("Orchestrate error", r.status, (await r.text()).slice(0, 500));
      return { answer: null, thread_id: threadId ?? null, error: `The agent service returned an error (${r.status}). Please try again.` };
    }
    const j = (await r.json()) as {
      choices?: { message?: { content?: string } }[];
      thread_id?: string;
    };
    return {
      answer: j.choices?.[0]?.message?.content ?? "",
      thread_id: j.thread_id ?? threadId ?? null,
      error: null,
    };
  } catch (e) {
    console.error("Orchestrate call failed", e);
    return { answer: null, thread_id: threadId ?? null, error: "Couldn't reach the agent. Please try again." };
  }
}
