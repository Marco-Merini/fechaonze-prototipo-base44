export const SPORTS = [
  { id: "futebol", label: "Futebol de Campo", football: true },
  { id: "society", label: "Futebol Society", football: true },
  { id: "futsal", label: "Futsal", football: true },
  { id: "beach", label: "Futebol de Areia", football: true },
  { id: "basquete", label: "Basquete", football: false },
  { id: "volei", label: "Vôlei", football: false },
  { id: "tenis", label: "Tênis", football: false },
  { id: "padel", label: "Padel", football: false },
];

export const isFootballSport = (id) => SPORTS.find((s) => s.id === id)?.football || false;
export const isFootballUser = (player) => {
  const sports = player?.sports;
  if (sports && sports.length) return sports.some((sid) => isFootballSport(sid));
  return (player?.ratings_count || 0) > 0;
};
export const sportLabel = (id) => SPORTS.find((s) => s.id === id)?.label || id;