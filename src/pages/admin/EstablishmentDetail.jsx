import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import { WEEKDAYS, weekdayLabel } from "@/lib/establishments";
import CourtCard from "@/components/establishments/CourtCard";
import CourtFormDialog from "@/components/establishments/CourtFormDialog";
import CourtScheduleDialog from "@/components/establishments/CourtScheduleDialog";
import { ArrowLeft, Pencil, Plus, MapPin, Phone, Clock, Building2, LayoutGrid, Power } from "lucide-react";

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [est, setEst] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [courtDialogOpen, setCourtDialogOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [scheduleCourt, setScheduleCourt] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [establishment, phs, cs] = await Promise.all([
        base44.entities.Establishment.get(id),
        base44.entities.EstablishmentPhoto.filter({ establishment_id: id }, "order", 50),
        base44.entities.Court.filter({ establishment_id: id }, "-created_date", 200),
      ]);
      setEst(establishment);
      const sorted = [...phs].sort((a, b) => (a.order || 0) - (b.order || 0));
      setPhotos(sorted);
      const mainIdx = sorted.findIndex((p) => p.is_main);
      setActivePhoto(mainIdx >= 0 ? mainIdx : 0);
      setCourts(cs);
    } catch (e) {
      toast({ title: "Erro ao carregar", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const toggleStatus = async () => {
    try {
      const newStatus = est.status === "active" ? "inactive" : "active";
      await base44.entities.Establishment.update(id, { status: newStatus });
      setEst({ ...est, status: newStatus });
      toast({ title: `Estabelecimento ${newStatus === "active" ? "ativado" : "inativado"}` });
    } catch (e) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!est) {
    return <div className="text-center py-20 text-muted-foreground">Estabelecimento não encontrado.</div>;
  }

  const isActive = est.status === "active";
  const fullAddress = [est.address, est.number, est.neighborhood, est.city, est.state].filter(Boolean).join(", ");
  const mainPhoto = photos[activePhoto]?.photo_url || est.main_photo;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/establishments")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold flex items-center gap-2">
              {est.name}
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-300"}`}>
                {isActive ? "Ativo" : "Inativo"}
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {fullAddress}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2" onClick={toggleStatus}>
            <Power className="w-4 h-4" /> {isActive ? "Inativar" : "Ativar"}
          </Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate(`/establishments/${id}/edit`)}>
            <Pencil className="w-4 h-4" /> Editar
          </Button>
        </div>
      </div>

      {/* Galeria */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-56 sm:h-72 bg-gradient-to-br from-primary/10 to-primary/5 relative">
          {mainPhoto ? (
            <Image src={mainPhoto} alt={est.name} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Building2 className="w-16 h-16 text-primary/20" />
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {photos.map((p, i) => (
              <button key={p.id || i} onClick={() => setActivePhoto(i)} className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 ${i === activePhoto ? "border-primary" : "border-transparent"}`}>
                <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4">
          {est.description && (
            <div>
              <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-1">Descrição</h3>
              <p className="text-sm">{est.description}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Telefone</p>
                <p className="text-sm font-medium">{est.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Funcionamento</p>
                <p className="text-sm font-medium">{est.opening_time} — {est.closing_time}</p>
                {est.operating_days?.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {est.operating_days.map(weekdayLabel).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <LayoutGrid className="w-8 h-8 text-primary mb-2" />
          <p className="text-3xl font-heading font-extrabold">{courts.length}</p>
          <p className="text-sm text-muted-foreground">quadra{courts.length !== 1 ? "s" : ""} cadastrada{courts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Quadras */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" /> Quadras
          </h2>
          <Button className="rounded-xl gap-2" onClick={() => { setEditingCourt(null); setCourtDialogOpen(true); }}>
            <Plus className="w-4 h-4" /> Adicionar quadra
          </Button>
        </div>

        {courts.length === 0 ? (
          <div className="py-10 text-center">
            <LayoutGrid className="w-14 h-14 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma quadra cadastrada.</p>
            <p className="text-muted-foreground text-sm">Adicione a primeira quadra deste estabelecimento.</p>
            <Button className="rounded-xl gap-2 mt-4" onClick={() => { setEditingCourt(null); setCourtDialogOpen(true); }}>
              <Plus className="w-4 h-4" /> Adicionar quadra
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                onEdit={(c) => { setEditingCourt(c); setCourtDialogOpen(true); }}
                onManageSchedule={(c) => { setScheduleCourt(c); setScheduleOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <CourtFormDialog
        open={courtDialogOpen}
        onOpenChange={setCourtDialogOpen}
        establishmentId={id}
        court={editingCourt}
        onSaved={load}
        onCreated={(c) => { setScheduleCourt(c); setScheduleOpen(true); }}
      />
      <CourtScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        court={scheduleCourt}
        establishment={est}
      />
    </div>
  );
}