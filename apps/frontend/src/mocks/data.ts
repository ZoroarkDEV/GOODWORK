/**
 * Mock data for GOODWORK presentation.
 * Used as fallback when API is not available.
 * Consolidated from mock-data.ts and data.ts
 */

// ============================================
// Types
// ============================================

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

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  user: string;
  avatar: string;
  start: string;
  end: string;
  date: string;
  attendees: number;
  status: "confirmed" | "pending" | "cancelled";
}

export interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  lastMovement: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "warning" | "success" | "alert";
  read: boolean;
}

// Compatibility types for API-based routes
export interface MockRoom {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  hourly_rate: number;
  image_url: string | null;
  amenities: string[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
  floor?: string;
  pricePerHour?: number;
  rating?: number;
  image?: string;
  isAvailable?: boolean;
}

export interface MockSupply {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  category: string;
}

export interface MockBooking {
  id: string;
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at?: string;
  total_price?: number;
}

export interface MockKpis {
  occupancyRate: number;
  totalRooms: number;
  todaysTotal: number;
  todaysConfirmed: number;
  todaysPending: number;
  monthlyRevenue: number;
  cancellationRate: number;
}

export interface MockWeeklyData {
  day: string;
  ocupacao: number;
  reservas: number;
}

export interface MockRevenueData {
  month: string;
  receita: number;
  meta: number;
}

// ============================================
// ROOMS
// ============================================
export const rooms: Room[] = [
  {
    id: "executive-suite",
    name: "Executive Suite",
    capacity: 12,
    pricePerHour: 180,
    amenities: ["wifi", "screen", "whiteboard", "coffee", "ac", "videoconf"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    description: "Sala executiva com vista panorâmica, mesa de mogno e equipamento de videoconferência 4K.",
    floor: "8º andar",
    rating: 4.9,
  },
  {
    id: "creative-lab",
    name: "Creative Lab",
    capacity: 8,
    pricePerHour: 110,
    amenities: ["wifi", "whiteboard", "coffee", "ac"],
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80",
    description: "Espaço dinâmico com paredes whiteboard, mobiliário modular e iluminação natural.",
    floor: "5º andar",
    rating: 4.8,
  },
  {
    id: "focus-pod",
    name: "Focus Pod",
    capacity: 4,
    pricePerHour: 60,
    amenities: ["wifi", "screen", "ac", "phone"],
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1600&q=80",
    description: "Cabine acústica perfeita para chamadas estratégicas e trabalho concentrado.",
    floor: "3º andar",
    rating: 4.7,
  },
  {
    id: "boardroom-arctic",
    name: "Boardroom Arctic",
    capacity: 16,
    pricePerHour: 240,
    amenities: ["wifi", "screen", "videoconf", "coffee", "ac", "phone"],
    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1600&q=80",
    description: "Boardroom premium com sistema Dolby, mesa em granito e cadeiras Herman Miller.",
    floor: "10º andar",
    rating: 5.0,
  },
  {
    id: "studio-loft",
    name: "Studio Loft",
    capacity: 10,
    pricePerHour: 140,
    amenities: ["wifi", "whiteboard", "coffee", "ac", "screen"],
    image: "https://images.unsplash.com/photo-1604328471151-b52226907017?auto=format&fit=crop&w=1600&q=80",
    description: "Loft industrial com pé direito alto, ideal para workshops e dinâmicas em grupo.",
    floor: "2º andar",
    rating: 4.8,
  },
  {
    id: "garden-room",
    name: "Garden Room",
    capacity: 6,
    pricePerHour: 90,
    amenities: ["wifi", "coffee", "ac"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    description: "Sala biofílica com jardim vertical e luz natural — perfeita para reuniões leves.",
    floor: "1º andar",
    rating: 4.6,
  },
];

// ============================================
// BOOKINGS
// ============================================
const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export const bookings: Booking[] = [
  { id: "b1", roomId: "executive-suite", roomName: "Executive Suite", user: "Marina Costa", avatar: "MC", start: "09:00", end: "10:30", date: today, attendees: 8, status: "confirmed" },
  { id: "b2", roomId: "creative-lab", roomName: "Creative Lab", user: "Diego Ramos", avatar: "DR", start: "11:00", end: "12:00", date: today, attendees: 5, status: "confirmed" },
  { id: "b3", roomId: "focus-pod", roomName: "Focus Pod", user: "Júlia Tavares", avatar: "JT", start: "14:00", end: "15:30", date: today, attendees: 2, status: "pending" },
  { id: "b4", roomId: "boardroom-arctic", roomName: "Boardroom Arctic", user: "Eduardo Lima", avatar: "EL", start: "16:00", end: "18:00", date: today, attendees: 12, status: "confirmed" },
  { id: "b5", roomId: "studio-loft", roomName: "Studio Loft", user: "Renata Sá", avatar: "RS", start: "10:00", end: "13:00", date: tomorrow, attendees: 10, status: "confirmed" },
];

// ============================================
// SUPPLIES
// ============================================
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

// ============================================
// ANALYTICS DATA
// ============================================
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

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications: Notification[] = [
  { id: "n1", title: "Estoque crítico de café", description: "Apenas 18 cápsulas restantes — abaixo do mínimo de 50.", time: "há 4 min", type: "alert", read: false },
  { id: "n2", title: "Nova reserva confirmada", description: "Marina Costa reservou Executive Suite às 09:00.", time: "há 22 min", type: "success", read: false },
  { id: "n3", title: "Atualização de sala", description: "Creative Lab teve manutenção concluída.", time: "há 1h", type: "info", read: true },
  { id: "n4", title: "Conflito de agenda evitado", description: "Sistema reagendou automaticamente Focus Pod.", time: "há 3h", type: "warning", read: true },
  { id: "n5", title: "Relatório mensal pronto", description: "Resumo de Agosto disponível para download.", time: "ontem", type: "info", read: true },
];

// ============================================
// KPIs
// ============================================
export const mockRooms: MockRoom[] = [
  {
    id: "room-001", name: "Sala Aurora", description: "Sala premium com vista panorâmica.",
    capacity: 12, hourly_rate: 180, image_url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
    amenities: ["Projetor 4K", "Videoconferência", "Quadro branco", "Café premium", "Ar condicionado"],
    active: true, floor: "1º andar", pricePerHour: 180, rating: 4.9,
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80", isAvailable: true,
  },
  {
    id: "room-002", name: "Sala Boreal", description: "Espaço criativo com iluminação natural.",
    capacity: 8, hourly_rate: 120, image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    amenities: ["TV 65\"", "Quadro interativo", "Sofás", "Café", "Janela panorâmica"],
    active: true, floor: "2º andar", pricePerHour: 120, rating: 4.7,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80", isAvailable: true,
  },
  {
    id: "room-003", name: "Sala Cosmos", description: "Sala ampla para eventos e treinamentos.",
    capacity: 24, hourly_rate: 250, image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
    amenities: ["Sistema de som", "Palco", "Microfone sem fio", "Iluminação LED", "Catering"],
    active: false, floor: "Térreo", pricePerHour: 250, rating: 4.8,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80", isAvailable: false,
  },
  {
    id: "room-004", name: "Sala Diamante", description: "Sala VIP com acabamento luxuoso.",
    capacity: 6, hourly_rate: 300, image_url: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80",
    amenities: ["Tela OLED 8K", "Sistema de som premium", "Minibar", "Acesso exclusivo", "Estacionamento VIP"],
    active: true, floor: "3º andar", pricePerHour: 300, rating: 5.0,
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80", isAvailable: true,
  },
  {
    id: "room-005", name: "Sala Estrela", description: "Sala versátil com configuração flexível.",
    capacity: 16, hourly_rate: 150, image_url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
    amenities: ["Projetor", "Móveis modulares", "Café", "Wi-Fi 6", "Ar condicionado"],
    active: true, floor: "1º andar", pricePerHour: 150, rating: 4.6,
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80", isAvailable: true,
  },
  {
    id: "room-006", name: "Sala Futuro", description: "Espaço high-tech com realidade virtual.",
    capacity: 10, hourly_rate: 200, image_url: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80",
    amenities: ["VR Headset", "Holograma", "Digital Whiteboard", "Gravação 360°", "Transmissão ao vivo"],
    active: true, floor: "2º andar", pricePerHour: 200, rating: 4.9,
    image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80", isAvailable: true,
  },
];

export const mockSupplies: MockSupply[] = [
  { id: "sup-001", name: "Papel A4 (resma)", stock: 15, minStock: 20, unit: "resmas", category: "Escritório" },
  { id: "sup-002", name: "Canetas esferográficas", stock: 45, minStock: 30, unit: "unidades", category: "Escritório" },
  { id: "sup-003", name: "Marcadores quadro branco", stock: 8, minStock: 15, unit: "unidades", category: "Escritório" },
  { id: "sup-004", name: "Café em pó", stock: 3, minStock: 10, unit: "kg", category: "Copa" },
  { id: "sup-005", name: "Açúcar", stock: 2, minStock: 5, unit: "kg", category: "Copa" },
  { id: "sup-006", name: "Copos descartáveis", stock: 150, minStock: 200, unit: "unidades", category: "Copa" },
  { id: "sup-007", name: "Água mineral", stock: 12, minStock: 24, unit: "garrafas", category: "Copa" },
  { id: "sup-008", name: "Guardanapos", stock: 50, minStock: 100, unit: "unidades", category: "Copa" },
  { id: "sup-009", name: "Baterias AA", stock: 4, minStock: 12, unit: "unidades", category: "Eletrônicos" },
  { id: "sup-010", name: "Cabos HDMI", stock: 6, minStock: 8, unit: "unidades", category: "Eletrônicos" },
];

const todayStr = new Date().toISOString().split("T")[0];

export const mockTodaysBookings: MockBooking[] = [
  { id: "book-001", room_id: "room-001", user_id: "user-001", start_time: `${todayStr}T09:00:00`, end_time: `${todayStr}T10:30:00`, status: "confirmed", notes: "Apresentação para investidores", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "book-002", room_id: "room-002", user_id: "user-002", start_time: `${todayStr}T11:00:00`, end_time: `${todayStr}T12:00:00`, status: "confirmed", notes: "Brainstorming equipe de design", created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "book-003", room_id: "room-004", user_id: "user-003", start_time: `${todayStr}T14:00:00`, end_time: `${todayStr}T16:00:00`, status: "pending", notes: "Reunião com cliente VIP", created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: "book-004", room_id: "room-005", user_id: "user-004", start_time: `${todayStr}T16:30:00`, end_time: `${todayStr}T18:00:00`, status: "confirmed", notes: "Treinamento onboarding", created_at: new Date(Date.now() - 259200000).toISOString() },
];

export const mockKpis: MockKpis = {
  occupancyRate: 78,
  totalRooms: mockRooms.length,
  todaysTotal: mockTodaysBookings.length,
  todaysConfirmed: mockTodaysBookings.filter((b) => b.status === "confirmed").length,
  todaysPending: mockTodaysBookings.filter((b) => b.status === "pending").length,
  monthlyRevenue: 459400,
  cancellationRate: 3.1,
};

export const mockWeeklyOccupancy: MockWeeklyData[] = [
  { day: "Seg", ocupacao: 65, reservas: 12 },
  { day: "Ter", ocupacao: 72, reservas: 15 },
  { day: "Qua", ocupacao: 85, reservas: 18 },
  { day: "Qui", ocupacao: 78, reservas: 14 },
  { day: "Sex", ocupacao: 90, reservas: 22 },
  { day: "Sáb", ocupacao: 45, reservas: 8 },
  { day: "Dom", ocupacao: 20, reservas: 3 },
];

export const mockRevenueData: MockRevenueData[] = [
  { month: "Jan", receita: 320000, meta: 300000 },
  { month: "Fev", receita: 280000, meta: 300000 },
  { month: "Mar", receita: 350000, meta: 320000 },
  { month: "Abr", receita: 380000, meta: 350000 },
  { month: "Mai", receita: 420000, meta: 380000 },
  { month: "Jun", receita: 459400, meta: 400000 },
];

export const mockCriticalSupplies: MockSupply[] = mockSupplies.filter((s) => s.stock < s.minStock);

export const mockRoomOccupancyPie = mockRooms.map((room, index) => ({
  name: room.name,
  value: 40 - index * 5 + index * 3,
}));

export const mockBookingsPerDay: MockWeeklyData[] = [
  { day: "Seg", ocupacao: 0, reservas: 12 },
  { day: "Ter", ocupacao: 0, reservas: 15 },
  { day: "Qua", ocupacao: 0, reservas: 18 },
  { day: "Qui", ocupacao: 0, reservas: 14 },
  { day: "Sex", ocupacao: 0, reservas: 22 },
  { day: "Sáb", ocupacao: 0, reservas: 8 },
  { day: "Dom", ocupacao: 0, reservas: 3 },
];

export const mockNotifications = [
  { id: "notif-001", title: "Reserva confirmada", message: "Sala Aurora reservada para 09:00", type: "success" as const, read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "notif-002", title: "Suprimento crítico", message: "Café em pó abaixo do estoque mínimo", type: "warning" as const, read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "notif-003", title: "Manutenção agendada", message: "Sala Cosmos em manutenção programada", type: "info" as const, read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const mockJobTitles = [
  { id: "job-001", name: "Desenvolvedor(a) Full Stack", category: "Tecnologia" },
  { id: "job-002", name: "Designer UX/UI", category: "Design" },
  { id: "job-003", name: "Product Manager", category: "Produto" },
  { id: "job-004", name: "Analista de Dados", category: "Dados" },
  { id: "job-005", name: "Gerente de Projetos", category: "Gestão" },
  { id: "job-006", name: "Analista de Marketing", category: "Marketing" },
  { id: "job-007", name: "Analista Financeiro", category: "Financeiro" },
  { id: "job-008", name: "Recrutador(a)", category: "RH" },
];

// ============================================
// Helpers
// ============================================
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