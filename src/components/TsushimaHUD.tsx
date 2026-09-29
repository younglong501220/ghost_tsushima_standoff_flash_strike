import React from 'react';
import { GameState, EnemyTypeConfig } from '../types/game';

interface TsushimaHUDProps {
  gameState: GameState;
  playerHp: number;
  playerMaxHp: number;
  resolve: number;
  maxResolve: number;
  isGhostMode: boolean;
  ghostTimer: number;
  enemy: EnemyTypeConfig;
  enemyHp: number;
  enemyPosture: number;
  isStandoffHolding: boolean;
  standoffFeintAlert: boolean;
  standoffStrikeAlert: boolean;
  wave: number;
  score: number;
  streak: number;
  centerCalligraphy: string | null;
  dojoFeedback?: { text: string; sub: string; color: string } | null;
}

export const TsushimaHUD: React.FC<TsushimaHUDProps> = ({
  gameState,
  playerHp,
  playerMaxHp,
  resolve,
  maxResolve,
  isGhostMode,
  ghostTimer,
  enemy,
  enemyHp,
  enemyPosture,
  isStandoffHolding,
  standoffFeintAlert,
  standoffStrikeAlert,
  wave,
  streak,
  centerCalligraphy,
  dojoFeedback
}) => {
  const hpPercent = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));
  const enemyHpPercent = Math.max(0, Math.min(100, (enemyHp / enemy.hp) * 100));
  const posturePercent = Math.max(0, Math.min(100, (enemyPosture / enemy.posture) * 100));

  const isCombatOrStandoff = gameState === 'STANDOFF' || gameState === 'COMBAT' || gameState === 'STANDOFF_INTRO';

  return (
    <div className="pointer-events-none absolute inset-0 p-4 md:p-6 flex flex-col justify-between overflow-hidden">
      {/* TOP HEADER: Player info (Left) & Enemy info (Right) */}
      {isCombatOrStandoff && (
        <div className="flex justify-between items-start w-full">
          {/* PLAYER HUD */}
          <div className="flex flex-col gap-1.5 max-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.2em] text-[#d4af37] font-serif font-bold uppercase">
                境井仁
              </span>
              <span className="text-[10px] tracking-wider text-slate-400">
                JIN SAKAI
              </span>
              {streak > 1 && (
                <span className="text-[11px] font-cinzel text-amber-400 bg-black/60 px-1.5 py-0.5 border border-amber-500/40 rounded">
                  {streak} 連斬
                </span>
              )}
            </div>

            {/* HP Bar */}
            <div className="relative w-48 md:w-56 h-2.5 bg-black/80 border border-[#7f1d1d]/80 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#f87171] transition-all duration-150 ease-out"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Resolve Drums (決意太鼓) */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] tracking-wider text-[#d4af37]/80 font-cinzel">
                決意
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxResolve }).map((_, idx) => {
                  const filled = idx < resolve;
                  return (
                    <div
                      key={idx}
                      className={`relative w-4 h-4 rounded-full border transition-all duration-300 ${
                        filled
                          ? isGhostMode
                            ? 'bg-red-500 border-red-300 shadow-[0_0_8px_#ef4444]'
                            : 'bg-amber-400 border-amber-200 shadow-[0_0_7px_#fbbf24]'
                          : 'bg-black/60 border-amber-700/50'
                      }`}
                    >
                      {/* Drum rim accent */}
                      <div className="absolute inset-0.5 rounded-full border border-black/30" />
                    </div>
                  );
                })}
              </div>

              {/* Ghost Stance Ready Badge */}
              {resolve >= 3 && !isGhostMode && gameState === 'COMBAT' && (
                <span className="text-[10px] font-bold text-red-400 animate-pulse tracking-widest pl-1">
                  [R] 戰鬼覺醒
                </span>
              )}

              {/* Active Ghost Mode Timer */}
              {isGhostMode && (
                <span className="text-[10px] font-bold text-red-500 animate-ping tracking-widest pl-1">
                  戰鬼姿態 ({Math.ceil(ghostTimer / 60)}s)
                </span>
              )}
            </div>
          </div>

          {/* ENEMY HUD */}
          <div className="flex flex-col items-end gap-1.5 max-w-[320px]">
            <span className="text-[11px] tracking-[0.25em] text-slate-300 font-serif">
              {enemy.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-bold tracking-[0.15em] text-slate-100 font-serif">
                {enemy.name}
              </span>
              <span className="text-[10px] text-amber-500 font-cinzel">
                WAVE {wave}
              </span>
            </div>

            {/* Enemy HP Bar */}
            <div className="relative w-52 md:w-64 h-2.5 bg-black/80 border border-slate-700 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-100 transition-all duration-100 ease-out"
                style={{ width: `${enemyHpPercent}%` }}
              />
            </div>

            {/* Posture Bar (架勢值) */}
            <div className="flex items-center gap-2 w-52 md:w-64">
              <span className="text-[9px] tracking-wider text-slate-400 font-serif">架勢</span>
              <div className="flex-1 h-1.5 bg-black/80 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-slate-400 to-sky-300 transition-all duration-150"
                  style={{ width: `${posturePercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CENTER CALLIGRAPHIC FLASH / WATERMARK */}
      {centerCalligraphy && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center justify-center animate-out fade-out duration-700">
            {/* Ink wash background ring */}
            <div className="absolute w-44 h-44 rounded-full border-4 border-[#d4af37]/30 scale-125 animate-ping opacity-25" />
            <h1 className="text-5xl md:text-7xl font-bold font-serif tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-b from-[#fff6d6] via-[#d4af37] to-[#8c711f] drop-shadow-[0_0_25px_rgba(212,175,55,0.7)] select-none">
              {centerCalligraphy}
            </h1>
          </div>
        </div>
      )}

      {/* STANDOFF REAL-TIME PROMPT BANNER */}
      {gameState === 'STANDOFF' && (
        <div className="absolute inset-x-0 top-24 md:top-28 flex flex-col items-center justify-center pointer-events-none px-4">
          <div className="bg-black/75 backdrop-blur-sm border border-[#d4af37]/40 px-6 py-2.5 rounded shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-center transition-all duration-200 max-w-lg">
            {standoffFeintAlert ? (
              <div className="text-amber-400 font-bold tracking-widest text-sm md:text-base animate-bounce">
                ⚠ 敵方虛晃假動作！切莫鬆手！
              </div>
            ) : standoffStrikeAlert ? (
              <div className="text-red-500 font-black tracking-[0.2em] text-base md:text-lg animate-pulse scale-110">
                ⚡ 敵將出刀！立即放開【空白鍵】！一閃！
              </div>
            ) : isStandoffHolding ? (
              <div className="text-slate-200 font-serif tracking-widest text-xs md:text-sm">
                凝神聚氣... 靜候敵刃出鞘紅光之瞬放開【空白鍵】
              </div>
            ) : (
              <div className="text-amber-300 font-serif tracking-widest text-xs md:text-sm">
                長按【空白鍵】或【蓄勢拔刀】擺出居合架勢 (HOLD TO DRAW)
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOJO TIMING FEEDBACK */}
      {dojoFeedback && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none">
          <div
            className="px-5 py-2 rounded bg-black/85 border text-center shadow-lg transition-all"
            style={{ borderColor: dojoFeedback.color }}
          >
            <div className="text-sm font-bold tracking-wider" style={{ color: dojoFeedback.color }}>
              {dojoFeedback.text}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">{dojoFeedback.sub}</div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS HINT */}
      {isCombatOrStandoff && (
        <div className="w-full flex justify-between items-end text-[11px] text-slate-400/90 font-serif">
          <div className="hidden sm:flex items-center gap-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-white/10 rounded">
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-slate-200 font-mono text-[10px] mr-1">
                J
              </kbd>
              斬擊
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-slate-200 font-mono text-[10px] mr-1">
                K
              </kbd>
              招架/彈刀
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-slate-200 font-mono text-[10px] mr-1">
                L
              </kbd>
              看破閃避
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-slate-200 font-mono text-[10px] mr-1">
                Q
              </kbd>
              決意回血
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-600 rounded text-slate-200 font-mono text-[10px] mr-1">
                R
              </kbd>
              戰鬼姿態
            </span>
          </div>
          <div className="text-right text-[10px] text-slate-500 font-cinzel">
            GHOST OF TSUSHIMA · WEB
          </div>
        </div>
      )}
    </div>
  );
};
