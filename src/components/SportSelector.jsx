import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SPORTS } from "@/lib/sports";
import { POSITIONS } from "@/lib/playerStats";

export default function SportSelector({ sports = [], positions = [], onChange }) {
  const toggle = (sport) => {
    if (sports.includes(sport.id)) {
      onChange({
        sports: sports.filter((s) => s !== sport.id),
        positions: positions.filter((p) => p.sport !== sport.id),
      });
    } else {
      const nextPositions = sport.football
        ? [...positions.filter((p) => p.sport !== sport.id), { sport: sport.id, position: "ATA" }]
        : positions.filter((p) => p.sport !== sport.id);
      onChange({ sports: [...sports, sport.id], positions: nextPositions });
    }
  };

  const setPosition = (sportId, pos) => {
    onChange({ sports, positions: positions.map((p) => (p.sport === sportId ? { ...p, position: pos } : p)) });
  };

  return (
    <div className="space-y-2">
      {SPORTS.map((sport) => {
        const checked = sports.includes(sport.id);
        const pos = positions.find((p) => p.sport === sport.id);
        return (
          <div key={sport.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-3">
              <Checkbox checked={checked} onCheckedChange={() => toggle(sport)} id={`sport-${sport.id}`} />
              <label htmlFor={`sport-${sport.id}`} className="text-sm font-medium cursor-pointer flex-1">
                {sport.label}
              </label>
            </div>
            {checked && sport.football && pos && (
              <div className="mt-2 pl-8">
                <Select value={pos.position} onValueChange={(v) => setPosition(sport.id, v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}