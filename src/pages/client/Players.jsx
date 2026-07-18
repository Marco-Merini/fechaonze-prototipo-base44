import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlayerCard from "@/components/players/PlayerCard";
import { Link } from "react-router-dom";

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("todos");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await base44.entities.Player.list("-overall", 100);
        setPlayers(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = players.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.city || "").toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === "todos" || p.position === posFilter;
    return matchSearch && matchPos;
  });

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
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Jogadores ⚽</h1>
        <p className="text-muted-foreground mt-1">Cards e Overall da galera</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou cidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl h-12" />
        </div>
        <Select value={posFilter} onValueChange={setPosFilter}>
          <SelectTrigger className="w-44 rounded-xl h-12"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas posições</SelectItem>
            <SelectItem value="GOL">Goleiro</SelectItem>
            <SelectItem value="ZAG">Zagueiro</SelectItem>
            <SelectItem value="LAT">Lateral</SelectItem>
            <SelectItem value="VOL">Volante</SelectItem>
            <SelectItem value="MEI">Meia</SelectItem>
            <SelectItem value="EXT">Extremo</SelectItem>
            <SelectItem value="ATA">Atacante</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Nenhum jogador encontrado</h3>
          <p className="text-muted-foreground">Tente outra busca</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {filtered.map((p) => (
            <Link key={p.id} to={`/players/${p.id}`}>
              <PlayerCard player={p} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}