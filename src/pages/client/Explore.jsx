import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, MapPin, Clock, LocateFixed, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function Explore() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState("");
  const [userLoc, setUserLoc] = useState(null);
  const [locating, setLocating] = useState(false);
  const [radius, setRadius] = useState("10");

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

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  let filtered = courts;
  if (searchCity) {
    filtered = filtered.filter((c) => c.city.toLowerCase().includes(searchCity.toLowerCase()));
  }
  if (userLoc) {
    const r = Number(radius);
    filtered = filtered
      .map((c) => ({
        ...c,
        _dist: c.latitude != null && c.longitude != null ? haversineKm(userLoc.lat, userLoc.lng, c.latitude, c.longitude) : null,
      }))
      .filter((c) => c._dist != null && c._dist <= r)
      .sort((a, b) => a._dist - b._dist);
  }

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
        <p className="text-muted-foreground mt-1">Encontre quadras disponíveis perto de você</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por cidade..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="pl-10 rounded-xl h-12 text-base"
          />
        </div>
        <Button
          variant={userLoc ? "default" : "outline"}
          onClick={handleLocate}
          className="rounded-xl h-12 gap-2"
          disabled={locating}
        >
          <LocateFixed className="w-4 h-4" /> {locating ? "Localizando..." : userLoc ? "Localização ativa" : "Minha localização"}
        </Button>
        {userLoc && (
          <Select value={radius} onValueChange={setRadius}>
            <SelectTrigger className="w-36 rounded-xl h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Raio: 1 km</SelectItem>
              <SelectItem value="5">Raio: 5 km</SelectItem>
              <SelectItem value="10">Raio: 10 km</SelectItem>
              <SelectItem value="25">Raio: 25 km</SelectItem>
              <SelectItem value="50">Raio: 50 km</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {userLoc && filtered.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
          Nenhuma quadra com coordenadas dentro do raio. Peça ao dono da quadra para definir a localização no cadastro.
        </div>
      )}

      {!userLoc && filtered.length === 0 ? (
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
                {court._dist != null && (
                  <span className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> {court._dist.toFixed(1)} km
                  </span>
                )}
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