import fs from 'fs';
import path from 'path';

export interface MarkdownContent {
  content: string;
  title: string;
  sections: Section[];
}

export interface Section {
  title: string;
  content: string;
  level: number;
  id: string;
}

export function parseMarkdownFile(filename: string): MarkdownContent {
  const filePath = path.join(process.cwd(), 'doc', filename);
  const content = fs.readFileSync(filePath, 'utf-8');

  const lines = content.split('\n');
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let title = '';
  const usedIds = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('#')) {
      if (currentSection) {
        sections.push(currentSection);
      }

      const level = line.match(/^#+/)?.[0].length || 1;
      const sectionTitle = line.replace(/^#+\s*/, '').trim();

      if (level === 1 && !title) {
        title = sectionTitle;
      }

      // Generate base ID
      let baseId = sectionTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

      // Handle empty or invalid IDs
      if (!baseId || baseId === '-' || baseId === '') {
        baseId = `section-${i}`;
      }

      // Ensure unique ID
      let uniqueId = baseId;
      const count = usedIds.get(baseId) || 0;
      if (count > 0) {
        uniqueId = `${baseId}-${count}`;
      }
      usedIds.set(baseId, count + 1);

      currentSection = {
        title: sectionTitle,
        content: '',
        level,
        id: uniqueId,
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { content, title, sections };
}

export function getDocumentList() {
  return [
    { id: 'general', filename: 'general.md' },
    { id: 'hiring', filename: 'hiring-plan-detailed.md' },
    { id: 'timeline', filename: '4-month-launch-timeline.md' },
  ];
}

