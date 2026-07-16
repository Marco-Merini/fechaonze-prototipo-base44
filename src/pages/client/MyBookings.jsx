import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarCheck, MapPin } from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Booking.list("-created_date", 50);
        setBookings(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Meus Agendamentos</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas reservas</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <CalendarCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Nenhum agendamento</h3>
          <p className="text-muted-foreground">Seus agendamentos aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-semibold text-lg">{b.court_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    📅 {b.date} &nbsp;•&nbsp; 🕐 {b.start_time} — {b.end_time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                  b.status === "confirmado" ? "bg-emerald-100 text-emerald-700" :
                  b.status === "cancelado" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}