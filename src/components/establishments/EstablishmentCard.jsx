import React from "react";
import { MapPin, Eye, Pencil, LayoutGrid, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

export default function EstablishmentCard({ establishment, courtCount, onView, onEdit, onManageCourts }) {
  const photo = establishment.main_photo;
  const isActive = establishment.status === "active";
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all">
      <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        {photo ? (
          <Image src={photo} alt={establishment.name} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="w-12 h-12 text-primary/20" />
          </div>
        )}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"}`}>
          {isActive ? "Ativo" : "Inativo"}
        </span>
        <span className="absolute top-3 right-3 bg-card/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-primary flex items-center gap-1">
          <LayoutGrid className="w-3 h-3" /> {courtCount} quadra{courtCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-heading font-semibold text-lg truncate">{establishment.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {[establishment.neighborhood, establishment.city, establishment.state].filter(Boolean).join(", ") || establishment.address}
        </p>
        <div className="flex gap-2 mt-4">
          <Button variant="default" size="sm" className="rounded-xl flex-1 gap-1.5" onClick={() => onView(establishment)}>
            <Eye className="w-3.5 h-3.5" /> Visualizar
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => onEdit(establishment)}>
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => onManageCourts(establishment)}>
            <LayoutGrid className="w-3.5 h-3.5" /> Quadras
          </Button>
        </div>
      </div>
    </div>
  );
}