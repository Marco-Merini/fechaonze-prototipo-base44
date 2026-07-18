import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import MatchCard from "@/components/matches/MatchCard";
import CreateMatchPost from "@/components/matches/CreateMatchPost";

export default function MatchFeed() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [p, me] = await Promise.all([
        base44.entities.MatchPost.list("-created_date", 100),
        base44.auth.me(),
      ]);
      setPosts(p);
      setUser(me);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleInterest = async (post) => {
    if (!user) return;
    const interested = post.interested_players || [];
    const has = interested.includes(user.id);
    const newList = has ? interested.filter((id) => id !== user.id) : [...interested, user.id];
    try {
      await base44.entities.MatchPost.update(post.id, { interested_players: newList });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, interested_players: newList } : p)));
      toast({ title: has ? "Interesse removido" : "Você demonstrou interesse!" });
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const contactWhatsApp = (post) => {
    const phone = post.whatsapp_number.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá! Tenho interesse na partida "${post.title}" (${post.date} às ${post.start_time}). Vi no app Falta Um!`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const filtered = filter === "todos" ? posts : posts.filter((p) => p.level === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Falta Um 🔥</h1>
          <p className="text-muted-foreground mt-1">Encontre partidas que precisam de jogadores</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Anunciar partida
        </Button>
      </div>

      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-52 rounded-xl"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os níveis</SelectItem>
          <SelectItem value="amistoso">Amistoso/Resenha</SelectItem>
          <SelectItem value="competitivo">Competitivo</SelectItem>
          <SelectItem value="iniciantes">Iniciantes</SelectItem>
        </SelectContent>
      </Select>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Nenhuma partida aberta</h3>
          <p className="text-muted-foreground mb-4">Seja o primeiro a anunciar uma partida!</p>
          <Button onClick={() => setDialogOpen(true)} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Anunciar partida
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => (
            <MatchCard
              key={post.id}
              post={post}
              user={user}
              onToggleInterest={toggleInterest}
              onContact={contactWhatsApp}
            />
          ))}
        </div>
      )}

      <CreateMatchPost open={dialogOpen} onOpenChange={setDialogOpen} user={user} onCreated={load} />
    </div>
  );
}