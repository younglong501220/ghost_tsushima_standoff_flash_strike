import React from 'react';
import { GameMode, CombatStats } from '../types/game';

interface EndGameModalProps {
  isVictory: boolean;
  gameMode: GameMode;
  wave: number;
  maxWave: number;
  stats: CombatStats;
  onNextWave: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  isVictory,
  gameMode,
  wave,
  maxWave,
  stats,
  onNextWave,
  onRestart,
  onReturnTitle
}) => {
  const hasNextWave = gameMode === 'SURVIVAL' || (gameMode === 'STORY' && wave <= maxWave);
  const isFinalStoryVictory = gameMode === 'STORY' && wave > maxWave;

  // Samurai rank evaluation
  let samuraiRank = '孤勇劍士';
  if (stats.perfectParries >= 5 && stats.standoffKills >= 3) {
    samuraiRank = '戰鬼修羅 (LEGENDARY GHOST)';
  } else if (stats.perfectParries >= 3 || stats.standoffKills >= 2) {
    samuraiRank = '境井一刀流宗師 (SAKAI SWORDMASTER)';
  } else if (stats.kills >= 3) {
    samuraiRank = '對馬英傑 (HERO OF TSUSHIMA)';
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e0c10] border border-[#3e3328] shadow-[0_30px_90px_rgba(0,0,0,0.95)] rounded-lg p-6 md:p-8 flex flex-col items-center text-center">
        {/* Calligraphic Stamp / Emblem */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center font-serif font-black text-2xl mb-3 border-2 shadow-lg ${
            isVictory
              ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-amber-500/30'
              : 'bg-red-950/80 border-red-500 text-red-200 shadow-red-500/30'
          }`}
        >
          {isVictory ? '勝' : '歿'}
        </div>

        {/* Title */}
        <h2
          className={`text-3xl md:text-4xl font-serif font-bold tracking-[0.25em] mb-1.5 ${
            isVictory
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500'
              : 'text-red-500'
          }`}
        >
          {isVictory ? (isFinalStoryVictory ? '光復對馬 · 全勝' : '戰鬼得勝') : '戰死對馬'}
        </h2>

        <p className="text-xs md:text-sm text-slate-400 font-serif tracking-widest mb-4">
          {isVictory
            ? isFinalStoryVictory
              ? '蒙古主將全數伏誅，境井家威名永載青史'
              : `已肅清第 ${wave - 1} 幕敵軍 · 鋒芒震懾草木`
            : '武士之魂，隨風消逝於金色落葉之間'}
        </p>

        {/* Stats card */}
        <div className="w-full bg-black/60 border border-slate-800 rounded p-4 mb-5 text-left font-serif">
          <div className="text-xs text-amber-400/90 font-bold mb-2 pb-1 border-b border-slate-800 flex justify-between">
            <span>戰績評定</span>
            <span className="text-slate-300 font-normal">{samuraiRank}</span>
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-300">
            <div>
              抵達陣幕: <span className="text-amber-400 font-cinzel font-bold">{wave}</span>
            </div>
            <div>
              總斬敵數: <span className="text-amber-400 font-cinzel font-bold">{stats.kills}</span>
            </div>
            <div>
              一閃勝次: <span className="text-amber-400 font-cinzel font-bold">{stats.standoffKills}</span>
            </div>
            <div>
              完美招架: <span className="text-sky-300 font-cinzel font-bold">{stats.perfectParries}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {isVictory && hasNextWave && !isFinalStoryVictory && (
            <button
              onClick={onNextWave}
              className="w-full py-3 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-400 text-white font-serif font-bold tracking-widest text-sm rounded border border-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              迎擊下一陣敵將 (NEXT BATTLE)
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-3 bg-gradient-to-r from-red-950 via-red-900 to-amber-950 hover:from-red-900 hover:to-amber-900 text-amber-100 font-serif font-bold tracking-widest text-sm rounded border border-red-500/50 shadow-md transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            {isVictory ? '再次出征決戰 (PLAY AGAIN)' : '重鑄武士之道 (RETRY)'}
          </button>

          <button
            onClick={onReturnTitle}
            className="w-full py-2 text-xs font-serif tracking-widest text-slate-400 hover:text-slate-200 transition-colors"
          >
            返回主頁選單 (TITLE MENU)
          </button>
        </div>
      </div>
    </div>
  );
};
