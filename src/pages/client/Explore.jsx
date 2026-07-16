import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export default function Explore() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Court.filter({ is_active: true });
        setCourts(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = searchCity
    ? courts.filter((c) => c.city.toLowerCase().includes(searchCity.toLowerCase()))
    : courts;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Buscar Quadras</h1>
        <p className="text-muted-foreground mt-1">Encontre quadras disponíveis na sua cidade</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por cidade..."
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="pl-10 rounded-xl h-12 text-base"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Nenhuma quadra encontrada</h3>
          <p className="text-muted-foreground">Tente buscar por outra cidade</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((court) => (
            <Link
              key={court.id}
              to={`/court/${court.id}`}
              className="bg-white rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                {court.photo_url ? (
                  <img src={court.photo_url} alt={court.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="w-14 h-14 text-primary/15" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-primary">
                  {court.sport_type}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">{court.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {court.city}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{court.address}</p>
                {court.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{court.description}</p>}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-primary font-bold text-lg">
                    R$ {court.price_per_hour?.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/hora</span>
                  </p>
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Ver horários
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}