import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Users, UserPlus, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { computeOverall } from "@/lib/playerStats";
import PlayerCard from "@/components/players/PlayerCard";

export default function Players() {
  const [me, setMe] = useState(null);
  const [follows, setFollows] = useState([]);
  const [team, setTeam] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      const myFollows = await base44.entities.Follow.filter({ follower_id: meUser.id });
      setFollows(myFollows);
      const ids = myFollows.map((f) => f.following_id);
      if (ids.length) {
        const res = await base44.functions.invoke("playerSocial", { action: "byIds", ids });
        setTeam(res.data?.players || []);
      } else {
        setTeam([]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const doSearch = async () => {
    const q = search.trim();
    if (!q) { setResults([]); setSearched(false); return; }
    setSearching(true);
    try {
      const res = await base44.functions.invoke("playerSocial", { action: "search", query: q });
      setResults(res.data?.players || []);
      setSearched(true);
    } catch (e) { console.error(e); }
    setSearching(false);
  };

  const isFollowing = (userId) => follows.some((f) => f.following_id === userId);

  const follow = async (userId) => {
    setBusyId(userId);
    try {
      await base44.entities.Follow.create({ follower_id: me.id, following_id: userId });
      toast({ title: "Seguindo!" });
      load();
    } catch (e) { toast({ title: "Erro", variant: "destructive" }); }
    setBusyId(null);
  };

  const unfollow = async (userId) => {
    setBusyId(userId);
    try {
      await base44.entities.Follow.deleteMany({ follower_id: me.id, following_id: userId });
      toast({ title: "Deixou de seguir" });
      load();
    } catch (e) { toast({ title: "Erro", variant: "destructive" }); }
    setBusyId(null);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Meu Time ⚽</h1>
        <p className="text-muted-foreground mt-1">Os jogadores que você segue</p>
      </div>

      {/* Buscar amigos */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-heading font-semibold mb-1">Buscar jogadores</h2>
        <p className="text-sm text-muted-foreground mb-3">Pesquise pelo nome de usuário ou pelo código</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="@usuario ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              className="pl-10 rounded-xl h-12"
            />
          </div>
          <Button onClick={doSearch} className="rounded-xl h-12" disabled={searching}>
            {searching ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2">
            {results.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-muted/50">
                <Link to={`/players/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                    {p.photo_url ? (
                      <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {p.full_name} <span className="text-muted-foreground font-normal">@{p.username}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{p.position} • {p.city || "—"} • {computeOverall(p)} OVR</p>
                  </div>
                </Link>
                {isFollowing(p.id) ? (
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5" disabled={busyId === p.id} onClick={() => unfollow(p.id)}>
                    <UserCheck className="w-4 h-4" /> Seguindo
                  </Button>
                ) : (
                  <Button size="sm" className="rounded-xl gap-1.5" disabled={busyId === p.id} onClick={() => follow(p.id)}>
                    <UserPlus className="w-4 h-4" /> Seguir
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        {searched && !searching && results.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">Nenhum jogador encontrado.</p>
        )}
      </div>

      {/* Meu Time */}
      <div>
        <h2 className="font-heading font-bold mb-4">Meu Time ({team.length})</h2>
        {team.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-heading font-semibold text-lg mb-1">Você ainda não segue ninguém</h3>
            <p className="text-muted-foreground">Busque jogadores acima para montar seu time</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-5">
            {team.map((p) => (
              <Link key={p.id} to={`/players/${p.id}`}>
                <PlayerCard player={p} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}