/**
 * Mock data for GOODWORK presentation.
 * Used as fallback when API is not available.
 */

// Types compatible with API interfaces
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
  // Extra fields for UI
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
// ROOMS - Salas de reunião
// ============================================
export const mockRooms: MockRoom[] = [
  {
    id: "room-001",
    name: "Sala Aurora",
    description: "Sala premium com vista panorâmica, ideal para reuniões executivas e apresentações de alto impacto.",
    capacity: 12,
    hourly_rate: 180,
    image_url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
    amenities: ["Projetor 4K", "Videoconferência", "Quadro branco", "Café premium", "Ar condicionado"],
    active: true,
    floor: "1º andar",
    pricePerHour: 180,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
  {
    id: "room-002",
    name: "Sala Boreal",
    description: "Espaço criativo com iluminação natural, perfeito para brainstorming e workshops colaborativos.",
    capacity: 8,
    hourly_rate: 120,
    image_url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    amenities: ["TV 65\"", "Quadro interativo", "Sofás", "Café", "Janela panorâmica"],
    active: true,
    floor: "2º andar",
    pricePerHour: 120,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
  {
    id: "room-003",
    name: "Sala Cosmos",
    description: "Sala ampla para eventos e treinamentos, com tecnologia de ponta e conforto acústico.",
    capacity: 24,
    hourly_rate: 250,
    image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
    amenities: ["Sistema de som", "Palco", "Microfone sem fio", "Iluminação LED", "Catering"],
    active: false,
    floor: "Térreo",
    pricePerHour: 250,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
    isAvailable: false,
  },
  {
    id: "room-004",
    name: "Sala Diamante",
    description: "Sala VIP com acabamento luxuoso, ideal para reuniões com clientes e parceiros estratégicos.",
    capacity: 6,
    hourly_rate: 300,
    image_url: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80",
    amenities: ["Tela OLED 8K", "Sistema de som premium", "Minibar", "Acesso exclusivo", "Estacionamento VIP"],
    active: true,
    floor: "3º andar",
    pricePerHour: 300,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
  {
    id: "room-005",
    name: "Sala Estrela",
    description: "Sala versátil com configuração flexível, adaptável para diferentes formatos de reunião.",
    capacity: 16,
    hourly_rate: 150,
    image_url: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
    amenities: ["Projetor", "Móveis modulares", "Café", "Wi-Fi 6", "Ar condicionado"],
    active: true,
    floor: "1º andar",
    pricePerHour: 150,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
  {
    id: "room-006",
    name: "Sala Futuro",
    description: "Espaço high-tech com realidade virtual e ferramentas de colaboração digital avançadas.",
    capacity: 10,
    hourly_rate: 200,
    image_url: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80",
    amenities: ["VR Headset", "Holograma", "Digital Whiteboard", "Gravação 360°", "Transmissão ao vivo"],
    active: true,
    floor: "2º andar",
    pricePerHour: 200,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80",
    isAvailable: true,
  },
];

// ============================================
// SUPPLIES - Suprimentos
// ============================================
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

// ============================================
// BOOKINGS - Reservas de hoje
// ============================================
const today = new Date();
const todayStr = today.toISOString().split("T")[0];

export const mockTodaysBookings: MockBooking[] = [
  {
    id: "book-001",
    room_id: "room-001",
    user_id: "user-001",
    start_time: `${todayStr}T09:00:00`,
    end_time: `${todayStr}T10:30:00`,
    status: "confirmed",
    notes: "Apresentação para investidores",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "book-002",
    room_id: "room-002",
    user_id: "user-002",
    start_time: `${todayStr}T11:00:00`,
    end_time: `${todayStr}T12:00:00`,
    status: "confirmed",
    notes: "Brainstorming equipe de design",
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "book-003",
    room_id: "room-004",
    user_id: "user-003",
    start_time: `${todayStr}T14:00:00`,
    end_time: `${todayStr}T16:00:00`,
    status: "pending",
    notes: "Reunião com cliente VIP",
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "book-004",
    room_id: "room-005",
    user_id: "user-004",
    start_time: `${todayStr}T16:30:00`,
    end_time: `${todayStr}T18:00:00`,
    status: "confirmed",
    notes: "Treinamento onboarding",
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

// ============================================
// KPIs - Indicadores do dashboard
// ============================================
export const mockKpis: MockKpis = {
  occupancyRate: 78,
  totalRooms: mockRooms.length,
  todaysTotal: mockTodaysBookings.length,
  todaysConfirmed: mockTodaysBookings.filter((b) => b.status === "confirmed").length,
  todaysPending: mockTodaysBookings.filter((b) => b.status === "pending").length,
  monthlyRevenue: 459400,
  cancellationRate: 3.1,
};

// ============================================
// WEEKLY OCCUPATION - Ocupação semanal
// ============================================
export const mockWeeklyOccupancy: MockWeeklyData[] = [
  { day: "Seg", ocupacao: 65, reservas: 12 },
  { day: "Ter", ocupacao: 72, reservas: 15 },
  { day: "Qua", ocupacao: 85, reservas: 18 },
  { day: "Qui", ocupacao: 78, reservas: 14 },
  { day: "Sex", ocupacao: 90, reservas: 22 },
  { day: "Sáb", ocupacao: 45, reservas: 8 },
  { day: "Dom", ocupacao: 20, reservas: 3 },
];

// ============================================
// REVENUE DATA - Receita mensal vs meta
// ============================================
export const mockRevenueData: MockRevenueData[] = [
  { month: "Jan", receita: 320000, meta: 300000 },
  { month: "Fev", receita: 280000, meta: 300000 },
  { month: "Mar", receita: 350000, meta: 320000 },
  { month: "Abr", receita: 380000, meta: 350000 },
  { month: "Mai", receita: 420000, meta: 380000 },
  { month: "Jun", receita: 459400, meta: 400000 },
];

// ============================================
// CRITICAL SUPPLIES - Suprimentos críticos
// ============================================
export const mockCriticalSupplies: MockSupply[] = mockSupplies.filter(
  (s) => s.stock < s.minStock
);

// ============================================
// ANALYTICS DATA - Dados para gráficos
// ============================================
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

// ============================================
// NOTIFICATIONS - Notificações
// ============================================
export const mockNotifications = [
  {
    id: "notif-001",
    title: "Reserva confirmada",
    message: "Sala Aurora reservada para 09:00",
    type: "success" as const,
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif-002",
    title: "Suprimento crítico",
    message: "Café em pó abaixo do estoque mínimo",
    type: "warning" as const,
    read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "notif-003",
    title: "Manutenção agendada",
    message: "Sala Cosmos em manutenção programada",
    type: "info" as const,
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ============================================
// JOB TITLES - Cargos
// ============================================
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