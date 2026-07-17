import React from "react";
import { Users, MapPin, Calendar, Clock, MessageCircle, Sparkles, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const levelConfig = {
  amistoso: { label: "Amistoso/Resenha", icon: Sparkles, color: "bg-emerald-100 text-emerald-700" },
  competitivo: { label: "Competitivo", icon: Trophy, color: "bg-orange-100 text-orange-700" },
  iniciantes: { label: "Iniciantes", icon: Flame, color: "bg-blue-100 text-blue-700" },
};

export default function MatchCard({ post, user, onToggleInterest, onContact }) {
  const lvl = levelConfig[post.level] || levelConfig.amistoso;
  const LvlIcon = lvl.icon;
  const isInterested = user && (post.interested_players || []).includes(user.id);
  const interestedCount = (post.interested_players || []).length;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-heading font-bold text-lg">{post.title}</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${lvl.color}`}>
              <LvlIcon className="w-3 h-3" /> {lvl.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">por {post.organizer_name}</p>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${post.status === "completo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {post.status === "completo" ? "Completo" : "Aberto"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-3">
        <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> {new Date(post.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
        <p className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {post.start_time}—{post.end_time}</p>
        <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {post.city}</p>
      </div>
      <p className="text-sm font-medium text-foreground mb-1">📋 Vagas: {post.positions_needed}</p>
      {post.location && <p className="text-sm text-muted-foreground">📍 {post.location}</p>}
      {post.description && <p className="text-sm text-muted-foreground mt-2">{post.description}</p>}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Users className="w-4 h-4" /> {interestedCount} {interestedCount === 1 ? "interessado" : "interessados"}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-xl ${isInterested ? "border-primary bg-primary/10 text-primary" : ""}`}
            onClick={() => onToggleInterest(post)}
          >
            {isInterested ? "✓ Tenho Interesse" : "Tenho Interesse"}
          </Button>
          {isInterested && (
            <Button size="sm" className="rounded-xl gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => onContact(post)}>
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}