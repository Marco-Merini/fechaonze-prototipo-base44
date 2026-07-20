import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";

export default function Feed() {
  const [me, setMe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const meUser = await base44.auth.me();
      setMe(meUser);
      const list = await base44.entities.Post.list("-created_date", 50);
      setPosts(list);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">Feed 📰</h1>
        <p className="text-muted-foreground mt-1">Veja o que a galera está compartilhando</p>
      </div>
      {me && <CreatePost me={me} onPosted={load} />}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <p className="font-heading font-semibold text-lg mb-1">Nada por aqui ainda</p>
          <p className="text-muted-foreground">Seja o primeiro a publicar!</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} me={me} />)
      )}
    </div>
  );
}