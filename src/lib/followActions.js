import { base44 } from "@/api/base44Client";

export async function followUser(me, target) {
  if (target.is_private) {
    const existing = await base44.entities.FollowRequest.filter({
      requester_id: me.id,
      target_id: target.id,
      status: "pending",
    });
    if (!existing.length) {
      await base44.entities.FollowRequest.create({
        requester_id: me.id,
        requester_name: me.full_name,
        target_id: target.id,
        target_name: target.full_name || "",
        status: "pending",
      });
    }
    return "requested";
  }
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

export async function cancelRequest(me, targetId) {
  await base44.entities.FollowRequest.deleteMany({
    requester_id: me.id,
    target_id: targetId,
    status: "pending",
  });
}