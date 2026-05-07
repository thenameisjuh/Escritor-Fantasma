// ============================================================
// BANCO DE PALAVRAS - OS MAIAS (CITAÇÕES REAIS)
// ============================================================
const WORD_BANK = [
    // Palavras para as frases
    { text:'Sombria',     weight:1.5, rarity:2, color:0x6c7a89 },
    { text:'Severa',      weight:1.5, rarity:2, color:0x7c6454 },
    { text:'Diletante',   weight:2.0, rarity:3, color:0x9b6fa8 },
    { text:'Elegância',   weight:1.0, rarity:1, color:0xd4af37 },
    { text:'Soberbo',     weight:1.2, rarity:2, color:0xffa726 },
    { text:'Doçura',      weight:1.1, rarity:2, color:0xd4e6ff },
    { text:'Fútil',       weight:0.8, rarity:1, color:0x87ceeb },
    { text:'Oco',         weight:0.8, rarity:1, color:0x5dbea3 },
    { text:'Fatalidade',  weight:3.0, rarity:3, color:0x960018 },
    { text:'Irresistível',weight:2.0, rarity:3, color:0xef5350 },
    // Palavras extra para encher o cenário
    { text:'Ramalhete',   weight:0.5, rarity:1, color:0xc4a882 },
    { text:'Melancolia',  weight:1.5, rarity:2, color:0x7b92a2 },
    { text:'Vencido',     weight:2.2, rarity:3, color:0x2ecc71 },
    { text:'Lisboa',      weight:0.6, rarity:1, color:0xffeb3b }
];

const SENTENCE_TEMPLATES = [
    { display: 'O Ramalhete era uma casa ___ e ___ ao fundo da rua.', hint: 'Descrição da casa (Cap. I)', blanks: 2, answers: ['Sombria', 'Severa'] },
    { display: 'Carlos era um ___ de uma ___ soberba.', hint: 'Sobre o diletantismo de Carlos', blanks: 2, answers: ['Diletante', 'Elegância'] },
    { display: 'Maria Eduarda tinha um passo ___ e um olhar de uma ___ grave.', hint: 'A aparição no Hotel Central', blanks: 2, answers: ['Soberbo', 'Doçura'] },
    { display: 'Tudo isto é ___, tudo isto é ___, tudo isto é Lisboa!', hint: 'A famosa crítica de João da Ega', blanks: 2, answers: ['Fútil', 'Oco'] },
    { display: 'Aquele amor era uma ___, de uma força ___.', hint: 'O destino trágico do romance', blanks: 2, answers: ['Fatalidade', 'Irresistível'] }
];

const SYNERGY_PAIRS = [
    ['Sombria','Severa'], ['Fútil','Oco'], ['Fatalidade','Irresistível'], ['Diletante','Elegância']
];