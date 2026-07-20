import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Users } from "lucide-react";
import PlayerCard from "@/components/players/PlayerCard";

export default function Connections() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") === "followers" ? "followers" : "following");
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetName, setTargetName] = useState("");

  const load = async () => {
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      const tId = id || meUser.id;
      let ids = [];
      if (tab === "following") {
        const list = await base44.entities.Follow.filter({ follower_id: tId }, "-created_date", 200);
        ids = list.map((f) => f.following_id);
      } else {
        const list = await base44.entities.Follow.filter({ following_id: tId }, "-created_date", 200);
        ids = list.map((f) => f.follower_id);
      }
      if (ids.length) {
        const res = await base44.functions.invoke("playerSocial", { action: "byIds", ids });
        setUsers(res.data?.players || []);
      } else {
        setUsers([]);
      }
      if (id && id !== meUser.id) {
        const res = await base44.functions.invoke("playerSocial", { action: "getById", id });
        setTargetName(res.data?.player?.full_name || "");
      } else {
        setTargetName("Você");
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, [id, tab]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">
          {targetName ? `${targetName}` : "Conexões"}
        </h1>
        <p className="text-muted-foreground mt-1">Seguindo e seguidores</p>
      </div>

      <div className="flex gap-2 bg-card rounded-2xl border border-border p-1">
        <button
          onClick={() => setTab("following")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "following" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Seguindo
        </button>
        <button
          onClick={() => setTab("followers")}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${tab === "followers" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          Seguidores
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-heading font-semibold text-lg mb-1">Ninguém aqui</p>
          <p className="text-muted-foreground">{tab === "following" ? "Ainda não segue ninguém." : "Sem seguidores ainda."}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {users.map((p) => (
            <Link key={p.id} to={`/players/${p.id}`}>
              <PlayerCard player={p} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}