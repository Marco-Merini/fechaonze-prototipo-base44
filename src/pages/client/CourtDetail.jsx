import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Clock, ArrowLeft, CalendarCheck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const WEEKDAY_BY_JS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const WEEKDAY_LABEL = {
  domingo: "Domingo",
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
};
const WEEKDAY_ORDER = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 };

const todayStr = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const weekdayOf = (dateStr) => {
  const d = new Date(dateStr + "T12:00:00");
  return WEEKDAY_BY_JS[d.getDay()];
};

export default function CourtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [court, setCourt] = useState(null);
  const [slots, setSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ client_name: "", client_phone: "", client_email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([
          base44.entities.Court.get(id),
          base44.entities.TimeSlot.filter({ court_id: id, is_available: true }),
        ]);
        setCourt(c);
        setSlots(
          s.sort(
            (a, b) =>
              (WEEKDAY_ORDER[a.weekday] ?? 99) - (WEEKDAY_ORDER[b.weekday] ?? 99) ||
              a.start_time.localeCompare(b.start_time)
          )
        );
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [id]);

  // Busca reservas já existentes para a data selecionada (para não mostrar horários ocupados)
  useEffect(() => {
    if (!selectedDate) return;
    let active = true;
    (async () => {
      try {
        const bks = await base44.entities.Booking.filter({ court_id: id, date: selectedDate });
        if (active) {
          setBookedTimes(bks.filter((b) => b.status !== "cancelado").map((b) => b.start_time));
        }
      } catch (e) { console.error(e); }
    })();
    return () => { active = false; };
  }, [id, selectedDate]);

  const handleBook = (slot) => {
    setSelectedSlot(slot);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // checagem extra contra agendamento duplicado no mesmo horário/data
      const existing = await base44.entities.Booking.filter({
        court_id: id,
        date: selectedDate,
        start_time: selectedSlot.start_time,
      });
      if (existing.some((b) => b.status !== "cancelado")) {
        toast({ title: "Horário ocupado", description: "Esse horário já foi reservado.", variant: "destructive" });
        setSaving(false);
        return;
      }
      await base44.entities.Booking.create({
        court_id: id,
        time_slot_id: selectedSlot.id,
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email,
        date: selectedDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        court_name: court.name,
        status: "pendente",
      });
      toast({ title: "Agendamento realizado!", description: "O dono da quadra entrará em contato para confirmar." });
      setDialogOpen(false);
      setForm({ client_name: "", client_phone: "", client_email: "" });
      setBookedTimes((prev) => [...prev, selectedSlot.start_time]);
    } catch (e) {
      toast({ title: "Erro ao agendar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Quadra não encontrada</p>
        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/explore")}>Voltar</Button>
      </div>
    );
  }

  const targetWeekday = weekdayOf(selectedDate);
  const daySlots = slots.filter((s) => s.weekday === targetWeekday);
  const availableSlots = daySlots.filter((s) => !bookedTimes.includes(s.start_time));

  const formattedDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("/explore")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Voltar para busca
      </button>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-48 sm:h-64 bg-gradient-to-br from-primary/10 to-primary/5 relative">
          {court.photo_url ? (
            <img src={court.photo_url} alt={court.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <MapPin className="w-20 h-20 text-primary/15" />
            </div>
          )}
          <span className="absolute top-4 left-4 bg-card/90 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium text-primary">
            {court.sport_type}
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">{court.name}</h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {court.address}, {court.city}
          </p>
          {court.description && <p className="text-muted-foreground mt-3">{court.description}</p>}
          <p className="text-primary font-bold text-2xl mt-4">
            R$ {court.price_per_hour?.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/hora</span>
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Horários Disponíveis
        </h2>

        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 mb-4">
          <Label className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" /> Escolha a data
          </Label>
          <Input
            type="date"
            value={selectedDate}
            min={todayStr()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl max-w-xs"
          />
          <p className="text-sm text-muted-foreground mt-2 capitalize">{formattedDate} • {WEEKDAY_LABEL[targetWeekday]}</p>
        </div>

        {daySlots.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum horário cadastrado para {WEEKDAY_LABEL[targetWeekday].toLowerCase()}</p>
            <Button variant="outline" className="mt-4 rounded-xl" onClick={() => navigate("/explore")}>
              Ver outras quadras
            </Button>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Todos os horários deste dia já estão reservados</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border">
            <div className="p-4 flex flex-wrap gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleBook(slot)}
                  className="px-4 py-2.5 rounded-xl border border-primary/20 text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all duration-200 hover:shadow-sm"
                >
                  {slot.start_time} — {slot.end_time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Confirmar Agendamento</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="bg-muted/50 rounded-xl p-4 mb-2">
              <p className="font-medium">{court.name}</p>
              <p className="text-sm text-muted-foreground capitalize">{formattedDate} • {selectedSlot.start_time} — {selectedSlot.end_time}</p>
              <p className="text-primary font-bold mt-1">R$ {court.price_per_hour?.toFixed(2)}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Seu nome *</Label>
              <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Seu WhatsApp *</Label>
              <Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} placeholder="5511999999999" required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>E-mail (opcional)</Label>
              <Input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Agendando..." : "Agendar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}