const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
        Header, Footer, PageNumber, LevelFormat } = require('docx');
const fs = require('fs');

// Colors - Midnight Code palette
const colors = {
  primary: '#020617',      // Midnight Black
  body: '#1E293B',         // Deep Slate Blue  
  secondary: '#64748B',    // Cool Blue-Gray
  accent: '#94A3B8',       // Steady Silver
  tableBg: '#F8FAFC',      // Glacial Blue-White
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
        id: 'Name', 
        name: 'Name', 
        basedOn: 'Normal',
        run: { size: 56, bold: true, color: colors.primary, font: 'Times New Roman' },
        paragraph: { spacing: { after: 60 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'Subtitle', 
        name: 'Subtitle', 
        basedOn: 'Normal',
        run: { size: 24, color: colors.secondary, font: 'Calibri' },
        paragraph: { spacing: { after: 200 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'SectionHeader', 
        name: 'Section Header', 
        basedOn: 'Normal',
        run: { size: 26, bold: true, color: colors.primary, font: 'Times New Roman' },
        paragraph: { spacing: { before: 300, after: 120 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'JobTitle', 
        name: 'Job Title', 
        basedOn: 'Normal',
        run: { size: 24, bold: true, color: colors.body, font: 'Times New Roman' },
        paragraph: { spacing: { before: 160, after: 40 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'Company', 
        name: 'Company', 
        basedOn: 'Normal',
        run: { size: 22, italics: true, color: colors.secondary, font: 'Calibri' },
        paragraph: { spacing: { after: 80 }, alignment: AlignmentType.LEFT }
      },
      { 
        id: 'BodyText', 
        name: 'Body Text', 
        basedOn: 'Normal',
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
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      },
      {
        reference: 'exp-list-1',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      },
      {
        reference: 'exp-list-2',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } }
        }]
      },
      {
        reference: 'proj-list',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
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
      // HEADER - Name
      new Paragraph({
        style: 'Name',
        children: [new TextRun('QUIX MINNEN')]
      }),
      
      // Subtitle - Creative hook
      new Paragraph({
        style: 'Subtitle',
        children: [new TextRun('Software Developer | AI Systems Architect')]
      }),
      
      // Contact Info Line
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: '📧  ', font: 'Calibri', size: 20 }),
          new TextRun({ text: 'RootlessOnline@proton.me', font: 'Calibri', size: 20, color: colors.body }),
          new TextRun({ text: '   |   📱  ', font: 'Calibri', size: 20 }),
          new TextRun({ text: '+31 6 37274885', font: 'Calibri', size: 20, color: colors.body }),
          new TextRun({ text: '   |   📍  ', font: 'Calibri', size: 20 }),
          new TextRun({ text: 'Rotterdam, Netherlands', font: 'Calibri', size: 20, color: colors.body })
        ]
      }),

      // PROFESSIONAL SUMMARY
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('ABOUT')]
      }),
      new Paragraph({
        style: 'BodyText',
        children: [
          new TextRun({ text: 'People call me Q. ', bold: true }),
          new TextRun("I've been working with AI and software development for years, building autonomous systems that push boundaries. When I recognized that traditional education wasn't keeping pace with AI's evolution, I made a choice: dive deep into the future rather than study the past. Some of my current work explores new frontiers in AI architecture—details I can't share publicly yet. What I can say: I build systems that think, adapt, and evolve. I'm looking for a team that values innovation over convention.")
        ]
      }),

      // SKILLS
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('SKILLS')]
      }),
      
      // Skills Table
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
                  new Paragraph({ children: [new TextRun({ text: 'AI & Automation', bold: true, size: 22, color: colors.primary })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Autonomous Agent Development', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'LLM Integration & Prompt Engineering', size: 20 })] }),
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Process Automation & AI Workflows', size: 20 })] })
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
                  new Paragraph({ numbering: { reference: 'skills-list', level: 0 }, children: [new TextRun({ text: 'Cloud Infrastructure', size: 20 })] })
                ]
              })
            ]
          })
        ]
      }),

      // EXPERIENCE
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('EXPERIENCE')]
      }),

      // AIStudio
      new Paragraph({
        style: 'JobTitle',
        children: [new TextRun('AI Developer')]
      }),
      new Paragraph({
        style: 'Company',
        children: [new TextRun('AIStudio — Rotterdam, Netherlands')]
      }),
      new Paragraph({
        numbering: { reference: 'exp-list-1', level: 0 },
        children: [new TextRun({ text: 'Contributed to AI Connect platform, building intelligent automation solutions for enterprise clients seeking to reduce manual workflows and improve operational efficiency through machine learning integration.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'exp-list-1', level: 0 },
        children: [new TextRun({ text: 'Designed and implemented AI assistants that automate repetitive business processes, enabling organizations to redirect human effort toward higher-value strategic work.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'exp-list-1', level: 0 },
        children: [new TextRun({ text: 'Collaborated with cross-functional teams to identify automation opportunities and translate business requirements into scalable AI-powered solutions.', size: 22, color: colors.body })]
      }),

      // DIJ Digital
      new Paragraph({
        style: 'JobTitle',
        spacing: { before: 240 },
        children: [new TextRun('Software Developer')]
      }),
      new Paragraph({
        style: 'Company',
        children: [new TextRun('DIJ Digital — Apeldoorn/Amsterdam, Netherlands')]
      }),
      new Paragraph({
        numbering: { reference: 'exp-list-2', level: 0 },
        children: [new TextRun({ text: 'Developed complex digital platforms and web applications for diverse clients, focusing on robust backend architecture and seamless user experiences using Laravel and modern JavaScript frameworks.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'exp-list-2', level: 0 },
        children: [new TextRun({ text: 'Built scalable solutions that helped clients accelerate their digital transformation, working in dedicated development teams on long-term projects requiring deep technical expertise.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'exp-list-2', level: 0 },
        children: [new TextRun({ text: 'Collaborated in agile environments, participating in code reviews, architecture discussions, and continuous integration workflows to maintain code quality standards.', size: 22, color: colors.body })]
      }),

      // PROJECTS
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('PROJECTS')]
      }),
      
      new Paragraph({
        style: 'JobTitle',
        children: [new TextRun('Anubis — Autonomous AI Agent Framework')]
      }),
      new Paragraph({
        style: 'Company',
        children: [new TextRun('Personal Research Project')]
      }),
      new Paragraph({
        numbering: { reference: 'proj-list', level: 0 },
        children: [new TextRun({ text: 'Architected and built an autonomous agent system capable of independent decision-making, multi-step task execution, and self-directed learning—exploring how AI can operate without constant human oversight.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'proj-list', level: 0 },
        children: [new TextRun({ text: 'Implemented memory systems, personality frameworks, and emotional intelligence modules to create agents that maintain context across sessions and develop consistent behavioral patterns.', size: 22, color: colors.body })]
      }),
      new Paragraph({
        numbering: { reference: 'proj-list', level: 0 },
        children: [new TextRun({ text: 'Explored agent-to-agent communication protocols and collaborative problem-solving architectures, laying groundwork for future autonomous systems.', size: 22, color: colors.body })]
      }),

      // EDUCATION
      new Paragraph({
        style: 'SectionHeader',
        children: [new TextRun('EDUCATION')]
      }),
      new Paragraph({
        style: 'JobTitle',
        children: [new TextRun('Computer Science (Ongoing)')]
      }),
      new Paragraph({
        style: 'Company',
        children: [new TextRun('Self-directed study with focus on AI/ML, neural architectures, and emerging computing paradigms')]
      }),

      // FOOTER - Mysterious but professional
      new Paragraph({
        spacing: { before: 400 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "— Some things are better discussed in person —", italics: true, size: 20, color: colors.secondary })
        ]
      })
    ]
  }]
});

// Save the document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/z/my-project/download/Quix_Minnen_Resume.docx', buffer);
  console.log('Resume created: /home/z/my-project/download/Quix_Minnen_Resume.docx');
});
