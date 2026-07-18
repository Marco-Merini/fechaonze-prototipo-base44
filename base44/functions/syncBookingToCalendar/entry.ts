import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const bookingId = body.booking_id;
    if (!bookingId) return Response.json({ error: "booking_id required" }, { status: 400 });

    const booking = await base44.asServiceRole.entities.Booking.get(bookingId);
    if (!booking) return Response.json({ error: "booking not found" }, { status: 404 });
    if (booking.calendar_event_id) return Response.json({ skipped: "already synced" });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("googlecalendar");

    // Brasília (UTC-3, sem horário de verão)
    const start = new Date(`${booking.date}T${booking.start_time}:00-03:00`);
    const end = new Date(`${booking.date}T${booking.end_time}:00-03:00`);

    const event = {
      summary: `Reserva FechaOnze — ${booking.court_name}`,
      description: `Cliente: ${booking.client_name}\nTelefone: ${booking.client_phone}\nStatus: ${booking.status}`,
      start: { dateTime: start.toISOString(), timeZone: "America/Sao_Paulo" },
      end: { dateTime: end.toISOString(), timeZone: "America/Sao_Paulo" },
    };

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || "calendar api error" }, { status: 502 });

    await base44.asServiceRole.entities.Booking.update(bookingId, { calendar_event_id: data.id });
    return Response.json({ synced: true, event_id: data.id, html_link: data.htmlLink });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});