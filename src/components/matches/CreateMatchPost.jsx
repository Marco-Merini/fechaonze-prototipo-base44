import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const emptyForm = {
  title: "", sport_type: "Futebol Society", date: "", start_time: "", end_time: "",
  city: "", location: "", positions_needed: "", level: "amistoso", description: "", whatsapp_number: "",
};

export default function CreateMatchPost({ open, onOpenChange, user, onCreated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await base44.entities.MatchPost.create({
        ...form,
        organizer_name: user.full_name || "Organizador",
        organizer_id: user.id,
        status: "aberto",
        interested_players: [],
      });
      toast({ title: "Partida anunciada!", description: "Jogadores já podem ver seu anúncio." });
      onOpenChange(false);
      setForm(emptyForm);
      onCreated();
    } catch (err) {
      toast({ title: "Erro ao anunciar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Anunciar Partida</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Futebol Society Quinta" required className="rounded-xl mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Modalidade</Label>
              <Select value={form.sport_type} onValueChange={(v) => set("sport_type", v)}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Futebol Society">Society</SelectItem>
                  <SelectItem value="Futsal">Futsal</SelectItem>
                  <SelectItem value="Vôlei">Vôlei</SelectItem>
                  <SelectItem value="Basquete">Basquete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nível</Label>
              <Select value={form.level} onValueChange={(v) => set("level", v)}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amistoso">Amistoso/Resenha</SelectItem>
                  <SelectItem value="competitivo">Competitivo</SelectItem>
                  <SelectItem value="iniciantes">Iniciantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Data *</Label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Início *</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Fim *</Label>
              <Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} required className="rounded-xl mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Cidade *</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Local</Label>
              <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Nome da quadra" className="rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <Label>Vagas disponíveis *</Label>
            <Input value={form.positions_needed} onChange={(e) => set("positions_needed", e.target.value)} placeholder="Ex: 2 goleiros e 1 atacante" required className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>WhatsApp para contato *</Label>
            <Input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="5511999999999" required className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="rounded-xl mt-1" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Anunciando..." : "Anunciar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}