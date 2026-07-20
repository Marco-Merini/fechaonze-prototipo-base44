import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FollowRequests() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const list = await base44.entities.Follow.filter({ following_id: me.id }, "-created_date", 100);
        const ids = list.map((f) => f.follower_id);
        let profiles = [];
        if (ids.length) {
          const res = await base44.functions.invoke("playerSocial", { action: "byIds", ids });
          profiles = res.data?.players || [];
        }
        const map = new Map(profiles.map((p) => [p.id, p]));
        setFollowers(list.map((f) => ({ ...f, user: map.get(f.follower_id) })).filter((f) => f.user));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Seguidores</h1>
        <p className="text-muted-foreground mt-1">Histórico de quem começou a te seguir</p>
      </div>
      {followers.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-heading font-semibold text-lg mb-1">Ninguém te segue ainda</p>
          <p className="text-muted-foreground">Quando alguém seguir você, aparece aqui.</p>
        </div>
      ) : (
        followers.map((f) => (
          <Link key={f.id} to={`/players/${f.user.id}`} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors">
            <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
              {f.user.photo_url ? (
                <img src={f.user.photo_url} alt={f.user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary">{(f.user.full_name || "?").charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold truncate">{f.user.full_name}</p>
              <p className="text-sm text-muted-foreground truncate">@{f.user.username}</p>
            </div>
            <p className="text-xs text-muted-foreground shrink-0 hidden sm:block">
              seguiu você {formatDistanceToNow(new Date(f.created_date), { addSuffix: true, locale: ptBR })}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}