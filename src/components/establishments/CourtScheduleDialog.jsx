import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { WEEKDAYS } from "@/lib/establishments";
import { Trash2, Plus, Copy, Clock } from "lucide-react";

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export default function CourtScheduleDialog({ open, onOpenChange, court, establishment }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState("segunda");
  const [newStart, setNewStart] = useState("08:00");
  const [newEnd, setNewEnd] = useState("09:00");
  const [newPrice, setNewPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    if (!court?.id) return;
    setLoading(true);
    try {
      const data = await base44.entities.CourtAvailability.filter({ court_id: court.id }, "start_time", 500);
      setSlots(data);
    } catch (e) {
      toast({ title: "Erro ao carregar horários", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open && court?.id) {
      load();
      if (establishment?.opening_time) setNewStart(establishment.opening_time);
      if (establishment?.closing_time) setNewEnd(establishment.closing_time);
      if (court.price_per_hour) setNewPrice(String(court.price_per_hour));
    }
  }, [open, court]);

  const daySlots = slots
    .filter((s) => s.weekday === activeDay && !s.specific_date)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  const addSlot = async () => {
    if (timeToMinutes(newEnd) <= timeToMinutes(newStart)) {
      toast({ title: "Horário inválido", description: "O término deve ser depois do início.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CourtAvailability.create({
        court_id: court.id,
        weekday: activeDay,
        start_time: newStart,
        end_time: newEnd,
        price: newPrice ? Number(newPrice) : court.price_per_hour || null,
        status: "available",
      });
      toast({ title: "Horário adicionado!" });
      load();
    } catch (e) {
      toast({ title: "Erro ao adicionar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const removeSlot = async (slotId) => {
    try {
      await base44.entities.CourtAvailability.delete(slotId);
      setSlots(slots.filter((s) => s.id !== slotId));
    } catch (e) {
      toast({ title: "Erro ao remover", variant: "destructive" });
    }
  };

  const generateBulk = async () => {
    const opening = establishment?.opening_time || "08:00";
    const closing = establishment?.closing_time || "22:00";
    const duration = court.default_duration || 60;
    const startMin = timeToMinutes(opening);
    const endMin = timeToMinutes(closing);
    const toCreate = [];
    for (let t = startMin; t + duration <= endMin; t += duration) {
      const st = minutesToTime(t);
      const et = minutesToTime(t + duration);
      const exists = daySlots.some((s) => s.start_time === st && s.end_time === et);
      if (!exists) {
        toCreate.push({
          court_id: court.id,
          weekday: activeDay,
          start_time: st,
          end_time: et,
          price: newPrice ? Number(newPrice) : court.price_per_hour || null,
          status: "available",
        });
      }
    }
    if (toCreate.length === 0) {
      toast({ title: "Nenhum horário novo para gerar", description: "Todos os horários já existem neste dia." });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CourtAvailability.bulkCreate(toCreate);
      toast({ title: `${toCreate.length} horários gerados!` });
      load();
    } catch (e) {
      toast({ title: "Erro ao gerar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const copyToAllDays = async () => {
    const otherDays = WEEKDAYS.filter((d) => d.value !== activeDay).map((d) => d.value);
    const toCreate = [];
    daySlots.forEach((slot) => {
      otherDays.forEach((day) => {
        const exists = slots.some((s) => s.weekday === day && !s.specific_date && s.start_time === slot.start_time && s.end_time === slot.end_time);
        if (!exists) {
          toCreate.push({
            court_id: court.id,
            weekday: day,
            start_time: slot.start_time,
            end_time: slot.end_time,
            price: slot.price,
            status: "available",
          });
        }
      });
    });
    if (toCreate.length === 0) {
      toast({ title: "Nada para copiar", description: "Os horários já existem nos demais dias." });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.CourtAvailability.bulkCreate(toCreate);
      toast({ title: `Horários copiados para ${otherDays.length} dias!` });
      load();
    } catch (e) {
      toast({ title: "Erro ao copiar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const hasAnySlot = slots.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Horários — {court?.name}
          </DialogTitle>
          <DialogDescription>
            Cadastre os horários disponíveis para reserva desta quadra.
          </DialogDescription>
        </DialogHeader>

        {/* Weekday tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setActiveDay(d.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDay === d.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Add slot */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
            <div>
              <Label className="text-xs">Início</Label>
              <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label className="text-xs">Término</Label>
              <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="rounded-lg mt-1" />
            </div>
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="rounded-lg mt-1" placeholder="Padrão da quadra" />
            </div>
            <Button type="button" className="rounded-lg" onClick={addSlot} disabled={saving}>
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs" onClick={generateBulk} disabled={saving}>
              <Copy className="w-3.5 h-3.5" /> Gerar automáticos
            </Button>
            {daySlots.length > 0 && (
              <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs" onClick={copyToAllDays} disabled={saving}>
                <Copy className="w-3.5 h-3.5" /> Copiar para todos os dias
              </Button>
            )}
          </div>
        </div>

        {/* Slots list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : daySlots.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm">Nenhum horário cadastrado para {WEEKDAYS.find((d) => d.value === activeDay)?.label}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {daySlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{slot.start_time} — {slot.end_time}</span>
                  {slot.price != null && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                      R$ {Number(slot.price).toFixed(2)}
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => removeSlot(slot.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>
            {hasAnySlot ? "Concluir" : "Fechar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}