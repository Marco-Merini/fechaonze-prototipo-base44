import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import SportSelector from "@/components/SportSelector";
import Logo from "@/components/Logo";
import { isFootballSport } from "@/lib/sports";

export default function Onboarding() {
  const { toast } = useToast();
  const [sports, setSports] = useState([]);
  const [positions, setPositions] = useState([]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (sports.length === 0) {
      toast({ title: "Selecione ao menos um esporte", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const primaryPosition = positions.find((p) => isFootballSport(p.sport))?.position || "ATA";
      await base44.auth.updateMe({ sports, positions, position: primaryPosition });
      toast({ title: "Tudo pronto!" });
      window.location.href = "/explore";
    } catch (e) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-5">
        <div className="flex flex-col items-center text-center">
          <Logo size={56} />
          <h1 className="font-heading font-bold text-2xl mt-4">Bem-vindo ao FechaOnze!</h1>
          <p className="text-muted-foreground mt-1">Conte quais esportes você joga para personalizar seu perfil.</p>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Seus esportes</p>
          <SportSelector
            sports={sports}
            positions={positions}
            onChange={({ sports, positions }) => { setSports(sports); setPositions(positions); }}
          />
        </div>
        <Button className="rounded-xl w-full" onClick={save} disabled={saving}>
          {saving ? "Salvando..." : "Concluir"}
        </Button>
      </div>
    </div>
  );
}