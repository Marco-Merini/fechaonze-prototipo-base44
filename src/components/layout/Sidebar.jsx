import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MapPin, Clock, CalendarCheck, Search, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

const adminLinks = [
  { label: "Painel", path: "/", icon: LayoutDashboard },
  { label: "Minhas Quadras", path: "/courts", icon: MapPin },
  { label: "Horários", path: "/time-slots", icon: Clock },
  { label: "Agendamentos", path: "/bookings", icon: CalendarCheck },
];

const clientLinks = [
  { label: "Buscar Quadras", path: "/explore", icon: Search },
  { label: "Meus Agendamentos", path: "/my-bookings", icon: CalendarCheck },
  { label: "Meu Perfil", path: "/profile", icon: User },
];

export default function Sidebar({ userRole }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = userRole === "admin" ? adminLinks : clientLinks;

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">QuadraFácil</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">QuadraFácil</h1>
              <p className="text-xs text-muted-foreground">
                {userRole === "admin" ? "Gestão de Quadras" : "Aluguel de Quadras"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}