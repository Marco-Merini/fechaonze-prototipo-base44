import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    if (body.action === 'accept') {
      const request = await base44.asServiceRole.entities.FollowRequest.get(body.request_id).catch(() => null);
      if (!request || request.target_id !== me.id) {
        return Response.json({ error: 'Solicitação inválida' }, { status: 403 });
      }
      const existing = await base44.asServiceRole.entities.Follow.filter({
        follower_id: request.requester_id,
        following_id: me.id,
      });
      if (!existing.length) {
        await base44.asServiceRole.entities.Follow.create({
          follower_id: request.requester_id,
          following_id: me.id,
        });
      }
      await base44.asServiceRole.entities.FollowRequest.delete(body.request_id);
      return Response.json({ ok: true });
    }

    if (body.action === 'reject') {
      const request = await base44.asServiceRole.entities.FollowRequest.get(body.request_id).catch(() => null);
      if (!request || request.target_id !== me.id) {
        return Response.json({ error: 'Solicitação inválida' }, { status: 403 });
      }
      await base44.asServiceRole.entities.FollowRequest.delete(body.request_id);
      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});