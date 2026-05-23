import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total active rooms
    const { count: totalRooms } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    // Today's bookings
    const { data: todaysBookings } = await supabase
      .from("bookings")
      .select("id, status")
      .gte("start_time", todayStart)
      .lt("start_time", todayEnd);

    const todaysConfirmed = todaysBookings?.filter((b) => b.status === "confirmed").length ?? 0;
    const todaysPending = todaysBookings?.filter((b) => b.status === "pending").length ?? 0;

    // Week's bookings for occupancy calculation
    const { data: weekBookings } = await supabase
      .from("bookings")
      .select("start_time, end_time, status")
      .gte("start_time", weekStart)
      .in("status", ["confirmed", "pending"]);

    // Calculate occupancy: total booked hours / (rooms * 12 hours * 7 days)
    const totalBookedHours = weekBookings?.reduce((acc, b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0) ?? 0;

    const totalAvailableHours = (totalRooms ?? 0) * 12 * 7; // 12h/day * 7 days
    const occupancyRate = totalAvailableHours > 0
      ? Math.round((totalBookedHours / totalAvailableHours) * 100)
      : 0;

    // Monthly revenue
    const { data: monthBookings } = await supabase
      .from("bookings")
      .select("total_price, status")
      .gte("start_time", monthStart)
      .in("status", ["confirmed", "finished"]);

    const monthlyRevenue = monthBookings?.reduce((acc, b) => acc + (b.total_price ?? 0), 0) ?? 0;

    // Cancellation rate (last 30 days)
    const { data: allRecentBookings } = await supabase
      .from("bookings")
      .select("status")
      .gte("start_time", weekStart);

    const totalRecent = allRecentBookings?.length ?? 0;
    const canceledCount = allRecentBookings?.filter((b) => b.status === "canceled").length ?? 0;
    const cancellationRate = totalRecent > 0
      ? Math.round((canceledCount / totalRecent) * 100 * 10) / 10
      : 0;

    // Weekly occupancy per day (for chart)
    const weeklyOccupancy = [];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 6; i >= 0; i--) {
      const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate()).toISOString();
      const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate() + 1).toISOString();

      const { data: dayBookings } = await supabase
        .from("bookings")
        .select("start_time, end_time")
        .gte("start_time", dayStart)
        .lt("start_time", dayEnd)
        .in("status", ["confirmed", "pending"]);

      const dayHours = dayBookings?.reduce((acc, b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0) ?? 0;

      const dayOccupancy = totalRooms && totalRooms > 0
        ? Math.round((dayHours / (totalRooms * 12)) * 100)
        : 0;

      weeklyOccupancy.push({
        day: dayNames[dayDate.getDay()],
        ocupacao: Math.min(100, dayOccupancy),
        reservas: dayBookings?.length ?? 0,
      });
    }

    // Critical supplies
    const { data: allSupplies } = await supabase
      .from("supplies")
      .select("id, name, category, quantity, min_threshold, unit")
      .eq("active", true);

    const criticalSupplies = allSupplies
      ?.filter((s) => s.quantity < s.min_threshold)
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        stock: s.quantity,
        minStock: s.min_threshold,
        unit: s.unit,
      })) ?? [];

    // Recent bookings for today's list
    const { data: recentTodayBookings } = await supabase
      .from("bookings")
      .select("id, start_time, end_time, status, room_id, user_id, notes")
      .gte("start_time", todayStart)
      .lt("start_time", todayEnd)
      .order("start_time", { ascending: true })
      .limit(10);

    return NextResponse.json({
      kpis: {
        occupancyRate,
        todaysTotal: todaysBookings?.length ?? 0,
        todaysConfirmed,
        todaysPending,
        monthlyRevenue,
        cancellationRate,
        totalRooms: totalRooms ?? 0,
      },
      weeklyOccupancy,
      criticalSupplies,
      todaysBookings: recentTodayBookings ?? [],
    });
  } catch (error: any) {
    console.error("Dashboard KPIs error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard." },
      { status: 500 }
    );
  }
}