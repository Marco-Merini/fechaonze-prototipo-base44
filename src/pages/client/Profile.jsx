import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Sun, Moon, Palette, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ phone: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dark, setDark] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setDark(localStorage.getItem("theme") === "dark");
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setForm({ phone: me.phone || "", city: me.city || "" });
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