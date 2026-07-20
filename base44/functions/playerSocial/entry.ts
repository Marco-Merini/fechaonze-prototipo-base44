import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const publicFields = (u) => ({
  id: u.id,
  full_name: u.full_name,
  email: u.email,
  username: u.username,
  user_code: u.user_code,
  position: u.position,
  city: u.city,
  photo_url: u.photo_url,
  pace: u.pace,
  shooting: u.shooting,
  passing: u.passing,
  dribbling: u.dribbling,
  defending: u.defending,
  physical: u.physical,
  overall: u.overall,
  ratings_count: u.ratings_count,
  is_private: u.is_private,
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    if (body.action === 'search') {
      const q = (body.query || '').trim().toLowerCase();
      if (!q) return Response.json({ players: [] });
      const all = await base44.asServiceRole.entities.User.list('-created_date', 200);
      const players = all
        .filter((u) => u.id !== user.id)
        .filter((u) => {
          const un = (u.username || '').toLowerCase();
          const code = (u.user_code || '').toLowerCase();
          const name = (u.full_name || '').toLowerCase();
          return un.includes(q) || code.includes(q) || name.includes(q);
        })
        .map(publicFields);
      return Response.json({ players });
    }

    if (body.action === 'byIds') {
      const ids = Array.isArray(body.ids) ? body.ids : [];
      if (ids.length === 0) return Response.json({ players: [] });
      const fetched = await Promise.all(
        ids.map((id) => base44.asServiceRole.entities.User.get(id).catch(() => null))
      );
      return Response.json({ players: fetched.filter(Boolean).map(publicFields) });
    }

    if (body.action === 'getById') {
      const u = await base44.asServiceRole.entities.User.get(body.id).catch(() => null);
      if (!u) return Response.json({ error: 'Not found' }, { status: 404 });
      const [myFollow, myReq, followers, following] = await Promise.all([
        base44.asServiceRole.entities.Follow.filter({ follower_id: user.id, following_id: body.id }),
        base44.asServiceRole.entities.FollowRequest.filter({ requester_id: user.id, target_id: body.id, status: 'pending' }),
        base44.asServiceRole.entities.Follow.filter({ following_id: body.id }),
        base44.asServiceRole.entities.Follow.filter({ follower_id: body.id }),
      ]);
      return Response.json({
        player: {
          ...publicFields(u),
          i_follow: myFollow.length > 0,
          requested: myReq.length > 0,
          followers_count: followers.length,
          following_count: following.length,
        },
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});