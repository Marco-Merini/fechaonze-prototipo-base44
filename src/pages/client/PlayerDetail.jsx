import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, MapPin, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PlayerCard from "@/components/players/PlayerCard";
import { ATTR_LABELS, tierColor, computeOverall } from "@/lib/playerStats";

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [me, setMe] = useState(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      const res = await base44.functions.invoke("playerSocial", { action: "getById", id });
      setPlayer(res.data?.player);
      const myFollows = await base44.entities.Follow.filter({ follower_id: meUser.id, following_id: id });
      setFollowing(myFollows.length > 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const toggleFollow = async () => {
    if (!me) return;
    setBusy(true);
    try {
      if (following) {
        await base44.entities.Follow.deleteMany({ follower_id: me.id, following_id: id });
        setFollowing(false);
        toast({ title: "Deixou de seguir" });
      } else {
        await base44.entities.Follow.create({ follower_id: me.id, following_id: id });
        setFollowing(true);
        toast({ title: "Seguindo!" });
      }
    } catch (e) { toast({ title: "Erro", variant: "destructive" }); }
    setBusy(false);
  };

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

  const overall = computeOverall(player);
  const tier = tierColor(overall);
  const name = player.name || player.full_name;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/players" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar para jogadores
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <PlayerCard player={player} size="lg" />
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-heading font-bold uppercase">{name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tier.text} bg-gradient-to-r ${tier.bg}`}>{tier.label}</span>
              <MapPin className="w-4 h-4" /> {player.city || "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">@{player.username} • código: <span className="font-mono">{player.user_code}</span></p>
          </div>
          {me && me.id !== id && (
            following ? (
              <Button variant="outline" className="rounded-xl gap-2" disabled={busy} onClick={toggleFollow}>
                <UserCheck className="w-4 h-4" /> Seguindo
              </Button>
            ) : (
              <Button className="rounded-xl gap-2" disabled={busy} onClick={toggleFollow}>
                <UserPlus className="w-4 h-4" /> Seguir
              </Button>
            )
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
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
    </div>
  );
}