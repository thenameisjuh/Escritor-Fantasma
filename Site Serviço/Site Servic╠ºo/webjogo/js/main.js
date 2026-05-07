// ============================================================
// BOOT
// ============================================================
const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    backgroundColor: '#060402',
    physics: { default:'arcade', arcade:{ gravity:{ y:0 }, debug:false } },
    scene: [MenuScene, GameScene, AssemblerScene, ResultScene],
};

new Phaser.Game(config);