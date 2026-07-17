import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Star, MapPin, Gamepad2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerCard from "@/components/players/PlayerCard";
import RatePlayer from "@/components/players/RatePlayer";
import { ATTR_LABELS, tierColor } from "@/lib/playerStats";

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rateOpen, setRateOpen] = useState(false);

  const load = async () => {
    try {
      const [p, r, me] = await Promise.all([
        base44.entities.Player.get(id),
        base44.entities.PlayerRating.filter({ player_id: id }),
        base44.auth.me(),
      ]);
      setPlayer(p);
      setRatings(r);
      setUser(me);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">Jogador não encontrado</p>
        <Link to="/players"><Button variant="outline" className="rounded-xl">Voltar</Button></Link>
      </div>
    );
  }

  const avg = ratings.length ? (ratings.reduce((s, r) => s + r.overall_rating, 0) / ratings.length).toFixed(1) : null;
  const tier = tierColor(player.overall ?? 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/players" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar para jogadores
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <PlayerCard player={player} size="lg" />
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-heading font-bold uppercase">{player.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tier.text} bg-gradient-to-r ${tier.bg}`}>{tier.label}</span>
              <MapPin className="w-4 h-4" /> {player.city || "—"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase font-bold">Partidas</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Gamepad2 className="w-4 h-4 text-primary" /> {player.games_played || 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground uppercase font-bold">Nota média</p>
              <p className="text-xl font-bold flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> {avg || "—"}</p>
            </div>
          </div>
          <Button className="rounded-xl w-full sm:w-auto gap-2" onClick={() => setRateOpen(true)}>
            <MessageSquare className="w-4 h-4" /> Avaliar jogador
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-bold mb-3">Atributos</h3>
        <div className="space-y-2">
          {ATTR_LABELS.map((a) => {
            const val = player[a.key] ?? 0;
            return (
              <div key={a.key} className="flex items-center gap-3">
                <span className="text-sm font-medium w-28">{a.label}</span>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${val}%` }} />
                </div>
                <span className="text-sm font-bold w-8 text-right">{val}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-heading font-bold mb-3">Avaliações ({ratings.length})</h3>
        {ratings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Ainda sem avaliações. Seja o primeiro!</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.rater_name} <span className="text-amber-600 font-bold">• {r.overall_rating}/10</span></p>
                  {r.comment && <p className="text-sm text-muted-foreground mt-0.5">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RatePlayer open={rateOpen} onOpenChange={setRateOpen} player={player} user={user} onRated={load} />
    </div>
  );
}