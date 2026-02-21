const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
        LevelFormat } = require('docx');
const fs = require('fs');

// Colors - Midnight Code palette
const colors = {
  primary: '#020617',
  body: '#1E293B',
  secondary: '#64748B',
  accent: '#94A3B8',
  tableBg: '#F8FAFC',
};

const doc = new Document({
  styles: {
    default: { 
      document: { 
        run: { font: 'Calibri', size: 22 } 
      } 
    },
    paragraphStyles: [
      { 
        id: 'Name', name: 'Name', basedOn: 'Normal',
        run: { size: 56, bold: true, color: colors.primary, font: 'Times New Roman' },
        paragraph: { spacing: { after: 60 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'Subtitle', name: 'Subtitle', basedOn: 'Normal',
        run: { size: 24, color: colors.secondary, font: 'Calibri' },
        paragraph: { spacing: { after: 200 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'SectionHeader', name: 'Section Header', basedOn: 'Normal',
        run: { size: 26, bold: true, color: colors.primary, font: 'Times New Roman' },
        paragraph: { spacing: { before: 300, after: 120 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'JobTitle', name: 'Job Title', basedOn: 'Normal',
        run: { size: 24, bold: true, color: colors.body, font: 'Times New Roman' },
        paragraph: { spacing: { before: 160, after: 40 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'BodyText', name: 'Body Text', basedOn: 'Normal',
        run: { size: 22, color: colors.body, font: 'Calibri' },
        paragraph: { spacing: { after: 80, line: 276 }, alignment: AlignmentType.LEFT }
      }
    ]
  },
  numbering: {
    config: [
      {
        reference: 'skills-list',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      },
      {
        reference: 'proj1-list',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      },
      {
        reference: 'proj2-list',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      },
      {
        reference: 'proj3-list',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children: [
      // HEADER
      new Paragraph({
        style: 'Name',
        children: [new TextRun('QUIX "Q" MINNEN')]
      }),
      
      new Paragraph({
        style: 'Subtitle',
        children: [new TextRun('Software Developer | AI Systems | Autonomous Agents')]
      }),
      
      // Contact
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: '📧 ', size: 20 }),
          new TextRun({ text: 'RootlessOnline@proton.me', size: 20, color: colors.body }),
          new TextRun({ text: '   |   📱 ', size: 20 }),
          new TextRun({ text: '+31 6 37274885', size: 20, color: colors.body }),
          new TextRun({ text: '   |   📍 ', size: 20 }),
          new TextRun({ text: 'Rotterdam, Netherlands', size: 20, color: colors.body })
        ]
      }),

      // ADDRESSING BOTH COMPANIES
      new Paragraph({
        style: 'BodyText',
        shading: { fill: 'F0F4F8', type: ShadingType.CLEAR },
        children: [
          new TextRun({ text: 'To: DIJ Digital & AIStudio', bold: true, color: colors.primary })
        ]
      }),

      // ABOUT
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('ABOUT ME')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'I go by Q. ', bold: true }),
          new TextRun("I took an unconventional path. When I saw that traditional education wasn't keeping pace with AI's rapid evolution, I made a choice: step away from formal studies and dive deep into what's actually coming. Since then, I've been building autonomous AI systems, agent architectures, and exploring how machines can think, adapt, and evolve. I'm not looking for just a job—I'm looking for a team that's building what matters. Some of my current research is under wraps, but what I can share: I build systems that bridge software engineering and AI in ways most haven't imagined yet.")
        ]
      }),

      // SKILLS
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('SKILLS')]
      }),
      
      new Table({
        columnWidths: [4500, 4500],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                width: { size: 4500, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'Languages & Frameworks', bold: true, size: 22, color: colors.primary })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'TypeScript, JavaScript, Python', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'React, Node.js, Next.js', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Solidity (Blockchain/Smart Contracts)', size: 20 })] })
                ]
              }),
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                width: { size: 4500, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [new TextRun({ text: 'AI & Autonomous Systems', bold: true, size: 22, color: colors.primary })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Autonomous Agent Development', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'LLM Integration & Prompt Engineering', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Multi-Agent Systems & Orchestration', size: 20 })] })
                ]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                width: { size: 4500, type: WidthType.DXA },
                children: [
                  new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Emerging Tech', bold: true, size: 22, color: colors.primary })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'VR Development & Immersive Systems', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Blockchain, NFTs, Cryptocurrency', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Neural Network Architecture', size: 20 })] })
                ]
              }),
              new TableCell({
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                width: { size: 4500, type: WidthType.DXA },
                children: [
                  new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Tools & Platforms', bold: true, size: 22, color: colors.primary })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Git, Docker, REST APIs', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'SQL, NoSQL Databases', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Cloud Infrastructure & Deployment', size: 20 })] })
                ]
              })
            ]
          })
        ]
      }),

      // PROJECTS
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('PROJECTS')]
      }),
      
      // Anubis
      new Paragraph({
        style: 'JobTitle',
        children: [new TextRun('Anubis — Autonomous AI Agent Framework')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [new TextRun({ text: 'Personal Research & Development Project', italics: true, color: colors.secondary })]
      }),
      new Paragraph({
        numbering: { reference: 'proj1-list', level: 0 },
        children: [new TextRun({ text: 'Built an autonomous agent system capable of independent decision-making, multi-step task execution, and self-directed learning—exploring how AI can operate without constant human oversight.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'proj1-list', level: 0 },
        children: [new TextRun({ text: 'Implemented memory systems, personality frameworks, and emotional intelligence modules to create agents that maintain context across sessions and develop consistent behavioral patterns.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'proj1-list', level: 0 },
        children: [new TextRun({ text: 'Designed agent-to-agent communication protocols and collaborative problem-solving architectures.', size: 22, color: colors.body })]
      }),

      // Blockchain/VR
      new Paragraph({
        style: 'JobTitle',
        spacing: { before: 240 },
        children: [new TextRun('Blockchain & VR Development')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [new TextRun({ text: 'Various Client & Personal Projects', italics: true, color: colors.secondary })]
      }),
      new Paragraph({
        numbering: { reference: 'proj2-list', level: 0 },
        children: [new TextRun({ text: 'Developed smart contracts and NFT marketplaces on Ethereum ecosystem, handling wallet integrations and token economics.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'proj2-list', level: 0 },
        children: [new TextRun({ text: 'Built VR experiences and immersive applications, exploring the intersection of spatial computing and interactive design.', size: 22, color: colors.body })]
      }),

      // AI Automation
      new Paragraph({
        style: 'JobTitle',
        spacing: { before: 240 },
        children: [new TextRun('AI Automation & Process Optimization')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [new TextRun({ text: 'Ongoing Development', italics: true, color: colors.secondary })]
      }),
      new Paragraph({
        numbering: { reference: 'proj3-list', level: 0 },
        children: [new TextRun({ text: 'Created automated workflows using LLMs to reduce manual tasks and improve operational efficiency.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'proj3-list', level: 0 },
        children: [new TextRun({ text: 'Developed custom AI assistants and chatbots tailored to specific domain requirements.', size: 22, color: colors.body })]
      }),

      // EDUCATION
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('EDUCATION')]
      }),
      new Paragraph({
        style: 'JobTitle',
        children: [new TextRun('Computer Science (Self-Directed)')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'Focus: ', bold: true }),
          new TextRun('AI/ML, Neural Architectures, Autonomous Systems, Emerging Computing Paradigms')
        ]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'Note: ', italics: true, color: colors.secondary }),
          new TextRun({ text: "Chose to pursue hands-on AI development over traditional curriculum. The gap between academic CS and real-world AI was too wide to ignore. No regrets.", italics: true, color: colors.secondary })
        ]
      }),

      // WHAT I BRING
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('WHAT I BRING')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'For DIJ Digital: ', bold: true }),
          new TextRun('Strong foundation in software development, clean code practices, and building complex systems that scale. I understand that great software isn\'t just about code—it\'s about solving real problems.')
        ]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'For AIStudio: ', bold: true }),
          new TextRun('Deep familiarity with AI systems, LLMs, and how to actually implement AI in ways that deliver value—not just hype. I\'ve built autonomous agents from scratch; I know what works and what doesn\'t.')
        ]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'For Both: ', bold: true }),
          new TextRun('I\'m the bridge. I speak both languages—traditional software engineering AND cutting-edge AI. That\'s rare. And I\'m ready to use it.')
        ]
      }),

      // CLOSING
      new Paragraph({
        spacing: { before: 400 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "— Let's build something that matters —", italics: true, size: 20, color: colors.secondary })
        ]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/Quix_Minnen_Resume_v2.docx', buffer);
  console.log('Resume created: /home/z/my-project/download/Quix_Minnen_Resume_v2.docx');
});
