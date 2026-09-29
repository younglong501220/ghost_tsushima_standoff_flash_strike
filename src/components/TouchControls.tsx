import React from 'react';
import { GameState } from '../types/game';

interface TouchControlsProps {
  gameState: GameState;
  resolve: number;
  isGhostMode: boolean;
  onAttack: () => void;
  onParry: () => void;
  onDodge: () => void;
  onHeal: () => void;
  onGhost: () => void;
  onStandoffHoldStart: () => void;
  onStandoffHoldEnd: () => void;
  onMoveLeft: (isDown: boolean) => void;
  onMoveRight: (isDown: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  gameState,
  resolve,
  isGhostMode,
  onAttack,
  onParry,
  onDodge,
  onHeal,
  onGhost,
  onStandoffHoldStart,
  onStandoffHoldEnd,
  onMoveLeft,
  onMoveRight
}) => {
  const isCombat = gameState === 'COMBAT';
  const isStandoff = gameState === 'STANDOFF';

  if (!isCombat && !isStandoff) return null;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 py-3 flex items-center justify-between gap-4 select-none touch-none">
      {/* LEFT CLUSTER: Standoff / Movement */}
      <div className="flex items-center gap-2">
        {isStandoff ? (
          <button
            onPointerDown={onStandoffHoldStart}
            onPointerUp={onStandoffHoldEnd}
            onPointerCancel={onStandoffHoldEnd}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-400 active:scale-95 text-white font-bold font-serif tracking-widest text-sm rounded border border-amber-300/60 shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-transform"
          >
            長按蓄勢拔刀 (HOLD STANDOFF)
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onPointerDown={() => onMoveLeft(true)}
              onPointerUp={() => onMoveLeft(false)}
              onPointerLeave={() => onMoveLeft(false)}
              className="w-12 h-12 flex items-center justify-center bg-black/60 active:bg-amber-900/60 border border-slate-700 active:border-amber-400 rounded text-slate-200 font-bold text-lg transition-colors"
              title="後退"
            >
              ◀
            </button>
            <button
              onPointerDown={() => onMoveRight(true)}
              onPointerUp={() => onMoveRight(false)}
              onPointerLeave={() => onMoveRight(false)}
              className="w-12 h-12 flex items-center justify-center bg-black/60 active:bg-amber-900/60 border border-slate-700 active:border-amber-400 rounded text-slate-200 font-bold text-lg transition-colors"
              title="逼近"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* RIGHT CLUSTER: Combat Skills */}
      {isCombat && (
        <div className="flex items-center gap-2 md:gap-3">
          {/* Heal (Q) */}
          <button
            onClick={onHeal}
            disabled={resolve < 1}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded border transition-all text-xs font-serif ${
              resolve >= 1
                ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 hover:bg-amber-900 active:scale-90 shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                : 'bg-black/40 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="font-bold">愈</span>
            <span className="text-[9px] text-amber-400/80">Q</span>
          </button>

          {/* Ghost Stance (R) */}
          <button
            onClick={onGhost}
            disabled={resolve < 3 && !isGhostMode}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded border transition-all text-xs font-serif ${
              resolve >= 3 || isGhostMode
                ? 'bg-red-950/90 border-red-500 text-red-200 hover:bg-red-900 active:scale-90 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
                : 'bg-black/40 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
            }`}
          >
            <span className="font-bold">鬼</span>
            <span className="text-[9px] text-red-300/80">R</span>
          </button>

          {/* Dodge (L) */}
          <button
            onClick={onDodge}
            className="flex flex-col items-center justify-center w-12 h-12 bg-neutral-900/90 active:bg-neutral-700 border border-slate-600 active:border-white rounded text-slate-200 text-xs font-serif active:scale-95 transition-transform"
          >
            <span className="font-bold">閃</span>
            <span className="text-[9px] text-slate-400">L</span>
          </button>

          {/* Parry (K) */}
          <button
            onClick={onParry}
            className="flex flex-col items-center justify-center w-13 h-13 bg-slate-900 active:bg-sky-950 border-2 border-sky-400/80 active:border-sky-300 rounded text-sky-200 text-sm font-serif shadow-[0_0_10px_rgba(56,189,248,0.3)] active:scale-95 transition-all"
          >
            <span className="font-bold">招架</span>
            <span className="text-[9px] text-sky-300/80">K</span>
          </button>

          {/* Attack (J) */}
          <button
            onClick={onAttack}
            className="flex flex-col items-center justify-center w-14 h-14 bg-gradient-to-br from-red-900 via-red-800 to-amber-900 active:from-red-700 active:to-amber-700 border-2 border-red-400/90 rounded-lg text-white text-base font-bold font-serif shadow-[0_0_15px_rgba(220,38,38,0.5)] active:scale-95 transition-all"
          >
            <span>斬</span>
            <span className="text-[9px] text-amber-200/90">J</span>
          </button>
        </div>
      )}
    </div>
  );
};
