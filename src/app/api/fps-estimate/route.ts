import { NextResponse } from 'next/server';

// Use supported model name for v1beta generateContent
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Use node runtime to avoid edge/network provider quirks during LLM calls
export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { system, game, resolution, quality } = body as {
      system: {
        cpu?: string;
        gpu?: string;
        ram?: string;
      };
      game: {
        name: string;
        fpsProfiles: {
          '1080p': { low: number; medium: number; high: number };
          '1440p': { low: number; medium: number; high: number };
          '4k': { low: number; medium: number; high: number };
        };
      };
      resolution: '1080p' | '1440p' | '4k';
      quality: 'low' | 'medium' | 'high' | 'ultra';
    };

    if (!game?.name || !resolution || !quality) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const qualityKey = quality === 'ultra' ? 'high' : quality;
    const baseFps = game.fpsProfiles[resolution]?.[qualityKey as 'low' | 'medium' | 'high'] ?? 60;

    const prompt = `
You are an FPS estimator. Given a PC and a game's known baseline FPS, estimate likely average FPS.

Rules:
- Return ONLY a number (integer). No text, no units.
- Consider CPU, GPU, RAM. Assume modern drivers.
- Baseline FPS for ${game.name} at ${resolution} ${quality} is ~${baseFps} FPS on a balanced mid-tier build.
- If hardware is weaker, scale down; stronger, scale up. Stay realistic (no more than 2x baseline).
- If info is missing, keep estimate conservative.

System:
- CPU: ${system?.cpu || 'unknown'}
- GPU: ${system?.gpu || 'unknown'}
- RAM: ${system?.ram || 'unknown'}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Gemini error', response.status, errBody);
      return NextResponse.json(
        { error: 'LLM request failed', providerStatus: response.status, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

    const parsed = text ? parseInt(text.replace(/[^\d]/g, ''), 10) : NaN;
    if (!parsed || Number.isNaN(parsed)) {
    return NextResponse.json({ error: 'Could not parse FPS', detail: text }, { status: 500 });
    }

    // Clamp to reasonable range
    const fps = Math.max(10, Math.min(parsed, baseFps * 2));

    return NextResponse.json({ fps });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: `${err}` }, { status: 500 });
  }
}

