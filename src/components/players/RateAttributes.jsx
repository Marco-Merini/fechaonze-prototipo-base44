import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ATTR_LABELS } from "@/lib/playerStats";

export default function RateAttributes({ open, onOpenChange, player, onRated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70, comment: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        pace: 70, shooting: 70, passing: 70, dribbling: 70, defending: 70, physical: 70, comment: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.functions.invoke("ratePlayer", {
        player_id: player.id,
        pace: form.pace, shooting: form.shooting, passing: form.passing,
        dribbling: form.dribbling, defending: form.defending, physical: form.physical,
        comment: form.comment,
      });
      toast({ title: "Avaliação enviada!" });
      onOpenChange(false);
      onRated?.();
    } catch (err) {
      toast({ title: "Erro ao avaliar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Avaliar {player?.full_name || player?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">Avalie cada atributo de 0 a 99.</p>
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
            {ATTR_LABELS.map((a) => (
              <div key={a.key} className="flex items-center gap-3">
                <span className="text-sm font-medium w-24">{a.label}</span>
                <input type="range" min={0} max={99} value={form[a.key]} onChange={(e) => setForm((f) => ({ ...f, [a.key]: Number(e.target.value) }))} className="flex-1 accent-primary" />
                <span className="text-sm font-bold w-8 text-right">{form[a.key]}</span>
              </div>
            ))}
          </div>
          <div>
            <Label>Comentário (opcional)</Label>
            <Textarea value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} className="rounded-xl mt-1" rows={2} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Enviando..." : "Enviar avaliação"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}