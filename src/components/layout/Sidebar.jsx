import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MapPin, Clock, CalendarCheck, Search, Settings, LogOut, Menu, X, Users, Star, UserPlus } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
// ThemeToggle movido para a página de Configurações
import Logo from "@/components/Logo";

const adminLinks = [
  { label: "Painel", path: "/", icon: LayoutDashboard },
  { label: "Minhas Quadras", path: "/courts", icon: MapPin },
  { label: "Horários", path: "/time-slots", icon: Clock },
  { label: "Agendamentos", path: "/bookings", icon: CalendarCheck },
];

const clientLinks = [
  { label: "Buscar Quadras", path: "/explore", icon: Search },
  { label: "Meus Agendamentos", path: "/my-bookings", icon: CalendarCheck },
  { label: "Meu time", path: "/players", icon: Star },
  { label: "Fecha Onze", path: "/matches", icon: Users },
  { label: "Solicitações", path: "/follow-requests", icon: UserPlus },
];

export default function Sidebar({ userRole }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = userRole === "dono" ? adminLinks : clientLinks;

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--sidebar-background))] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Logo size={36} />
          <div className="leading-tight">
            <span className="font-heading font-extrabold text-base tracking-tight">FechaOnze</span>
            <span className="block text-[10px] uppercase tracking-widest text-white/60 font-bold">{userRole === "dono" ? "Gestão" : "Jogador"}</span>
          </div>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[hsl(var(--sidebar-background))] text-white border-r border-[hsl(var(--sidebar-border))] z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 overflow-hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundColor: "#86efac",
            WebkitMaskImage: "url(https://media.base44.com/images/public/6a58de6b489bfc4d5fc5352c/e2d7630bb_image.png)",
            WebkitMaskSize: "420px 420px",
            WebkitMaskRepeat: "repeat",
            maskImage: "url(https://media.base44.com/images/public/6a58de6b489bfc4d5fc5352c/e2d7630bb_image.png)",
            maskSize: "420px 420px",
            maskRepeat: "repeat",
          }}
        />
        <div className="pitch-pattern p-6 border-b border-[hsl(var(--sidebar-border))] relative z-10">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <h1 className="font-heading font-extrabold text-xl tracking-tight leading-none">FechaOnze</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold mt-1">
                {userRole === "dono" ? "Gestão do Local" : "Encontre sua partida"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto relative z-10">
          <p className="px-4 mb-2 text-[10px] uppercase tracking-widest text-white/40 font-bold">Menu</p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-md"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-1 relative z-10">
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              location.pathname === "/profile"
                ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-md"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:bg-destructive/20 hover:text-white transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}