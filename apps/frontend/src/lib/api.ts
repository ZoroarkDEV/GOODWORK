const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Rooms ---
export interface ApiRoom {
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
}

export function getRooms(): Promise<ApiRoom[]> {
  return fetchJson<ApiRoom[]>('/rooms');
}

export function getRoom(id: string): Promise<ApiRoom> {
  return fetchJson<ApiRoom>(`/rooms/${id}`);
}

export function createRoom(data: Partial<ApiRoom>): Promise<ApiRoom> {
  return fetchJson<ApiRoom>('/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRoom(id: string, data: Partial<ApiRoom>): Promise<ApiRoom> {
  return fetchJson<ApiRoom>(`/rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteRoom(id: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/rooms/${id}`, {
    method: 'DELETE',
  });
}

export function checkAvailability(roomId: string, startDate: string, endDate: string): Promise<{ isAvailable: boolean }> {
  return fetchJson<{ isAvailable: boolean }>(`/rooms/${roomId}/availability?startDate=${startDate}&endDate=${endDate}`);
}

// --- Bookings ---
export interface ApiBooking {
  id: string;
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'canceled' | 'finished';
  notes: string | null;
  created_at?: string;
}

export function getBookings(): Promise<ApiBooking[]> {
  return fetchJson<ApiBooking[]>('/bookings');
}

export function createBooking(data: {
  room_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}): Promise<ApiBooking> {
  return fetchJson<ApiBooking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBooking(id: string, data: Partial<ApiBooking>): Promise<ApiBooking> {
  return fetchJson<ApiBooking>(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function cancelBooking(id: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/bookings/${id}`, {
    method: 'DELETE',
  });
}

// --- Dashboard KPIs ---
export interface DashboardKpis {
  kpis: {
    occupancyRate: number;
    todaysTotal: number;
    todaysConfirmed: number;
    todaysPending: number;
    monthlyRevenue: number;
    cancellationRate: number;
    totalRooms: number;
  };
  weeklyOccupancy: Array<{
    day: string;
    ocupacao: number;
    reservas: number;
  }>;
  criticalSupplies: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
    minStock: number;
    unit: string;
  }>;
  todaysBookings: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    room_id: string;
    user_id: string;
    notes: string | null;
  }>;
}

export function getDashboardKpis(): Promise<DashboardKpis> {
  return fetchJson<DashboardKpis>('/dashboard/kpis');
}
