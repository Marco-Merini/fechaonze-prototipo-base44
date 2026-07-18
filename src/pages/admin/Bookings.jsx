import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarCheck, MessageCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Booking.list("-created_date", 200);
      setBookings(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await base44.entities.Booking.update(id, { status });
      if (status === "cancelado") {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
          await base44.entities.TimeSlot.update(booking.time_slot_id, { is_available: true });
        }
      }
      toast({ title: `Agendamento ${status}!` });
      load();
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const openWhatsApp = (booking) => {
    const phone = booking.client_phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá ${booking.client_name}! Sobre seu agendamento na quadra ${booking.court_name} no dia ${booking.date} das ${booking.start_time} às ${booking.end_time}. Gostaria de confirmar sua reserva!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const filtered = filter === "todos" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie as reservas dos clientes</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="confirmado">Confirmados</SelectItem>
            <SelectItem value="cancelado">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <CalendarCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Nenhum agendamento</h3>
          <p className="text-muted-foreground">Os agendamentos dos clientes aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-card rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-heading font-semibold text-lg">{b.client_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      b.status === "confirmado" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" :
                      b.status === "cancelado" ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300" :
                      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    📍 {b.court_name} &nbsp;•&nbsp; 📅 {b.date} &nbsp;•&nbsp; 🕐 {b.start_time} — {b.end_time}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">📱 {b.client_phone}{b.client_email ? ` • ✉️ ${b.client_email}` : ""}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10" onClick={() => openWhatsApp(b)}>
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                  {b.status === "pendente" && (
                    <>
                      <Button size="sm" className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(b.id, "confirmado")}>
                        <Check className="w-4 h-4" /> Confirmar
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "cancelado")}>
                        <X className="w-4 h-4" /> Cancelar
                      </Button>
                    </>
                  )}
                  {b.status === "confirmado" && (
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(b.id, "cancelado")}>
                      <X className="w-4 h-4" /> Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}