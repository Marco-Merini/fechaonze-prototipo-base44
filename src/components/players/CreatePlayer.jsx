import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { computeOverall, ATTR_LABELS } from "@/lib/playerStats";

const POSITIONS = [
  { value: "GOL", label: "Goleiro" },
  { value: "ZAG", label: "Zagueiro" },
  { value: "LAT", label: "Lateral" },
  { value: "VOL", label: "Volante" },
  { value: "MEI", label: "Meia" },
  { value: "EXT", label: "Extremo" },
  { value: "ATA", label: "Atacante" },
];

const emptyForm = {
  name: "", position: "ATA", city: "",
  pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70,
};

export default function CreatePlayer({ open, onOpenChange, onCreated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Player.create({
        ...form,
        overall: computeOverall(form),
        games_played: 0,
        is_fake: false,
      });
      toast({ title: "Jogador cadastrado!" });
      onOpenChange(false);
      setForm(emptyForm);
      onCreated();
    } catch (err) {
      toast({ title: "Erro ao cadastrar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Cadastrar Jogador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Nome *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required className="rounded-xl mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Posição *</Label>
              <Select value={form.position} onValueChange={(v) => set("position", v)}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="mb-0">Atributos (0-99)</Label>
              <span className="text-sm font-bold text-primary">OVER {computeOverall(form)}</span>
            </div>
            {ATTR_LABELS.map((a) => (
              <div key={a.key} className="flex items-center gap-3">
                <span className="text-sm font-medium w-24">{a.label}</span>
                <input type="range" min={0} max={99} value={form[a.key]} onChange={(e) => set(a.key, Number(e.target.value))} className="flex-1 accent-primary" />
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={form[a.key]}
                  onChange={(e) => set(a.key, Math.max(0, Math.min(99, Number(e.target.value) || 0)))}
                  className="w-16 rounded-lg"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">O OVER é calculado por média ponderada conforme a posição do jogador.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Salvando..." : "Cadastrar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}