import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const WEEKDAYS = [
  { value: "domingo", label: "Domingo" },
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
];
const WEEKDAY_ORDER = { domingo: 0, segunda: 1, terca: 2, quarta: 3, quinta: 4, sexta: 5, sabado: 6 };
const weekdayLabel = (w) => WEEKDAYS.find((d) => d.value === w)?.label || w;

export default function TimeSlots() {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [form, setForm] = useState({ court_id: "", weekdays: [], start_time: "", end_time: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        base44.entities.Court.list(),
        base44.entities.TimeSlot.list("-created_date", 500),
      ]);
      setCourts(c);
      setSlots(s);
      if (c.length > 0 && !selectedCourt) setSelectedCourt(c[0].id);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredSlots = slots
    .filter((s) => s.court_id === selectedCourt)
    .sort((a, b) => (WEEKDAY_ORDER[a.weekday] ?? 99) - (WEEKDAY_ORDER[b.weekday] ?? 99) || a.start_time.localeCompare(b.start_time));
  const courtName = (id) => courts.find((c) => c.id === id)?.name || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.weekdays.length === 0) {
      toast({ title: "Selecione ao menos um dia da semana", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await base44.entities.TimeSlot.bulkCreate(
        form.weekdays.map((w) => ({
          court_id: form.court_id,
          weekday: w,
          start_time: form.start_time,
          end_time: form.end_time,
          is_available: true,
        }))
      );
      toast({ title: `${form.weekdays.length} horário(s) adicionado(s)!` });
      setDialogOpen(false);
      load();
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este horário?")) return;
    try {
      await base44.entities.TimeSlot.delete(id);
      toast({ title: "Horário excluído" });
      load();
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

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
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Horários</h1>
          <p className="text-muted-foreground mt-1">Gerencie os horários disponíveis</p>
        </div>
        <Button onClick={() => { setForm({ court_id: selectedCourt || "", weekdays: [], start_time: "", end_time: "" }); setDialogOpen(true); }} className="rounded-xl gap-2" disabled={courts.length === 0}>
          <Plus className="w-4 h-4" /> Novo Horário
        </Button>
      </div>

      {courts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Cadastre uma quadra primeiro</h3>
          <p className="text-muted-foreground">Você precisa ter quadras para adicionar horários</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 flex-wrap">
            {courts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourt(c.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCourt === c.id ? "bg-primary text-white shadow-sm" : "bg-card border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {filteredSlots.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhum horário para <strong>{courtName(selectedCourt)}</strong></p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border divide-y divide-border">
              {filteredSlots.map((slot) => (
                <div key={slot.id} className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{weekdayLabel(slot.weekday)}</p>
                      <p className="text-sm text-muted-foreground">{slot.start_time} — {slot.end_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${slot.is_available ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"}`}>
                      {slot.is_available ? "Disponível" : "Ocupado"}
                    </span>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(slot.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Novo Horário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Quadra *</Label>
              <Select value={form.court_id} onValueChange={(v) => setForm({ ...form, court_id: v })} required>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {courts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dias da semana * <span className="text-muted-foreground font-normal">(selecione um ou mais)</span></Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {WEEKDAYS.map((d) => {
                  const active = form.weekdays.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          weekdays: active ? f.weekdays.filter((w) => w !== d.value) : [...f.weekdays, d.value],
                        }))
                      }
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-card border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Início *</Label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required className="rounded-xl mt-1" />
              </div>
              <div>
                <Label>Término *</Label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required className="rounded-xl mt-1" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}