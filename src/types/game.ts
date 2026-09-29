export type GameMode = 'STORY' | 'SURVIVAL' | 'DOJO';

export type GameState =
  | 'TITLE'
  | 'STANDOFF_INTRO'
  | 'STANDOFF'
  | 'COMBAT'
  | 'VICTORY'
  | 'GAMEOVER';

export type PlayerAction =
  | 'idle'
  | 'walk'
  | 'standoff_ready'
  | 'attack1'
  | 'attack2'
  | 'attack3'
  | 'parry'
  | 'perfect_counter'
  | 'dodge'
  | 'heal'
  | 'hit'
  | 'dead'
  | 'standoff_slash';

export type EnemyAction =
  | 'standoff_walk'
  | 'standoff_idle'
  | 'standoff_feint'
  | 'standoff_strike'
  | 'idle'
  | 'advance'
  | 'retreat'
  | 'prep_attack'
  | 'attacking'
  | 'parried_stagger'
  | 'hit'
  | 'dead';

export interface EnemyTypeConfig {
  id: string;
  name: string;
  title: string;
  hp: number;
  posture: number;
  speed: number;
  feints: number;
  unblockableChance: number;
  attackInterval: number; // in frames
  color: string;
  weaponType: 'sabre' | 'spear' | 'nodachi' | 'axe' | 'twin_blades';
  desc: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  shape?: 'circle' | 'leaf' | 'spark' | 'line';
  rotation?: number;
  rotSpeed?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  life: number;
}

export interface CombatStats {
  score: number;
  wave: number;
  kills: number;
  standoffKills: number;
  perfectParries: number;
  ghostActivations: number;
  streak: number;
  bestStreak: number;
}
