import { base44 } from "@/api/base44Client";

export async function followUser(me, target) {
  const existing = await base44.entities.Follow.filter({
    follower_id: me.id,
    following_id: target.id,
  });
  if (!existing.length) {
    await base44.entities.Follow.create({
      follower_id: me.id,
      following_id: target.id,
    });
  }
  return "following";
}

export async function unfollowUser(me, targetId) {
  await base44.entities.Follow.deleteMany({ follower_id: me.id, following_id: targetId });
}