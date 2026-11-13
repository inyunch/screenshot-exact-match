<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Lake data tables (`lakes`, `nearest_sources`, `metrics`) are precomputed, public read-only reference data; the app only displays them and never computes risk. Why: scores come from an offline model and must match what the agent's tools report.
- Load all lakes by paging with `.range()` in 1000-row pages (`src/lib/lakes-data.ts`). Why: the data API caps responses at 1000 rows.
- The IBM watsonx Orchestrate agent is called only from the `agentChat` server function (`src/lib/agent.functions.ts` → `agent.server.ts`), with credentials in server secrets. Why: the IBM key must never reach the browser; replaces the original `agent-chat` edge function with the same request/response shape.
- Leaflet is imported only in `src/components/radar/LakeMap.tsx`, lazy-loaded behind `ClientOnly`. Why: Leaflet touches `window` and breaks server rendering.
- Filtering/formatting rules live in `src/lib/lake-rules.ts` with tests in `src/test/lake-rules.test.ts`.
