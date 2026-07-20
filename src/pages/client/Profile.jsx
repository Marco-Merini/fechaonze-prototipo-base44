import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Sun, Moon, Palette, Mail, Copy, Hash, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { computeOverall, tierColor, ATTR_LABELS, POSITIONS } from "@/lib/playerStats";
import { isFootballUser, isFootballSport } from "@/lib/sports";
import SportSelector from "@/components/SportSelector";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ phone: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(false);
  const [playerForm, setPlayerForm] = useState({ username: "", user_code: "", sports: [], positions: [] });
  const [savingPlayer, setSavingPlayer] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { toast } = useToast();

  const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  useEffect(() => {
    setDark(localStorage.getItem("theme") === "dark");
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setForm({ phone: me.phone || "", city: me.city || "" });
        setPlayerForm({
          username: me.username || "",
          user_code: me.user_code || genCode(),
          sports: me.sports || [],
          positions: me.positions || [],
        });
        const [fol, ing] = await Promise.all([
          base44.entities.Follow.filter({ following_id: me.id }),
          base44.entities.Follow.filter({ follower_id: me.id }),
        ]);
        setFollowersCount(fol.length);
        setFollowingCount(ing.length);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const setTheme = (isDark) => {
    setDark(isDark);
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const overall = user ? (user.overall ?? computeOverall(user)) : 0;
  const tier = tierColor(overall);
  const ratingsCount = user?.ratings_count || 0;
  const hasFootball = isFootballUser(user);

  const copyCode = () => {
    navigator.clipboard?.writeText(playerForm.user_code);
    toast({ title: "Código copiado!" });
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    if (!playerForm.username.trim()) {
      toast({ title: "Informe um nome de usuário", variant: "destructive" });
      return;
    }
    setSavingPlayer(true);
    try {
      const res = await base44.functions.invoke("playerSocial", { action: "search", query: playerForm.username.trim() });
      const taken = (res.data?.players || []).some(
        (p) => (p.username || "").toLowerCase() === playerForm.username.trim().toLowerCase() && p.id !== user?.id
      );
      if (taken) {
        toast({ title: "Nome de usuário já existe", variant: "destructive" });
        setSavingPlayer(false);
        return;
      }
      const primaryPosition = playerForm.positions.find((p) => isFootballSport(p.sport))?.position || user?.position || "ATA";
      const newOverall = hasFootball
        ? computeOverall({
            position: primaryPosition,
            pace: user?.pace, shooting: user?.shooting, passing: user?.passing,
            dribbling: user?.dribbling, defending: user?.defending, physical: user?.physical,
          })
        : 0;
      await base44.auth.updateMe({
        username: playerForm.username.trim(),
        user_code: playerForm.user_code,
        sports: playerForm.sports,
        positions: playerForm.positions,
        position: primaryPosition,
        overall: newOverall,
      });
      setUser((u) => ({ ...u, sports: playerForm.sports, positions: playerForm.positions, position: primaryPosition, overall: newOverall }));
      toast({ title: "Card atualizado!" });
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setSavingPlayer(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ phone: form.phone, city: form.city });
      toast({ title: "Conta atualizada!" });
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas preferências e sua conta</p>
      </div>

      {/* Preferências */}
      <section className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-lg">Preferências</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Personalize a aparência do app</p>
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="font-medium">Tema</p>
            <p className="text-sm text-muted-foreground">Escolha entre modo claro e escuro</p>
          </div>
          <div className="inline-flex rounded-xl border border-border bg-muted p-1">
            <button
              onClick={() => setTheme(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                !dark ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sun className="w-4 h-4" /> Claro
            </button>
            <button
              onClick={() => setTheme(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dark ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Moon className="w-4 h-4" /> Escuro
            </button>
          </div>
        </div>
      </section>

      {/* Meu Card de Jogador */}
      <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <Hash className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-lg">Meu Card</h2>
        </div>

        {hasFootball ? (
          <>
            <div className="flex items-center gap-5 mb-4">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${tier.bg} flex items-center justify-center shrink-0`}>
                <span className={`text-4xl font-extrabold ${tier.text}`}>{ratingsCount > 0 ? overall : "—"}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seu Overall</p>
                <p className="font-heading font-bold text-lg">{ratingsCount > 0 ? tier.label : "Sem avaliações"}</p>
                <p className="text-sm text-muted-foreground">{ratingsCount} avaliação(ões)</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Seu overall é calculado a partir das avaliações que os outros jogadores dão nos seus atributos. Você não pode editar seus próprios atributos.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground mb-6">
            Você não joga modalidades de futebol, então as informações de overall não se aplicam ao seu perfil.
          </p>
        )}

        <form onSubmit={handleSavePlayer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Nome de usuário *</Label>
              <Input value={playerForm.username} onChange={(e) => setPlayerForm((f) => ({ ...f, username: e.target.value }))} placeholder="seu_usuario" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Seu código</Label>
              <div className="flex gap-2 mt-1">
                <Input value={playerForm.user_code} readOnly className="rounded-xl font-mono" />
                <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0" onClick={copyCode}><Copy className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
          <div>
            <Label>Modalidades e posições</Label>
            <div className="mt-1">
              <SportSelector
                sports={playerForm.sports}
                positions={playerForm.positions}
                onChange={({ sports, positions }) => setPlayerForm((f) => ({ ...f, sports, positions }))}
              />
            </div>
          </div>
          <Button type="submit" className="rounded-xl w-full" disabled={savingPlayer}>{savingPlayer ? "Salvando..." : "Salvar card"}</Button>
        </form>
      </section>

      {/* Rede Social */}
      <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <Lock className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-lg">Rede Social</h2>
        </div>

        <div className="flex gap-8 mb-6">
          <Link to="/connections?tab=following" className="text-center hover:text-primary">
            <p className="font-heading font-bold text-2xl">{followingCount}</p>
            <p className="text-sm text-muted-foreground">Seguindo</p>
          </Link>
          <Link to="/connections?tab=followers" className="text-center hover:text-primary">
            <p className="font-heading font-bold text-2xl">{followersCount}</p>
            <p className="text-sm text-muted-foreground">Seguidores</p>
          </Link>
        </div>

        <Link to="/follow-requests" className="mt-4 block text-sm font-medium text-primary hover:underline">Ver seguidores →</Link>
      </section>

      {/* Minha Conta */}
      <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-lg">Minha Conta</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-semibold text-lg truncate">{user?.full_name || "Usuário"}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" /> {user?.email || "—"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Telefone / WhatsApp</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="5511999999999" className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Sua cidade" className="rounded-xl mt-1" />
          </div>
          <Button type="submit" className="rounded-xl w-full" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </section>
    </div>
  );
}