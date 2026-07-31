import React from "react";
import { MapPin, Pencil, Power, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { modalityLabel, amenityLabel } from "@/lib/establishments";

export default function CourtCard({ court, onEdit, onManageSchedule }) {
  const photo = court.photo_url;
  const isActive = court.is_active !== false;
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-md transition-all">
      <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
        {photo ? (
          <Image src={photo} alt={court.name} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <MapPin className="w-10 h-10 text-primary/20" />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-card/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-primary">
          {modalityLabel(court.modality)}
        </span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"}`}>
          {isActive ? "Ativo" : "Inativo"}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold text-base truncate">{court.name}</h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
          {court.floor_type && <span>🏟️ {court.floor_type}</span>}
          <span>{court.covered ? "Coberta" : "Descoberta"}</span>
          {court.capacity && <span>👥 {court.capacity}</span>}
        </div>
        {court.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {court.amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{amenityLabel(a)}</span>
            ))}
            {court.amenities.length > 3 && <span className="text-[10px] text-muted-foreground">+{court.amenities.length - 3}</span>}
          </div>
        )}
        <p className="text-primary font-bold text-lg mt-2">
          R$ {Number(court.price_per_hour || 0).toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/horário</span>
        </p>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="rounded-xl flex-1 gap-1.5" onClick={() => onManageSchedule(court)}>
            <CalendarClock className="w-3.5 h-3.5" /> Horários
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => onEdit(court)}>
            <Pencil className="w-3.5 h-3.5" /> Editar
          </Button>
        </div>
      </div>
    </div>
  );
}