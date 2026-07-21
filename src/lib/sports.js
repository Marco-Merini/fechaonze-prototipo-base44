const FOOTBALL_POSITIONS = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "LAT", label: "Lateral" },
  { value: "VOL", label: "Volante" },
  { value: "MEI", label: "Meia" },
  { value: "EXT", label: "Extremo" },
  { value: "ATA", label: "Atacante" },
];

export const SPORTS = [
  { id: "futebol", label: "Futebol de Campo", football: true, positions: FOOTBALL_POSITIONS },
  { id: "society", label: "Futebol Society", football: true, positions: FOOTBALL_POSITIONS },
  { id: "futsal", label: "Futsal", football: true, positions: FOOTBALL_POSITIONS },
  { id: "beach", label: "Futebol de Areia", football: true, positions: FOOTBALL_POSITIONS },
  {
    id: "basquete",
    label: "Basquete",
    football: false,
    positions: [
      { value: "ARM", label: "Armador" },
      { value: "ALG", label: "Ala-armador" },
      { value: "ALA", label: "Ala" },
      { value: "ALP", label: "Ala-pivô" },
      { value: "PIV", label: "Pivô" },
    ],
  },
  {
    id: "volei",
    label: "Vôlei",
    football: false,
    positions: [
      { value: "LEV", label: "Levantador" },
      { value: "LIB", label: "Líbero" },
      { value: "PON", label: "Ponta" },
      { value: "OPS", label: "Oposto" },
      { value: "CEN", label: "Central" },
    ],
  },
  { id: "tenis", label: "Tênis", football: false, positions: [] },
  {
    id: "padel",
    label: "Padel",
    football: false,
    positions: [
      { value: "DRV", label: "Drive (direita)" },
      { value: "REV", label: "Revés (esquerda)" },
    ],
  },
];

export const isFootballSport = (id) => SPORTS.find((s) => s.id === id)?.football || false;
export const isFootballUser = (player) => {
  const sports = player?.sports;
  if (sports && sports.length) return sports.some((sid) => isFootballSport(sid));
  return (player?.ratings_count || 0) > 0;
};
export const sportLabel = (id) => SPORTS.find((s) => s.id === id)?.label || id;
export const sportPositions = (id) => SPORTS.find((s) => s.id === id)?.positions || [];
export const positionLabel = (sportId, code) => {
  const pos = sportPositions(sportId).find((p) => p.value === code);
  return pos?.label || code;
};