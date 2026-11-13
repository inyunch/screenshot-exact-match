import { useEffect, useRef, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { agentChat } from "@/lib/agent.functions";
import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";

type Msg = { role: "user" | "assistant" | "error"; content: string };

const EXAMPLES = [
  "Which lakes have the highest risk?",
  "Tell me about Morrow Lake",
  "How accurate is this model?",
  "Give me an action plan for Morrow Lake",
];

export function AgentTab() {
  const ask = useServerFn(agentChat);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: message }]);
    setBusy(true);
    try {
      const res = await ask({ data: { message, thread_id: threadId } });
      if (res.error) {
        setMessages((m) => [...m, { role: "error", content: res.error as string }]);
      } else {
        if (res.thread_id) setThreadId(res.thread_id);
        setMessages((m) => [...m, { role: "assistant", content: res.answer || "_No answer returned._" }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "error", content: "Couldn't reach the agent. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((q) => (
          <Button
            key={q}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto rounded-full bg-card py-1.5 text-left whitespace-normal"
            disabled={busy}
            onClick={() => void send(q)}
          >
            {q}
          </Button>
        ))}
      </div>

      <div className="min-h-72 space-y-3 rounded-xl border border-border bg-surface p-3 sm:p-4">
        {messages.length === 0 && !busy && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Ask about any Michigan inland lake, survey priorities, or how the scores were made.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-2.5 text-sm",
                m.role === "user" && "rounded-br-md bg-primary text-primary-foreground",
                m.role === "assistant" && "shadow-soft rounded-bl-md border border-border bg-card",
                m.role === "error" && "rounded-bl-md border border-warning-border bg-warning text-warning-foreground",
              )}
            >
              {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              IBM Granite agent is calling its tools...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Ask the agent…"
          rows={2}
          maxLength={2000}
          className="min-h-[52px] resize-none bg-card"
          aria-label="Your question"
        />
        <Button type="submit" size="icon" className="h-[52px] w-12 shrink-0" disabled={busy || !input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Every number the agent states comes from a tool call on this data.</span>
        {messages.length > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-foreground"
            onClick={() => {
              setMessages([]);
              setThreadId(null);
            }}
            disabled={busy}
          >
            <RotateCcw className="h-3 w-3" /> New chat
          </button>
        )}
      </div>
    </div>
  );
}
