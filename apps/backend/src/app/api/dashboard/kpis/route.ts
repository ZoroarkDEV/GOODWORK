import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total active rooms
    const totalRoomsResult = await query(
      "SELECT COUNT(*) as count FROM rooms WHERE active = TRUE;"
    );
    const totalRooms = parseInt(totalRoomsResult.rows[0]?.count ?? "0");

    // Today's bookings
    const todaysBookingsResult = await query(
      "SELECT id, status FROM bookings WHERE start_time >= $1 AND start_time < $2;",
      [todayStart, todayEnd]
    );
    const todaysBookings = todaysBookingsResult.rows;
    const todaysConfirmed = todaysBookings.filter((b) => b.status === "confirmed").length;
    const todaysPending = todaysBookings.filter((b) => b.status === "pending").length;

    // Week's bookings for occupancy calculation
    const weekBookingsResult = await query(
      "SELECT start_time, end_time, status FROM bookings WHERE start_time >= $1 AND status IN ('confirmed', 'pending');",
      [weekStart]
    );

    // Calculate occupancy: total booked hours / (rooms * 12 hours * 7 days)
    const totalBookedHours = weekBookingsResult.rows.reduce((acc, b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

    const totalAvailableHours = totalRooms * 12 * 7;
    const occupancyRate = totalAvailableHours > 0
      ? Math.round((totalBookedHours / totalAvailableHours) * 100)
      : 0;

    // Monthly revenue
    const monthBookingsResult = await query(
      "SELECT total_price, status FROM bookings WHERE start_time >= $1 AND status IN ('confirmed', 'finished');",
      [monthStart]
    );

    const monthlyRevenue = monthBookingsResult.rows.reduce(
      (acc, b) => acc + (parseFloat(b.total_price) ?? 0), 0
    );

    // Cancellation rate (last 30 days)
    const allRecentResult = await query(
      "SELECT status FROM bookings WHERE start_time >= $1;",
      [weekStart]
    );

    const totalRecent = allRecentResult.rows.length;
    const canceledCount = allRecentResult.rows.filter((b) => b.status === "canceled").length;
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

      const dayBookingsResult = await query(
        "SELECT start_time, end_time FROM bookings WHERE start_time >= $1 AND start_time < $2 AND status IN ('confirmed', 'pending');",
        [dayStart, dayEnd]
      );

      const dayHours = dayBookingsResult.rows.reduce((acc, b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0);

      const dayOccupancy = totalRooms > 0
        ? Math.round((dayHours / (totalRooms * 12)) * 100)
        : 0;

      weeklyOccupancy.push({
        day: dayNames[dayDate.getDay()],
        ocupacao: Math.min(100, dayOccupancy),
        reservas: dayBookingsResult.rows.length,
      });
    }

    // Critical supplies
    const suppliesResult = await query(
      "SELECT id, name, category, quantity, min_threshold, unit FROM supplies WHERE active = TRUE;"
    );

    const criticalSupplies = suppliesResult.rows
      .filter((s) => s.quantity < s.min_threshold)
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        stock: s.quantity,
        minStock: s.min_threshold,
        unit: s.unit,
      }));

    // Recent bookings for today's list
    const recentTodayResult = await query(
      "SELECT id, start_time, end_time, status, room_id, user_id, notes FROM bookings WHERE start_time >= $1 AND start_time < $2 ORDER BY start_time ASC LIMIT 10;",
      [todayStart, todayEnd]
    );

    return NextResponse.json({
      kpis: {
        occupancyRate,
        todaysTotal: todaysBookings.length,
        todaysConfirmed,
        todaysPending,
        monthlyRevenue,
        cancellationRate,
        totalRooms,
      },
      weeklyOccupancy,
      criticalSupplies,
      todaysBookings: recentTodayResult.rows,
    });
  } catch (error: any) {
    console.error("Dashboard KPIs error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do dashboard." },
      { status: 500 }
    );
  }
}