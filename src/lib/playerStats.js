const positionWeights = {
  GOL: { defending: 0.45, physical: 0.2, passing: 0.2, pace: 0.1, dribbling: 0.05, shooting: 0 },
  ZAG: { defending: 0.35, physical: 0.25, pace: 0.15, passing: 0.1, shooting: 0.1, dribbling: 0.05 },
  LAT: { pace: 0.25, defending: 0.25, physical: 0.2, passing: 0.15, dribbling: 0.1, shooting: 0.05 },
  VOL: { passing: 0.25, defending: 0.2, physical: 0.2, dribbling: 0.15, pace: 0.1, shooting: 0.1 },
  MEI: { passing: 0.25, dribbling: 0.25, shooting: 0.2, pace: 0.1, physical: 0.1, defending: 0.1 },
  EXT: { pace: 0.3, dribbling: 0.25, shooting: 0.2, passing: 0.15, physical: 0.05, defending: 0.05 },
  ATA: { shooting: 0.35, pace: 0.25, physical: 0.2, dribbling: 0.1, passing: 0.05, defending: 0.05 },
};

export function computeOverall(player) {
  const w = positionWeights[player.position] || positionWeights.ATA;
  const a = player;
  const val =
    (a.pace || 0) * (w.pace || 0) +
    (a.shooting || 0) * (w.shooting || 0) +
    (a.passing || 0) * (w.passing || 0) +
    (a.dribbling || 0) * (w.dribbling || 0) +
    (a.defending || 0) * (w.defending || 0) +
    (a.physical || 0) * (w.physical || 0);
  return Math.round(val);
}

export function blendOverall(baseOverall, avgRating) {
  const ratingScaled = (avgRating / 10) * 99;
  return Math.round(0.7 * baseOverall + 0.3 * ratingScaled);
}

export function tierColor(overall) {
  if (overall >= 80) return { bg: "from-amber-300 via-amber-400 to-amber-600", text: "text-amber-950", label: "Lenda", ring: "ring-amber-300" };
  if (overall >= 74) return { bg: "from-yellow-200 via-yellow-300 to-yellow-500", text: "text-yellow-950", label: "Ouro", ring: "ring-yellow-300" };
  if (overall >= 67) return { bg: "from-slate-200 via-slate-300 to-slate-500", text: "text-slate-900", label: "Prata", ring: "ring-slate-300" };
  return { bg: "from-orange-200 via-orange-300 to-orange-600", text: "text-orange-950", label: "Bronze", ring: "ring-orange-300" };
}

export const ATTR_LABELS = [
  { key: "pace", short: "PAC", label: "Velocidade" },
  { key: "shooting", short: "SHO", label: "Finalização" },
  { key: "passing", short: "PAS", label: "Passe" },
  { key: "dribbling", short: "DRI", label: "Drible" },
  { key: "defending", short: "DEF", label: "Defesa" },
  { key: "physical", short: "FIS", label: "Físico" },
];