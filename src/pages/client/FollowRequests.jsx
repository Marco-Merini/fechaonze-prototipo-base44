import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

export default function FollowRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      const me = await base44.auth.me();
      const pending = await base44.entities.FollowRequest.filter(
        { target_id: me.id, status: "pending" },
        "-created_date",
        50
      );
      const ids = pending.map((r) => r.requester_id);
      let profiles = [];
      if (ids.length) {
        const res = await base44.functions.invoke("playerSocial", { action: "byIds", ids });
        profiles = res.data?.players || [];
      }
      const map = new Map(profiles.map((p) => [p.id, p]));
      setRequests(pending.map((r) => ({ ...r, requester: map.get(r.requester_id) })).filter((r) => r.requester));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (r) => {
    setBusyId(r.id);
    try {
      await base44.functions.invoke("followRequests", { action: "accept", request_id: r.id });
      toast({ title: "Solicitação aceita!" });
      load();
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
    setBusyId(null);
  };

  const reject = async (r) => {
    setBusyId(r.id);
    try {
      await base44.functions.invoke("followRequests", { action: "reject", request_id: r.id });
      toast({ title: "Solicitação rejeitada" });
      load();
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
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
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Solicitações</h1>
        <p className="text-muted-foreground mt-1">Quem quer te seguir</p>
      </div>
      {requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-heading font-semibold text-lg mb-1">Nenhuma solicitação</p>
          <p className="text-muted-foreground">Quando alguém quiser te seguir, aparece aqui.</p>
        </div>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <Link to={`/players/${r.requester.id}`} className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
              {r.requester.photo_url ? (
                <img src={r.requester.photo_url} alt={r.requester.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary">{(r.requester.full_name || "?").charAt(0)}</span>
              )}
            </Link>
            <Link to={`/players/${r.requester.id}`} className="flex-1 min-w-0">
              <p className="font-heading font-semibold truncate">{r.requester.full_name}</p>
              <p className="text-sm text-muted-foreground truncate">@{r.requester.username}</p>
            </Link>
            <Button size="sm" className="rounded-xl gap-1.5" disabled={busyId === r.id} onClick={() => accept(r)}>
              <Check className="w-4 h-4" /> Aceitar
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl" disabled={busyId === r.id} onClick={() => reject(r)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}