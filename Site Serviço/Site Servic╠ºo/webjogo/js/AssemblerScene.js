// ============================================================
// ASSEMBLER SCENE
// ============================================================
class AssemblerScene extends Phaser.Scene {
  constructor() { super({ key:'AssemblerScene' }); }

  init(data) { 
    this.collectedWords = data.words || []; 
    this.targetSentence = data.targetSentence; // Recebe a frase
    }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.W = W; this.H = H;

    // Se recebemos uma frase, usamos essa. Se não, escolhemos uma (segurança).
    this.sentence = this.targetSentence || Phaser.Utils.Array.GetRandom(SENTENCE_TEMPLATES);



    this.sentence   = Phaser.Utils.Array.GetRandom(SENTENCE_TEMPLATES);
    this.blankSlots = [];
    this.tiles      = [];
    this.score      = 0;

    this._buildBg(W, H);
    this._buildSentence(W, H);
    this._buildWordTiles(W, H);
    this._buildScoreUI(W, H);
    this.maxHookRange = 220;

    this.cameras.main.fadeIn(450);
  }

  _buildBg(W, H) {
    this.add.rectangle(W/2, H/2, W, H, 0x080503);
    const paper = this.add.rectangle(W/2, H/2, W - 48, H - 32, 0x0d0805);
    paper.setStrokeStyle(1, 0xd4af37, 0.2);

    // Ruled lines
    const gr = this.add.graphics();
    gr.lineStyle(1, 0x221608, 0.4);
    for (let y = 90; y < H - 16; y += 30) gr.lineBetween(50, y, W - 50, y);

    // Red margin line
    gr.lineStyle(1, 0x8b1a1a, 0.35);
    gr.lineBetween(90, 90, 90, H - 16);

    // Header
    this.add.text(W/2, 30, 'O   A S S E M B L A D O R', {
      fontFamily:'Georgia, serif', fontSize:'26px',
      color:'#d4af37', letterSpacing:8
    }).setOrigin(0.5);

    const orn = this.add.graphics();
    orn.lineStyle(1, 0xd4af37, 0.3);
    orn.lineBetween(W/2 - 220, 54, W/2 + 220, 54);

    this.add.text(W/2, 66, 'Completa a frase incompleta com as palavras capturadas', {
      fontFamily:'Georgia, serif', fontSize:'13px',
      color:'#7a5a30', fontStyle:'italic'
    }).setOrigin(0.5);
  }

  _buildSentence(W, H) {
    const template = this.sentence.display;
    const parts    = template.split('___');
    const sentY    = H * 0.28;
    const slotW    = 108;

    this.add.text(W/2, H * 0.19, '— FRASE INCOMPLETA —', {
      fontFamily:'Georgia, serif', fontSize:'11px',
      color:'#8a6a40', letterSpacing:5
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.235, '↳ Dica: ' + this.sentence.hint, {
      fontFamily:'Georgia, serif', fontSize:'12px',
      color:'#5a3f25', fontStyle:'italic'
    }).setOrigin(0.5);

    // Measure to center: create hidden texts first
    const tempTxts = parts.map(p =>
      this.add.text(0, -9999, p, { fontFamily:'Georgia, serif', fontSize:'20px', color:'#c4a070' })
    );
    let totalW = tempTxts.reduce((s, t) => s + t.width, 0) + slotW * (parts.length - 1);
    let curX   = W/2 - totalW/2;

    parts.forEach((part, i) => {
      const t = tempTxts[i];
      t.setPosition(curX, sentY).setOrigin(0, 0.5);
      curX += t.width;

      if (i < parts.length - 1) {
        const slot = this.add.rectangle(curX + slotW/2, sentY, slotW, 28, 0x0a0704);
        slot.setStrokeStyle(1.5, 0xd4af37, 0.55);

        const fill = this.add.text(curX + slotW/2, sentY, '·  ·  ·', {
          fontFamily:'Georgia, serif', fontSize:'15px',
          color:'#4a3418', alpha:0.8
        }).setOrigin(0.5);

        this.blankSlots.push({
          slot, fill, slotCX: curX + slotW/2, slotY: sentY,
          index: i, filled: false, word: null
        });
        curX += slotW;
      }
    });
  }

  _buildWordTiles(W, H) {
    const labelY = H * 0.48;
    this.add.text(W/2, labelY, 'AS TUAS PALAVRAS CAPTURADAS', {
      fontFamily:'Georgia, serif', fontSize:'11px',
      color:'#6a4a28', letterSpacing:5
    }).setOrigin(0.5);

    if (!this.collectedWords.length) {
      this.add.text(W/2, H * 0.6, 'Nenhuma palavra capturada. O capítulo fica por escrever.', {
        fontFamily:'Georgia, serif', fontSize:'15px',
        color:'#4a3020', fontStyle:'italic'
      }).setOrigin(0.5);
      return;
    }

    let rx = 55, ry = H * 0.54;
    const tileH = 38, gap = 8;

    this.collectedWords.forEach((wd) => {
      const tileW = Math.max(64, wd.text.length * 10 + 24);
      if (rx + tileW > W - 55) { rx = 55; ry += tileH + gap; }

      const c   = this.add.container(rx + tileW/2, ry);
      const bg  = this.add.rectangle(0, 0, tileW, tileH - 4, 0x100905);
      const col = '#' + wd.color.toString(16).padStart(6,'0');
      bg.setStrokeStyle(1.5, wd.color, 0.75);
      const txt = this.add.text(0, -3, wd.text, {
        fontFamily:'Georgia, serif', fontSize:'14px', color: col
      }).setOrigin(0.5);
      const dots = this.add.text(0, 12, '◆'.repeat(wd.rarity), {
        fontSize:'7px', color:'#d4af37', alpha:0.65
      }).setOrigin(0.5);

      c.add([bg, txt, dots]);
      c.setSize(tileW, tileH - 4);
      c.setInteractive({ cursor:'pointer' });

      const tile = { container:c, bg, txt, wd, used:false };
      this.tiles.push(tile);

      c.on('pointerover', () => { if (!tile.used) bg.setFillStyle(0x1e1008); });
      c.on('pointerout',  () => { if (!tile.used) bg.setFillStyle(0x100905); });
      c.on('pointerdown', () => this._pickWord(tile));

      rx += tileW + gap;
    });
  }

  _buildScoreUI(W, H) {
    this.scoreTxt = this.add.text(W/2, H * 0.84, '', {
      fontFamily:'Georgia, serif', fontSize:'15px',
      color:'#d4af37', align:'center'
    }).setOrigin(0.5);

    const btn = this.add.rectangle(W/2, H * 0.935, 230, 50, 0x130a04)
      .setStrokeStyle(1.5, 0xd4af37, 0.75).setInteractive({ cursor:'pointer' }).setDepth(10);

    this.add.text(W/2, H * 0.935, 'TERMINAR CAPÍTULO', {
      fontFamily:'Georgia, serif', fontSize:'18px',
      color:'#d4af37', letterSpacing:2
    }).setOrigin(0.5).setDepth(11);

    btn.on('pointerover', () => btn.setFillStyle(0x221608));
    btn.on('pointerout',  () => btn.setFillStyle(0x130a04));
    btn.on('pointerdown', () => {
      this.cameras.main.fade(500, 6, 4, 2);
      this.time.delayedCall(500, () =>
        this.scene.start('ResultScene', {
          score: this.score,
          words: this.collectedWords,
          template: this.sentence.display,
          filled: this.blankSlots.map(s => s.filled ? s.word.text : '___')
        })
      );
    });

    // Clear / undo button
    const undoBtn = this.add.rectangle(W - 80, H * 0.935, 110, 50, 0x0a0503)
      .setStrokeStyle(1, 0x5a3f20, 0.7).setInteractive({ cursor:'pointer' }).setDepth(10);
    this.add.text(W - 80, H * 0.935, 'LIMPAR', {
      fontFamily:'Georgia, serif', fontSize:'14px',
      color:'#7a5a30', letterSpacing:2
    }).setOrigin(0.5).setDepth(11);
    undoBtn.on('pointerover', () => undoBtn.setFillStyle(0x160c06));
    undoBtn.on('pointerout',  () => undoBtn.setFillStyle(0x0a0503));
    undoBtn.on('pointerdown', () => this._clearSlots());
  }

  _pickWord(tile) {
    if (tile.used) return;
    const slot = this.blankSlots.find(s => !s.filled);
    if (!slot) return;

    slot.filled = true;
    slot.word   = tile.wd;
    tile.used   = true;
    tile.bg.setFillStyle(0x0a0704);
    tile.txt.setAlpha(0.3);
    tile.bg.setStrokeStyle(1.5, tile.wd.color, 0.25);

    const col = '#' + tile.wd.color.toString(16).padStart(6,'0');
    slot.fill.setText(tile.wd.text).setColor(col).setAlpha(1).setFontSize('18px');

    // Fly animation
    const ghost = this.add.text(tile.container.x, tile.container.y, tile.wd.text, {
      fontFamily:'Georgia, serif', fontSize:'14px', color:col
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets:ghost, x:slot.slotCX, y:slot.slotY,
      scaleX:1.25, scaleY:1.25,
      duration:280, ease:'Power2',
      onComplete: ()=>ghost.destroy()
    });

    this._recalcScore();
    if (this.blankSlots.every(s => s.filled)) this._celebrate();
  }

  _clearSlots() {
    this.blankSlots.forEach(s => {
      s.filled = false; s.word = null;
      s.fill.setText('·  ·  ·').setColor('#4a3418').setAlpha(0.8).setFontSize('15px');
    });
    this.tiles.forEach(t => {
      if (t.used) {
        t.used = false;
        t.bg.setFillStyle(0x100905);
        t.bg.setStrokeStyle(1.5, t.wd.color, 0.75);
        t.txt.setAlpha(1);
      }
    });
    this.score = 0;
    this.scoreTxt.setText('');
  }

  _recalcScore() {
    let s = 0;
    this.blankSlots.filter(sl => sl.filled).forEach(sl => {
      if (this.sentence.answers && sl.word.text === this.sentence.answers[sl.index]) {
        s += 1;
      }
    });
    this.score = s;
    this.scoreTxt.setText('Pontuação: ' + s + ' pt' + (s !== 1 ? 's' : ''));
  }

  _celebrate() {
    this.scoreTxt.setText('Pontuação: ' + this.score + ' pts  ✦ Completo!');
    this.blankSlots.forEach((sl, i) => {
      this.time.delayedCall(i * 120, () => {
        this.tweens.add({
          targets: sl.fill, scaleX:1.3, scaleY:1.3,
          duration:180, yoyo:true
        });
      });
    });
  }
}