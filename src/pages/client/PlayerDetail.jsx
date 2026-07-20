import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, MapPin, UserPlus, UserCheck, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import PlayerCard from "@/components/players/PlayerCard";
import RateAttributes from "@/components/players/RateAttributes";
import { ATTR_LABELS, tierColor, computeOverall } from "@/lib/playerStats";
import { isFootballUser } from "@/lib/sports";
import { followUser, unfollowUser } from "@/lib/followActions";

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [me, setMe] = useState(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const { toast } = useToast();

  const load = async () => {
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      const res = await base44.functions.invoke("playerSocial", { action: "getById", id });
      const p = res.data?.player;
      setPlayer(p);
      setFollowing(!!p?.i_follow);
      const ratings = await base44.entities.PlayerRating.filter({ player_id: id }, "-created_date", 50);
      setComments(ratings.filter((r) => r.comment && r.comment.trim()).map((r) => ({
        id: r.id,
        name: r.rater_name || "Anônimo",
        comment: r.comment.trim(),
        date: r.created_date,
      })));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const toggleFollow = async () => {
    if (!me || !player) return;
    setBusy(true);
    try {
      if (following) {
        await unfollowUser(me, id);
        setFollowing(false);
        toast({ title: "Deixou de seguir" });
        load();
      } else {
        await followUser(me, { id });
        setFollowing(true);
        toast({ title: "Seguindo!" });
        load();
      }
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
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
  const hasFootball = isFootballUser(player);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/players" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Voltar para jogadores
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <PlayerCard player={player} size="lg" />
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl font-heading font-bold uppercase flex items-center gap-2">
              {player.full_name}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              {hasFootball && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tier.text} bg-gradient-to-r ${tier.bg}`}>{tier.label}</span>}
              <MapPin className="w-4 h-4" /> {player.city || "—"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">@{player.username} • código: <span className="font-mono">{player.user_code}</span></p>
            <p className="text-sm text-muted-foreground mt-1">{player.ratings_count || 0} avaliação(ões)</p>
            <div className="flex gap-4 mt-2 text-sm">
              <Link to={`/connections/${player.id}?tab=followers`} className="hover:text-primary"><b>{player.followers_count || 0}</b> seguidores</Link>
              <Link to={`/connections/${player.id}?tab=following`} className="hover:text-primary"><b>{player.following_count || 0}</b> seguindo</Link>
            </div>
          </div>
          {me && me.id !== id && (
            <div className="flex gap-2">
              {following ? (
                <Button variant="outline" className="rounded-xl gap-2" disabled={busy} onClick={toggleFollow}>
                  <UserCheck className="w-4 h-4" /> Seguindo
                </Button>
              ) : (
                <Button className="rounded-xl gap-2" disabled={busy} onClick={toggleFollow}>
                  <UserPlus className="w-4 h-4" /> Seguir
                </Button>
              )}
              {hasFootball && (
                <Button variant="secondary" className="rounded-xl gap-2" onClick={() => setRateOpen(true)}>
                  <Star className="w-4 h-4" /> Avaliar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {hasFootball && (
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
      )}

      <RateAttributes open={rateOpen} onOpenChange={setRateOpen} player={player} onRated={load} />

      {hasFootball && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold">Comentários das avaliações</h3>
          </div>
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum comentário ainda. Avalie este jogador para deixar um comentário!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {(c.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm">{c.name}</p>
                      {c.date && <p className="text-xs text-muted-foreground">{new Date(c.date).toLocaleDateString("pt-BR")}</p>}
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{c.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}