import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MODALITIES, AMENITIES, FLOOR_TYPES } from "@/lib/establishments";
import { ImagePlus, X, Power } from "lucide-react";

const emptyForm = {
  name: "", description: "", modality: "futsal", floor_type: "", covered: false,
  capacity: "", price_per_hour: "", default_duration: 60, amenities: [], photo_url: "", is_active: true,
};

export default function CourtFormDialog({ open, onOpenChange, establishmentId, court, onSaved, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (court) {
        setForm({
          name: court.name || "", description: court.description || "", modality: court.modality || "futsal",
          floor_type: court.floor_type || "", covered: court.covered || false,
          capacity: court.capacity ? String(court.capacity) : "", price_per_hour: court.price_per_hour ? String(court.price_per_hour) : "",
          default_duration: court.default_duration || 60, amenities: court.amenities || [], photo_url: court.photo_url || "", is_active: court.is_active !== false,
        });
        setEditingId(court.id);
      } else {
        setForm(emptyForm);
        setEditingId(null);
      }
    }
  }, [open, court]);

  const toggleAmenity = (value) => {
    setForm((f) => ({ ...f, amenities: f.amenities.includes(value) ? f.amenities.filter((a) => a !== value) : [...f.amenities, value] }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, photo_url: file_url }));
    } catch {
      toast({ title: "Erro no upload da foto", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!establishmentId) {
      toast({ title: "Estabelecimento não encontrado", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        establishment_id: establishmentId,
        capacity: form.capacity ? Number(form.capacity) : null,
        price_per_hour: Number(form.price_per_hour),
        default_duration: Number(form.default_duration),
        sport_type: MODALITIES.find((m) => m.value === form.modality)?.label || form.modality,
        city: form.city || "",
        address: form.address || "",
      };
      if (editingId) {
        await base44.entities.Court.update(editingId, payload);
        toast({ title: "Quadra atualizada!" });
        onOpenChange(false);
        onSaved();
      } else {
        const created = await base44.entities.Court.create(payload);
        toast({ title: "Quadra criada! Agora cadastre os horários." });
        onOpenChange(false);
        onSaved();
        if (onCreated) onCreated(created);
      }
    } catch (err) {
      toast({ title: "Erro ao salvar quadra", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{editingId ? "Editar Quadra" : "Nova Quadra"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Nome da quadra *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl mt-1" placeholder="Ex: Quadra Futsal 1" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Modalidade *</Label>
              <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v })}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODALITIES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de piso</Label>
              <Select value={form.floor_type} onValueChange={(v) => setForm({ ...form, floor_type: v })}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {FLOOR_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Capacidade</Label>
              <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="rounded-xl mt-1" placeholder="0" />
            </div>
            <div>
              <Label>Valor/horário (R$) *</Label>
              <Input type="number" step="0.01" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} required className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Duração (min)</Label>
              <Input type="number" value={form.default_duration} onChange={(e) => setForm({ ...form, default_duration: e.target.value })} className="rounded-xl mt-1" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
            <Label className="cursor-pointer">Quadra coberta</Label>
            <Switch checked={form.covered} onCheckedChange={(v) => setForm({ ...form, covered: v })} />
          </div>
          <div>
            <Label>Comodidades</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {AMENITIES.map((a) => {
                const active = form.amenities.includes(a.value);
                return (
                  <button key={a.value} type="button" onClick={() => toggleAmenity(a.value)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${active ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label>Foto da quadra</Label>
            <div className="flex items-center gap-3 mt-1">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                  <ImagePlus className="w-4 h-4" /> {uploading ? "Enviando..." : "Enviar foto"}
                </span>
                <Input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
              {form.photo_url && (
                <div className="relative">
                  <img src={form.photo_url} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
                  <button type="button" onClick={() => setForm({ ...form, photo_url: "" })} className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
            <Label className="cursor-pointer flex items-center gap-2"><Power className="w-4 h-4" /> Quadra ativa</Label>
            <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Salvando..." : "Salvar quadra"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}