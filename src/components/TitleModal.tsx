import React from 'react';
import { GameMode, CombatStats } from '../types/game';
import crestImg from '../assets/images/tsushima_crest_mon_1790694531366.jpg';

interface TitleModalProps {
  onStartGame: (mode: GameMode) => void;
  isKurosawa: boolean;
  onToggleKurosawa: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  stats: CombatStats;
}

export const TitleModal: React.FC<TitleModalProps> = ({
  onStartGame,
  isKurosawa,
  onToggleKurosawa,
  isMuted,
  onToggleMute,
  stats
}) => {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e0c10] border border-[#3a3028] shadow-[0_30px_90px_rgba(0,0,0,0.95)] rounded-lg p-6 md:p-8 flex flex-col items-center text-center my-auto">
        {/* Kamon Clan Crest / Hero Illustration */}
        <div className="relative mb-3 flex items-center justify-center">
          <img
            src={crestImg}
            alt="Sakai Clan Crest"
            className="w-16 h-16 rounded-full border border-amber-500/40 shadow-[0_0_20px_rgba(212,175,55,0.3)] object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <span className="text-xs md:text-sm font-serif tracking-[0.4em] text-amber-400/90 uppercase">
            Ghost of Tsushima Web
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_15px_rgba(212,175,55,0.5)]">
            對馬戰鬼：對峙與一閃
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-serif tracking-widest mt-1 max-w-md">
            拔刀蓄勢·一閃制敵·金鐵交鳴·黑澤明電影風格武士決鬥
          </p>
        </div>

        {/* Mode Select Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={() => onStartGame('STORY')}
            className="flex-1 py-3 px-4 bg-gradient-to-b from-[#8c1d18] to-[#59100d] hover:from-[#a82520] hover:to-[#6d1410] border border-red-500/50 rounded text-amber-100 font-bold font-serif tracking-widest text-sm shadow-[0_4px_20px_rgba(140,29,24,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            劇情對決 (STORY)
            <span className="block text-[10px] font-normal text-amber-200/70 tracking-normal mt-0.5">
              五幕史詩交鋒 · 斬落蒙古百夫長至敵將
            </span>
          </button>

          <button
            onClick={() => onStartGame('SURVIVAL')}
            className="flex-1 py-3 px-4 bg-gradient-to-b from-[#2b241e] to-[#171310] hover:from-[#3d322a] hover:to-[#221c17] border border-amber-600/50 rounded text-amber-200 font-bold font-serif tracking-widest text-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            無盡修羅 (SURVIVAL)
            <span className="block text-[10px] font-normal text-amber-300/70 tracking-normal mt-0.5">
              挑戰極限連斬 · 難度動態狂化
            </span>
          </button>

          <button
            onClick={() => onStartGame('DOJO')}
            className="flex-1 py-3 px-4 bg-gradient-to-b from-[#1c222b] to-[#0e1217] hover:from-[#27303d] hover:to-[#141a21] border border-sky-500/40 rounded text-sky-200 font-bold font-serif tracking-widest text-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            修練道場 (DOJO)
            <span className="block text-[10px] font-normal text-sky-300/70 tracking-normal mt-0.5">
              研習對峙拔刀時機與完美招架彈刀
            </span>
          </button>
        </div>

        {/* Combat Guide Cards */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 text-left">
          <div className="bg-black/50 border border-amber-900/40 p-2.5 rounded">
            <div className="text-amber-400 font-bold text-xs font-serif flex items-center justify-between">
              <span>對峙 (Standoff)</span>
              <kbd className="text-[10px] font-mono bg-neutral-800 px-1 py-0.5 rounded text-slate-300">Space</kbd>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              長按拔刀。敵將會<span className="text-amber-300">虛晃假動作</span>！切莫被騙；待敵刃閃現紅光突進瞬間放開，即可一擊必殺！
            </p>
          </div>

          <div className="bg-black/50 border border-sky-900/40 p-2.5 rounded">
            <div className="text-sky-300 font-bold text-xs font-serif flex items-center justify-between">
              <span>招架 (Parry)</span>
              <kbd className="text-[10px] font-mono bg-neutral-800 px-1 py-0.5 rounded text-slate-300">K / 右鍵</kbd>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              敵刀命中前瞬間招架觸發<span className="text-sky-300">「完美招架」</span>，金屬火花爆閃引發敵方破防，接刀重擊處決！
            </p>
          </div>

          <div className="bg-black/50 border border-red-900/40 p-2.5 rounded">
            <div className="text-red-400 font-bold text-xs font-serif flex items-center justify-between">
              <span>看破閃避</span>
              <kbd className="text-[10px] font-mono bg-neutral-800 px-1 py-0.5 rounded text-slate-300">L</kbd>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              敵人發動<span className="text-red-400 font-bold">紅光重擊（危）</span>不可防禦！必須及時看破側身閃避以製造反擊空檔。
            </p>
          </div>

          <div className="bg-black/50 border border-amber-800/40 p-2.5 rounded">
            <div className="text-amber-300 font-bold text-xs font-serif flex items-center justify-between">
              <span>決意與戰鬼</span>
              <kbd className="text-[10px] font-mono bg-neutral-800 px-1 py-0.5 rounded text-slate-300">Q / R</kbd>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              按 Q 消耗 1 格決意太鼓療傷；集滿 3 格按 R 踏入<span className="text-red-400">戰鬼姿態</span>，以極速收割敵軍！
            </p>
          </div>
        </div>

        {/* Settings & Record Toolbar */}
        <div className="w-full flex items-center justify-between mt-5 pt-4 border-t border-slate-800/80 text-xs">
          {/* Highest records */}
          <div className="flex items-center gap-3 text-slate-400 font-serif">
            <span>最高斬數: <strong className="text-amber-400 font-cinzel">{stats.kills}</strong></span>
            <span>·</span>
            <span>對峙勝次: <strong className="text-amber-400 font-cinzel">{stats.standoffKills}</strong></span>
            <span>·</span>
            <span>完美彈刀: <strong className="text-sky-300 font-cinzel">{stats.perfectParries}</strong></span>
          </div>

          {/* Style & sound toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleKurosawa}
              className={`px-2.5 py-1 rounded border text-xs font-serif transition-colors ${
                isKurosawa
                  ? 'bg-neutral-100 text-black border-white font-bold'
                  : 'bg-black/60 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {isKurosawa ? '● 黑澤明黑白模式' : '○ 彩色暮色模式'}
            </button>
            <button
              onClick={onToggleMute}
              className="px-2.5 py-1 bg-black/60 border border-slate-700 hover:border-slate-500 rounded text-slate-300 text-xs transition-colors"
            >
              {isMuted ? '🔇 靜音' : '🔊 音效開'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
