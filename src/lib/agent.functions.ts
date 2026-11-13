import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callOrchestrate } from "./agent.server";

const AgentInput = z.object({
  message: z.string().trim().min(1).max(2000),
  thread_id: z.string().max(200).nullish(),
});

/** agent-chat: { message, thread_id } -> { answer (markdown), thread_id } or { error }. */
export const agentChat = createServerFn({ method: "POST" })
  .validator((data: unknown) => AgentInput.parse(data))
  .handler(async ({ data }) => callOrchestrate(data.message, data.thread_id));
