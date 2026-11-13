import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "__all__";

export function CountySelect({
  counties,
  value,
  onChange,
}: {
  counties: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">County</label>
      <Select value={value ?? ALL} onValueChange={(v) => onChange(v === ALL ? null : v)}>
        <SelectTrigger className="w-full bg-card sm:w-56">
          <SelectValue placeholder="All counties" />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          <SelectItem value={ALL}>All counties</SelectItem>
          {counties.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
