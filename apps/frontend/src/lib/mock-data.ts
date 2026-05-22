// Mock data for GOODWORK — first version uses in-memory fixtures.
// Real backend wiring (Supabase tables, RLS, realtime) comes in iteration 2.

export type RoomAmenity =
  | "wifi"
  | "screen"
  | "whiteboard"
  | "coffee"
  | "ac"
  | "phone"
  | "videoconf";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  amenities: RoomAmenity[];
  image: string;
  description: string;
  floor: string;
  rating: number;
}

export const rooms: Room[] = [
  {
    id: "executive-suite",
    name: "Executive Suite",
    capacity: 12,
    pricePerHour: 180,
    amenities: ["wifi", "screen", "whiteboard", "coffee", "ac", "videoconf"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    description:
      "Sala executiva com vista panorâmica, mesa de mogno e equipamento de videoconferência 4K.",
    floor: "8º andar",
    rating: 4.9,
  },
  {
    id: "creative-lab",
    name: "Creative Lab",
    capacity: 8,
    pricePerHour: 110,
    amenities: ["wifi", "whiteboard", "coffee", "ac"],
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    description:
      "Espaço dinâmico com paredes whiteboard, mobiliário modular e iluminação natural.",
    floor: "5º andar",
    rating: 4.8,
  },
  {
    id: "focus-pod",
    name: "Focus Pod",
    capacity: 4,
    pricePerHour: 60,
    amenities: ["wifi", "screen", "ac", "phone"],
    image:
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1600&q=80",
    description:
      "Cabine acústica perfeita para chamadas estratégicas e trabalho concentrado.",
    floor: "3º andar",
    rating: 4.7,
  },
  {
    id: "boardroom-arctic",
    name: "Boardroom Arctic",
    capacity: 16,
    pricePerHour: 240,
    amenities: ["wifi", "screen", "videoconf", "coffee", "ac", "phone"],
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1600&q=80",
    description:
      "Boardroom premium com sistema Dolby, mesa em granito e cadeiras Herman Miller.",
    floor: "10º andar",
    rating: 5.0,
  },
  {
    id: "studio-loft",
    name: "Studio Loft",
    capacity: 10,
    pricePerHour: 140,
    amenities: ["wifi", "whiteboard", "coffee", "ac", "screen"],
    image:
      "https://images.unsplash.com/photo-1604328471151-b52226907017?auto=format&fit=crop&w=1600&q=80",
    description:
      "Loft industrial com pé direito alto, ideal para workshops e dinâmicas em grupo.",
    floor: "2º andar",
    rating: 4.8,
  },
  {
    id: "garden-room",
    name: "Garden Room",
    capacity: 6,
    pricePerHour: 90,
    amenities: ["wifi", "coffee", "ac"],
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    description:
      "Sala biofílica com jardim vertical e luz natural — perfeita para reuniões leves.",
    floor: "1º andar",
    rating: 4.6,
  },
];

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  user: string;
  avatar: string;
  start: string; // ISO time HH:mm
  end: string;
  date: string; // YYYY-MM-DD
  attendees: number;
  status: "confirmed" | "pending" | "cancelled";
}

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export const bookings: Booking[] = [
  {
    id: "b1",
    roomId: "executive-suite",
    roomName: "Executive Suite",
    user: "Marina Costa",
    avatar: "MC",
    start: "09:00",
    end: "10:30",
    date: today,
    attendees: 8,
    status: "confirmed",
  },
  {
    id: "b2",
    roomId: "creative-lab",
    roomName: "Creative Lab",
    user: "Diego Ramos",
    avatar: "DR",
    start: "11:00",
    end: "12:00",
    date: today,
    attendees: 5,
    status: "confirmed",
  },
  {
    id: "b3",
    roomId: "focus-pod",
    roomName: "Focus Pod",
    user: "Júlia Tavares",
    avatar: "JT",
    start: "14:00",
    end: "15:30",
    date: today,
    attendees: 2,
    status: "pending",
  },
  {
    id: "b4",
    roomId: "boardroom-arctic",
    roomName: "Boardroom Arctic",
    user: "Eduardo Lima",
    avatar: "EL",
    start: "16:00",
    end: "18:00",
    date: today,
    attendees: 12,
    status: "confirmed",
  },
  {
    id: "b5",
    roomId: "studio-loft",
    roomName: "Studio Loft",
    user: "Renata Sá",
    avatar: "RS",
    start: "10:00",
    end: "13:00",
    date: tomorrow,
    attendees: 10,
    status: "confirmed",
  },
];

export interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  lastMovement: string;
}

export const supplies: Supply[] = [
  { id: "s1", name: "Cápsulas de café Premium", category: "Copa", stock: 18, minStock: 50, unit: "un", lastMovement: "hoje, 09:42" },
  { id: "s2", name: "Papel A4 75g", category: "Escritório", stock: 240, minStock: 100, unit: "fls", lastMovement: "ontem, 17:11" },
  { id: "s3", name: "Água mineral 500ml", category: "Copa", stock: 32, minStock: 80, unit: "un", lastMovement: "hoje, 08:20" },
  { id: "s4", name: "Marcadores quadro branco", category: "Reuniões", stock: 12, minStock: 20, unit: "un", lastMovement: "3 dias atrás" },
  { id: "s5", name: "Toner impressora HP", category: "Escritório", stock: 4, minStock: 3, unit: "un", lastMovement: "1 semana atrás" },
  { id: "s6", name: "Cabos HDMI", category: "Tecnologia", stock: 14, minStock: 10, unit: "un", lastMovement: "5 dias atrás" },
  { id: "s7", name: "Chá variado", category: "Copa", stock: 56, minStock: 40, unit: "saches", lastMovement: "hoje, 10:05" },
  { id: "s8", name: "Bloco de notas", category: "Escritório", stock: 88, minStock: 30, unit: "un", lastMovement: "2 dias atrás" },
];

export const occupancyWeekly = [
  { day: "Seg", ocupacao: 68, reservas: 14 },
  { day: "Ter", ocupacao: 82, reservas: 18 },
  { day: "Qua", ocupacao: 91, reservas: 22 },
  { day: "Qui", ocupacao: 76, reservas: 17 },
  { day: "Sex", ocupacao: 88, reservas: 21 },
  { day: "Sáb", ocupacao: 42, reservas: 8 },
  { day: "Dom", ocupacao: 18, reservas: 3 },
];

export const revenueMonthly = [
  { month: "Jan", receita: 42800, meta: 40000 },
  { month: "Fev", receita: 47200, meta: 42000 },
  { month: "Mar", receita: 51800, meta: 45000 },
  { month: "Abr", receita: 49600, meta: 48000 },
  { month: "Mai", receita: 58300, meta: 50000 },
  { month: "Jun", receita: 62100, meta: 55000 },
  { month: "Jul", receita: 67400, meta: 60000 },
  { month: "Ago", receita: 71200, meta: 65000 },
];

export const consumptionTrend = [
  { week: "S1", café: 120, papel: 800, água: 200 },
  { week: "S2", café: 145, papel: 920, água: 240 },
  { week: "S3", café: 160, papel: 760, água: 280 },
  { week: "S4", café: 180, papel: 1010, água: 310 },
  { week: "S5", café: 210, papel: 880, água: 340 },
  { week: "S6", café: 240, papel: 940, água: 380 },
];

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "warning" | "success" | "alert";
  read: boolean;
}

export const notifications: Notification[] = [
  { id: "n1", title: "Estoque crítico de café", description: "Apenas 18 cápsulas restantes — abaixo do mínimo de 50.", time: "há 4 min", type: "alert", read: false },
  { id: "n2", title: "Nova reserva confirmada", description: "Marina Costa reservou Executive Suite às 09:00.", time: "há 22 min", type: "success", read: false },
  { id: "n3", title: "Atualização de sala", description: "Creative Lab teve manutenção concluída.", time: "há 1h", type: "info", read: true },
  { id: "n4", title: "Conflito de agenda evitado", description: "Sistema reagendou automaticamente Focus Pod.", time: "há 3h", type: "warning", read: true },
  { id: "n5", title: "Relatório mensal pronto", description: "Resumo de Agosto disponível para download.", time: "ontem", type: "info", read: true },
];

export function amenityLabel(a: RoomAmenity): string {
  return {
    wifi: "Wi-Fi de alta velocidade",
    screen: "Tela 4K",
    whiteboard: "Quadro branco",
    coffee: "Café & água",
    ac: "Climatização",
    phone: "Telefone",
    videoconf: "Videoconferência",
  }[a];
}
