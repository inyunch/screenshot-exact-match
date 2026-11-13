import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Cpu,
  Database,
  Info,
  ListChecks,
  MessageSquare,
  Network,
  Sparkles,
  Terminal,
  Wrench,
} from "lucide-react";
import { Fragment } from "react";
import { AppNav } from "@/components/radar/AppNav";

export const Route = createFileRoute("/ibm")({
  head: () => ({
    meta: [
      { title: "How we used IBM — Lake Invasion Risk Radar" },
      {
        name: "description",
        content:
          "An AI agent on IBM watsonx Orchestrate, powered by IBM Granite, answers questions about Michigan lakes using only our own data.",
      },
      { property: "og:title", content: "How we used IBM" },
      {
        property: "og:description",
        content:
          "An AI agent on IBM watsonx Orchestrate, powered by IBM Granite, answers questions about Michigan lakes using only our own data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/ibm" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/ibm" }],
  }),
  component: IBMPage,
});

const BLOCKS = [
  {
    icon: Bot,
    title: "IBM watsonx Orchestrate",
    text: "Runs our AI agent. A user asks a question about a Michigan lake, and the agent picks the right tool, gets the data and writes the answer.",
  },
  {
    icon: BrainCircuit,
    title: "IBM Granite",
    text: "The AI model inside the agent. It turns the data into short, plain-English answers and action plans for lake volunteers.",
  },
  {
    icon: Wrench,
    title: "6 Python tools",
    text: "Look up our precomputed results: top-risk lakes, one lake's details, the nearest infested lakes, an action plan, model accuracy, and a shoreline septic screening (well density x algae). Every number Granite gives comes from these tools, not from the model.",
  },
  {
    icon: Terminal,
    title: "Orchestrate ADK",
    text: "The command-line kit we used to upload the tools and deploy the agent.",
  },
  {
    icon: Network,
    title: "Orchestrate chat API",
    text: "Connects our web app to the agent through our server, so the IBM key never reaches the browser.",
  },
];

const STEPS = [
  { icon: MessageSquare, text: "You ask about a lake" },
  { icon: ListChecks, text: "The agent picks a tool" },
  { icon: Database, text: "The tool returns our data" },
  { icon: Sparkles, text: "Granite writes the answer" },
];

function IBMPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="hero-water border-b border-border">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-12">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ibm-blue">
            <Cpu className="h-4 w-4" aria-hidden />
            IBM watsonx Orchestrate
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            How we used IBM
          </h1>
          <p className="mt-3 max-w-2xl text-base text-foreground/80 sm:text-lg">
            An AI agent on IBM watsonx Orchestrate, powered by IBM Granite, answers questions about
            Michigan lakes using only our own data.
          </p>
        </div>
      </header>

      <AppNav active="ibm" />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <figure className="shadow-soft rounded-xl border border-border bg-diagram-surface p-3 sm:p-6">
          <img
            src="/ibm-architecture.svg"
            alt="Architecture: web app, server, watsonx Orchestrate agent with Granite, six tools, precomputed results, Python pipeline, Orchestrate ADK."
            className="h-auto w-full"
            width={1200}
            height={640}
          />
        </figure>

        <section aria-label="IBM building blocks" className="mt-8">
          <h2 className="sr-only">What we used</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BLOCKS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="shadow-soft rounded-xl border border-border bg-card p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ibm-blue-soft text-ibm-blue">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-xl font-semibold text-foreground sm:text-2xl">
            What happens when you ask a question
          </h2>
          <ol className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {STEPS.map(({ icon: Icon, text }, i) => (
              <Fragment key={text}>
                <li className="shadow-soft flex flex-1 flex-col gap-2 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ibm-blue text-xs font-semibold text-primary-foreground">
                      {i + 1}
                    </span>
                    <Icon className="h-4 w-4 text-ibm-blue" aria-hidden />
                  </div>
                  <span className="text-sm leading-relaxed text-foreground">{text}</span>
                </li>
                {i < STEPS.length - 1 && (
                  <li aria-hidden className="hidden items-center justify-center lg:flex">
                    <ArrowRight className="h-5 w-5 text-ibm-blue" />
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
        </section>

        <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Results are survey priorities from public data, not detection results.
        </p>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-muted-foreground sm:px-6">
          Data: USGS Nonindigenous Aquatic Species database (downloaded 2026-11-13); Michigan DNR Boating
          Access Sites; EGLE Michigan Inland Lakes Water Clarity 2018-2023; EGLE AIS early-detection
          monitoring 2014-2023.
        </div>
      </footer>
    </div>
  );
}
