import React, { useEffect, useRef } from 'react';
import { GameMode, GameState, PlayerAction, EnemyAction, Particle, FloatingText } from '../types/game';

interface TsushimaCanvasProps {
  gameState: GameState;
  gameMode: GameMode;
  isKurosawa: boolean;
  playerAction: PlayerAction;
  enemyAction: EnemyAction;
  playerX: number;
  enemyX: number;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyPosture: number;
  enemyMaxPosture: number;
  enemyColor: string;
  enemyWeaponType: 'sabre' | 'spear' | 'nodachi' | 'axe' | 'twin_blades';
  enemyAttackType: 'normal' | 'unblockable';
  isGhostMode: boolean;
  ghostTimer: number;
  standoffHolding: boolean;
  screenShake: number;
  flashEffect: { color: string; alpha: number };
  particles: Particle[];
  floatingTexts: FloatingText[];
  cinematicLetterbox: number; // 0 to 1
  slashTrail: { x: number; y: number; alpha: number; angle: number; color: string }[];
  windForce: number;
}

export const TsushimaCanvas: React.FC<TsushimaCanvasProps> = ({
  gameState,
  isKurosawa,
  playerAction,
  enemyAction,
  playerX,
  enemyX,
  enemyAttackType,
  enemyColor,
  enemyWeaponType,
  isGhostMode,
  standoffHolding,
  screenShake,
  flashEffect,
  particles,
  floatingTexts,
  cinematicLetterbox,
  slashTrail,
  windForce,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animTimeRef = useRef<number>(0);

  // Dynamic foliage grass blades
  const grassBladesRef = useRef<{ x: number; height: number; swayOffset: number; width: number }[]>([]);
  // Ambient falling leaves (ginkgo & maple)
  const leavesRef = useRef<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    rot: number;
    rotSpeed: number;
    color: string;
    type: 'maple' | 'ginkgo';
  }[]>([]);

  // Initialize leaves and grass once
  useEffect(() => {
    const grass: { x: number; height: number; swayOffset: number; width: number }[] = [];
    for (let x = 0; x < 1050; x += 6) {
      grass.push({
        x: x + (Math.random() - 0.5) * 3,
        height: 60 + Math.random() * 45,
        swayOffset: Math.random() * Math.PI * 2,
        width: 2 + Math.random() * 2
      });
    }
    grassBladesRef.current = grass;

    const leaves: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rot: number;
      rotSpeed: number;
      color: string;
      type: 'maple' | 'ginkgo';
    }[] = [];
    for (let i = 0; i < 55; i++) {
      leaves.push({
        x: Math.random() * 1050,
        y: Math.random() * 560,
        size: 5 + Math.random() * 6,
        speedX: 1.5 + Math.random() * 2.5,
        speedY: 0.8 + Math.random() * 1.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: Math.random() > 0.45 ? '#d4af37' : '#b91c1c',
        type: Math.random() > 0.5 ? 'maple' : 'ginkgo'
      });
    }
    leavesRef.current = leaves;
  }, []);

  // Main rendering frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    animTimeRef.current++;
    const t = animTimeRef.current;
    const width = 1000;
    const height = 560;

    ctx.save();

    // Screen Shake
    if (screenShake > 0.3) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. SKY & BACKGROUND
    if (isKurosawa) {
      // Kurosawa high-contrast stormy sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#121212');
      skyGrad.addColorStop(0.5, '#262626');
      skyGrad.addColorStop(1, '#3a3a3a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);
    } else if (isGhostMode) {
      // Blood moon ghost realm
      const ghostGrad = ctx.createLinearGradient(0, 0, 0, height);
      ghostGrad.addColorStop(0, '#100000');
      ghostGrad.addColorStop(0.4, '#300505');
      ghostGrad.addColorStop(0.8, '#580808');
      ghostGrad.addColorStop(1, '#1a0202');
      ctx.fillStyle = ghostGrad;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Tsushima Golden Twilight / Crimson Sunset
      const sunsetGrad = ctx.createLinearGradient(0, 0, 0, height);
      sunsetGrad.addColorStop(0, '#1a1829'); // Deep indigo dusk
      sunsetGrad.addColorStop(0.3, '#3d2645'); // Plum purple
      sunsetGrad.addColorStop(0.6, '#832a38'); // Ruby crimson
      sunsetGrad.addColorStop(0.85, '#cf5c36'); // Golden amber
      sunsetGrad.addColorStop(1, '#efb054'); // Horizon warm gold
      ctx.fillStyle = sunsetGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. CELESTIAL BODY (Sun / Blood Moon / Silver Moon)
    const sunX = 720;
    const sunY = 170;
    const sunRadius = 75;

    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    if (isKurosawa) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 45;
    } else if (isGhostMode) {
      ctx.fillStyle = '#ff2222';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 60;
    } else {
      ctx.fillStyle = '#fff4db';
      ctx.shadowColor = '#ffd066';
      ctx.shadowBlur = 50;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    // Distant mountain ranges (Layer 1 - distant mist)
    ctx.fillStyle = isKurosawa ? '#202020' : isGhostMode ? '#1e0505' : '#422037';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    ctx.lineTo(120, 270);
    ctx.lineTo(260, 310);
    ctx.lineTo(410, 250);
    ctx.lineTo(600, 320);
    ctx.lineTo(820, 230); // Mount Yotei silhouette peak
    ctx.lineTo(1000, 300);
    ctx.lineTo(1000, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Distant mountain ranges (Layer 2 - closer ridge)
    ctx.fillStyle = isKurosawa ? '#151515' : isGhostMode ? '#140202' : '#2b1424';
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(180, 320);
    ctx.lineTo(340, 370);
    ctx.lineTo(540, 310);
    ctx.lineTo(760, 360);
    ctx.lineTo(950, 315);
    ctx.lineTo(1000, 340);
    ctx.lineTo(1000, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Torii Gate silhouette (鳥居) in the background
    const toriiX = 490;
    const toriiY = 265;
    ctx.fillStyle = isKurosawa ? '#0d0d0d' : isGhostMode ? '#0a0000' : '#140d16';
    // Pillars
    ctx.fillRect(toriiX, toriiY, 14, 150);
    ctx.fillRect(toriiX + 90, toriiY, 14, 150);
    // Upper curved lintel (Kasagi)
    ctx.beginPath();
    ctx.moveTo(toriiX - 22, toriiY + 5);
    ctx.quadraticCurveTo(toriiX + 52, toriiY - 14, toriiX + 126, toriiY + 5);
    ctx.lineTo(toriiX + 126, toriiY + 20);
    ctx.quadraticCurveTo(toriiX + 52, toriiY + 4, toriiX - 22, toriiY + 20);
    ctx.closePath();
    ctx.fill();
    // Lower tie beam (Nuki)
    ctx.fillRect(toriiX - 10, toriiY + 36, 124, 11);

    // Stone lanterns (石燈籠)
    [-15, 125].forEach((offset) => {
      const lx = toriiX + offset;
      const ly = toriiY + 95;
      ctx.fillRect(lx, ly + 25, 10, 30);
      ctx.fillRect(lx - 4, ly + 15, 18, 12);
      ctx.fillRect(lx - 2, ly, 14, 15);
      // Small warm candle flame in lantern
      if (!isKurosawa) {
        ctx.fillStyle = '#ffaa33';
        ctx.fillRect(lx + 1, ly + 4, 8, 7);
        ctx.fillStyle = isGhostMode ? '#0a0000' : '#140d16';
      }
    });

    // 3. GROUND (Hillock of Tsushima)
    const groundY = 415;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    if (isKurosawa) {
      groundGrad.addColorStop(0, '#101010');
      groundGrad.addColorStop(1, '#050505');
    } else if (isGhostMode) {
      groundGrad.addColorStop(0, '#1c0303');
      groundGrad.addColorStop(1, '#080000');
    } else {
      groundGrad.addColorStop(0, '#191114');
      groundGrad.addColorStop(0.4, '#120b0e');
      groundGrad.addColorStop(1, '#090507');
    }
    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(300, groundY - 12, 600, groundY + 5);
    ctx.quadraticCurveTo(850, groundY + 12, 1000, groundY);
    ctx.lineTo(1000, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // 4. GUIDING WIND TRAILS (導引之風)
    ctx.strokeStyle = isKurosawa ? 'rgba(255, 255, 255, 0.15)' : isGhostMode ? 'rgba(255, 60, 60, 0.25)' : 'rgba(255, 245, 220, 0.22)';
    ctx.lineWidth = 1.8;
    for (let w = 0; w < 4; w++) {
      const windY = 240 + w * 70 + Math.sin(t * 0.02 + w) * 20;
      const windSpeed = (t * (3.5 + w * 0.8)) % 1400;
      const startX = -300 + windSpeed;
      ctx.beginPath();
      ctx.moveTo(startX, windY);
      ctx.quadraticCurveTo(startX + 120, windY - 25, startX + 240, windY + 10);
      ctx.stroke();
    }

    // 5. SWAYING PAMPAS GRASS FIELD (芒草)
    const grassColor = isKurosawa ? '#1c1c1c' : isGhostMode ? '#260606' : '#2a1a1d';
    const grassTipColor = isKurosawa ? '#3e3e3e' : isGhostMode ? '#521010' : '#8d6e63';
    ctx.lineWidth = 2.2;

    grassBladesRef.current.forEach((blade) => {
      const sway = Math.sin(t * 0.045 + blade.swayOffset + windForce * 0.5) * (18 + windForce * 10);
      ctx.beginPath();
      ctx.moveTo(blade.x, groundY + 15);
      const tipX = blade.x + sway + 10;
      const tipY = groundY + 15 - blade.height;
      ctx.quadraticCurveTo(blade.x + sway * 0.4, groundY - blade.height * 0.5, tipX, tipY);
      ctx.strokeStyle = grassColor;
      ctx.stroke();

      // Fluffy pampas grass plume top
      ctx.beginPath();
      ctx.arc(tipX, tipY, blade.width * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = grassTipColor;
      ctx.fill();
    });

    // 6. SWORD TRAILS (Katana light arcs)
    slashTrail.forEach((st) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, st.alpha);
      ctx.strokeStyle = isKurosawa ? '#ffffff' : st.color;
      ctx.lineWidth = 6;
      ctx.shadowColor = isKurosawa ? '#ffffff' : st.color;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(st.x, st.y, 45, st.angle - 0.7, st.angle + 0.7);
      ctx.stroke();
      ctx.restore();
    });

    // 7. CHARACTERS
    // Draw Jin Sakai (Player)
    drawJinSakai(ctx, playerX, groundY, playerAction, isGhostMode, isKurosawa, t, standoffHolding);

    // Draw Enemy
    drawEnemyCharacter(
      ctx,
      enemyX,
      groundY,
      enemyAction,
      enemyAttackType,
      enemyColor,
      enemyWeaponType,
      isKurosawa,
      t
    );

    // 8. FOREGROUND PAMPAS GRASS (Depth layering)
    ctx.lineWidth = 3;
    for (let x = 10; x < width; x += 32) {
      const fSway = Math.sin(t * 0.05 + x) * 22;
      ctx.strokeStyle = isKurosawa ? '#080808' : isGhostMode ? '#0d0000' : '#110b0f';
      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + fSway * 0.5, height - 70, x + fSway + 15, height - 120);
      ctx.stroke();
    }

    // 9. FALLING GINKGO & MAPLE LEAVES
    leavesRef.current.forEach((leaf) => {
      leaf.x += leaf.speedX + windForce * 1.2;
      leaf.y += leaf.speedY;
      leaf.rot += leaf.rotSpeed;
      if (leaf.x > width + 30) leaf.x = -30;
      if (leaf.y > height + 20) leaf.y = -20;

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rot);
      ctx.fillStyle = isKurosawa ? '#cccccc' : isGhostMode ? '#ff3b30' : leaf.color;

      if (leaf.type === 'maple') {
        // Japanese Red Maple leaf star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? leaf.size : leaf.size * 0.45;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Ginkgo fan shape
        ctx.beginPath();
        ctx.moveTo(0, leaf.size * 0.5);
        ctx.arc(0, 0, leaf.size, Math.PI * 0.15, Math.PI * 0.85, false);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // 10. COMBAT PARTICLES (Blood, Sparks, Energy)
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = isKurosawa ? '#ffffff' : p.color;

      if (p.shape === 'spark') {
        ctx.shadowColor = isKurosawa ? '#ffffff' : p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'line') {
        ctx.strokeStyle = isKurosawa ? '#ffffff' : p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 11. FLOATING TEXTS (完美招架！, 看破！, 一閃！)
    floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${Math.round(22 * ft.scale)}px 'Noto Serif TC', serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = isKurosawa ? '#000000' : ft.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = isKurosawa ? '#ffffff' : ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 12. SCREEN FLASH (White / Red / Gold)
    if (flashEffect.alpha > 0.02) {
      ctx.fillStyle = isKurosawa
        ? `rgba(255, 255, 255, ${flashEffect.alpha})`
        : flashEffect.color.includes('rgba')
        ? flashEffect.color
        : `rgba(255, 255, 255, ${flashEffect.alpha})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 13. CINEMATIC LETTERBOXING (2.35:1 Anamorphic cinema bars)
    if (cinematicLetterbox > 0.01) {
      const barHeight = 65 * cinematicLetterbox;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barHeight);
      ctx.fillRect(0, height - barHeight, width, barHeight);

      // Gold hairline trim on letterbox
      if (!isKurosawa) {
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 * cinematicLetterbox})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barHeight);
        ctx.lineTo(width, barHeight);
        ctx.moveTo(0, height - barHeight);
        ctx.lineTo(width, height - barHeight);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [
    gameState,
    isKurosawa,
    playerAction,
    enemyAction,
    playerX,
    enemyX,
    enemyAttackType,
    enemyColor,
    enemyWeaponType,
    isGhostMode,
    standoffHolding,
    screenShake,
    flashEffect,
    particles,
    floatingTexts,
    cinematicLetterbox,
    slashTrail,
    windForce
  ]);

  return (
    <div className="relative w-full max-w-[1000px] aspect-[1000/560] mx-auto select-none rounded-lg overflow-hidden border border-[#2b2620] shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
      <canvas
        ref={canvasRef}
        width={1000}
        height={560}
        className="w-full h-full block bg-black"
      />
      {/* Kurosawa Vintage Film Grain Layer */}
      {isKurosawa && (
        <div className="pointer-events-none absolute inset-0 film-grain opacity-40 mix-blend-overlay" />
      )}
      {isKurosawa && (
        <div className="pointer-events-none absolute inset-0 animate-film-scratch border-l border-white/10" />
      )}
    </div>
  );
};

/**
 * Procedural Render for Jin Sakai (境井仁)
 */
function drawJinSakai(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  action: PlayerAction,
  isGhost: boolean,
  isKurosawa: boolean,
  t: number,
  standoffHolding: boolean
) {
  ctx.save();
  const y = groundY - 88; // Standing feet at ground
  ctx.translate(x, y);

  // Ghost Stance Fiery Crimson Aura
  if (isGhost) {
    ctx.save();
    ctx.shadowColor = '#ff1111';
    ctx.shadowBlur = 30;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(0, 35, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 88, 28, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Cape & Sashimono (陣羽織 / 披風)
  const capeSway = Math.sin(t * 0.12) * 8 + (action === 'dodge' ? -25 : 0);
  ctx.fillStyle = isKurosawa ? '#1c1c1c' : isGhost ? '#5c0000' : '#171d24';
  ctx.beginPath();
  ctx.moveTo(-12, 18);
  ctx.quadraticCurveTo(-38 + capeSway, 45, -30 + capeSway * 1.3, 85);
  ctx.lineTo(-4, 75);
  ctx.lineTo(-2, 22);
  ctx.closePath();
  ctx.fill();

  // 2. Legs / Hakama Pants (袴)
  ctx.fillStyle = isKurosawa ? '#262626' : '#1f2429';
  if (action === 'dodge') {
    // Low sliding legs
    ctx.fillRect(-22, 60, 16, 25);
    ctx.fillRect(4, 55, 18, 28);
  } else if (action === 'standoff_ready' || standoffHolding) {
    // Deep crouched Iai stance
    ctx.fillRect(-20, 52, 15, 34);
    ctx.fillRect(5, 52, 16, 34);
  } else {
    // Neutral martial stance
    ctx.fillRect(-15, 50, 14, 38);
    ctx.fillRect(3, 50, 14, 38);
  }

  // Shin guards (脛當 Suneate)
  ctx.fillStyle = isKurosawa ? '#404040' : '#3d3024';
  ctx.fillRect(-15, 68, 14, 18);
  ctx.fillRect(3, 68, 14, 18);

  // 3. Torso Armor (胴 Do)
  ctx.fillStyle = isKurosawa ? '#181818' : isGhost ? '#260404' : '#121417';
  ctx.fillRect(-14, 16, 28, 38);

  // Golden Sakai Clan cords & trim
  ctx.strokeStyle = isKurosawa ? '#aaaaaa' : '#d4af37';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-14, 25);
  ctx.lineTo(14, 25);
  ctx.moveTo(-14, 38);
  ctx.lineTo(14, 38);
  ctx.stroke();

  // Sakai Clan Crest on chest (Small crossed blades circle)
  ctx.fillStyle = isKurosawa ? '#ffffff' : '#ffd700';
  ctx.beginPath();
  ctx.arc(0, 28, 4, 0, Math.PI * 2);
  ctx.fill();

  // 4. Head & Helmet/Mask (兜與戰鬼面具)
  ctx.fillStyle = '#0a0a0d';
  ctx.beginPath();
  ctx.arc(2, 6, 13, 0, Math.PI * 2);
  ctx.fill();

  // Ghost Mask (Mempo 面頰)
  ctx.fillStyle = isKurosawa ? '#eeeeee' : isGhost ? '#880000' : '#d4af37';
  ctx.beginPath();
  ctx.arc(6, 9, 7, -0.2, Math.PI * 0.7);
  ctx.fill();

  // Headband (額當 / 鉢巻 Hachimaki) with tails fluttering behind
  ctx.fillStyle = isKurosawa ? '#ffffff' : '#ffffff';
  ctx.fillRect(-8, 0, 18, 4);
  const headSway = Math.sin(t * 0.15) * 6;
  ctx.beginPath();
  ctx.moveTo(-8, 2);
  ctx.quadraticCurveTo(-26, 6 + headSway, -32, 14 + headSway);
  ctx.lineTo(-30, 18 + headSway);
  ctx.quadraticCurveTo(-24, 10 + headSway, -8, 5);
  ctx.fill();

  // 5. Arms & Katana (武士刀與架勢)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  if (action === 'standoff_ready' || standoffHolding) {
    // 居合拔刀術架勢：左手按鞘，右手撫刀柄，目光如電
    // Scabbard (Saya 刀鞘)
    ctx.strokeStyle = isKurosawa ? '#333333' : '#221914';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-14, 38);
    ctx.lineTo(12, 44);
    ctx.stroke();

    // Right Arm hovering on Katana Hilt
    ctx.strokeStyle = isKurosawa ? '#999999' : '#d4af37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, 24);
    ctx.lineTo(10, 36);
    ctx.stroke();

    // Eye glint spark when tense
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(8, 5, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (action === 'attack1' || action === 'attack2' || action === 'attack3' || action === 'standoff_slash') {
    // Dynamic slash pose with glowing blade
    ctx.strokeStyle = isKurosawa ? '#ffffff' : '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = isKurosawa ? '#ffffff' : '#ffea75';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(8, 22);
    ctx.lineTo(58, 28); // Slicing extended blade
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Golden Hilt & Tsuba
    ctx.fillStyle = isKurosawa ? '#999999' : '#d4af37';
    ctx.fillRect(6, 20, 6, 6);
  } else if (action === 'parry' || action === 'perfect_counter') {
    // 豎刀格擋姿態 (Vertical Katana Block)
    ctx.strokeStyle = isKurosawa ? '#ffffff' : '#e2e8f0';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(18, 55);
    ctx.lineTo(24, -15);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Hilt guard
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(16, 32, 6, 6);
  } else if (action === 'heal') {
    // 決意凝神回血冥想態
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 30, 25, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.stroke();
  } else if (action === 'dodge') {
    // 側身閃避殘影
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-16, 28);
    ctx.lineTo(15, 34);
    ctx.stroke();
  } else {
    // 默認備戰步態 (Ready Stance)
    ctx.strokeStyle = isKurosawa ? '#cccccc' : '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(4, 30);
    ctx.lineTo(32, 14); // Blade angled forward
    ctx.stroke();

    // Hilt
    ctx.fillStyle = isKurosawa ? '#888888' : '#d4af37';
    ctx.fillRect(2, 28, 5, 5);
  }

  ctx.restore();
}

/**
 * Procedural Render for Enemy Characters
 */
function drawEnemyCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  action: EnemyAction,
  attackType: 'normal' | 'unblockable',
  color: string,
  weaponType: 'sabre' | 'spear' | 'nodachi' | 'axe' | 'twin_blades',
  isKurosawa: boolean,
  t: number
) {
  ctx.save();
  const y = groundY - 94;
  ctx.translate(x, y);

  // Attack Warning Indicator (Blue / Red Flash on enemy)
  if (action === 'prep_attack' || action === 'standoff_strike') {
    const glowColor = attackType === 'unblockable' ? '#ff1e1e' : '#38bdf8';
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 35;
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(0, 20, 16, 0, Math.PI * 2);
    ctx.fill();

    // Warning Glint Icon / Kanji
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(attackType === 'unblockable' ? '危' : '斬', 0, -22);
    ctx.restore();
  }

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 94, 32, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Heavy Cloak / Robes
  ctx.fillStyle = isKurosawa ? '#2b2b2b' : color;
  ctx.beginPath();
  ctx.moveTo(14, 25);
  ctx.quadraticCurveTo(34 + Math.sin(t * 0.1) * 6, 55, 26, 88);
  ctx.lineTo(-4, 88);
  ctx.lineTo(-14, 25);
  ctx.closePath();
  ctx.fill();

  // 2. Heavy Legs & Boots
  ctx.fillStyle = isKurosawa ? '#181818' : '#1f1b19';
  if (action === 'parried_stagger') {
    // Staggered off-balance stance
    ctx.fillRect(-24, 60, 18, 34);
    ctx.fillRect(10, 55, 18, 38);
  } else {
    ctx.fillRect(-16, 56, 16, 38);
    ctx.fillRect(4, 56, 16, 38);
  }

  // 3. Armor Torso
  ctx.fillStyle = isKurosawa ? '#333333' : '#362925';
  ctx.fillRect(-18, 20, 36, 42);

  // Chest plate studs & rivets
  ctx.fillStyle = isKurosawa ? '#777777' : '#9c7a52';
  for (let r = 0; r < 3; r++) {
    ctx.fillRect(-12 + r * 10, 28, 5, 5);
    ctx.fillRect(-12 + r * 10, 42, 5, 5);
  }

  // 4. Headwear (Mongol Fur Helmet / Straw Hat)
  if (weaponType === 'nodachi') {
    // Straw Hat Ronin (笠鬼)
    ctx.fillStyle = isKurosawa ? '#666666' : '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(-32, 10);
    ctx.lineTo(32, 10);
    ctx.lineTo(0, -18);
    ctx.closePath();
    ctx.fill();
    // Face shadow
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(0, 12, 10, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Mongol War Helmet with Red Plume
    ctx.fillStyle = isKurosawa ? '#222222' : '#282422';
    ctx.beginPath();
    ctx.arc(0, 8, 14, 0, Math.PI * 2);
    ctx.fill();

    // Red Horsehair plume (蒙古盔纓)
    ctx.fillStyle = isKurosawa ? '#999999' : '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-3, -6);
    ctx.lineTo(3, -6);
    ctx.lineTo(10 + Math.sin(t * 0.15) * 5, -28);
    ctx.lineTo(-2, -18);
    ctx.closePath();
    ctx.fill();

    // Helmet Spire
    ctx.fillStyle = isKurosawa ? '#aaaaaa' : '#d4af37';
    ctx.fillRect(-2, -12, 4, 8);
  }

  // 5. Enemy Weapon
  ctx.save();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = isKurosawa ? '#cccccc' : '#e5e7eb';

  if (action === 'standoff_feint') {
    // 假動作虛晃抽動 (Feint twitch)
    ctx.translate(-15, -10);
    ctx.rotate(-0.35);
  } else if (action === 'attacking' || action === 'standoff_strike') {
    // 下劈突進
    ctx.translate(-25, 20);
    ctx.rotate(0.65);
  } else if (action === 'parried_stagger') {
    // 破防大硬直：武器向後彈開門戶大開
    ctx.translate(22, -15);
    ctx.rotate(-0.8);
  }

  if (weaponType === 'spear') {
    // Long Mongol Spear (長矛)
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, 60);
    ctx.lineTo(-45, -25);
    ctx.stroke();

    // Spear head blade & red tassel
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-45, -25);
    ctx.lineTo(-65, -40);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-48, -27, 8, 8);
  } else if (weaponType === 'axe') {
    // Heavy Greataxe (雙手巨斧)
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(10, 55);
    ctx.lineTo(-35, -25);
    ctx.stroke();

    // Curved crescent axe head
    ctx.fillStyle = isKurosawa ? '#dddddd' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(-35, -25, 24, -Math.PI * 0.75, Math.PI * 0.25);
    ctx.lineTo(-35, -25);
    ctx.closePath();
    ctx.fill();
  } else if (weaponType === 'twin_blades') {
    // Dual sabres (雙刀流)
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(5, 30);
    ctx.lineTo(-35, -10);
    ctx.moveTo(-5, 40);
    ctx.lineTo(-45, 15);
    ctx.stroke();
  } else {
    // Curved Mongol Sabre / Nodachi
    ctx.beginPath();
    ctx.moveTo(8, 35);
    ctx.quadraticCurveTo(-15, 10, -42, -15);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}
