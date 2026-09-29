import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameMode, GameState, PlayerAction, EnemyAction, Particle, FloatingText, CombatStats } from '../types/game';
import { ENEMY_ARCHETYPES, getEnemyForWave } from '../utils/enemies';
import { audio } from '../utils/audio';
import { TsushimaCanvas } from './TsushimaCanvas';
import { TsushimaHUD } from './TsushimaHUD';
import { TouchControls } from './TouchControls';
import { TitleModal } from './TitleModal';
import { EndGameModal } from './EndGameModal';

const STATS_STORAGE_KEY = 'tsushima_combat_stats_v1';

export const TsushimaGame: React.FC = () => {
  // Game states
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('STORY');
  const [isKurosawa, setIsKurosawa] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Match / Wave progress
  const [wave, setWave] = useState<number>(1);
  const [enemyConfig, setEnemyConfig] = useState(getEnemyForWave(1, 'STORY'));
  const [stats, setStats] = useState<CombatStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      score: 0,
      wave: 1,
      kills: 0,
      standoffKills: 0,
      perfectParries: 0,
      ghostActivations: 0,
      streak: 0,
      bestStreak: 0
    };
  });

  // Player state
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp] = useState<number>(100);
  const [resolve, setResolve] = useState<number>(3);
  const [maxResolve] = useState<number>(3);
  const [playerAction, setPlayerAction] = useState<PlayerAction>('idle');
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false);
  const [ghostTimer, setGhostTimer] = useState<number>(0);
  const [isStandoffHolding, setIsStandoffHolding] = useState<boolean>(false);

  // Positions
  const playerXRef = useRef<number>(240);
  const enemyXRef = useRef<number>(750);
  const [playerX, setPlayerX] = useState<number>(240);
  const [enemyX, setEnemyX] = useState<number>(750);

  // Enemy Combat State
  const [enemyHp, setEnemyHp] = useState<number>(80);
  const [enemyPosture, setEnemyPosture] = useState<number>(50);
  const [enemyAction, setEnemyAction] = useState<EnemyAction>('standoff_idle');
  const [enemyAttackType, setEnemyAttackType] = useState<'normal' | 'unblockable'>('normal');

  // Standoff Timing Cues & Alerts
  const [standoffFeintAlert, setStandoffFeintAlert] = useState<boolean>(false);
  const [standoffStrikeAlert, setStandoffStrikeAlert] = useState<boolean>(false);
  const [centerCalligraphy, setCenterCalligraphy] = useState<string | null>(null);
  const [dojoFeedback, setDojoFeedback] = useState<{ text: string; sub: string; color: string } | null>(null);

  // FX & Cinematic Refs
  const screenShakeRef = useRef<number>(0);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [flashEffect, setFlashEffect] = useState<{ color: string; alpha: number }>({ color: '#ffffff', alpha: 0 });
  const [cinematicLetterbox, setCinematicLetterbox] = useState<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const slashTrailsRef = useRef<{ x: number; y: number; alpha: number; angle: number; color: string }[]>([]);
  const windForceRef = useRef<number>(0);

  // Loop & Logic internals
  const slowMotionRef = useRef<number>(1.0);
  const standoffTimerRef = useRef<number>(0);
  const standoffFeintsLeftRef = useRef<number>(0);
  const enemyActionTimerRef = useRef<number>(0);
  const playerActionTimerRef = useRef<number>(0);
  const parryWindowRef = useRef<number>(0);
  const perfectParryWindowRef = useRef<number>(0);
  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const comboIndexRef = useRef<number>(0);
  const lastAttackTimeRef = useRef<number>(0);

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Trigger floating calligraphic text
  const showCenterBanner = useCallback((text: string, duration = 1200) => {
    setCenterCalligraphy(text);
    setTimeout(() => {
      setCenterCalligraphy((prev) => (prev === text ? null : prev));
    }, duration);
  }, []);

  // Add floating combat text
  const addFloatingText = useCallback((text: string, x: number, y: number, color = '#ffd700', scale = 1.0) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale,
      vy: -1.8,
      life: 50
    });
  }, []);

  // Spawn blood burst particles
  const spawnBlood = useCallback((x: number, y: number, count = 25) => {
    audio.playBlood();
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 12,
        size: Math.random() * 4 + 2,
        color: Math.random() > 0.3 ? '#8b0000' : '#450000',
        alpha: 1.0,
        decay: 0.015,
        gravity: 0.35,
        shape: 'circle'
      });
    }
  }, []);

  // Spawn metal sparks
  const spawnSparks = useCallback((x: number, y: number, count = 20, color = '#ffd700') => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color,
        alpha: 1.0,
        decay: 0.035,
        gravity: 0.15,
        shape: 'spark'
      });
    }
  }, []);

  // Start / Spawn a wave
  const startWave = useCallback(
    (targetWave: number, mode: GameMode) => {
      const cfg = getEnemyForWave(targetWave, mode);
      setWave(targetWave);
      setEnemyConfig(cfg);
      setEnemyHp(cfg.hp);
      setEnemyPosture(cfg.posture);

      // Reset positions
      playerXRef.current = 240;
      enemyXRef.current = 750;
      setPlayerX(240);
      setEnemyX(750);

      // Standoff setup
      standoffFeintsLeftRef.current = cfg.feints;
      standoffTimerRef.current = 80 + Math.random() * 70;
      setEnemyAction('standoff_idle');
      setPlayerAction('idle');
      setIsStandoffHolding(false);
      setStandoffFeintAlert(false);
      setStandoffStrikeAlert(false);
      setCinematicLetterbox(1.0);
      setGameState('STANDOFF');

      audio.playTaiko('heavy');
      showCenterBanner('對峙', 1400);
    },
    [showCenterBanner]
  );

  // Player takes damage
  const damagePlayer = useCallback(
    (amount: number) => {
      setPlayerHp((prev) => {
        const nextHp = Math.max(0, prev - amount);
        if (nextHp <= 0) {
          setPlayerAction('dead');
          setGameState('GAMEOVER');
          audio.playDefeat();
          showCenterBanner('戰死對馬', 2000);
          setStats((s) => ({
            ...s,
            streak: 0
          }));
        }
        return nextHp;
      });

      screenShakeRef.current = 16;
      setFlashEffect({ color: 'rgba(255, 0, 0, 0.4)', alpha: 0.6 });
      spawnBlood(playerXRef.current + 10, 360, 20);
      setStats((s) => ({ ...s, streak: 0 }));
    },
    [showCenterBanner, spawnBlood]
  );

  // Enemy takes damage
  const damageEnemy = useCallback(
    (amount: number, isCritical = false, postureDmg = 25) => {
      screenShakeRef.current = isCritical ? 20 : 8;
      if (isCritical) {
        setFlashEffect({ color: '#ffffff', alpha: 0.6 });
        slowMotionRef.current = 0.15;
        setTimeout(() => {
          slowMotionRef.current = 1.0;
        }, 320);
        addFloatingText(`暴擊 ${amount}`, enemyXRef.current, 320, '#ffd700', 1.3);
      } else {
        addFloatingText(`${amount}`, enemyXRef.current, 330, '#ffffff', 1.0);
      }

      spawnBlood(enemyXRef.current, 350, isCritical ? 40 : 18);

      setEnemyPosture((prev) => Math.max(0, prev - postureDmg));

      setEnemyHp((prev) => {
        const next = Math.max(0, prev - amount);
        if (next <= 0) {
          // ENEMY DEFEATED
          setEnemyAction('dead');
          setStats((s) => {
            const newKills = s.kills + 1;
            const newStreak = s.streak + 1;
            return {
              ...s,
              kills: newKills,
              streak: newStreak,
              bestStreak: Math.max(s.bestStreak, newStreak),
              score: s.score + 500 + newStreak * 100
            };
          });

          // Gain 1 Resolve on kill
          setResolve((r) => Math.min(maxResolve, r + 1));

          setTimeout(() => {
            setGameState('VICTORY');
            audio.playVictory();
            showCenterBanner('勝負已分', 1800);
          }, 1200);
        } else {
          setEnemyAction('hit');
          enemyActionTimerRef.current = 18;
        }
        return next;
      });
    },
    [addFloatingText, maxResolve, showCenterBanner, spawnBlood]
  );

  // Standoff Release Resolution (居合一閃判定)
  const handleStandoffRelease = useCallback(() => {
    if (gameState !== 'STANDOFF') return;
    setIsStandoffHolding(false);

    if (enemyAction === 'standoff_strike') {
      // PERFECT IAI SLASH (神速一閃！)
      audio.playSlash('iai');
      audio.playTaiko('lethal');
      screenShakeRef.current = 25;
      setFlashEffect({ color: '#ffffff', alpha: 0.9 });
      slowMotionRef.current = 0.05;

      setTimeout(() => {
        slowMotionRef.current = 1.0;
      }, 550);

      setPlayerAction('standoff_slash');
      playerActionTimerRef.current = 40;
      showCenterBanner('一閃', 1500);
      addFloatingText('神速一閃', (playerXRef.current + enemyXRef.current) / 2, 300, '#ffd700', 1.5);

      if (gameMode === 'DOJO') {
        setDojoFeedback({
          text: '完美一閃 (PERFECT TIMING)',
          sub: '在敵刀紅光斬落瞬間精準出鞘！',
          color: '#22c55e'
        });
      }

      setStats((s) => ({
        ...s,
        standoffKills: s.standoffKills + 1,
        score: s.score + 1000
      }));

      // Instant Kill in standoff
      damageEnemy(enemyHp, true, 999);
    } else if (enemyAction === 'standoff_feint') {
      // TRICKED BY FEINT (中敵假動作！)
      if (gameMode === 'DOJO') {
        setDojoFeedback({
          text: '被虛晃誘騙 (FEINT TRICKED)',
          sub: '敵兵尚未出刀，因急躁提前鬆手，破綻大露！',
          color: '#ef4444'
        });
      }
      addFloatingText('中計！', playerXRef.current, 310, '#ef4444', 1.2);
      damagePlayer(45);
      setGameState('COMBAT');
      setCinematicLetterbox(0);
    } else {
      // Too early / Released randomly
      if (gameMode === 'DOJO') {
        setDojoFeedback({
          text: '放開過早 (TOO EARLY)',
          sub: '敵人尚未發起衝鋒便揮刀走空。',
          color: '#f59e0b'
        });
      }
      addFloatingText('揮刀過早', playerXRef.current, 320, '#f59e0b', 1.0);
      damagePlayer(30);
      setGameState('COMBAT');
      setCinematicLetterbox(0);
    }
  }, [gameState, enemyAction, gameMode, damageEnemy, enemyHp, showCenterBanner, addFloatingText, damagePlayer]);

  // Player Attack Trigger (J / Left Click)
  const handleAttack = useCallback(() => {
    audio.init();
    if (gameState !== 'COMBAT' || playerAction === 'dead' || playerAction === 'hit') return;

    const now = Date.now();
    if (now - lastAttackTimeRef.current < 220) return; // Attack cooldown
    lastAttackTimeRef.current = now;

    // Combo progression
    comboIndexRef.current = (comboIndexRef.current % 3) + 1;
    const actionKey: PlayerAction =
      comboIndexRef.current === 1 ? 'attack1' : comboIndexRef.current === 2 ? 'attack2' : 'attack3';

    setPlayerAction(actionKey);
    playerActionTimerRef.current = 18;
    audio.playSlash(isGhostMode ? 'iai' : comboIndexRef.current === 3 ? 'heavy' : 'light');

    // Add visual slash trail
    slashTrailsRef.current.push({
      x: playerXRef.current + 35,
      y: 360,
      alpha: 1.0,
      angle: comboIndexRef.current === 1 ? 0 : comboIndexRef.current === 2 ? -0.4 : 0.4,
      color: isGhostMode ? '#ff0000' : comboIndexRef.current === 3 ? '#fbbf24' : '#e2e8f0'
    });

    // Check hit range
    const dist = Math.abs(playerXRef.current - enemyXRef.current);
    if (dist < 135 && enemyHp > 0) {
      setTimeout(() => {
        if (isGhostMode) {
          // Ghost mode instant kill strike
          damageEnemy(150, true, 200);
        } else if (enemyAction === 'parried_stagger') {
          // Critical Punish on Staggered enemy
          damageEnemy(75, true, 80);
          audio.playTaiko('heavy');
        } else if (enemyAction === 'prep_attack') {
          // Counter interrupt
          damageEnemy(40, false, 35);
          addFloatingText('打斷攻擊', enemyXRef.current, 310, '#38bdf8', 1.0);
        } else {
          // Standard slash
          const dmg = comboIndexRef.current === 3 ? 42 : 26;
          damageEnemy(dmg, false, 25);
        }
      }, 70);
    }
  }, [gameState, playerAction, isGhostMode, enemyHp, enemyAction, damageEnemy, addFloatingText]);

  // Player Parry Trigger (K / Right Click)
  const handleParry = useCallback(() => {
    audio.init();
    if (gameState !== 'COMBAT' || playerAction === 'dead' || playerAction === 'hit') return;

    setPlayerAction('parry');
    playerActionTimerRef.current = 20;
    parryWindowRef.current = 15;
    perfectParryWindowRef.current = 8; // First 8 frames = Perfect Parry
    audio.playSwordDraw();
  }, [gameState, playerAction]);

  // Player Dodge (L / Space in combat)
  const handleDodge = useCallback(() => {
    audio.init();
    if (gameState !== 'COMBAT' || playerAction === 'dead' || playerAction === 'hit') return;

    setPlayerAction('dodge');
    playerActionTimerRef.current = 20;
    audio.playDodge();
    // Step backward slightly
    playerXRef.current = Math.max(80, playerXRef.current - 45);
    setPlayerX(playerXRef.current);
  }, [gameState, playerAction]);

  // Player Heal (Q)
  const handleHeal = useCallback(() => {
    audio.init();
    if (gameState !== 'COMBAT' || resolve < 1 || playerHp >= playerMaxHp) return;

    setResolve((r) => r - 1);
    setPlayerHp((prev) => Math.min(playerMaxHp, prev + 35));
    setPlayerAction('heal');
    playerActionTimerRef.current = 16;
    audio.playHeal();
    spawnSparks(playerXRef.current, 360, 25, '#ffd700');
    addFloatingText('+35 療傷', playerXRef.current, 300, '#22c55e', 1.1);
  }, [gameState, resolve, playerHp, playerMaxHp, spawnSparks, addFloatingText]);

  // Trigger Ghost Stance (R)
  const handleGhostStance = useCallback(() => {
    audio.init();
    if (gameState !== 'COMBAT' || resolve < 3 || isGhostMode) return;

    setResolve(0);
    setIsGhostMode(true);
    setGhostTimer(360); // ~6 seconds
    audio.playGhostStanceTrigger();
    setFlashEffect({ color: 'rgba(255, 0, 0, 0.7)', alpha: 0.8 });
    screenShakeRef.current = 22;
    slowMotionRef.current = 0.2;
    setTimeout(() => {
      slowMotionRef.current = 1.0;
    }, 450);

    showCenterBanner('戰鬼姿態', 1600);
    setStats((s) => ({ ...s, ghostActivations: s.ghostActivations + 1 }));
  }, [gameState, resolve, isGhostMode, showCenterBanner]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.init();
      if (e.repeat) return;
      keysDownRef.current[e.code] = true;

      if (gameState === 'STANDOFF') {
        if (e.code === 'Space') {
          setIsStandoffHolding(true);
          setPlayerAction('standoff_ready');
        }
      } else if (gameState === 'COMBAT') {
        if (e.code === 'KeyJ') handleAttack();
        if (e.code === 'KeyK') handleParry();
        if (e.code === 'KeyL' || e.code === 'Space') handleDodge();
        if (e.code === 'KeyQ') handleHeal();
        if (e.code === 'KeyR') handleGhostStance();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.code] = false;
      if (gameState === 'STANDOFF' && e.code === 'Space') {
        handleStandoffRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleAttack, handleParry, handleDodge, handleHeal, handleGhostStance, handleStandoffRelease]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      // Dynamic Wind oscillation
      windForceRef.current = Math.sin(Date.now() * 0.002) * 1.5;

      // Screen shake decay
      if (screenShakeRef.current > 0.1) {
        screenShakeRef.current *= 0.88;
        setScreenShake(screenShakeRef.current);
      }

      // Flash decay
      setFlashEffect((prev) =>
        prev.alpha > 0.02 ? { ...prev, alpha: prev.alpha * 0.85 } : { color: '#ffffff', alpha: 0 }
      );

      // Slash trail decay
      slashTrailsRef.current.forEach((st) => {
        st.alpha -= 0.08;
      });
      slashTrailsRef.current = slashTrailsRef.current.filter((st) => st.alpha > 0.05);

      // Particle decay
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.02);

      // Floating text decay
      floatingTextsRef.current.forEach((ft) => {
        ft.y += ft.vy;
        ft.life--;
        ft.alpha = ft.life / 50;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life > 0);

      // Ghost mode timer
      if (isGhostMode) {
        setGhostTimer((prev) => {
          if (prev <= 1) {
            setIsGhostMode(false);
            return 0;
          }
          return prev - 1;
        });
      }

      // Player timers
      if (playerActionTimerRef.current > 0) {
        playerActionTimerRef.current--;
        if (playerActionTimerRef.current <= 0 && playerAction !== 'dead') {
          setPlayerAction('idle');
        }
      }
      if (parryWindowRef.current > 0) parryWindowRef.current--;
      if (perfectParryWindowRef.current > 0) perfectParryWindowRef.current--;

      // Active Keyboard movement in Combat
      if (gameState === 'COMBAT' && playerAction === 'idle') {
        if (keysDownRef.current['KeyA'] || keysDownRef.current['ArrowLeft']) {
          playerXRef.current = Math.max(80, playerXRef.current - 3);
          setPlayerX(playerXRef.current);
        }
        if (keysDownRef.current['KeyD'] || keysDownRef.current['ArrowRight']) {
          playerXRef.current = Math.min(enemyXRef.current - 65, playerXRef.current + 3);
          setPlayerX(playerXRef.current);
        }
      }

      // STATE SPECIFIC UPDATES
      if (gameState === 'STANDOFF') {
        updateStandoffCycle();
      } else if (gameState === 'COMBAT') {
        updateCombatCycle();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    // Standoff Logic
    const updateStandoffCycle = () => {
      standoffTimerRef.current--;

      // Heartbeat pulse every 50 frames
      if (standoffTimerRef.current % 50 === 0) {
        audio.playHeartbeat();
      }

      if (enemyAction === 'standoff_idle' && standoffTimerRef.current <= 0) {
        if (standoffFeintsLeftRef.current > 0 && Math.random() > 0.45) {
          // TRIGGER FEINT
          standoffFeintsLeftRef.current--;
          setEnemyAction('standoff_feint');
          setStandoffFeintAlert(true);
          enemyActionTimerRef.current = 24;
          audio.playSlash('light');
        } else {
          // TRIGGER REAL STRIKE
          setEnemyAction('standoff_strike');
          setStandoffStrikeAlert(true);
          setStandoffFeintAlert(false);
          enemyActionTimerRef.current = 40;
          audio.playSwordDraw();
          setFlashEffect({ color: '#ff3333', alpha: 0.4 });
        }
      } else if (enemyAction === 'standoff_feint') {
        enemyActionTimerRef.current--;
        if (enemyActionTimerRef.current <= 0) {
          setEnemyAction('standoff_idle');
          setStandoffFeintAlert(false);
          standoffTimerRef.current = 35 + Math.random() * 35;
        }
      } else if (enemyAction === 'standoff_strike') {
        // Enemy rushes forward
        enemyXRef.current -= 6.5;
        setEnemyX(enemyXRef.current);

        if (enemyXRef.current <= playerXRef.current + 65) {
          // Player failed to release in time
          setStandoffStrikeAlert(false);
          damagePlayer(50);
          setGameState('COMBAT');
          setCinematicLetterbox(0);
        }
      }
    };

    // Combat AI Logic
    const updateCombatCycle = () => {
      if (enemyHp <= 0 || playerHp <= 0) return;

      const dist = enemyXRef.current - playerXRef.current;
      const targetDist = 110;

      if (enemyAction === 'idle' || enemyAction === 'advance' || enemyAction === 'retreat') {
        // Spatial positioning AI
        if (dist > targetDist + 15) {
          enemyXRef.current -= enemyConfig.speed * 2.2;
          setEnemyX(enemyXRef.current);
          setEnemyAction('advance');
        } else if (dist < targetDist - 25) {
          enemyXRef.current += enemyConfig.speed * 1.8;
          setEnemyX(enemyXRef.current);
          setEnemyAction('retreat');
        } else {
          setEnemyAction('idle');
          // Attack decision
          if (Math.random() < 0.035) {
            setEnemyAction('prep_attack');
            const isUnblockable = Math.random() < enemyConfig.unblockableChance;
            setEnemyAttackType(isUnblockable ? 'unblockable' : 'normal');
            enemyActionTimerRef.current = Math.max(28, enemyConfig.attackInterval);
            if (isUnblockable) {
              audio.playTaiko('light');
            }
          }
        }
      } else if (enemyAction === 'prep_attack') {
        enemyActionTimerRef.current--;
        if (enemyActionTimerRef.current <= 0) {
          setEnemyAction('attacking');
          enemyActionTimerRef.current = 18;
          audio.playSlash('heavy');

          // Check hit detection
          setTimeout(() => {
            const currentDist = enemyXRef.current - playerXRef.current;
            if (currentDist < 125) {
              if (perfectParryWindowRef.current > 0 && enemyAttackType === 'normal') {
                // PERFECT PARRY
                audio.playClang(true);
                setEnemyAction('parried_stagger');
                enemyActionTimerRef.current = 65;
                spawnSparks((playerXRef.current + enemyXRef.current) / 2 + 10, 350, 30, '#ffd700');
                setFlashEffect({ color: '#ffd700', alpha: 0.5 });
                slowMotionRef.current = 0.15;
                setTimeout(() => {
                  slowMotionRef.current = 1.0;
                }, 280);

                showCenterBanner('完美招架', 1000);
                addFloatingText('完美招架！破防！', (playerXRef.current + enemyXRef.current) / 2, 300, '#ffd700', 1.3);

                setResolve((r) => Math.min(maxResolve, r + 1));
                setStats((s) => ({
                  ...s,
                  perfectParries: s.perfectParries + 1,
                  score: s.score + 350
                }));
              } else if (parryWindowRef.current > 0 && enemyAttackType === 'normal') {
                // NORMAL PARRY
                audio.playClang(false);
                spawnSparks((playerXRef.current + enemyXRef.current) / 2 + 10, 350, 15, '#e2e8f0');
                addFloatingText('招架格擋', playerXRef.current, 320, '#e2e8f0', 0.9);
                setEnemyAction('idle');
              } else if (playerAction === 'dodge') {
                // DODGED UNBLOCKABLE
                addFloatingText('看破閃避', playerXRef.current, 320, '#38bdf8', 1.1);
                spawnSparks(playerXRef.current + 20, 370, 10, '#ffffff');
              } else {
                // HIT TAKEN
                damagePlayer(enemyAttackType === 'unblockable' ? 36 : 22);
              }
            }
          }, 60);
        }
      } else if (enemyAction === 'attacking' || enemyAction === 'hit' || enemyAction === 'parried_stagger') {
        enemyActionTimerRef.current--;
        if (enemyActionTimerRef.current <= 0) {
          setEnemyAction('idle');
        }
      }
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    gameState,
    enemyHp,
    playerHp,
    enemyAction,
    enemyConfig,
    enemyAttackType,
    playerAction,
    isGhostMode,
    maxResolve,
    damagePlayer,
    showCenterBanner,
    addFloatingText,
    spawnSparks
  ]);

  // User Actions
  const handleStartGame = (mode: GameMode) => {
    audio.init();
    setGameMode(mode);
    setPlayerHp(playerMaxHp);
    setResolve(3);
    startWave(1, mode);
  };

  const handleNextWave = () => {
    audio.init();
    startWave(wave + 1, gameMode);
  };

  const handleRestart = () => {
    audio.init();
    setPlayerHp(playerMaxHp);
    setResolve(3);
    startWave(1, gameMode);
  };

  const handleReturnTitle = () => {
    setGameState('TITLE');
    setCinematicLetterbox(0);
  };

  const handleToggleKurosawa = () => {
    setIsKurosawa((prev) => !prev);
  };

  const handleToggleMute = () => {
    audio.init();
    const next = !isMuted;
    setIsMuted(next);
    audio.setMute(next);
  };

  return (
    <div className={`min-h-screen bg-[#070608] text-slate-100 flex flex-col justify-between ${isKurosawa ? 'kurosawa-filter' : ''}`}>
      {/* TOP NAV BAR - Follows strict 3-zone Top Bar Contract */}
      <header className="w-full border-b border-[#241f1a] bg-[#0c0a0e]/90 backdrop-blur-md px-4 md:px-8 py-3 flex items-center justify-between z-10">
        {/* Zone 1: Single text wordmark */}
        <span className="text-base md:text-lg font-bold font-serif tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
          對馬戰鬼 · 一閃
        </span>

        {/* Zone 2: Navigation / Info */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-serif text-slate-400">
          <span className="hover:text-amber-300 transition-colors">
            武士道 · 境井一刀流
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300">
            {gameMode === 'STORY' ? '劇情對決' : gameMode === 'SURVIVAL' ? '無盡修羅' : '修練道場'} · 第 {wave} 幕
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-cinzel text-amber-400">
            KILLS: {stats.kills}
          </span>
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleKurosawa}
            className={`px-3 py-1.5 rounded text-xs font-serif transition-all border ${
              isKurosawa
                ? 'bg-neutral-200 text-black border-white font-bold shadow-sm'
                : 'bg-black/60 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            {isKurosawa ? '黑澤明黑白' : '彩色暮色'}
          </button>
          <button
            onClick={handleToggleMute}
            className="p-1.5 px-2 bg-black/60 border border-slate-700 hover:border-slate-500 rounded text-slate-300 text-xs transition-colors"
            title="音效開關"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* MAIN GAME ARENA VIEWPORT */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 relative">
        <div className="relative w-full max-w-[1000px] mx-auto">
          {/* Canvas Viewport */}
          <TsushimaCanvas
            gameState={gameState}
            gameMode={gameMode}
            isKurosawa={isKurosawa}
            playerAction={playerAction}
            enemyAction={enemyAction}
            playerX={playerX}
            enemyX={enemyX}
            playerHp={playerHp}
            playerMaxHp={playerMaxHp}
            enemyHp={enemyHp}
            enemyMaxHp={enemyConfig.hp}
            enemyPosture={enemyPosture}
            enemyMaxPosture={enemyConfig.posture}
            enemyColor={enemyConfig.color}
            enemyWeaponType={enemyConfig.weaponType}
            enemyAttackType={enemyAttackType}
            isGhostMode={isGhostMode}
            ghostTimer={ghostTimer}
            standoffHolding={isStandoffHolding}
            screenShake={screenShake}
            flashEffect={flashEffect}
            particles={particlesRef.current}
            floatingTexts={floatingTextsRef.current}
            cinematicLetterbox={cinematicLetterbox}
            slashTrail={slashTrailsRef.current}
            windForce={windForceRef.current}
          />

          {/* Interactive HUD Layer */}
          <TsushimaHUD
            gameState={gameState}
            playerHp={playerHp}
            playerMaxHp={playerMaxHp}
            resolve={resolve}
            maxResolve={maxResolve}
            isGhostMode={isGhostMode}
            ghostTimer={ghostTimer}
            enemy={enemyConfig}
            enemyHp={enemyHp}
            enemyPosture={enemyPosture}
            isStandoffHolding={isStandoffHolding}
            standoffFeintAlert={standoffFeintAlert}
            standoffStrikeAlert={standoffStrikeAlert}
            wave={wave}
            score={stats.score}
            streak={stats.streak}
            centerCalligraphy={centerCalligraphy}
            dojoFeedback={dojoFeedback}
          />

          {/* MODALS */}
          {gameState === 'TITLE' && (
            <TitleModal
              onStartGame={handleStartGame}
              isKurosawa={isKurosawa}
              onToggleKurosawa={handleToggleKurosawa}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              stats={stats}
            />
          )}

          {(gameState === 'VICTORY' || gameState === 'GAMEOVER') && (
            <EndGameModal
              isVictory={gameState === 'VICTORY'}
              gameMode={gameMode}
              wave={wave}
              maxWave={ENEMY_ARCHETYPES.length}
              stats={stats}
              onNextWave={handleNextWave}
              onRestart={handleRestart}
              onReturnTitle={handleReturnTitle}
            />
          )}
        </div>

        {/* TOUCH / MOBILE ON-SCREEN CONTROLS */}
        <TouchControls
          gameState={gameState}
          resolve={resolve}
          isGhostMode={isGhostMode}
          onAttack={handleAttack}
          onParry={handleParry}
          onDodge={handleDodge}
          onHeal={handleHeal}
          onGhost={handleGhostStance}
          onStandoffHoldStart={() => {
            audio.init();
            setIsStandoffHolding(true);
            setPlayerAction('standoff_ready');
          }}
          onStandoffHoldEnd={handleStandoffRelease}
          onMoveLeft={(isDown) => {
            if (isDown && playerAction === 'idle') {
              playerXRef.current = Math.max(80, playerXRef.current - 25);
              setPlayerX(playerXRef.current);
            }
          }}
          onMoveRight={(isDown) => {
            if (isDown && playerAction === 'idle') {
              playerXRef.current = Math.min(enemyXRef.current - 65, playerXRef.current + 25);
              setPlayerX(playerXRef.current);
            }
          }}
        />
      </main>

      {/* QUIET FOOTER */}
      <footer className="w-full border-t border-[#1a1715] bg-[#080709] px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-serif">
        <div className="flex items-center gap-2">
          <span>對馬戰鬼：對峙與一閃</span>
          <span>·</span>
          <span>純 Web Audio 合成音效</span>
        </div>
        <div className="flex items-center gap-3">
          <span>空白鍵長按: 對峙居合</span>
          <span>·</span>
          <span>J: 斬擊 / K: 完美招架 / L: 看破閃避</span>
        </div>
      </footer>
    </div>
  );
};
