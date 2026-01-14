'use client';

import { useState } from 'react';

export interface Game {
  id: string;
  name: string;
  slug: string;
  genre: string;
  developer: string;
  minCpu: string;
  minGpu: string;
  minRam: number;
  recommendedCpu: string;
  recommendedGpu: string;
  recommendedRam: number;
  // Performance targets for different settings
  fps1080pLow: number;
  fps1080pMedium: number;
  fps1080pHigh: number;
  fps1440pLow: number;
  fps1440pMedium: number;
  fps1440pHigh: number;
  fps4kLow: number;
  fps4kMedium: number;
  fps4kHigh: number;
}

export interface GamingFilter {
  selectedGames: string[];
  resolution: '1080p' | '1440p' | '4k';
  qualityPreset: 'low' | 'medium' | 'high' | 'ultra';
  targetFps: number;
}

interface GamingFilterProps {
  onFilterChange: (filter: GamingFilter) => void;
  className?: string;
}

export const popularGames: Game[] = [
  {
    id: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    genre: 'RPG',
    developer: 'CD Projekt RED',
    minCpu: 'Intel Core i5-3570K / AMD FX-8310',
    minGpu: 'NVIDIA GTX 780 3GB / AMD Radeon RX 470',
    minRam: 8,
    recommendedCpu: 'Intel Core i7-4790 / AMD Ryzen 3 3200G',
    recommendedGpu: 'NVIDIA GTX 1060 6GB / AMD Radeon RX 580',
    recommendedRam: 12,
    fps1080pLow: 60,
    fps1080pMedium: 45,
    fps1080pHigh: 30,
    fps1440pLow: 45,
    fps1440pMedium: 30,
    fps1440pHigh: 20,
    fps4kLow: 30,
    fps4kMedium: 20,
    fps4kHigh: 15
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    slug: 'elden-ring',
    genre: 'RPG',
    developer: 'FromSoftware',
    minCpu: 'Intel Core i5-8400 / AMD Ryzen 3 3300X',
    minGpu: 'NVIDIA GTX 1060 3GB / AMD RX 580 4GB',
    minRam: 12,
    recommendedCpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600X',
    recommendedGpu: 'NVIDIA GTX 1070 8GB / AMD RX VEGA 56',
    recommendedRam: 16,
    fps1080pLow: 60,
    fps1080pMedium: 45,
    fps1080pHigh: 30,
    fps1440pLow: 45,
    fps1440pMedium: 30,
    fps1440pHigh: 20,
    fps4kLow: 30,
    fps4kMedium: 20,
    fps4kHigh: 15
  },
  {
    id: 'call-of-duty-mw3',
    name: 'Call of Duty: Modern Warfare III',
    slug: 'call-of-duty-mw3',
    genre: 'FPS',
    developer: 'Infinity Ward',
    minCpu: 'Intel Core i5-6600 / AMD Ryzen 5 1400',
    minGpu: 'NVIDIA GTX 1060 / AMD RX 580',
    minRam: 8,
    recommendedCpu: 'Intel Core i7-8700K / AMD Ryzen 7 2700X',
    recommendedGpu: 'NVIDIA RTX 3060 / AMD RX 6600 XT',
    recommendedRam: 16,
    fps1080pLow: 60,
    fps1080pMedium: 60,
    fps1080pHigh: 45,
    fps1440pLow: 60,
    fps1440pMedium: 45,
    fps1440pHigh: 30,
    fps4kLow: 45,
    fps4kMedium: 30,
    fps4kHigh: 20
  },
  {
    id: 'baldurs-gate-3',
    name: 'Baldur\'s Gate 3',
    slug: 'baldurs-gate-3',
    genre: 'RPG',
    developer: 'Larian Studios',
    minCpu: 'Intel Core i5-4690 / AMD FX 4350',
    minGpu: 'NVIDIA GTX 970 / AMD RX 480',
    minRam: 8,
    recommendedCpu: 'Intel Core i7-8700K / AMD Ryzen 5 3600',
    recommendedGpu: 'NVIDIA RTX 2060 Super / AMD RX 5700 XT',
    recommendedRam: 16,
    fps1080pLow: 60,
    fps1080pMedium: 45,
    fps1080pHigh: 30,
    fps1440pLow: 45,
    fps1440pMedium: 30,
    fps1440pHigh: 20,
    fps4kLow: 30,
    fps4kMedium: 20,
    fps4kHigh: 15
  },
  {
    id: 'counter-strike-2',
    name: 'Counter-Strike 2',
    slug: 'counter-strike-2',
    genre: 'FPS',
    developer: 'Valve',
    minCpu: 'Intel Core i5-2500K / AMD FX-6300',
    minGpu: 'NVIDIA GTX 1050 Ti / AMD RX 560',
    minRam: 8,
    recommendedCpu: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
    recommendedGpu: 'NVIDIA GTX 1660 / AMD RX 580',
    recommendedRam: 16,
    fps1080pLow: 144,
    fps1080pMedium: 120,
    fps1080pHigh: 90,
    fps1440pLow: 120,
    fps1440pMedium: 90,
    fps1440pHigh: 60,
    fps4kLow: 90,
    fps4kMedium: 60,
    fps4kHigh: 30
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    slug: 'fortnite',
    genre: 'Battle Royale',
    developer: 'Epic Games',
    minCpu: 'Intel Core i3-3225 / AMD FX-4350',
    minGpu: 'NVIDIA GTX 660 / AMD Radeon HD 7870',
    minRam: 4,
    recommendedCpu: 'Intel Core i5-8400 / AMD Ryzen 5 2600',
    recommendedGpu: 'NVIDIA GTX 1060 / AMD RX 580',
    recommendedRam: 8,
    fps1080pLow: 144,
    fps1080pMedium: 120,
    fps1080pHigh: 90,
    fps1440pLow: 120,
    fps1440pMedium: 90,
    fps1440pHigh: 60,
    fps4kLow: 90,
    fps4kMedium: 60,
    fps4kHigh: 30
  },
  {
    id: 'valorant',
    name: 'Valorant',
    slug: 'valorant',
    genre: 'FPS',
    developer: 'Riot Games',
    minCpu: 'Intel Core i3-4150 / AMD FX-6300',
    minGpu: 'NVIDIA GTX 730 / AMD Radeon R7 240',
    minRam: 4,
    recommendedCpu: 'Intel Core i5-4460 / AMD Ryzen 5 1600',
    recommendedGpu: 'NVIDIA GTX 1050 Ti / AMD RX 560',
    recommendedRam: 4,
    fps1080pLow: 144,
    fps1080pMedium: 120,
    fps1080pHigh: 90,
    fps1440pLow: 120,
    fps1440pMedium: 90,
    fps1440pHigh: 60,
    fps4kLow: 90,
    fps4kMedium: 60,
    fps4kHigh: 30
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    slug: 'minecraft',
    genre: 'Sandbox',
    developer: 'Mojang Studios',
    minCpu: 'Intel Core i3-3210 / AMD A8-7600 APU',
    minGpu: 'Intel HD Graphics 4000 / AMD Radeon R5',
    minRam: 4,
    recommendedCpu: 'Intel Core i5-4690 / AMD A10-7800',
    recommendedGpu: 'NVIDIA GTX 750 Ti / AMD Radeon R7 260X',
    recommendedRam: 8,
    fps1080pLow: 60,
    fps1080pMedium: 60,
    fps1080pHigh: 60,
    fps1440pLow: 60,
    fps1440pMedium: 60,
    fps1440pHigh: 60,
    fps4kLow: 60,
    fps4kMedium: 60,
    fps4kHigh: 60
  }
];

export default function GamingFilter({ onFilterChange, className = '' }: GamingFilterProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [resolution, setResolution] = useState<'1080p' | '1440p' | '4k'>('1080p');
  const [qualityPreset, setQualityPreset] = useState<'low' | 'medium' | 'high' | 'ultra'>('medium');
  const [targetFps, setTargetFps] = useState<number>(60);

  const handleGameToggle = (gameId: string) => {
    const newSelectedGames = selectedGames.includes(gameId)
      ? selectedGames.filter(id => id !== gameId)
      : [...selectedGames, gameId];
    
    setSelectedGames(newSelectedGames);
    updateFilter(newSelectedGames, resolution, qualityPreset, targetFps);
  };

  const updateFilter = (games: string[], res: string, quality: string, fps: number) => {
    onFilterChange({
      selectedGames: games,
      resolution: res as '1080p' | '1440p' | '4k',
      qualityPreset: quality as 'low' | 'medium' | 'high' | 'ultra',
      targetFps: fps
    });
  };

  const getExpectedFps = (game: Game) => {
    const fpsMap = {
      '1080p': { low: game.fps1080pLow, medium: game.fps1080pMedium, high: game.fps1080pHigh },
      '1440p': { low: game.fps1440pLow, medium: game.fps1440pMedium, high: game.fps1440pHigh },
      '4k': { low: game.fps4kLow, medium: game.fps4kMedium, high: game.fps4kHigh }
    };
    
    // Map 'ultra' to 'high' since Game interface doesn't have ultra FPS values
    const qualityKey = qualityPreset === 'ultra' ? 'high' : qualityPreset;
    return fpsMap[resolution][qualityKey as 'low' | 'medium' | 'high'] || 60;
  };

  return (
    <div className={`bg-[var(--card-bg)] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[var(--card-border)] ${className}`}>
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white">🎮 Gaming Performance Filter</h3>
      
      {/* Game Selection */}
      <div className="mb-4 sm:mb-6">
        <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-300">Select Games You Want to Play</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {popularGames.map((game) => (
            <button
              key={game.id}
              onClick={() => handleGameToggle(game.id)}
              className={`p-2 sm:p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedGames.includes(game.id)
                  ? 'border-[var(--brand)] bg-[var(--brand)]/20 text-white'
                  : 'border-[var(--card-border)] bg-[var(--card-bg)] text-gray-300 hover:border-[var(--brand)]/50'
              }`}
            >
              <div className="font-medium text-xs sm:text-sm">{game.name}</div>
              <div className="text-xs text-gray-400">{game.genre}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Performance Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Resolution */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
          <select
            value={resolution}
            onChange={(e) => {
              setResolution(e.target.value as '1080p' | '1440p' | '4k');
              updateFilter(selectedGames, e.target.value, qualityPreset, targetFps);
            }}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
          >
            <option value="1080p" className="bg-[var(--background)]">1080p (Full HD)</option>
            <option value="1440p" className="bg-[var(--background)]">1440p (QHD)</option>
            <option value="4k" className="bg-[var(--background)]">4K (Ultra HD)</option>
          </select>
        </div>

        {/* Quality Preset */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Quality Preset</label>
          <select
            value={qualityPreset}
            onChange={(e) => {
              setQualityPreset(e.target.value as 'low' | 'medium' | 'high' | 'ultra');
              updateFilter(selectedGames, resolution, e.target.value, targetFps);
            }}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
          >
            <option value="low" className="bg-[var(--background)]">Low</option>
            <option value="medium" className="bg-[var(--background)]">Medium</option>
            <option value="high" className="bg-[var(--background)]">High</option>
            <option value="ultra" className="bg-[var(--background)]">Ultra</option>
          </select>
        </div>

        {/* Target FPS */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Target FPS</label>
          <select
            value={targetFps}
            onChange={(e) => {
              const fps = parseInt(e.target.value);
              setTargetFps(fps);
              updateFilter(selectedGames, resolution, qualityPreset, fps);
            }}
            className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
          >
            <option value={30} className="bg-[var(--background)]">30 FPS</option>
            <option value={60} className="bg-[var(--background)]">60 FPS</option>
            <option value={120} className="bg-[var(--background)]">120 FPS</option>
            <option value={144} className="bg-[var(--background)]">144 FPS</option>
          </select>
        </div>
      </div>

      {/* Expected Performance */}
      {selectedGames.length > 0 && (
        <div className="bg-[var(--background)] rounded-lg p-3 sm:p-4">
          <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Expected Performance</h4>
          <div className="space-y-1.5 sm:space-y-2">
            {selectedGames.map((gameId) => {
              const game = popularGames.find(g => g.id === gameId);
              if (!game) return null;
              
              const expectedFps = getExpectedFps(game);
              const meetsTarget = expectedFps >= targetFps;
              
              return (
                <div key={gameId} className="flex justify-between items-center">
                  <span className="text-gray-300">{game.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${meetsTarget ? 'text-green-400' : 'text-yellow-400'}`}>
                      ~{expectedFps} FPS
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      meetsTarget ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {meetsTarget ? '✓' : '⚠'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
