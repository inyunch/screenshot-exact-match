import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { lakeLabel } from "@/lib/lake-rules";
import type { LakeSummary } from "@/lib/lakes-data";

export function LakePicker({
  lakes,
  value,
  currentLabel,
  onChange,
}: {
  lakes: LakeSummary[];
  value: string;
  currentLabel: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const sorted = useMemo(
    () =>
      lakes
        .map((l) => ({ id: l.lake_id, label: lakeLabel(l) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [lakes],
  );
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? sorted.filter((l) => l.label.toLowerCase().includes(s)) : sorted;
    return list.slice(0, 60);
  }, [sorted, q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Choose a lake"
          className="h-11 w-full justify-between bg-card text-base font-medium sm:w-96"
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search lake or county…" value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>No lake found.</CommandEmpty>
            <CommandGroup>
              {results.map((l) => (
                <CommandItem
                  key={l.id}
                  value={l.id}
                  onSelect={() => {
                    onChange(l.id);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <Check className={value === l.id ? "h-4 w-4 opacity-100" : "h-4 w-4 opacity-0"} />
                  {l.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
