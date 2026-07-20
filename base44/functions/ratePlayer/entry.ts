import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const positionWeights = {
  GOL: { defending: 0.45, physical: 0.2, passing: 0.2, pace: 0.1, dribbling: 0.05, shooting: 0 },
  ZAG: { defending: 0.35, physical: 0.25, pace: 0.15, passing: 0.1, shooting: 0.1, dribbling: 0.05 },
  LAT: { pace: 0.25, defending: 0.25, physical: 0.2, passing: 0.15, dribbling: 0.1, shooting: 0.05 },
  VOL: { passing: 0.25, defending: 0.2, physical: 0.2, dribbling: 0.15, pace: 0.1, shooting: 0.1 },
  MEI: { passing: 0.25, dribbling: 0.25, shooting: 0.2, pace: 0.1, physical: 0.1, defending: 0.1 },
  EXT: { pace: 0.3, dribbling: 0.25, shooting: 0.2, passing: 0.15, physical: 0.05, defending: 0.05 },
  ATA: { shooting: 0.3, pace: 0.25, dribbling: 0.2, physical: 0.15, passing: 0.07, defending: 0.03 },
};

const computeOverall = (p) => {
  const w = positionWeights[p.position] || positionWeights.ATA;
  return Math.round(
    (p.pace || 0) * (w.pace || 0) +
    (p.shooting || 0) * (w.shooting || 0) +
    (p.passing || 0) * (w.passing || 0) +
    (p.dribbling || 0) * (w.dribbling || 0) +
    (p.defending || 0) * (w.defending || 0) +
    (p.physical || 0) * (w.physical || 0)
  );
};

const clamp = (n) => Math.max(0, Math.min(99, Number(n) || 0));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetId = body.player_id;
    if (!targetId) return Response.json({ error: 'player_id obrigatório' }, { status: 400 });
    if (targetId === me.id) return Response.json({ error: 'Você não pode avaliar a si mesmo' }, { status: 400 });

    const target = await base44.asServiceRole.entities.User.get(targetId).catch(() => null);
    if (!target) return Response.json({ error: 'Jogador não encontrado' }, { status: 404 });

    const attrs = {
      pace: clamp(body.pace),
      shooting: clamp(body.shooting),
      passing: clamp(body.passing),
      dribbling: clamp(body.dribbling),
      defending: clamp(body.defending),
      physical: clamp(body.physical),
    };

    const existing = await base44.asServiceRole.entities.PlayerRating.filter({ player_id: targetId, rater_id: me.id });
    const payload = {
      player_id: targetId,
      player_name: target.full_name,
      rater_id: me.id,
      rater_name: me.full_name,
      ...attrs,
      comment: (body.comment || '').slice(0, 500),
    };
    if (existing.length) {
      await base44.asServiceRole.entities.PlayerRating.update(existing[0].id, payload);
    } else {
      await base44.asServiceRole.entities.PlayerRating.create(payload);
    }

    const all = await base44.asServiceRole.entities.PlayerRating.filter({ player_id: targetId });
    const avg = (key) => all.length ? Math.round(all.reduce((s, r) => s + (r[key] || 0), 0) / all.length) : 0;
    const averages = {
      pace: avg('pace'), shooting: avg('shooting'), passing: avg('passing'),
      dribbling: avg('dribbling'), defending: avg('defending'), physical: avg('physical'),
    };
    const overall = computeOverall({ position: target.position, ...averages });
    await base44.asServiceRole.entities.User.update(targetId, { ...averages, overall, ratings_count: all.length });

    return Response.json({ ok: true, overall, ratings_count: all.length, averages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});