import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { WEEKDAYS } from "@/lib/establishments";
import { ArrowLeft, ImagePlus, X, MapPin, Star } from "lucide-react";

const emptyForm = {
  name: "", description: "", phone: "", email: "", cep: "", address: "", number: "",
  complement: "", neighborhood: "", city: "", state: "", latitude: "", longitude: "",
  opening_time: "08:00", closing_time: "23:00", operating_days: [], status: "active",
};

export default function EstablishmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]); // [{photo_url, is_main}]
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const est = await base44.entities.Establishment.get(id);
        setForm({
          name: est.name || "", description: est.description || "", phone: est.phone || "", email: est.email || "",
          cep: est.cep || "", address: est.address || "", number: est.number || "", complement: est.complement || "",
          neighborhood: est.neighborhood || "", city: est.city || "", state: est.state || "",
          latitude: est.latitude != null ? String(est.latitude) : "", longitude: est.longitude != null ? String(est.longitude) : "",
          opening_time: est.opening_time || "08:00", closing_time: est.closing_time || "23:00",
          operating_days: est.operating_days || [], status: est.status || "active",
        });
        const phs = await base44.entities.EstablishmentPhoto.filter({ establishment_id: id }, "order", 50);
        setPhotos(phs.map((p) => ({ id: p.id, photo_url: p.photo_url, is_main: p.is_main })));
      } catch (e) {
        toast({ title: "Erro ao carregar", description: e.message, variant: "destructive" });
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const toggleDay = (value) => {
    setForm((f) => ({ ...f, operating_days: f.operating_days.includes(value) ? f.operating_days.filter((d) => d !== value) : [...f.operating_days, value] }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push({ photo_url: file_url, is_main: false });
      }
      setPhotos((prev) => {
        const isFirst = prev.length === 0;
        return [...prev, ...uploaded.map((u, i) => ({ ...u, is_main: isFirst && i === 0 }))];
      });
    } catch {
      toast({ title: "Erro no upload", variant: "destructive" });
    }
    setUploading(false);
  };

  const setMainPhoto = (idx) => {
    setPhotos((prev) => prev.map((p, i) => ({ ...p, is_main: i === idx })));
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (prev[idx]?.is_main && next.length > 0) next[0].is_main = true;
      return next;
    });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) { toast({ title: "Geolocalização não suportada", variant: "destructive" }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((prev) => ({ ...prev, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) })),
      () => toast({ title: "Não foi possível obter sua localização", variant: "destructive" }),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const me = await base44.auth.me();
      const payload = {
        ...form,
        owner_id: me.id,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        main_photo: photos.find((p) => p.is_main)?.photo_url || photos[0]?.photo_url || "",
      };
      let estId = id;
      if (isEdit) {
        await base44.entities.Establishment.update(id, payload);
        toast({ title: "Estabelecimento atualizado!" });
      } else {
        const created = await base44.entities.Establishment.create(payload);
        estId = created.id;
        toast({ title: "Estabelecimento criado!" });
      }
      // Sincronizar fotos
      const existing = await base44.entities.EstablishmentPhoto.filter({ establishment_id: estId }, "order", 50);
      const keptIds = photos.filter((p) => p.id).map((p) => p.id);
      const toDelete = existing.filter((p) => !keptIds.includes(p.id));
      await Promise.all(toDelete.map((p) => base44.entities.EstablishmentPhoto.delete(p.id)));
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        if (p.id) {
          await base44.entities.EstablishmentPhoto.update(p.id, { is_main: p.is_main, order: i });
        } else {
          await base44.entities.EstablishmentPhoto.create({ establishment_id: estId, photo_url: p.photo_url, order: i, is_main: p.is_main });
        }
      }
      navigate(`/establishments/${estId}`);
    } catch (err) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate(id ? `/establishments/${id}` : "/establishments")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold">{isEdit ? "Editar estabelecimento" : "Criar estabelecimento"}</h1>
          <p className="text-muted-foreground text-sm">Preencha as informações do seu estabelecimento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-5">
        <div>
          <Label>Nome do estabelecimento *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl mt-1" placeholder="Ex: Gigantão" />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl mt-1" rows={2} placeholder="Complexo esportivo com quadras de futsal e society" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>CEP</Label>
            <Input value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Bairro</Label>
            <Input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="rounded-xl mt-1" />
          </div>
        </div>
        <div>
          <Label>Endereço *</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required className="rounded-xl mt-1" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Número</Label>
            <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Cidade *</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Estado *</Label>
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required className="rounded-xl mt-1" placeholder="SP" maxLength={2} />
          </div>
        </div>
        <div>
          <Label>Complemento</Label>
          <Input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} className="rounded-xl mt-1" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label>Localização no mapa (lat / lng)</Label>
            <button type="button" onClick={handleUseLocation} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Usar minha localização
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="Latitude" className="rounded-xl" />
            <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="Longitude" className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Horário de abertura</Label>
            <Input type="time" value={form.opening_time} onChange={(e) => setForm({ ...form, opening_time: e.target.value })} className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Horário de fechamento</Label>
            <Input type="time" value={form.closing_time} onChange={(e) => setForm({ ...form, closing_time: e.target.value })} className="rounded-xl mt-1" />
          </div>
        </div>
        <div>
          <Label>Dias de funcionamento</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {WEEKDAYS.map((d) => {
              const active = form.operating_days.includes(d.value);
              return (
                <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${active ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`}>
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Fotos do estabelecimento</Label>
          <div className="mt-1">
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                <ImagePlus className="w-4 h-4" /> {uploading ? "Enviando..." : "Adicionar fotos"}
              </span>
              <Input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
              {photos.map((p, i) => (
                <div key={i} className="relative group">
                  <img src={p.photo_url} alt="" className={`h-24 w-full rounded-xl object-cover border-2 ${p.is_main ? "border-accent" : "border-transparent"}`} />
                  <button type="button" onClick={() => setMainPhoto(i)} className={`absolute top-1 left-1 p-1 rounded-full ${p.is_main ? "bg-accent text-black" : "bg-black/50 text-white"}`} title="Definir como principal">
                    <Star className="w-3 h-3" fill={p.is_main ? "currentColor" : "none"} />
                  </button>
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">A foto com a estrela amarela será a foto principal.</p>
        </div>

        <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
          <Label>Estabelecimento ativo</Label>
          <Switch checked={form.status === "active"} onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "inactive" })} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="rounded-xl flex-1" onClick={() => navigate(id ? `/establishments/${id}` : "/establishments")}>Cancelar</Button>
          <Button type="submit" className="rounded-xl flex-1" disabled={saving}>{saving ? "Salvando..." : "Salvar estabelecimento"}</Button>
        </div>
      </form>
    </div>
  );
}