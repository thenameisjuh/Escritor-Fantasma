// ============================================================
// MENU SCENE
// ============================================================
class MenuScene extends Phaser.Scene {
    constructor() { super({ key:'MenuScene' }); }

    create() {
        const W = this.scale.width, H = this.scale.height;

        // Atmospheric background
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x060402, 0x060402, 0x100804, 0x0a0603, 1);
        bg.fillRect(0, 0, W, H);

        // Vignette
        for (let r = 0; r < 5; r++) {
        const alpha = 0.06 * (5 - r);
            const ring = this.add.graphics();
            ring.fillStyle(0x000000, alpha);
        ring.fillRect(r * 40, r * 30, W - r * 80, H - r * 60);
        }

        // Floating dust motes
        for (let i = 0; i < 35; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
        const r = 0.5 + Math.random() * 1.5;
        const dot = this.add.circle(x, y, r, 0xd4af37, 0.2 + Math.random() * 0.4);
            this.tweens.add({
            targets: dot,
            x: x + Phaser.Math.Between(-60, 60),
            y: y - Phaser.Math.Between(60, 180),
            alpha: 0,
            duration: Phaser.Math.Between(4000, 9000),
            repeat: -1,
            onRepeat: () => {
                dot.x = Phaser.Math.Between(0, W);
                dot.y = H + 5;
            dot.alpha = 0.2 + Math.random() * 0.4;
            }
            });
        }

        // Title ornament
        const orn = this.add.graphics();
        orn.lineStyle(1, 0xd4af37, 0.35);
        orn.lineBetween(W/2 - 280, H * 0.18, W/2 + 280, H * 0.18);
        orn.lineBetween(W/2 - 280, H * 0.52, W/2 + 280, H * 0.52);

        this.add.text(W/2, H * 0.11, '✦  O ESCRITOR FANTASMA  ✦', {
            fontFamily: 'Georgia, serif',
            fontSize: '46px',
            color: '#d4af37',
            stroke: '#060402',
            strokeThickness: 6,
            letterSpacing: 3
        }).setOrigin(0.5);

        this.add.text(W/2, H * 0.23, 'Exterminador Linguístico · Arquitecto da Memória', {
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                color: '#8a6a40',
                fontStyle: 'italic'
        }).setOrigin(0.5);

        const lore = [
            'O autor perdeu o fio ao pensamento.',
            'As suas palavras escaparam das páginas e agora',
            'escondem-se nas sombras dos móveis.',
            '',
            'Caça-as antes do prazo final.'
        ];
        this.add.text(W/2, H * 0.36, lore.join('\n'), {
            fontFamily: 'Georgia, serif',
            fontSize: '15px',
            color: '#c4a070',
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5);

        // Instructions panel
        const ipanel = this.add.graphics();
        ipanel.fillStyle(0x0d0804, 0.7);
        ipanel.fillRect(W/2 - 220, H * 0.54, 440, 160);
        ipanel.lineStyle(1, 0x5a3f20, 0.6);
        ipanel.strokeRect(W/2 - 220, H * 0.54, 440, 160);

        const instructions = [
            'WASD / Setas ————————— Mover',
            'Clique Esquerdo ——————— Disparar Gancho',
            'Gancho numa Palavra ——— Arrastá-la para a Mala',
            'R / Clique Direito ———— Soltar Gancho',
            'Empurrar Móveis ———— Revelar palavras escondidas',
        ];
        this.add.text(W/2, H * 0.617, instructions.join('\n'), {
            fontFamily: 'Georgia, serif',
            fontSize: '13.5px',
            color: '#b09060',
            align: 'center',
            lineSpacing: 7
        }).setOrigin(0.5);

        // Start button
        const bx = W/2, by = H * 0.845;
        const btnBg = this.add.rectangle(bx, by, 250, 54, 0x1a0f06)
            .setStrokeStyle(1.5, 0xd4af37, 0.8)
            .setInteractive({ cursor:'pointer' });
        const btnTxt = this.add.text(bx, by, 'INICIAR A CAÇA', {
            fontFamily: 'Georgia, serif',
            fontSize: '19px',
            color: '#d4af37',
            letterSpacing: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: [btnBg, btnTxt],
            alpha: 0.7,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        btnBg.on('pointerover', () => {
            this.tweens.killTweensOf([btnBg, btnTxt]);
            btnBg.setFillStyle(0x2a1a08);
            btnTxt.setAlpha(1);
            btnBg.setAlpha(1);
        });
        btnBg.on('pointerout', () => {
            this.tweens.add({ targets:[btnBg, btnTxt], alpha:0.7, duration:900, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });
        });
        btnBg.on('pointerdown', () => {
            this.cameras.main.fade(500, 6, 4, 2);
            this.time.delayedCall(500, () => this.scene.start('GameScene'));
        });

        // Floating word samples - USANDO AS PALAVRAS CORRETAS DO data.js
        const samples = ['Sombria', 'Severa', 'Diletante', 'Elegância', 'Soberbo', 'Doçura'];

        samples.forEach((w, i) => {
        // Adicionamos uma verificação de segurança (o '?' evita o erro se não encontrar)
        const wordEntry = WORD_BANK.find(wb => wb.text === w);
        
        if (wordEntry) {
            const tx = 80 + i * 145;
            const ty = H * 0.95;
            const t = this.add.text(tx, ty, w, {
                fontFamily:'Georgia, serif', 
                fontSize:'13px',
                color: '#' + wordEntry.color.toString(16).padStart(6,'0'),
                alpha: 0.35
            }).setOrigin(0.5);
            
            this.tweens.add({ 
                targets:t, 
                y: ty - 15, 
                alpha:0.1, 
                duration:2200 + i * 250, 
                yoyo:true, 
                repeat:-1, 
                ease:'Sine.easeInOut', 
                delay: i * 180 
            });
        }
    });
}
}