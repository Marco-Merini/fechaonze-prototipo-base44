import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export default function TimeSlots() {
  const [courts, setCourts] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [form, setForm] = useState({ court_id: "", date: "", start_time: "", end_time: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        base44.entities.Court.list(),
        base44.entities.TimeSlot.list("-date", 200),
      ]);
      setCourts(c);
      setSlots(s);
      if (c.length > 0 && !selectedCourt) setSelectedCourt(c[0].id);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredSlots = slots.filter((s) => s.court_id === selectedCourt);
  const courtName = (id) => courts.find((c) => c.id === id)?.name || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.TimeSlot.create({ ...form, is_available: true });
      toast({ title: "Horário adicionado!" });
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
        <Button onClick={() => { setForm({ court_id: selectedCourt || "", date: "", start_time: "", end_time: "" }); setDialogOpen(true); }} className="rounded-xl gap-2" disabled={courts.length === 0}>
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
                      <p className="font-medium">{slot.date}</p>
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
              <Label>Data *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="rounded-xl mt-1" />
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