import {
  mockRooms,
  mockSupplies,
  mockKpis,
  mockWeeklyOccupancy,
  mockCriticalSupplies,
  mockTodaysBookings,
  mockNotifications,
  mockJobTitles,
  type MockRoom,
  type MockSupply,
} from '@/mocks/data';

const API_BASE = '/api';
const USE_MOCK_FALLBACK = true; // Enable mock fallback when API is unavailable

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (error) {
    // If API fails and mock fallback is enabled, throw to trigger mock in components
    if (USE_MOCK_FALLBACK) {
      throw error; // Let components handle with mock fallback
    }
    throw error;
  }
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

// --- Notifications ---
export interface ApiNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: any;
  created_at: string;
}

export function getNotifications(userId: string): Promise<ApiNotification[]> {
  return fetchJson<ApiNotification[]>(`/notifications?user_id=${userId}`);
}

export function markNotificationRead(id: string): Promise<ApiNotification> {
  return fetchJson<ApiNotification>(`/notifications`, {
    method: 'PATCH',
    body: JSON.stringify({ id, read: true }),
  });
}

export function markAllNotificationsRead(ids: string[]): Promise<void> {
  return fetchJson<void>(`/notifications`, {
    method: 'PATCH',
    body: JSON.stringify({ ids, read: true }),
  });
}

// --- Job Titles ---
export interface ApiJobTitle {
  id: string;
  name: string;
  category: string;
  active: boolean;
}

export function getJobTitles(): Promise<ApiJobTitle[]> {
  return fetchJson<ApiJobTitle[]>('/job-titles');
}

// --- User Profile ---
export function updateUserProfile(id: string, data: { job_title?: string; name?: string; phone?: string }): Promise<any> {
  return fetchJson<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
