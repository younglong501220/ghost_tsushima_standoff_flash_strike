import { EnemyTypeConfig } from '../types/game';

export const ENEMY_ARCHETYPES: EnemyTypeConfig[] = [
  {
    id: 'scout',
    name: '蒙古斥候兵',
    title: '第一幕 · 沿海哨兵',
    hp: 80,
    posture: 50,
    speed: 1.2,
    feints: 0,
    unblockableChance: 0.15,
    attackInterval: 80,
    color: '#3d342f',
    weaponType: 'sabre',
    desc: '輕裝斥候，刀法敏捷但缺乏耐性，對峙時尚未熟稔假動作。'
  },
  {
    id: 'centurion',
    name: '蒙古百夫長',
    title: '第二幕 · 鐵甲先鋒',
    hp: 130,
    posture: 90,
    speed: 1.0,
    feints: 1,
    unblockableChance: 0.35,
    attackInterval: 70,
    color: '#4a2522',
    weaponType: 'spear',
    desc: '身著重甲的蒙古將校，精於長槍刺擊，對峙時會以吼聲與抽搐假動作誘騙對手。'
  },
  {
    id: 'ronin',
    name: '笠鬼流浪武士',
    title: '第三幕 · 叛逆劍客',
    hp: 180,
    posture: 120,
    speed: 1.4,
    feints: 2,
    unblockableChance: 0.45,
    attackInterval: 55,
    color: '#2d3748',
    weaponType: 'nodachi',
    desc: '為求生計背棄對馬的笠鬼劍豪，精通居合拔刀術，對峙時可能連續虛晃兩次！'
  },
  {
    id: 'brute',
    name: '蒙古巨斧狂戰士',
    title: '第四幕 · 開山破陣',
    hp: 260,
    posture: 160,
    speed: 0.85,
    feints: 1,
    unblockableChance: 0.65,
    attackInterval: 75,
    color: '#1a1a1a',
    weaponType: 'axe',
    desc: '身材魁梧的破城巨漢，揮動重斧發動不可防禦的紅光重擊，必須看破側身閃避。'
  },
  {
    id: 'general',
    name: '萬夫長 · 巴圖爾',
    title: '最終幕 · 赫通汗親衛領袖',
    hp: 350,
    posture: 220,
    speed: 1.35,
    feints: 2,
    unblockableChance: 0.55,
    attackInterval: 48,
    color: '#8b0000',
    weaponType: 'twin_blades',
    desc: '草原精銳軍團指揮官，雙刀流攻守兼備，破防架勢極難撼動，考驗極限完美招架。'
  }
];

export function getEnemyForWave(wave: number, mode: 'STORY' | 'SURVIVAL' | 'DOJO'): EnemyTypeConfig {
  if (mode === 'DOJO') {
    return {
      id: 'trainer',
      name: '石川師父武術幻影',
      title: '道場試煉 · 對峙與招架研磨',
      hp: 9999,
      posture: 100,
      speed: 0.9,
      feints: 1,
      unblockableChance: 0.3,
      attackInterval: 90,
      color: '#4a5568',
      weaponType: 'sabre',
      desc: '修練木人與教官幻象，提供實時節奏判斷引導，供武士熟悉居合拔刀反制時機。'
    };
  }

  if (mode === 'STORY') {
    const idx = Math.min(wave - 1, ENEMY_ARCHETYPES.length - 1);
    return { ...ENEMY_ARCHETYPES[idx] };
  }

  // SURVIVAL mode: cycle and scale exponentially
  const baseIdx = (wave - 1) % ENEMY_ARCHETYPES.length;
  const cycle = Math.floor((wave - 1) / ENEMY_ARCHETYPES.length);
  const base = ENEMY_ARCHETYPES[baseIdx];

  return {
    ...base,
    name: cycle > 0 ? `${base.name} · 修羅第 ${cycle + 1} 重` : base.name,
    title: `無盡戰場 · 第 ${wave} 陣`,
    hp: Math.round(base.hp * (1 + cycle * 0.4)),
    posture: Math.round(base.posture * (1 + cycle * 0.3)),
    speed: Math.min(1.8, base.speed + cycle * 0.1),
    feints: Math.min(3, base.feints + (cycle > 0 ? 1 : 0)),
    unblockableChance: Math.min(0.8, base.unblockableChance + cycle * 0.08),
    attackInterval: Math.max(38, base.attackInterval - cycle * 6)
  };
}
