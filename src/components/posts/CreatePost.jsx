import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function CreatePost({ me, onPosted }) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [posting, setPosting] = useState(false);
  const fileRef = useRef(null);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;
    setPosting(true);
    try {
      let image_url = "";
      if (imageFile) {
        const res = await base44.integrations.Core.UploadFile({ file: imageFile });
        image_url = res.file_url;
      }
      await base44.entities.Post.create({
        author_id: me.id,
        author_name: me.full_name,
        author_username: me.username || "",
        author_photo_url: me.photo_url || "",
        content: text.trim(),
        image_url,
        likes: [],
        comments_count: 0,
      });
      setText("");
      clearImage();
      toast({ title: "Publicado!" });
      onPosted?.();
    } catch (e) {
      toast({ title: "Erro ao publicar", description: e.message, variant: "destructive" });
    }
    setPosting(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
          {(me?.full_name || "?").charAt(0)}
        </div>
        <form onSubmit={submit} className="flex-1 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Compartilhe algo com a galera..."
            rows={2}
            className="rounded-xl resize-none"
          />
          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <ImageIcon className="w-5 h-5" /> Foto
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
            <Button type="submit" className="rounded-xl" disabled={posting || (!text.trim() && !imageFile)}>
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}