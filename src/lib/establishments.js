export const MODALITIES = [
  { value: "futebol_society", label: "Futebol Society" },
  { value: "futsal", label: "Futsal" },
  { value: "futebol_campo", label: "Futebol de Campo" },
  { value: "basquete", label: "Basquete" },
  { value: "volei", label: "Vôlei" },
  { value: "beach_tennis", label: "Beach Tennis" },
  { value: "tenis", label: "Tênis" },
  { value: "outras", label: "Outras Modalidades" },
];

export const AMENITIES = [
  { value: "iluminacao", label: "Iluminação" },
  { value: "vestiario", label: "Vestiário" },
  { value: "chuveiro", label: "Chuveiro" },
  { value: "estacionamento", label: "Estacionamento" },
  { value: "arquibancada", label: "Arquibancada" },
  { value: "churrasqueira", label: "Churrasqueira" },
  { value: "bar", label: "Bar ou Lanchonete" },
  { value: "coletes", label: "Aluguel de coletes" },
  { value: "bola", label: "Aluguel de bola" },
];

export const WEEKDAYS = [
  { value: "domingo", label: "Domingo" },
  { value: "segunda", label: "Segunda" },
  { value: "terca", label: "Terça" },
  { value: "quarta", label: "Quarta" },
  { value: "quinta", label: "Quinta" },
  { value: "sexta", label: "Sexta" },
  { value: "sabado", label: "Sábado" },
];

export const WEEKDAY_ORDER = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 };

export const weekdayLabel = (w) => WEEKDAYS.find((d) => d.value === w)?.label || w;
export const modalityLabel = (m) => MODALITIES.find((d) => d.value === m)?.label || m;
export const amenityLabel = (a) => AMENITIES.find((d) => d.value === a)?.label || a;

export const FLOOR_TYPES = ["Society", "Cimento", "Madeira", "Borracha", "Areia", "Grama Sintética", "Grama Natural", "Quadra Poliesportiva"];