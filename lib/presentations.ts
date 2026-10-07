import {ancestry, type Item} from './content';

export function presentationTopic(items: Item[], id: string) {
  const topic = items.find(item => item.id === id && (item.kind === 'topic' || (item.kind === 'unit' && item.parent === 'pregrado-volatilomica' && Number(item.volatileWeek) >= 1 && Number(item.volatileWeek) <= 6)));
  return topic && ancestry(topic, items).some(item => item.kind === 'course' || item.kind === 'branch') ? topic : undefined;
}

export type Presentation = {id: string; title: string; pages: number};
