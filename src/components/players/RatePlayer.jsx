import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { blendOverall, computeOverall } from "@/lib/playerStats";

export default function RatePlayer({ open, onOpenChange, player, user, onRated }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(8);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || !player) return;
    setSaving(true);
    try {
      await base44.entities.PlayerRating.create({
        player_id: player.id,
        player_name: player.name,
        rater_id: user.id,
        rater_name: user.full_name || "Jogador",
        overall_rating: rating,
        comment,
      });

      const all = await base44.entities.PlayerRating.filter({ player_id: player.id });
      const avg = all.reduce((s, r) => s + r.overall_rating, 0) / (all.length || 1);
      const baseOverall = computeOverall(player);
      const blended = blendOverall(baseOverall, avg);
      await base44.entities.Player.update(player.id, { overall: blended, games_played: (player.games_played || 0) + 1 });

      toast({ title: "Avaliação registrada!", description: `Overall atualizado para ${blended}.` });
      onOpenChange(false);
      setComment("");
      setRating(8);
      onRated();
    } catch (err) {
      toast({ title: "Erro ao avaliar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Avaliar {player?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nota geral (1-10)</Label>
            <div className="flex items-center gap-3 mt-2">
              <input type="range" min={1} max={10} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full accent-primary" />
              <span className="text-2xl font-extrabold text-primary w-10 text-center">{rating}</span>
            </div>
          </div>
          <div>
            <Label>Comentário</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Como foi jogar com ele?" className="rounded-xl mt-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button className="rounded-xl flex-1" disabled={saving} onClick={handleSubmit}>{saving ? "Enviando..." : "Avaliar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}