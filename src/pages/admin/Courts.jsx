import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, MapPin, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const sportTypes = ["Futebol Society", "Futsal", "Vôlei", "Beach Tennis", "Tênis", "Basquete", "Padel", "Outro"];

const emptyForm = {
  name: "", sport_type: "", city: "", address: "", price_per_hour: "", whatsapp_number: "", description: "", photo_url: "",
};

export default function Courts() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Court.list();
      setCourts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  const openEdit = (court) => {
    setForm({
      name: court.name, sport_type: court.sport_type, city: court.city, address: court.address,
      price_per_hour: String(court.price_per_hour), whatsapp_number: court.whatsapp_number,
      description: court.description || "", photo_url: court.photo_url || "",
    });
    setEditingId(court.id);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price_per_hour: Number(form.price_per_hour), is_active: true };
      if (editingId) {
        await base44.entities.Court.update(editingId, payload);
        toast({ title: "Quadra atualizada!" });
      } else {
        await base44.entities.Court.create(payload);
        toast({ title: "Quadra criada!" });
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      toast({ title: "Erro ao salvar", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta quadra?")) return;
    try {
      await base44.entities.Court.delete(id);
      toast({ title: "Quadra excluída" });
      load();
    } catch (e) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, photo_url: file_url }));
    } catch (err) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold">Minhas Quadras</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas quadras esportivas</p>
        </div>
        <Button onClick={openNew} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Nova Quadra
        </Button>
      </div>

      {courts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-heading font-semibold text-lg mb-1">Nenhuma quadra cadastrada</h3>
          <p className="text-muted-foreground mb-4">Comece adicionando sua primeira quadra</p>
          <Button onClick={openNew} className="rounded-xl gap-2"><Plus className="w-4 h-4" /> Cadastrar Quadra</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <div key={court.id} className="bg-white rounded-2xl border border-border overflow-hidden group hover:shadow-md transition-all">
              <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                {court.photo_url ? (
                  <img src={court.photo_url} alt={court.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="w-12 h-12 text-primary/20" />
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-primary">
                  {court.sport_type}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-lg">{court.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {court.city} — {court.address}
                </p>
                <p className="text-primary font-bold text-lg mt-3">
                  R$ {court.price_per_hour?.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/hora</span>
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="rounded-xl flex-1 gap-1" onClick={() => openEdit(court)}>
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => handleDelete(court.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingId ? "Editar Quadra" : "Nova Quadra"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label>Nome da Quadra *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Tipo de Esporte *</Label>
              <Select value={form.sport_type} onValueChange={(v) => setForm({ ...form, sport_type: v })} required>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {sportTypes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cidade *</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="rounded-xl mt-1" />
              </div>
              <div>
                <Label>Preço/hora (R$) *</Label>
                <Input type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} required className="rounded-xl mt-1" />
              </div>
            </div>
            <div>
              <Label>Endereço *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>WhatsApp *</Label>
              <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} placeholder="5511999999999" required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Foto da Quadra</Label>
              <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="rounded-xl mt-1" />
              {form.photo_url && <img src={form.photo_url} alt="Preview" className="mt-2 h-24 rounded-xl object-cover" />}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}