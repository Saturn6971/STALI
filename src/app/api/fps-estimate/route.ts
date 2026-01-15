import { NextResponse } from 'next/server';

// Use supported model name for v1beta generateContent (without 'models/' prefix)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Use node runtime to avoid edge/network provider quirks during LLM calls
export const runtime = 'nodejs';

// Simple in-memory cache to reduce API calls
const fpsCache = new Map<string, { fps: number; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache

// Generate cache key from request params
function getCacheKey(system: { cpu?: string; gpu?: string; ram?: string }, game: string, resolution: string, quality: string): string {
  return `${system?.cpu || ''}-${system?.gpu || ''}-${system?.ram || ''}-${game}-${resolution}-${quality}`.toLowerCase();
}

// Estimate FPS locally without API call (fallback)
function estimateFpsLocally(
  system: { cpu?: string; gpu?: string; ram?: string },
  baseFps: number
): number {
  let multiplier = 1.0;
  
  const gpu = (system?.gpu || '').toLowerCase();
  const cpu = (system?.cpu || '').toLowerCase();
  
  // GPU-based adjustments
  if (gpu.includes('4090') || gpu.includes('4080')) multiplier = 1.8;
  else if (gpu.includes('4070') || gpu.includes('3090') || gpu.includes('3080')) multiplier = 1.5;
  else if (gpu.includes('4060') || gpu.includes('3070') || gpu.includes('7900')) multiplier = 1.3;
  else if (gpu.includes('3060') || gpu.includes('7800') || gpu.includes('6800')) multiplier = 1.1;
  else if (gpu.includes('3050') || gpu.includes('6700') || gpu.includes('7600')) multiplier = 0.9;
  else if (gpu.includes('1660') || gpu.includes('1650') || gpu.includes('6600')) multiplier = 0.7;
  else if (gpu.includes('1050') || gpu.includes('1030')) multiplier = 0.4;
  
  // CPU adjustments (minor impact)
  if (cpu.includes('i9') || cpu.includes('9900') || cpu.includes('7950') || cpu.includes('7900')) multiplier *= 1.1;
  else if (cpu.includes('i3') || cpu.includes('3100') || cpu.includes('5600')) multiplier *= 0.95;
  
  return Math.round(Math.max(15, Math.min(baseFps * multiplier, baseFps * 2)));
}

export async function POST(req: Request) {
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
    
    // Check cache first
    const cacheKey = getCacheKey(system, game.name, resolution, quality);
    const cached = fpsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ fps: cached.fps, cached: true });
    }

    // If no API key, use local estimation
    if (!GEMINI_API_KEY) {
      const fps = estimateFpsLocally(system, baseFps);
      fpsCache.set(cacheKey, { fps, timestamp: Date.now() });
      return NextResponse.json({ fps, estimated: true });
    }

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
      // On rate limit (429) or other errors, fall back to local estimation silently
      if (response.status === 429 || response.status >= 500) {
        const fps = estimateFpsLocally(system, baseFps);
        fpsCache.set(cacheKey, { fps, timestamp: Date.now() });
        return NextResponse.json({ fps, fallback: true });
      }
      
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
      // Fall back to local estimation if parsing fails
      const fps = estimateFpsLocally(system, baseFps);
      fpsCache.set(cacheKey, { fps, timestamp: Date.now() });
      return NextResponse.json({ fps, fallback: true });
    }

    // Clamp to reasonable range
    const fps = Math.max(10, Math.min(parsed, baseFps * 2));
    
    // Cache the result
    fpsCache.set(cacheKey, { fps, timestamp: Date.now() });

    return NextResponse.json({ fps });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', detail: `${err}` }, { status: 500 });
  }
}

