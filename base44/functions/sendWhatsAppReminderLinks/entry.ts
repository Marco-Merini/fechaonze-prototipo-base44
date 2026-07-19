import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Normaliza o telefone para o formato internacional usado pelo wa.me (ex: 5511999999999)
function normalizePhone(raw) {
  let d = (raw || "").replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("0")) d = d.slice(1);
  // Se nao tem codigo de pais (10 ou 11 digitos BR), adiciona 55
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // "Amanha" no fuso de Brasilia
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const tomorrowStr = fmt.format(tomorrow);

    const bookings = await base44.asServiceRole.entities.Booking.filter({ date: tomorrowStr });
    const due = bookings.filter(
      (b) => b.status === "confirmado" && b.client_phone && !b.whatsapp_reminder_sent
    );

    if (due.length === 0) {
      return Response.json({ date: tomorrowStr, due: 0, emailed: 0, links: [] });
    }

    const links = due.map((b) => {
      const phone = normalizePhone(b.client_phone);
      const msg =
        `Olá ${b.client_name}! Lembrando da sua reserva amanhã no ${b.court_name}, ` +
        `das ${b.start_time} às ${b.end_time}. Te esperamos! — FechaOnze`;
      const url = phone
        ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      return {
        id: b.id,
        name: b.client_name,
        court: b.court_name,
        time: `${b.start_time}-${b.end_time}`,
        url,
      };
    });

    // Envia um digest por e-mail aos administradores/donos com os links prontos
    let emailed = 0;
    try {
      const users = await base44.asServiceRole.entities.User.list();
      const admins = users.filter((u) => u.role === "admin" || u.account_type === "dono");
      const body =
        `Reservas confirmadas para amanhã (${tomorrowStr}).\n\n` +
        links
          .map((l) => `• ${l.name} — ${l.court} (${l.time})\n  ${l.url}`)
          .join("\n\n") +
        `\n\nAbra cada link e toque em enviar para lembrar o cliente pelo WhatsApp.`;
      for (const a of admins) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: a.email,
            subject: `Lembretes de WhatsApp — reservas de amanhã`,
            body,
          });
          emailed++;
        } catch (e) {
          // ignora falha individual de envio
        }
      }
    } catch (e) {
      // sem admins, segue marcando os links como gerados
    }

    for (const b of due) {
      await base44.asServiceRole.entities.Booking.update(b.id, {
        whatsapp_reminder_sent: true,
      });
    }

    return Response.json({ date: tomorrowStr, due: due.length, emailed, links });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});