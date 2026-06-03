function buildGoogleCalendarLink(params: {
  title: string;
  startISO: string;
  endISO: string;
  description: string;
  location: string;
}): string {
  const fmt = (iso: string) =>
    new Date(iso)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace('.000Z', 'Z');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', params.title);
  url.searchParams.set('dates', `${fmt(params.startISO)}/${fmt(params.endISO)}`);
  url.searchParams.set('details', params.description);
  url.searchParams.set('location', params.location);
  url.searchParams.set('ctz', 'America/Sao_Paulo');
  return url.toString();
}

export async function sendBookingConfirmationEmail(params: {
  toEmail: string;
  toName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingId: string;
}) {
  const calendarLink = buildGoogleCalendarLink({
    title: `Reserva GOODWORK — ${params.roomName}`,
    startISO: params.startTime,
    endISO: params.endTime,
    description: `Sala: ${params.roomName}\nID: ${params.bookingId}`,
    location: 'GOODWORK Coworking — São Paulo, SP',
  });

  // Por enquanto apenas loga — integrar Resend depois do pitch
  console.log('[EMAIL] Confirmação de reserva:', {
    to: params.toEmail,
    subject: `✅ Reserva confirmada — ${params.roomName}`,
    calendarLink,
  });

  // Retorna o link para o frontend poder usar direto
  return { calendarLink };
}
