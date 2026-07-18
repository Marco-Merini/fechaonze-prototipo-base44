import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Data de amanhã no formato YYYY-MM-DD
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${yyyy}-${mm}-${dd}`;

    // Busca reservas de amanhã (não canceladas e sem lembrete enviado)
    const bookings = await base44.asServiceRole.entities.Booking.filter({ date: tomorrowStr });
    const due = bookings.filter(
      (b) => b.status !== "cancelado" && b.client_email && !b.reminder_sent
    );

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const b of due) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: b.client_email,
          subject: `Lembrete: sua reserva amanhã no ${b.court_name}`,
          body:
            `Olá ${b.client_name},\n\n` +
            `Este é um lembrete da sua reserva no FechaOnze:\n\n` +
            `Quadra: ${b.court_name}\n` +
            `Data: ${b.date}\n` +
            `Horário: ${b.start_time} - ${b.end_time}\n\n` +
            `Bom jogo!\n\n` +
            `Equipe FechaOnze`
        });
        await base44.asServiceRole.entities.Booking.update(b.id, { reminder_sent: true });
        sent++;
      } catch (err) {
        failed++;
        errors.push({ id: b.id, email: b.client_email, error: err.message });
      }
    }

    return Response.json({ date: tomorrowStr, total_due: due.length, sent, failed, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});