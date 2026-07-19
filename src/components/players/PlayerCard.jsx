import React from "react";
import { User } from "lucide-react";
import { computeOverall, tierColor, ATTR_LABELS } from "@/lib/playerStats";

export default function PlayerCard({ player, onClick, size = "md" }) {
  const overall = computeOverall(player);
  const tier = tierColor(overall);
  const dims = size === "lg" ? "w-64" : "w-52";

  return (
    <div
      onClick={onClick}
      className={`${dims} cursor-pointer rounded-2xl bg-gradient-to-b ${tier.bg} p-[3px] shadow-xl ring-2 ${tier.ring} transition-transform hover:scale-[1.03] hover:shadow-2xl`}
    >
      <div className="rounded-2xl bg-gradient-to-b from-white/10 to-black/20 p-5 text-center text-white">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <p className={`text-4xl font-extrabold leading-none ${tier.text}`}>{overall}</p>
            <p className={`text-xs font-bold mt-1 ${tier.text}`}>{player.position}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex items-center justify-center">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white/70" />
            )}
          </div>
        </div>
        <h3 className="font-heading font-bold text-lg mt-2 truncate uppercase tracking-wide">{player.name}</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 text-left text-xs font-semibold">
          {ATTR_LABELS.map((a) => (
            <div key={a.key} className="flex justify-between">
              <span className="opacity-90">{a.short}</span>
              <span>{player[a.key] ?? 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}