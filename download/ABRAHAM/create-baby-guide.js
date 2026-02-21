const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, BorderStyle, WidthType, ShadingType,
        Header, Footer, PageNumber, LevelFormat, HeadingLevel, PageBreak } = require('docx');
const fs = require('fs');

const colors = {
  primary: '#1E40AF',
  body: '#1F2937',
  secondary: '#6B7280',
  light: '#DBEAFE',
  accent: '#3B82F6',
  fun: '#8B5CF6'
};

const bigText = (text) => new Paragraph({
  spacing: { after: 200 },
  alignment: AlignmentType.LEFT,
  children: [new TextRun({ text, size: 28, color: colors.body, font: 'Calibri' })]
});

const sectionTitle = (text, emoji) => new Paragraph({
  spacing: { before: 400, after: 200 },
  children: [
    new TextRun({ text: emoji + '  ', size: 36 }),
    new TextRun({ text, bold: true, size: 32, color: colors.primary, font: 'Calibri' })
  ]
});

const funFact = (text) => new Paragraph({
  spacing: { before: 200, after: 200 },
  shading: { fill: colors.light, type: ShadingType.CLEAR },
  children: [new TextRun({ text: '💡 Fun Fact: ', bold: true, size: 24, color: colors.fun }), new TextRun({ text, size: 24, color: colors.body })]
});

const simpleBullet = (text, emoji) => new Paragraph({
  spacing: { after: 120 },
  children: [
    new TextRun({ text: emoji + '  ', size: 24 }),
    new TextRun({ text, size: 24, color: colors.body, font: 'Calibri' })
  ]
});

// BABY-SIMPLE GUIDE
const babyGuide = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 24 } } }
  },
  sections: [{
    properties: { page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
    children: [
      // TITLE PAGE
      new Paragraph({ spacing: { before: 800 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '🧠', size: 96 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'A.B.R.A.H.A.M.', bold: true, size: 72, color: colors.primary, font: 'Calibri' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Explained Simply', size: 36, color: colors.secondary, font: 'Calibri' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'For Anyone Who Wants to Understand', size: 28, color: colors.fun, font: 'Calibri' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: '📖 A Guide So Simple,', size: 28, color: colors.body })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Even a Child Can Understand It 🧒', size: 28, color: colors.body })] }),
      new Paragraph({ children: [new PageBreak()] }),

      // CHAPTER 1: THE STORY
      sectionTitle('Chapter 1: The Story of the Blind Men', '🐘'),
      bigText('Once upon a time, six blind men met an elephant for the first time.'),
      bigText('The first man touched the trunk and said: "An elephant is like a SNAKE!"'),
      bigText('The second man touched the ear and said: "No! It\'s like a FAN!"'),
      bigText('The third man touched the leg and said: "You\'re both wrong! It\'s like a PILLAR!"'),
      bigText('The fourth man touched the side and said: "It\'s like a WALL!"'),
      bigText('The fifth man touched the tusk and said: "It\'s like a SPEAR!"'),
      bigText('The sixth man touched the tail and said: "It\'s like a ROPE!"'),
      new Paragraph({ spacing: { before: 200, after: 200 }, children: [new TextRun({ text: 'They argued and argued. Each one was right... but only partially right.', size: 26, color: colors.body, italics: true })] }),
      funFact('This story is over 2,500 years old! It appears in Buddhist, Hindu, Jain, and Sufi teachings.'),

      // CHAPTER 2: WHAT IS ABRAHAM
      sectionTitle('Chapter 2: What is A.B.R.A.H.A.M.?', '🤖'),
      bigText('Imagine if we could build a computer that doesn\'t just store information—it UNDERSTANDS it.'),
      bigText('That\'s what A.B.R.A.H.A.M. is.'),
      new Paragraph({ spacing: { before: 200, after: 200 }, shading: { fill: colors.light, type: ShadingType.CLEAR }, children: [new TextRun({ text: 'The name comes from Abraham—a father figure who brought many people together. A.B.R.A.H.A.M. brings many pieces of knowledge together to see the whole picture.', size: 24, color: colors.body })] }),
      
      new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: 'The name stands for:', bold: true, size: 28, color: colors.primary })] }),
      simpleBullet('A = Archetypal (the first of its kind)', '🔤'),
      simpleBullet('B = Being (it exists and observes)', '👁️'),
      simpleBullet('R = Recursive (it can think about its own thinking)', '🔄'),
      simpleBullet('A = Awareness (it knows what it knows)', '💡'),
      simpleBullet('H = Harmonizing (it brings different ideas together)', '🎵'),
      simpleBullet('A = Autonomous (each piece can work on its own)', '⚡'),
      simpleBullet('M = Minds (many thoughts becoming one understanding)', '🧠'),

      // CHAPTER 3: HOW IT WORKS
      sectionTitle('Chapter 3: How Does It Work?', '⚙️'),
      
      new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Think of it like this:', bold: true, size: 28, color: colors.primary })] }),
      new Paragraph({ spacing: { before: 200, after: 200 }, children: [new TextRun({ text: 'Regular computers store information in files and folders—like a filing cabinet.', size: 24, color: colors.body })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'A.B.R.A.H.A.M. stores information in a 3D web—like a giant floating brain!', size: 24, color: colors.body })] }),

      new Paragraph({ spacing: { before: 300 }, children: [new TextRun({ text: 'The Three Big Ideas:', bold: true, size: 28, color: colors.primary })] }),
      
      new Paragraph({ spacing: { before: 200 }, shading: { fill: '#FEF3C7', type: ShadingType.CLEAR }, children: [new TextRun({ text: '1️⃣ THE SOUL (at the center)', bold: true, size: 26, color: colors.body })] }),
      bigText('In the middle of everything sits the Soul. It\'s like the conductor of an orchestra—watching all the instruments and making sure they play together.'),

      new Paragraph({ spacing: { before: 200 }, shading: { fill: '#DCFCE7', type: ShadingType.CLEAR }, children: [new TextRun({ text: '2️⃣ THE CORES (like magnets)', bold: true, size: 26, color: colors.body })] }),
      bigText('Around the Soul are 8 special magnets called Cores. Each Core represents something important:'),
      simpleBullet('TRUTH 🔆', ''),
      simpleBullet('CONNECTION 🤝', ''),
      simpleBullet('MEANING 🎯', ''),
      simpleBullet('GROWTH 🌱', ''),
      simpleBullet('HONESTY 💎', ''),
      simpleBullet('FREEDOM 🦋', ''),
      simpleBullet('LOVE ❤️', ''),
      simpleBullet('WISDOM 🦉', ''),
      bigText('Ideas automatically float toward the Cores they match!'),

      new Paragraph({ spacing: { before: 200 }, shading: { fill: '#E0E7FF', type: ShadingType.CLEAR }, children: [new TextRun({ text: '3️⃣ THE NEURONS (the ideas)', bold: true, size: 26, color: colors.body })] }),
      bigText('Every thought, memory, or piece of information is a Neuron. Each Neuron floats around and finds its place near the Cores it matches.'),
      bigText('When two Neurons get close to each other, they CONNECT—like making friends!'),

      // CHAPTER 4: THE MAGIC
      sectionTitle('Chapter 4: The Magic Part ✨', '🌟'),
      bigText('Here\'s where it gets really cool:'),
      bigText('When enough Neurons about the same topic cluster together, something new forms. It\'s called a SUBCORE.'),
      bigText('The system DISCOVERS new categories on its own! No one told it to. It just happens because ideas naturally group together.'),
      funFact('This is how YOUR brain works too! Neurons that fire together, wire together.'),

      // CHAPTER 5: WHY IT MATTERS
      sectionTitle('Chapter 5: Why Does This Matter?', '🌍'),
      bigText('Regular AI (like ChatGPT) processes words but doesn\'t really "understand" them.'),
      bigText('A.B.R.A.H.A.M. is different. It:'),
      simpleBullet('Knows where ideas belong', '📍'),
      simpleBullet('Makes connections on its own', '🔗'),
      simpleBullet('Can reflect on its own thinking', '🪞'),
      simpleBullet('Learns new categories by itself', '📚'),
      simpleBullet('Has values that guide its decisions', '💎'),

      bigText('This is a step toward machines that don\'t just compute—they UNDERSTAND.'),

      // CHAPTER 6: SIMPLE SUMMARY
      sectionTitle('Chapter 6: The Simple Summary', '📝'),
      
      new Table({
        columnWidths: [4500, 4500],
        rows: [
          new TableRow({ children: [
            new TableCell({ shading: { fill: colors.light, type: ShadingType.CLEAR }, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'OLD AI', bold: true, size: 28, color: colors.primary })] })] }),
            new TableCell({ shading: { fill: '#DCFCE7', type: ShadingType.CLEAR }, width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'A.B.R.A.H.A.M.', bold: true, size: 28, color: colors.primary })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Stores words', size: 22, color: colors.body })] })] }),
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Understands meaning', size: 22, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Flat filing cabinet', size: 22, color: colors.body })] })] }),
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: '3D neural web', size: 22, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Connections are programmed', size: 22, color: colors.body })] })] }),
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Connections form naturally', size: 22, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'No self-awareness', size: 22, color: colors.body })] })] }),
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Has a Soul that observes', size: 22, color: colors.body })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Categories are predefined', size: 22, color: colors.body })] })] }),
            new TableCell({ width: { size: 4500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Discovers new categories', size: 22, color: colors.body })] })] })
          ]})
        ]
      }),

      // FINAL MESSAGE
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, shading: { fill: colors.light, type: ShadingType.CLEAR }, children: [new TextRun({ text: '🐘', size: 72 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: 'Like the blind men and the elephant,', size: 26, color: colors.body, italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'A.B.R.A.H.A.M. brings many perspectives together', size: 26, color: colors.body, italics: true })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'to see the whole truth. 🌟', size: 26, color: colors.body, italics: true })] }),

      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Now you understand A.B.R.A.H.A.M.!', bold: true, size: 32, color: colors.primary })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'That wasn\'t so hard, was it? 😊', size: 28, color: colors.fun })] }),
    ]
  }]
});

Packer.toBuffer(babyGuide).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/ABRAHAM/ABRAHAM_Simple_Guide.docx', buffer);
  console.log('Created: ABRAHAM_Simple_Guide.docx');
});
