import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, CalendarCheck, Clock, TrendingUp, Goal, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="bg-card rounded-2xl border border-border p-5 sm:p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
          <p className="text-3xl sm:text-4xl font-extrabold mt-2 font-heading">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, b] = await Promise.all([
          base44.entities.Court.list(),
          base44.entities.Booking.list("-created_date", 50),
        ]);
        setCourts(c);
        setBookings(b);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
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

  const pending = bookings.filter((b) => b.status === "pendente").length;
  const confirmed = bookings.filter((b) => b.status === "confirmado").length;
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden h-44 sm:h-56 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1556056504-5c3209c065a7?auto=format&fit=crop&w=1600&q=80"
          alt="Campo de futebol"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" />
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[hsl(var(--accent))] text-black px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest">Pro</span>
            <span className="text-white/80 text-xs font-medium uppercase tracking-widest">Painel do Gestor</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-shadow-strong">Sua operação esportiva em um só lugar</h1>
          <p className="text-white/90 mt-1 text-sm sm:text-base text-shadow-strong">Gerencie quadras, horários e agendamentos no FechaOnze.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={MapPin} label="Quadras" value={courts.length} color="bg-primary" to="/courts" />
        <StatCard icon={CalendarCheck} label="Agendamentos" value={bookings.length} color="bg-blue-500" to="/bookings" />
        <StatCard icon={Clock} label="Pendentes" value={pending} color="bg-amber-500" to="/bookings" />
        <StatCard icon={TrendingUp} label="Confirmados" value={confirmed} color="bg-emerald-500" to="/bookings" />
      </div>

      {/* Recent bookings */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Goal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base sm:text-lg">Últimos Agendamentos</h2>
              <p className="text-xs text-muted-foreground">Atualizados em tempo real</p>
            </div>
          </div>
          <Link to="/bookings" className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Nenhum agendamento ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-6 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{b.client_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {b.court_name} • {b.date} • {b.start_time} - {b.end_time}
                  </p>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                  b.status === "confirmado" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" :
                  b.status === "cancelado" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" :
                  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}