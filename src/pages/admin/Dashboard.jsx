import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, CalendarCheck, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 font-heading">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Painel</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MapPin} label="Quadras" value={courts.length} color="bg-primary" to="/courts" />
        <StatCard icon={CalendarCheck} label="Agendamentos" value={bookings.length} color="bg-blue-500" to="/bookings" />
        <StatCard icon={Clock} label="Pendentes" value={pending} color="bg-amber-500" to="/bookings" />
        <StatCard icon={TrendingUp} label="Confirmados" value={confirmed} color="bg-emerald-500" to="/bookings" />
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="font-heading font-semibold text-lg">Últimos Agendamentos</h2>
        </div>
        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Nenhum agendamento ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.client_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.court_name} • {b.date} • {b.start_time} - {b.end_time}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  b.status === "confirmado" ? "bg-emerald-100 text-emerald-700" :
                  b.status === "cancelado" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
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