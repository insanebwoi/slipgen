// AI Processing API — server-gated by auth, ban status, plan, and daily quota.
// Strategy:
//   1. Pollinations.ai (FREE, no key needed)
//   2. fal.ai (if FAL_KEY set)
//   3. Replicate (if REPLICATE_API_TOKEN set)

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const FAL_KEY = process.env.FAL_KEY || '';
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || '';

// Daily quotas for the real-AI path. Soft-cartoon clientside has no quota.
// Free is intentionally 0 because pricing copy says AI requires Standard.
// Basic gets a small allowance so they get value beyond Free.
const DAILY_QUOTA: Record<string, number> = {
  free: 0,
  basic: 4,
  standard: 9999,
};

export async function POST(req: NextRequest) {
  // ===== Gate 1: must be signed in =====
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // ===== Gate 2: must have a profile, must not be banned =====
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, banned, role')
    .eq('id', user.id)
    .single();
  if (!profile) {
    return NextResponse.json({ message: 'Profile not found' }, { status: 403 });
  }
  if (profile.banned) {
    return NextResponse.json({ message: 'Account suspended' }, { status: 403 });
  }

  // ===== Gate 3: plan must permit AI; admins bypass quota =====
  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
  const quota = DAILY_QUOTA[profile.plan] ?? 0;
  if (!isAdmin && quota === 0) {
    return NextResponse.json(
      { message: 'AI transform requires the Basic or Standard plan.' },
      { status: 402 },
    );
  }

  // ===== Gate 4: daily quota — count today's ai_process events for this user =====
  if (!isAdmin) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { count: usedToday } = await supabase
      .from('slip_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'ai_process')
      .gte('created_at', startOfDay.toISOString());
    if ((usedToday ?? 0) >= quota) {
      return NextResponse.json(
        { message: `Daily AI quota reached (${quota}/day on ${profile.plan}).` },
        { status: 429 },
      );
    }
  }

  // ===== Validated; proceed =====
  let body: { image?: string; passion?: string; prompt?: string; studentName?: string; gender?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }
  const { image, passion, prompt, studentName, gender } = body;

  if (!passion && !prompt) {
    return NextResponse.json({ message: 'No passion/prompt' }, { status: 400 });
  }

  try {
    // 1. Pollinations.ai — FREE
    const pollResult = await tryPollinations(passion ?? '', prompt ?? '', studentName, gender);
    if (pollResult) {
      await logAiEvent(supabase, user.id, 'pollinations');
      return NextResponse.json({ imageUrl: pollResult });
    }

    // 2. fal.ai
    if (FAL_KEY && image && image.length > 100) {
      const falResult = await tryFal(image, prompt ?? '');
      if (falResult) {
        await logAiEvent(supabase, user.id, 'fal');
        return NextResponse.json({ imageUrl: falResult });
      }
    }

    // 3. Replicate
    if (REPLICATE_TOKEN && image && image.length > 100) {
      const repResult = await tryReplicate(image, prompt ?? '');
      if (repResult) {
        await logAiEvent(supabase, user.id, 'replicate');
        return NextResponse.json({ imageUrl: repResult });
      }
    }

    return NextResponse.json({ fallback: true }, { status: 503 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('[AI] Error:', msg);
    return NextResponse.json({ fallback: true, message: msg }, { status: 500 });
  }
}

async function logAiEvent(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  userId: string,
  provider: string,
) {
  // Best-effort; failure here must not break the user-facing response.
  try {
    await supabase.from('slip_events').insert({
      user_id: userId,
      event_type: 'ai_process',
      slip_count: 1,
      meta: { provider },
    });
  } catch (err) {
    console.error('[AI] Failed to log event:', err);
  }
}

// ==========================================
// Pollinations.ai — 100% FREE, no key!
// ==========================================
async function tryPollinations(
  passion: string,
  prompt: string,
  studentName?: string,
  gender?: string,
): Promise<string | null> {
  try {
    const cartoonPrompt = buildCartoonPrompt(passion, gender);
    const encodedPrompt = encodeURIComponent(cartoonPrompt);
    const seed = studentName
      ? Array.from(studentName).reduce((a, c) => a + c.charCodeAt(0), 0)
      : Math.floor(Math.random() * 99999);

    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}&model=flux`;

    const resp = await fetch(url, {
      headers: { 'User-Agent': 'SlipGen/1.0' },
      signal: AbortSignal.timeout(60000),
    });
    if (!resp.ok) return null;

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('image')) return null;

    const buf = await resp.arrayBuffer();
    if (buf.byteLength < 1000) return null;

    const b64 = Buffer.from(buf).toString('base64');
    return `data:${contentType};base64,${b64}`;
  } catch {
    return null;
  }
  // unused param kept for signature parity
  void prompt;
}

function buildCartoonPrompt(passion: string, gender?: string): string {
  const g = gender === 'female' ? 'girl' : gender === 'male' ? 'boy' : 'child';

  const passionPrompts: Record<string, string> = {
    Doctor: `adorable cute pixar disney 3d cartoon ${g} dressed as a doctor, wearing white lab coat and stethoscope, big sparkling eyes, smooth skin, warm smile, soft lighting, pastel background, high quality 3d render, character portrait, waist up`,
    Engineer: `adorable cute pixar disney 3d cartoon ${g} dressed as an engineer, wearing yellow safety hard hat and vest, holding blueprints, big sparkling eyes, smooth skin, warm smile, soft lighting, construction site background, high quality 3d render, character portrait, waist up`,
    Scientist: `adorable cute pixar disney 3d cartoon ${g} dressed as a scientist, wearing white lab coat and safety goggles on head, holding test tube, big sparkling eyes, smooth skin, warm smile, laboratory background, high quality 3d render, character portrait, waist up`,
    Pilot: `adorable cute pixar disney 3d cartoon ${g} dressed as a pilot, wearing pilot uniform with aviator cap, big sparkling eyes, smooth skin, warm smile, sky and clouds background, high quality 3d render, character portrait, waist up`,
    Artist: `adorable cute pixar disney 3d cartoon ${g} as an artist, holding colorful paintbrush and palette, paint splashes, big sparkling eyes, smooth skin, warm smile, art studio background, high quality 3d render, character portrait, waist up`,
    Teacher: `adorable cute pixar disney 3d cartoon ${g} as a teacher, holding book and chalk, wearing glasses, big sparkling eyes, smooth skin, warm smile, classroom with chalkboard background, high quality 3d render, character portrait, waist up`,
    Athlete: `adorable cute pixar disney 3d cartoon ${g} as an athlete, wearing sports jersey with medal, big sparkling eyes, smooth skin, warm smile, stadium background, high quality 3d render, character portrait, waist up`,
    Astronaut: `adorable cute pixar disney 3d cartoon ${g} as an astronaut, wearing space suit with helmet under arm, big sparkling eyes, smooth skin, warm smile, stars and space background, high quality 3d render, character portrait, waist up`,
    Chef: `adorable cute pixar disney 3d cartoon ${g} as a chef, wearing white chef hat and apron, holding wooden spoon, big sparkling eyes, smooth skin, warm smile, kitchen background, high quality 3d render, character portrait, waist up`,
    Musician: `adorable cute pixar disney 3d cartoon ${g} as a musician, holding guitar, big sparkling eyes, smooth skin, warm smile, stage with colorful lights background, high quality 3d render, character portrait, waist up`,
    Police: `adorable cute pixar disney 3d cartoon ${g} as a police officer, wearing blue police uniform and cap, big sparkling eyes, smooth skin, warm smile, city background, high quality 3d render, character portrait, waist up`,
    Firefighter: `adorable cute pixar disney 3d cartoon ${g} as a firefighter, wearing red firefighter helmet and coat, big sparkling eyes, smooth skin, warm smile, fire station background, high quality 3d render, character portrait, waist up`,
  };

  return passionPrompts[passion] ||
    `adorable cute pixar disney 3d cartoon ${g}, big sparkling eyes, smooth skin, warm smile, colorful cheerful background, high quality 3d render, character portrait, waist up`;
}

// ==========================================
// fal.ai
// ==========================================
async function tryFal(image: string, prompt: string): Promise<string | null> {
  try {
    const resp = await fetch('https://queue.fal.run/fal-ai/face-to-sticker', {
      method: 'POST',
      headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: image,
        prompt: prompt || 'cute pixar disney 3d cartoon character',
        instant_id_strength: 0.7,
        num_inference_steps: 20,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.images?.[0]?.url) return await fetchImageAsDataUrl(data.images[0].url);
    if (data.request_id) return await pollFal(data.request_id);
    return null;
  } catch { return null; }
}

async function pollFal(requestId: string): Promise<string | null> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const r = await fetch(`https://queue.fal.run/fal-ai/face-to-sticker/requests/${requestId}/status`, {
        headers: { Authorization: `Key ${FAL_KEY}` },
      });
      if (!r.ok) continue;
      const s = await r.json();
      if (s.status === 'COMPLETED') {
        const res = await fetch(`https://queue.fal.run/fal-ai/face-to-sticker/requests/${requestId}`, {
          headers: { Authorization: `Key ${FAL_KEY}` },
        });
        const d = await res.json();
        if (d.images?.[0]?.url) return await fetchImageAsDataUrl(d.images[0].url);
        break;
      }
      if (s.status === 'FAILED') break;
    } catch { /* continue */ }
  }
  return null;
}

// ==========================================
// Replicate
// ==========================================
async function tryReplicate(image: string, prompt: string): Promise<string | null> {
  try {
    const r = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${REPLICATE_TOKEN}`, 'Content-Type': 'application/json', Prefer: 'wait' },
      body: JSON.stringify({
        version: '764d4827ea159608a07cdde8ddf1c6000019627515eb02b6b449695fd547e5ef',
        input: { image, prompt, steps: 20, width: 512, height: 512, upscale: false, prompt_strength: 4.5 },
      }),
      signal: AbortSignal.timeout(90000),
    });
    if (r.status === 402) return null;
    if (!r.ok) return null;
    const p = await r.json();
    if (p.status === 'succeeded' && p.output) {
      return await fetchImageAsDataUrl(Array.isArray(p.output) ? p.output[0] : p.output);
    }
    return null;
  } catch { return null; }
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    const ct = r.headers.get('content-type') || 'image/png';
    return `data:${ct};base64,${Buffer.from(buf).toString('base64')}`;
  } catch { return null; }
}
