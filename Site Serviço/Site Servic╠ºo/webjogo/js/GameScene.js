// ============================================================
// GAME SCENE
// ============================================================
class GameScene extends Phaser.Scene {
  constructor() { super({ key:'GameScene' }); }

create() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;

    this.targetSentence = Phaser.Utils.Array.GetRandom(SENTENCE_TEMPLATES);

    this.collectedWords  = [];
    this.wordObjects     = [];
    this.furnitureItems  = [];

    this.playerX = W / 2;
    this.playerY = H / 2 + 60;
    this.playerSpeed = 200;
    this.hookActive    = false;
    this.hookReturning = false;
    this.hookX = 0; this.hookY = 0;
    this.hookVX = 0; this.hookVY = 0;
    this.maxHookRange  = 82; 
    this.tetheredWord    = null;
    this.depositCooldown = 0;
    this.timeLeft        = 10; // Tempo fixo inicial
    this.isGameOver      = false;

    this._buildRoom();
    this._buildFurniture();
    this._buildWords();
    this._buildBriefcase();
    this._buildPlayer();
    this._buildCordGraphics();

    // Chama o buildUI UMA vez
    this._buildUI();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    this.input.on('pointerdown', p => {
        if (p.leftButtonDown())  this._fireHook(p.x, p.y);
        if (p.rightButtonDown()) this._releaseTether();
    });
    this.input.mouse.disableContextMenu();

    this.cameras.main.fadeIn(400);
  }



  // ── ROOM ─────────────────────────────────────────────────
  _buildRoom() {
    const W = this.W, H = this.H;
    const g = this.add.graphics();

    // Dark carpet floor
    g.fillGradientStyle(0x131118, 0x131118, 0x1a1720, 0x18151e, 1);
    g.fillRect(0, 120, W, H - 120);

    // Carpet tile grid
    g.lineStyle(1, 0x1c1924, 0.65);
    for (let x = 0; x <= W; x += 34) g.lineBetween(x, 120, x, H);
    for (let y = 120; y <= H; y += 34) g.lineBetween(0, y, W, y);

    // Accent aisle strip
    g.fillStyle(0x18162a, 0.55);
    g.fillRect(W/2 - 55, 120, 110, H - 120);

    // Back wall
    g.fillStyle(0x1c1a2a, 1);
    g.fillRect(0, 0, W, 122);

    // Suspended ceiling tiles
    g.lineStyle(1, 0x252235, 0.5);
    for (let x = 0; x <= W; x += 88) g.lineBetween(x, 0, x, 120);
    for (let y = 0; y <= 120; y += 55) g.lineBetween(0, y, W, y);

    // Skirting board
    g.fillStyle(0x222030, 1);
    g.fillRect(0, 113, W, 9);
    g.lineStyle(1, 0x48406a, 0.55);
    g.lineBetween(0, 120, W, 120);

    // Windows along back wall
    const winXs = [80, 240, 430, 620, 810];
    winXs.forEach(wx => {
      g.fillStyle(0x2a2840, 1);
      g.fillRect(wx - 32, 6, 64, 88);
      g.lineStyle(1.5, 0x48406a, 0.8);
      g.strokeRect(wx - 32, 6, 64, 88);
      // Night pane
      g.fillStyle(0x09111e, 1);
      g.fillRect(wx - 30, 8, 60, 84);
      // Crossbars
      g.lineStyle(1, 0x48406a, 0.5);
      g.lineBetween(wx, 8, wx, 92);
      g.lineBetween(wx - 30, 50, wx + 30, 50);
      // City glow at base of window
      g.fillStyle(0x1a2f4a, 0.5);
      g.fillRect(wx - 30, 68, 60, 24);
    });

    // Fluorescent light strips
    const litXs = [160, 340, 520, 740];
    litXs.forEach(lx => {
      g.fillStyle(0xd0cafe, 0.13);
      g.fillRect(lx - 42, 3, 84, 11);
      const beam = this.add.graphics();
      beam.fillStyle(0xd0cafe, 0.014);
      beam.fillRect(lx - 130, 14, 260, H - 14);
    });

    // Central ambient pool
    const amb = this.add.graphics();
    amb.fillStyle(0xd0cafe, 0.02);
    amb.fillEllipse(W / 2, H / 2 + 50, 640, 340);

    // Power outlet marks on floor
    const g2 = this.add.graphics();
    for (let i = 0; i < 6; i++) {
      const ox = 120 + i * 130, oy = H - 14;
      g2.fillStyle(0x302840, 1);
      g2.fillRect(ox - 5, oy - 4, 10, 8);
      g2.lineStyle(1, 0x504860, 0.7);
      g2.strokeRect(ox - 5, oy - 4, 10, 8);
    }
  }

  // ── FURNITURE ────────────────────────────────────────────
  _buildFurniture() {
    const defs = [
      // Desk row
      { id:'desk1',   x:155, y:192, w:138, h:66,  color:0x42382e, dark:0x2e2620, label:'Desk',           mass:4.5, type:'desk'    },
      { id:'desk2',   x:380, y:192, w:138, h:66,  color:0x42382e, dark:0x2e2620, label:'Desk',           mass:4.5, type:'desk'    },
      { id:'desk3',   x:610, y:192, w:138, h:66,  color:0x42382e, dark:0x2e2620, label:'Desk',           mass:4.5, type:'desk'    },
      // Office chairs (light)
      { id:'chair1',  x:155, y:272, w:42,  h:42,  color:0x202030, dark:0x141420, label:'Chair',          mass:0.8, type:'chair'   },
      { id:'chair2',  x:380, y:272, w:42,  h:42,  color:0x202030, dark:0x141420, label:'Chair',          mass:0.8, type:'chair'   },
      { id:'chair3',  x:610, y:272, w:42,  h:42,  color:0x202030, dark:0x141420, label:'Chair',          mass:0.8, type:'chair'   },
      { id:'chair4',  x:795, y:360, w:42,  h:42,  color:0x202030, dark:0x141420, label:'Chair',          mass:0.8, type:'chair'   },
      // Filing cabinets (heavy)
      { id:'cab1',    x:70,  y:235, w:66,  h:134, color:0x525248, dark:0x3c3c34, label:'Filing Cabinet', mass:5.5, type:'cabinet' },
      { id:'cab2',    x:830, y:235, w:66,  h:134, color:0x525248, dark:0x3c3c34, label:'Filing Cabinet', mass:5.5, type:'cabinet' },
      // Printer / copier
      { id:'printer', x:770, y:432, w:92,  h:66,  color:0x606068, dark:0x444448, label:'Printer',        mass:3.5, type:'printer' },
      // Side shelf
      { id:'shelf',   x:448, y:434, w:94,  h:52,  color:0x4a3e30, dark:0x322a20, label:'Shelf',          mass:2.8, type:'shelf'   },
      // Potted plants
      { id:'plant1',  x:102, y:510, w:34,  h:34,  color:0x1a3420, dark:0x0e2414, label:'Plant',          mass:0.6, type:'plant'   },
      { id:'plant2',  x:800, y:510, w:34,  h:34,  color:0x1a3420, dark:0x0e2414, label:'Plant',          mass:0.6, type:'plant'   },
    ];

    defs.forEach(def => {
      const c = this.add.container(def.x, def.y);

      const shadow = this.add.rectangle(5, 6, def.w, def.h, 0x000000, 0.5);
      const body   = this.add.rectangle(0, 0, def.w, def.h, def.color);
      body.setStrokeStyle(1, 0xffffff, 0.06);

      const deco = this.add.graphics();

      if (def.type === 'desk') {
        deco.fillStyle(0xffffff, 0.04);
        deco.fillRect(-def.w/2, -def.h/2, def.w, 6);
        // Monitor
        deco.fillStyle(0x0c1018, 1);
        deco.fillRect(-16, -def.h/2 + 4, 32, 24);
        deco.lineStyle(1, 0x3a4860, 0.9);
        deco.strokeRect(-16, -def.h/2 + 4, 32, 24);
        deco.fillStyle(0x0d2540, 0.8);
        deco.fillRect(-14, -def.h/2 + 6, 28, 20);
        deco.fillStyle(0x5a9adc, 0.6);
        deco.fillRect(-10, -def.h/2 + 15, 8, 2);
        // Mouse
        deco.fillStyle(0x706858, 1);
        deco.fillEllipse(def.w/2 - 14, def.h/2 - 10, 10, 14);
        // Papers
        deco.fillStyle(0xd8d0b8, 0.18);
        deco.fillRect(6, -def.h/2 + 6, 28, 20);
        deco.fillStyle(0xd8d0b8, 0.1);
        deco.fillRect(10, -def.h/2 + 10, 28, 20);

      } else if (def.type === 'chair') {
        deco.fillStyle(0x303044, 0.9);
        deco.fillRect(-14, -14, 28, 28);
        deco.lineStyle(1.5, 0x505068, 0.6);
        deco.strokeRect(-13, -13, 26, 26);
        deco.fillStyle(0x282838, 1);
        deco.fillRect(-18, -10, 4, 20);
        deco.fillRect(14, -10, 4, 20);
        deco.fillStyle(0x181820, 0.8);
        deco.fillCircle(0, 0, 6);

      } else if (def.type === 'cabinet') {
        const drawers = 4;
        const dh = (def.h - 12) / drawers;
        for (let i = 0; i < drawers; i++) {
          const dy = -def.h/2 + 6 + i * dh;
          deco.fillStyle(0x3a3a32, 1);
          deco.fillRect(-def.w/2 + 4, dy, def.w - 8, dh - 3);
          deco.lineStyle(1, def.dark, 0.6);
          deco.strokeRect(-def.w/2 + 4, dy, def.w - 8, dh - 3);
          deco.fillStyle(0xa0a090, 0.75);
          deco.fillRect(-10, dy + (dh - 3)/2 - 3, 20, 5);
        }

      } else if (def.type === 'printer') {
        deco.fillStyle(0x484850, 0.5);
        deco.fillRect(-def.w/2 + 4, -def.h/2 + 4, def.w - 8, 18);
        // Paper output tray
        deco.fillStyle(0x383840, 1);
        deco.fillRect(-def.w/2 + 10, -def.h/2 + 22, def.w - 20, 6);
        // Control panel
        deco.fillStyle(0x303038, 1);
        deco.fillRect(def.w/2 - 28, -def.h/2 + 4, 24, 16);
        // Status light (green)
        deco.fillStyle(0x00dd44, 0.9);
        deco.fillCircle(def.w/2 - 10, -def.h/2 + 8, 3);
        // Paper in slot
        deco.fillStyle(0xd8d0b8, 0.25);
        deco.fillRect(-def.w/2 + 12, def.h/2 - 14, def.w - 24, 8);

      } else if (def.type === 'shelf') {
        deco.lineStyle(1, def.dark, 0.7);
        deco.lineBetween(-def.w/2 + 6, -4, def.w/2 - 6, -4);
        deco.fillStyle(0x302820, 0.5);
        deco.fillRect(-def.w/2 + 4, -def.h/2 + 4, def.w - 8, 10);
        const bookColors = [0x6a2020, 0x204060, 0x206040, 0x604020, 0x502060];
        let bx = -def.w/2 + 8;
        bookColors.forEach(bc => {
          const bw = 10 + (Math.random() * 8 | 0);
          deco.fillStyle(bc, 0.75);
          deco.fillRect(bx, -def.h/2 + 6, bw, 20);
          bx += bw + 2;
        });

      } else if (def.type === 'plant') {
        // Pot
        deco.fillStyle(0x5a3218, 1);
        deco.fillRect(-8, 4, 16, 12);
        deco.lineStyle(1, 0x8a5030, 0.7);
        deco.strokeRect(-8, 4, 16, 12);
        deco.fillStyle(0x2a1a0a, 1);
        deco.fillRect(-6, 4, 12, 3);
        // Leaves
        deco.fillStyle(0x2a5e22, 0.9);
        deco.fillEllipse(-6, -4, 16, 12);
        deco.fillStyle(0x346e2a, 0.9);
        deco.fillEllipse(6, -6, 14, 10);
        deco.fillStyle(0x3a8030, 0.85);
        deco.fillEllipse(0, -11, 12, 14);
      }

      const lbl = this.add.text(0, def.h/2 + 9, def.label, {
        fontFamily:'Georgia, serif', fontSize:'9px', color:'#908070', alpha:0.55
      }).setOrigin(0.5);

      c.add([shadow, body, deco, lbl]);
      c.setDepth(3);

      this.furnitureItems.push({
        id:       def.id,
        container: c,
        x: def.x,  y: def.y,
        ox: def.x, oy: def.y,
        w: def.w,  h: def.h,
        mass: def.mass,
        vx: 0, vy: 0,
        revealed: false
      });
    });
  }

  // ── WORDS — physical, no glow ─────────────────────────────
  _buildWords() {
    const pool = Phaser.Utils.Array.Shuffle([...WORD_BANK]).slice(0, 16);

    const placements = [
      { x:70,  y:310, hidden:true,  hideId:'cab1'    },
      { x:830, y:310, hidden:true,  hideId:'cab2'    },
      { x:770, y:490, hidden:true,  hideId:'printer' },
      { x:180, y:350, hidden:false },
      { x:310, y:420, hidden:false },
      { x:440, y:160, hidden:false },
      { x:570, y:340, hidden:false },
      { x:730, y:160, hidden:false },
      { x:220, y:500, hidden:false },
      { x:400, y:520, hidden:false },
      { x:600, y:510, hidden:false },
      { x:740, y:450, hidden:false },
      { x:490, y:380, hidden:false },
      { x:140, y:430, hidden:false },
      { x:820, y:530, hidden:false },
      { x:345, y:465, hidden:false },
    ];

    pool.forEach((wd, i) => {
      const p = placements[i] || {
        x: Phaser.Math.Between(80, 820),
        y: Phaser.Math.Between(145, 560),
        hidden: false
      };

      const c        = this.add.container(p.x, p.y);
      const fontSize = 12 + wd.rarity * 2;
      const colorHex = '#' + wd.color.toString(16).padStart(6, '0');

      const txt = this.add.text(0, 0, wd.text, {
        fontFamily: 'Georgia, serif', fontSize: fontSize + 'px',
        color: colorHex, stroke: '#050302', strokeThickness: 2
      }).setOrigin(0.5);

      const ul = this.add.rectangle(0, txt.height / 2 + 3, txt.width, 1, wd.color, 0.4);
      c.add([txt, ul]);
      c.setDepth(6);

      if (p.hidden) { c.setAlpha(0); c.setVisible(false); }

      // Random starting velocity
      const spd   = 55 + Math.random() * 85;
      const angle = Math.random() * Math.PI * 2;

      this.wordObjects.push({
        container: c, txt, data: wd,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        hidden:    p.hidden || false,
        hideId:    p.hideId || null,
        collected: false,
        tethered:  false,
      });
    });
  }

  // ── BRIEFCASE ────────────────────────────────────────────
  _buildBriefcase() {
    this.bcX = this.W / 2;
    this.bcY = 565;
    this.bcRadius = 44;

    const c = this.add.container(this.bcX, this.bcY);
    this.bcPulse = this.add.circle(0, 0, 52, 0xd4af37, 0.1);
    const body   = this.add.rectangle(0, 0, 68, 46, 0x7a5c12);
    body.setStrokeStyle(2, 0xd4af37, 0.9);
    const handle = this.add.graphics();
    handle.lineStyle(2, 0xd4af37, 0.85);
    handle.strokeRoundedRect(-12, -27, 24, 12, 4);
    const clasp = this.add.rectangle(0, 0, 12, 9, 0xd4af37, 0.9);
    const lbl   = this.add.text(0, 26, 'ZONA DE DEPÓSITO', {
      fontFamily:'Georgia, serif', fontSize:'8px',
      color:'#d4af37', alpha:0.65, letterSpacing:2
    }).setOrigin(0.5);

    c.add([this.bcPulse, body, handle, clasp, lbl]);
    c.setDepth(4);
    this.bcContainer = c;

    this.tweens.add({
      targets: this.bcPulse, alpha:0.28, scaleX:1.12, scaleY:1.12,
      duration:1100, yoyo:true, repeat:-1
    });

    this.wordCountBadge = this.add.text(this.bcX + 34, this.bcY - 32, '0', {
      fontFamily:'Georgia, serif', fontSize:'20px',
      color:'#d4af37', stroke:'#000', strokeThickness:3
    }).setOrigin(0.5).setDepth(20);
  }

  // ── PLAYER ───────────────────────────────────────────────
  _buildPlayer() {
    this.pContainer = this.add.container(this.playerX, this.playerY);
    const shadow  = this.add.ellipse(2, 12, 28, 10, 0x000000, 0.5);
    const body    = this.add.ellipse(0, 0, 22, 28, 0x2c3e50);
    const head    = this.add.circle(0, -20, 10, 0x3d5470);
    const coat    = this.add.triangle(0, 0, -10, 14, 10, 14, 0, 3, 0x1e2d3d);
    const outline = this.add.ellipse(0, 0, 22, 28, 0x0, 0);
    outline.setStrokeStyle(1.5, 0x87ceeb, 0.7);
    this.pContainer.add([shadow, coat, body, head, outline]);
    this.pContainer.setDepth(10);
    this.dirArrow = this.add.graphics().setDepth(11);
  }

  // ── UI ───────────────────────────────────────────────────
  _buildUI() {
    const W = this.W;
    const H = this.H;

    

    // 2. Elementos de status
    this.statusTxt = this.add.text(W - 16, 38, '', {
      fontFamily:'Georgia, serif', fontSize:'13px',
      color:'#8a6a40', align:'right'
    }).setOrigin(1, 0).setDepth(20);
    
    this.tetheredTxt = this.add.text(16, 38, '', {
      fontFamily:'Georgia, serif', fontSize:'13px',
      color:'#87ceeb', stroke:'#000', strokeThickness:2
    }).setOrigin(0).setDepth(20);

    // 3. Novo elemento: Cronómetro de 10s (VARIÁVEL ÚNICA)
    this.uiTime = this.add.text(20, 20, 'TEMPO: 10', { 
        fontSize: '20px', 
        fill: '#ffffff' 
    }).setScrollFactor(0).setDepth(101);

    // 4. Frase alvo (VARIÁVEL ÚNICA)
    const uiBg = this.add.rectangle(W/2, H - 40, W - 40, 50, 0x000000, 0.5);
    uiBg.setScrollFactor(0).setDepth(100);

    this.add.text(W/2, H - 40, this.targetSentence.display, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#d4af37',
        fontStyle: 'italic',
        align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }
  _buildCordGraphics() {
    this.cordGfx = this.add.graphics().setDepth(8);
    this.hookGfx = this.add.graphics().setDepth(9);
  }

  // ── HOOK / TETHER ────────────────────────────────────────
  _fireHook(tx, ty) {
    if (this.hookActive || this.tetheredWord) return;
    this.hookActive    = true;
    this.hookReturning = false;
    this.hookX = this.playerX;
    this.hookY = this.playerY - 15;
    const angle = Math.atan2(ty - this.hookY, tx - this.hookX);
    this.hookVX = Math.cos(angle) * 640;
    this.hookVY = Math.sin(angle) * 640;
    this.cameras.main.shake(35, 0.0012);
  }

  _releaseTether() {
    if (this.tetheredWord) {
      const w = this.tetheredWord;
      w.tethered = false;
      // Fling word away on release
      const angle = Math.atan2(w.container.y - this.playerY, w.container.x - this.playerX);
      const spd   = 90 + Math.random() * 70;
      w.vx = Math.cos(angle) * spd;
      w.vy = Math.sin(angle) * spd;
      this.tetheredWord = null;
      this.tetheredTxt.setText('');
    }
    this.hookActive    = false;
    this.hookReturning = false;
  }

  _checkWordHit(hx, hy) {
    for (const w of this.wordObjects) {
      if (w.collected || w.tethered || w.hidden) continue;
      if (Phaser.Math.Distance.Between(hx, hy, w.container.x, w.container.y) < 34) {
        w.tethered = true;
        w.vx = 0; w.vy = 0;
        this.tetheredWord = w;
        this.hookActive   = false;
        this.tetheredTxt.setText('⟨ ' + w.data.text + ' ⟩\npeso: ' + w.data.weight.toFixed(1));
        this.cameras.main.shake(80, 0.0025);
        return true;
      }
    }
    return false;
  }

  _revealWords(f) {
    this.wordObjects.forEach(w => {
      if (!w.hidden || w.collected || w.hideId !== f.id) return;
      w.hidden = false;
      w.container.setVisible(true);
      // Scatter with velocity when revealed
      const angle = Math.random() * Math.PI * 2;
      w.vx = Math.cos(angle) * (65 + Math.random() * 80);
      w.vy = Math.sin(angle) * (65 + Math.random() * 80);
      this.tweens.add({ targets: w.container, alpha: 1, duration: 400 });
      const pop = this.add.text(w.container.x, w.container.y - 35, '!', {
        fontFamily:'Georgia, serif', fontSize:'22px',
        color:'#d4af37', stroke:'#000', strokeThickness:2
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets:pop, y:pop.y - 40, alpha:0, duration:700, onComplete:()=>pop.destroy() });
    });
  }

_depositWord(w) {
    // REMOVE O COOLDOWN: Não precisamos de esperar para depositar a próxima palavra
    // if (this.depositCooldown > 0) return; 

    w.collected = true; 
    w.tethered = false;
    this.tetheredWord = null;
    this.tetheredTxt.setText('');
    this.collectedWords.push(w.data);
    this.wordCountBadge.setText(this.collectedWords.length.toString());

    this._inkBurst(this.bcX, this.bcY, w.data.color);

    this.tweens.add({
      targets: w.container, x: this.bcX, y: this.bcY,
      scaleX:0.05, scaleY:0.05, alpha:0,
      duration: 280, ease:'Power3',
      onComplete: () => { 
          // Destrói o objeto visual e remove da lista de ativos para limpar o jogo
          w.container.destroy(); 
          this.wordObjects = this.wordObjects.filter(obj => obj !== w);
      }
    });
    
    // Efeito de "batida" na mala
    this.tweens.add({
      targets: this.bcContainer, scaleX:1.15, scaleY:0.88,
      duration: 90, yoyo:true
    });

    // ... (restante do teu código de estrelas/pontuação)
    this._checkSynergy();
}

  _checkSynergy() {
    const have = this.collectedWords.map(w => w.text);
    for (const [a, b] of SYNERGY_PAIRS) {
      if (have.includes(a) && have.includes(b)) {
        const key = a + '_' + b;
        if (this._triggeredSynergies && this._triggeredSynergies.includes(key)) continue;
        (this._triggeredSynergies = this._triggeredSynergies || []).push(key);
        this.timeLeft = Math.min(65, this.timeLeft + 6);
        this._updateTimerUI();
        const syn = this.add.text(this.bcX, this.bcY - 90, '✦ SINERGIA +6s ✦', {
          fontFamily:'Georgia, serif', fontSize:'17px',
          color:'#d4af37', stroke:'#000', strokeThickness:2
        }).setOrigin(0.5).setDepth(30);
        this.tweens.add({ targets:syn, y:syn.y - 55, alpha:0, duration:1600, onComplete:()=>syn.destroy() });
        this.tweens.add({ targets:this.bcPulse, alpha:0.75, duration:150, yoyo:true, repeat:3 });
        break;
      }
    }
  }

  _inkBurst(x, y, color) {
    for (let i = 0; i < 22; i++) {
      const a   = Math.random() * Math.PI * 2;
      const spd = 45 + Math.random() * 155;
      const sz  = 2 + Math.random() * 5;
      const p   = this.add.ellipse(x, y, sz, sz * 1.6, color, 0.9).setDepth(20);
      p.setRotation(a);
      this.tweens.add({
        targets:p, x: x + Math.cos(a)*spd, y: y + Math.sin(a)*spd,
        alpha:0, scaleX:0.1, scaleY:0.1,
        duration:350 + Math.random()*260, ease:'Power2',
        onComplete:()=>p.destroy()
      });
    }
  }

  // SUBSTITUIR este método em GameScene.js
_updateTimerUI() {
    if (this.uiTime) {
        this.uiTime.setText('TEMPO: ' + Math.max(0, Math.ceil(this.timeLeft)));
        const pct = this.timeLeft / 65;
        if      (pct < 0.25) this.uiTime.setColor('#e74c3c');
        else if (pct < 0.55) this.uiTime.setColor('#e67e22');
        else                  this.uiTime.setColor('#ffffff');
    }
}

  _endGame() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // Efeito visual de fim
    this.cameras.main.fadeOut(800);
    
    this.time.delayedCall(800, () => {
        // Passa os dados para a cena de montagem
        this.scene.start('AssemblerScene', { 
            words: this.collectedWords,
            targetSentence: this.targetSentence 
        });
    });
  }

  // ── UPDATE ───────────────────────────────────────────────
  update(time, delta) {
    if (this.isGameOver) return;
    const dt = delta / 1000;
    // Subtrai o tempo baseado no tempo real (delta)
    this.timeLeft -= delta / 1000;
    
    // Atualiza a UI se o elemento existir
    this._updateTimerUI();

    // Condição A: Tempo esgotado
    const timeIsUp = this.timeLeft <= 0;

    // Condição B: Apanhou todas as palavras (chão vazio e não está a carregar nada)
    const allCollected = this.wordObjects.length === 0 && !this.tetheredWord;

    if (timeIsUp || allCollected) {
        this._endGame();
    }

    // ── Player input
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx = -1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx =  1;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy = -1;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy =  1;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    const pR  = 15;
    let nextX = Phaser.Math.Clamp(this.playerX + vx * this.playerSpeed * dt, 22, this.W - 22);
    let nextY = Phaser.Math.Clamp(this.playerY + vy * this.playerSpeed * dt, 132, this.H - 22);

    // ── Player walks into furniture → pushes it
    for (const f of this.furnitureItems) {
      const hw = f.w / 2 + pR;
      const hh = f.h / 2 + pR;
      // X axis
      if (Math.abs(nextX - f.x) < hw && Math.abs(this.playerY - f.y) < hh) {
        const away = Math.sign(f.x - this.playerX) || 1;
        f.vx += away * this.playerSpeed / f.mass * 0.55;
        nextX = this.playerX;
      }
      // Y axis
      if (Math.abs(this.playerX - f.x) < hw && Math.abs(nextY - f.y) < hh) {
        const away = Math.sign(f.y - this.playerY) || 1;
        f.vy += away * this.playerSpeed / f.mass * 0.55;
        nextY = this.playerY;
      }
    }

    this.playerX = nextX;
    this.playerY = nextY;
    this.pContainer.setPosition(this.playerX, this.playerY);

    // ── Furniture physics
    const friction = Math.pow(0.84, delta / 16.667);
    for (const f of this.furnitureItems) {
      if (Math.abs(f.vx) < 0.8 && Math.abs(f.vy) < 0.8) {
        f.vx = 0; f.vy = 0;
        continue;
      }

      f.x += f.vx * dt;
      f.y += f.vy * dt;

      // Wall bounce (low restitution — furniture thuds)
      const hw = f.w / 2, hh = f.h / 2;
      if (f.x - hw < 5)            { f.x = 5 + hw;          f.vx =  Math.abs(f.vx) * 0.3; }
      if (f.x + hw > this.W - 5)   { f.x = this.W - 5 - hw; f.vx = -Math.abs(f.vx) * 0.3; }
      if (f.y - hh < 125)          { f.y = 125 + hh;         f.vy =  Math.abs(f.vy) * 0.3; }
      if (f.y + hh > this.H - 5)   { f.y = this.H - 5 - hh; f.vy = -Math.abs(f.vy) * 0.3; }

      f.vx *= friction;
      f.vy *= friction;
      f.container.setPosition(f.x, f.y);

      // Reveal hidden words once sufficiently displaced
      if (!f.revealed && Phaser.Math.Distance.Between(f.x, f.y, f.ox, f.oy) > 42) {
        f.revealed = true;
        this._revealWords(f);
        this.cameras.main.shake(120, 0.004);
      }
    }

    // ── Word physics — bounce around room and furniture
    for (const w of this.wordObjects) {
      if (w.collected || w.hidden || w.tethered) continue;

      w.container.x += w.vx * dt;
      w.container.y += w.vy * dt;

      // Room wall bounce
      const mx = 18;
      if (w.container.x < mx)           { w.container.x = mx;           w.vx =  Math.abs(w.vx) * 0.82; }
      if (w.container.x > this.W - mx)  { w.container.x = this.W - mx;  w.vx = -Math.abs(w.vx) * 0.82; }
      if (w.container.y < 134)          { w.container.y = 134;           w.vy =  Math.abs(w.vy) * 0.82; }
      if (w.container.y > this.H - mx)  { w.container.y = this.H - mx;  w.vy = -Math.abs(w.vy) * 0.82; }

      // Furniture bounce (AABB push-out)
      for (const f of this.furnitureItems) {
        const wx = w.container.x, wy = w.container.y;
        const hw = f.w / 2 + 14, hh = f.h / 2 + 14;
        if (wx > f.x - hw && wx < f.x + hw && wy > f.y - hh && wy < f.y + hh) {
          const ox = hw - Math.abs(wx - f.x);
          const oy = hh - Math.abs(wy - f.y);
          if (ox < oy) {
            w.container.x += Math.sign(wx - f.x) * (ox + 1);
            w.vx = Math.sign(wx - f.x) * Math.abs(w.vx) * 0.75;
          } else {
            w.container.y += Math.sign(wy - f.y) * (oy + 1);
            w.vy = Math.sign(wy - f.y) * Math.abs(w.vy) * 0.75;
          }
        }
      }

      // Maintain a minimum speed — words never fully stop
      const spd2 = Math.hypot(w.vx, w.vy);
      if (spd2 > 0 && spd2 < 32) {
        const s = 38 / spd2;
        w.vx *= s; w.vy *= s;
      }
    }

    // ── Direction arrow
    const ptr = this.input.activePointer;
    const ang = Math.atan2(ptr.y - this.playerY, ptr.x - this.playerX);
    this.dirArrow.clear();
    this.dirArrow.fillStyle(0x87ceeb, 0.7);
    this.dirArrow.fillTriangle(
      this.playerX + Math.cos(ang)*26,     this.playerY + Math.sin(ang)*26,
      this.playerX + Math.cos(ang+2.4)*14, this.playerY + Math.sin(ang+2.4)*14,
      this.playerX + Math.cos(ang-2.4)*14, this.playerY + Math.sin(ang-2.4)*14
    );

    if (Phaser.Input.Keyboard.JustDown(this.rKey)) this._releaseTether();

    // ── Hook travel
    if (this.hookActive && !this.hookReturning) {
      this.hookX += this.hookVX * dt;
      this.hookY += this.hookVY * dt;

      const dist = Phaser.Math.Distance.Between(this.playerX, this.playerY, this.hookX, this.hookY);
      if (dist > this.maxHookRange || this.hookX < 0 || this.hookX > this.W || this.hookY < 0 || this.hookY > this.H) {
        this.hookActive = false;
      } else {
        this._checkWordHit(this.hookX, this.hookY);
      }
    }

    // ── Tethered word springs toward player
    if (this.tetheredWord) {
      const tw = this.tetheredWord;
      const dx = this.playerX - tw.container.x;
      const dy = (this.playerY - 10) - tw.container.y;
      const k  = Math.max(2.5, 9 - tw.data.weight * 1.2);
      tw.container.x += dx * k * dt;
      tw.container.y += dy * k * dt;

      if (Phaser.Math.Distance.Between(this.playerX, this.playerY, this.bcX, this.bcY) < 48) {
        this._depositWord(this.tetheredWord);
      }
    }

    // ── Draw cord & hook tip
    this.cordGfx.clear();
    this.hookGfx.clear();

    if (this.hookActive) {
      this.hookGfx.fillStyle(0x87ceeb, 0.95);
      this.hookGfx.fillCircle(this.hookX, this.hookY, 5);
      this.hookGfx.lineStyle(1.5, 0x87ceeb, 0.55);
      this.hookGfx.beginPath();
      this.hookGfx.moveTo(this.playerX, this.playerY - 15);
      this.hookGfx.lineTo(this.hookX, this.hookY);
      this.hookGfx.strokePath();
    }

    if (this.tetheredWord) {
      const tw = this.tetheredWord;
      const wx = tw.container.x, wy = tw.container.y;
      const mx = (this.playerX + wx) / 2, my = (this.playerY + wy) / 2 + 18;
      this.cordGfx.lineStyle(2, 0x87ceeb, 0.65);
      this.cordGfx.beginPath();
      this.cordGfx.moveTo(this.playerX, this.playerY - 15);
      this.cordGfx.lineTo(mx, my);
      this.cordGfx.lineTo(wx, wy);
      this.cordGfx.strokePath();
      this.hookGfx.lineStyle(1.5, 0x87ceeb, 0.75);
      this.hookGfx.strokeCircle(wx, wy, 22);
    }

    const vis = this.wordObjects.filter(w => !w.collected && !w.hidden).length;
    this.statusTxt.setText('Apanhadas: ' + this.collectedWords.length + '   Soltas: ' + vis);
  }
}