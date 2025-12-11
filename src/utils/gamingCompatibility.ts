import { System } from '@/types';
import { Game } from '@/components/ui/GamingFilter';

// GPU performance tiers (simplified)
const gpuTiers: { [key: string]: number } = {
  // Low-end
  'GTX 1050': 1, 'GTX 1050 Ti': 2, 'GTX 1060': 3, 'RX 560': 1, 'RX 570': 2, 'RX 580': 3,
  // Mid-range
  'GTX 1660': 4, 'GTX 1660 Ti': 5, 'RTX 2060': 6, 'RTX 3060': 7, 'RX 6600': 6, 'RX 6600 XT': 7,
  // High-end
  'RTX 3070': 8, 'RTX 3080': 9, 'RTX 4070': 8, 'RTX 4070 Ti': 9, 'RTX 4080': 10, 'RTX 4090': 10,
  'RX 6700 XT': 8, 'RX 6800': 9, 'RX 6800 XT': 9, 'RX 6900 XT': 10, 'RX 7900 XT': 10, 'RX 7900 XTX': 10
};

// CPU performance tiers (simplified)
const cpuTiers: { [key: string]: number } = {
  // Low-end
  'i3': 1, 'i5-4': 2, 'i5-6': 3, 'i5-8': 4, 'i5-10': 5, 'i5-12': 6, 'i5-13': 7, 'i5-14': 8,
  'Ryzen 3': 2, 'Ryzen 5 2600': 3, 'Ryzen 5 3600': 4, 'Ryzen 5 5600': 5, 'Ryzen 5 7600': 6,
  // Mid-range
  'i7-6': 4, 'i7-7': 5, 'i7-8': 6, 'i7-9': 7, 'i7-10': 8, 'i7-11': 8, 'i7-12': 9, 'i7-13': 9, 'i7-14': 10,
  'Ryzen 7 2700': 4, 'Ryzen 7 3700': 5, 'Ryzen 7 5700': 6, 'Ryzen 7 7700': 7,
  // High-end
  'i9': 8, 'Threadripper': 10, 'Ryzen 9': 8
};

export interface GamingCompatibility {
  isCompatible: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
}

export function checkGamingCompatibility(
  system: System,
  games: Game[],
  resolution: '1080p' | '1440p' | '4k',
  qualityPreset: 'low' | 'medium' | 'high' | 'ultra',
  targetFps: number
): GamingCompatibility {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;
  let gameCount = 0;

  for (const game of games) {
    gameCount++;
    let gameScore = 100;

    // Check RAM
    const systemRam = parseInt(system.ram?.replace(/\D/g, '') || '0');
    const requiredRam = qualityPreset === 'low' ? game.minRam : game.recommendedRam;
    
    if (systemRam < requiredRam) {
      issues.push(`${game.name}: Insufficient RAM (${systemRam}GB < ${requiredRam}GB required)`);
      gameScore -= 30;
    }

    // Check CPU compatibility (simplified)
    const systemCpu = system.cpu || '';
    const requiredCpu = qualityPreset === 'low' ? game.minCpu : game.recommendedCpu;
    
    if (!isCpuCompatible(systemCpu, requiredCpu)) {
      issues.push(`${game.name}: CPU may not meet requirements`);
      gameScore -= 20;
    }

    // Check GPU compatibility (simplified)
    const systemGpu = system.gpu || '';
    const requiredGpu = qualityPreset === 'low' ? game.minGpu : game.recommendedGpu;
    
    if (!isGpuCompatible(systemGpu, requiredGpu)) {
      issues.push(`${game.name}: GPU may not meet requirements`);
      gameScore -= 25;
    }

    // Check expected FPS
    const expectedFps = getExpectedFps(game, resolution, qualityPreset);
    if (expectedFps < targetFps) {
      issues.push(`${game.name}: Expected ${expectedFps} FPS < ${targetFps} FPS target`);
      gameScore -= 15;
    }

    totalScore += Math.max(0, gameScore);
  }

  const averageScore = gameCount > 0 ? totalScore / gameCount : 0;
  const isCompatible = averageScore >= 70 && issues.length === 0;

  // Generate recommendations
  if (averageScore < 70) {
    recommendations.push('Consider upgrading GPU for better gaming performance');
  }
  if (issues.some(issue => issue.includes('RAM'))) {
    recommendations.push('Upgrade RAM for better multitasking and gaming');
  }
  if (issues.some(issue => issue.includes('CPU'))) {
    recommendations.push('Consider upgrading CPU for better overall performance');
  }

  return {
    isCompatible,
    score: Math.round(averageScore),
    issues,
    recommendations
  };
}

function isCpuCompatible(systemCpu: string, requiredCpu: string): boolean {
  // Simplified CPU compatibility check
  const systemCpuLower = systemCpu.toLowerCase();
  const requiredCpuLower = requiredCpu.toLowerCase();
  
  // Extract generation numbers for Intel
  const systemGen = systemCpuLower.match(/i[3579]-(\d+)/)?.[1];
  const requiredGen = requiredCpuLower.match(/i[3579]-(\d+)/)?.[1];
  
  if (systemGen && requiredGen) {
    return parseInt(systemGen) >= parseInt(requiredGen);
  }
  
  // For AMD, check Ryzen generation
  const systemRyzen = systemCpuLower.match(/ryzen\s*(\d+)/)?.[1];
  const requiredRyzen = requiredCpuLower.match(/ryzen\s*(\d+)/)?.[1];
  
  if (systemRyzen && requiredRyzen) {
    return parseInt(systemRyzen) >= parseInt(requiredRyzen);
  }
  
  // Fallback: assume compatible if we can't determine
  return true;
}

function isGpuCompatible(systemGpu: string, requiredGpu: string): boolean {
  // Simplified GPU compatibility check
  const systemGpuLower = systemGpu.toLowerCase();
  const requiredGpuLower = requiredGpu.toLowerCase();
  
  // Extract GPU model numbers
  const systemModel = systemGpuLower.match(/(gtx|rtx|rx)\s*(\d+)/);
  const requiredModel = requiredGpuLower.match(/(gtx|rtx|rx)\s*(\d+)/);
  
  if (systemModel && requiredModel) {
    const systemNum = parseInt(systemModel[2]);
    const requiredNum = parseInt(requiredModel[2]);
    
    // RTX > GTX, higher numbers generally better
    if (systemModel[1] === 'rtx' && requiredModel[1] === 'gtx') {
      return true;
    }
    if (systemModel[1] === 'gtx' && requiredModel[1] === 'rtx') {
      return false;
    }
    
    return systemNum >= requiredNum;
  }
  
  // Fallback: assume compatible if we can't determine
  return true;
}

function getExpectedFps(game: Game, resolution: '1080p' | '1440p' | '4k', qualityPreset: 'low' | 'medium' | 'high' | 'ultra'): number {
  const fpsMap = {
    '1080p': { low: game.fps1080pLow, medium: game.fps1080pMedium, high: game.fps1080pHigh },
    '1440p': { low: game.fps1440pLow, medium: game.fps1440pMedium, high: game.fps1440pHigh },
    '4k': { low: game.fps4kLow, medium: game.fps4kMedium, high: game.fps4kHigh }
  };
  
  // Map 'ultra' to 'high' since Game interface doesn't have ultra FPS values
  const qualityKey = qualityPreset === 'ultra' ? 'high' : qualityPreset;
  return fpsMap[resolution][qualityKey as 'low' | 'medium' | 'high'] || 60;
}

// Heuristic FPS estimation for a given system based on simple CPU/GPU tier maps
export function estimateSystemFps(
  system: System,
  game: Game,
  resolution: '1080p' | '1440p' | '4k',
  qualityPreset: 'low' | 'medium' | 'high' | 'ultra'
): number {
  const baseFps = getExpectedFps(game, resolution, qualityPreset);

  const gpuTier = getGpuTier(system.gpu || '');
  const cpuTier = getCpuTier(system.cpu || '');

  // Blend GPU heavier than CPU
  const gpuFactor = 0.55 + gpuTier * 0.07; // baseline ~0.55, top ~1.25
  const cpuFactor = 0.7 + cpuTier * 0.05; // baseline ~0.7, top ~1.2

  // RAM headroom: simple penalty if below recommended
  const systemRam = parseInt(system.ram?.replace(/\D/g, '') || '0');
  const ramPenalty = systemRam && systemRam < game.recommendedRam ? 0.85 : 1;

  const estimated = baseFps * gpuFactor * 0.7 + baseFps * cpuFactor * 0.25;
  const withRam = estimated * ramPenalty;

  // Clamp to avoid silly numbers
  return Math.max(10, Math.round(Math.min(withRam, baseFps * 2)));
}

function getGpuTier(name: string): number {
  const found = Object.keys(gpuTiers).find((key) =>
    name.toLowerCase().includes(key.toLowerCase())
  );
  return found ? gpuTiers[found] : 5; // mid baseline if unknown
}

function getCpuTier(name: string): number {
  const lower = name.toLowerCase();

  // Try to match Intel i3/i5/i7/i9 with generation numbers
  const intelMatch = lower.match(/i([3579])-(\d{1,2})/);
  if (intelMatch) {
    const series = intelMatch[1];
    const gen = intelMatch[2];
    return cpuTiers[`${series}${gen}`] || cpuTiers[`i${series}-${gen}`] || 5;
  }

  // Ryzen patterns
  const ryzenMatch = lower.match(/ryzen\s*(\d)/);
  if (ryzenMatch) {
    const series = ryzenMatch[1];
    if (series === '3') return 2;
    if (series === '5') return 4;
    if (series === '7') return 6;
    if (series === '9') return 8;
  }

  return 5; // default mid tier
}

export function getCompatibilityColor(score: number): string {
  if (score >= 90) return 'text-green-400 bg-green-400/20';
  if (score >= 70) return 'text-yellow-400 bg-yellow-400/20';
  if (score >= 50) return 'text-orange-400 bg-orange-400/20';
  return 'text-red-400 bg-red-400/20';
}

export function getCompatibilityLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

