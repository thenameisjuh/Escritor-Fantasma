// ============================================================
// RESULT SCENE
// ============================================================
class ResultScene extends Phaser.Scene {
    constructor() { super({ key:'ResultScene' }); }

init(data) {
    this.score    = data.score    || 0;
    this.words    = data.words    || [];
    this.template = data.template || '';
    this.filled   = data.filled   || [];
    }

create() {
    const W = this.scale.width, H = this.scale.height;

    this.add.rectangle(W/2, H/2, W, H, 0x060402);

    // Rising motes
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const p = this.add.circle(x, y, 0.5 + Math.random(), 0xd4af37, 0.25 + Math.random() * 0.5);
        this.tweens.add({
        targets:p, y: y - 250, alpha:0,
        duration: 4000 + Math.random()*4000,
        repeat:-1,
        onRepeat:()=>{ p.x = Math.random()*W; p.y = H; p.alpha = 0.25 + Math.random()*0.5; }
        });
    }

    // Grade
    let grade, gradeColor;
    if      (this.score >= 2) { grade='Obra-Prima';          gradeColor='#f0d060'; }
    else if (this.score >= 1) { grade='Promissor';           gradeColor='#a0c880'; }
    else                      { grade='Perdido no Silêncio'; gradeColor='#705040'; }

    this.add.text(W/2, H * 0.1, 'C A P Í T U L O   C O N C L U Í D O', {
        fontFamily:'Georgia, serif', fontSize:'30px',
        color:'#d4af37', letterSpacing:6, stroke:'#060402', strokeThickness:4
    }).setOrigin(0.5);

    // Stars
    let stars = '';
    if      (this.score >= 2) stars = '✦  ✦';
    else if (this.score >= 1) stars = '✦  ✧';
    else                      stars = '✧  ✧';
    this.add.text(W/2, H * 0.215, stars, {
        fontFamily:'Georgia, serif', fontSize:'28px', color:'#d4af37'
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.295, grade, {
        fontFamily:'Georgia, serif', fontSize:'18px',
        color: gradeColor, fontStyle:'italic', letterSpacing:3
    }).setOrigin(0.5);

    // Animated score
    this.add.text(W/2, H * 0.37, 'Pontuação Literária', {
        fontFamily:'Georgia, serif', fontSize:'13px',
        color:'#8a6a40', letterSpacing:4
    }).setOrigin(0.5);

    const scoreDisp = this.add.text(W/2, H * 0.455, '0', {
        fontFamily:'Georgia, serif', fontSize:'56px',
        color:'#d4af37', stroke:'#060402', strokeThickness:4
    }).setOrigin(0.5);

    let disp = 0;
    this.time.addEvent({
        delay:28, repeat:70,
        callback:()=>{ disp = Math.min(this.score, disp + Math.ceil(this.score/70)); scoreDisp.setText(disp.toString()); }
    });

    this.add.text(W/2, H * 0.55, this.words.length + ' palavras capturadas', {
        fontFamily:'Georgia, serif', fontSize:'15px', color:'#c4a070'
    }).setOrigin(0.5);

    // Divider
    const dv = this.add.graphics();
    dv.lineStyle(1, 0xd4af37, 0.25);
    dv.lineBetween(W/2 - 220, H * 0.605, W/2 + 220, H * 0.605);

    // Final sentence assembled
    let finalSentence = this.template;
    let fi = 0;
    finalSentence = finalSentence.replace(/___/g, () => {
        const w = this.filled[fi++];
        return w && w !== '___' ? '«' + w + '»' : '___';
    });

    this.add.text(W/2, H * 0.665, '"' + finalSentence + '"', {
        fontFamily:'Georgia, serif', fontSize:'15px',
        color:'#c4a070', fontStyle:'italic',
        wordWrap:{ width: W - 100 }, align:'center'
    }).setOrigin(0.5);

    // Captured words
    if (this.words.length > 0) {
        const listed = this.words.map(w => w.text).join('  ·  ');
      this.add.text(W/2, H * 0.76, listed, {
        fontFamily:'Georgia, serif', fontSize:'12px',
        color:'#6a4a28', wordWrap:{ width: W - 120 }, align:'center'
        }).setOrigin(0.5);
    }

    // Play again
    const btn = this.add.rectangle(W/2, H * 0.89, 210, 50, 0x100805)
        .setStrokeStyle(1.5, 0xd4af37, 0.8).setInteractive({ cursor:'pointer' });
    this.add.text(W/2, H * 0.89, 'CAÇAR NOVAMENTE', {
        fontFamily:'Georgia, serif', fontSize:'19px',
        color:'#d4af37', letterSpacing:3
    }).setOrigin(0.5);

    btn.on('pointerover', () => btn.setFillStyle(0x1e1008));
    btn.on('pointerout',  () => btn.setFillStyle(0x100805));
    btn.on('pointerdown', () => {
        this.cameras.main.fade(450, 6, 4, 2);
        this.time.delayedCall(450, () => this.scene.start('MenuScene'));
    });

    this.cameras.main.fadeIn(500);
    }
}