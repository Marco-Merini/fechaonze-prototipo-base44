import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Image } from "@/components/ui/image";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PostCard({ post, me }) {
  const { toast } = useToast();
  const [likes, setLikes] = useState(post.likes || []);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);

  const liked = me ? likes.includes(me.id) : false;

  const toggleLike = async () => {
    if (!me) return;
    const newLikes = liked ? likes.filter((id) => id !== me.id) : [...likes, me.id];
    setLikes(newLikes);
    try {
      await base44.entities.Post.update(post.id, { likes: newLikes });
    } catch (e) {
      setLikes(likes);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const list = await base44.entities.Comment.filter({ post_id: post.id }, "-created_date", 100);
      setComments(list);
    } catch (e) {
      console.error(e);
    }
    setLoadingComments(false);
  };

  const toggleComments = () => {
    if (!commentsOpen) loadComments();
    setCommentsOpen(!commentsOpen);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const created = await base44.entities.Comment.create({
        post_id: post.id,
        author_id: me.id,
        author_name: me.full_name,
        author_photo_url: me.photo_url || "",
        content: commentText.trim(),
      });
      setComments([created, ...comments]);
      setCommentText("");
      setCommentCount(commentCount + 1);
      await base44.entities.Post.update(post.id, { comments_count: commentCount + 1 });
    } catch (e) {
      toast({ title: "Erro ao comentar", variant: "destructive" });
    }
    setSendingComment(false);
  };

  const share = async () => {
    const url = `${window.location.origin}/players/${post.author_id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "FechaOnze", text: post.content || "Veja este post", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copiado!" });
      }
    } catch (e) {}
  };

  return (
    <article className="bg-card rounded-2xl border border-border overflow-hidden">
      <header className="flex items-center gap-3 p-4">
        <Link to={`/players/${post.author_id}`}>
          <div className="w-11 h-11 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
            {post.author_photo_url ? (
              <img src={post.author_photo_url} alt={post.author_name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-primary">{(post.author_name || "?").charAt(0)}</span>
            )}
          </div>
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={`/players/${post.author_id}`} className="font-heading font-semibold truncate block hover:text-primary">
            {post.author_name}
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            @{post.author_username || "usuario"} • {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
      </header>

      {post.content && <p className="px-4 pb-3 whitespace-pre-wrap break-words">{post.content}</p>}

      {post.image_url && (
        <div className="w-full">
          <Image src={post.image_url} fittingType="fill" className="w-full h-72 sm:h-96" />
        </div>
      )}

      <div className="flex items-center gap-5 px-4 py-3 border-t border-border">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} /> {likes.length}
        </button>
        <button onClick={toggleComments} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <MessageCircle className="w-5 h-5" /> {commentCount}
        </button>
        <button onClick={share} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground ml-auto">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {commentsOpen && (
        <div className="border-t border-border p-4 space-y-3 bg-muted/30">
          <form onSubmit={addComment} className="flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={1}
              className="rounded-xl resize-none flex-1 min-h-[40px]"
            />
            <Button type="submit" size="icon" className="rounded-xl shrink-0" disabled={sendingComment || !commentText.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          {loadingComments ? (
            <p className="text-sm text-muted-foreground text-center py-2">Carregando...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">Nenhum comentário ainda.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                  {c.author_photo_url ? (
                    <img src={c.author_photo_url} alt={c.author_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{(c.author_name || "?").charAt(0)}</span>
                  )}
                </div>
                <div className="bg-card rounded-xl border border-border px-3 py-2 flex-1">
                  <p className="text-xs font-semibold">{c.author_name}</p>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
}