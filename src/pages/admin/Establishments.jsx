import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plus, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import EstablishmentCard from "@/components/establishments/EstablishmentCard";

export default function Establishments() {
  const [establishments, setEstablishments] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      const [ests, cs] = await Promise.all([
        base44.entities.Establishment.filter({ owner_id: me.id }, "-created_date", 200),
        base44.entities.Court.list("-created_date", 500),
      ]);
      setEstablishments(ests);
      setCourts(cs);
    } catch (e) {
      toast({ title: "Erro ao carregar", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const courtCount = (estId) => courts.filter((c) => c.establishment_id === estId).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (establishments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150" />
          <button
            onClick={() => navigate("/establishments/new")}
            className="relative w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus className="w-10 h-10" strokeWidth={2.5} />
          </button>
        </div>
        <h2 className="font-heading font-bold text-2xl mb-2">Criar estabelecimento</h2>
        <p className="text-muted-foreground max-w-sm">
          Cadastre seu estabelecimento para começar a disponibilizar quadras e receber reservas dos jogadores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" /> Estabelecimentos
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie seus estabelecimentos e quadras</p>
        </div>
        <Button onClick={() => navigate("/establishments/new")} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Novo estabelecimento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {establishments.map((est) => (
          <EstablishmentCard
            key={est.id}
            establishment={est}
            courtCount={courtCount(est.id)}
            onView={(e) => navigate(`/establishments/${e.id}`)}
            onEdit={(e) => navigate(`/establishments/${e.id}/edit`)}
            onManageCourts={(e) => navigate(`/establishments/${e.id}`)}
          />
        ))}
      </div>
    </div>
  );
}