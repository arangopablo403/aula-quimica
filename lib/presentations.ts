import {ancestry, type Item} from './content';

export function presentationTopic(items: Item[], id: string) {
  const topic = items.find(item => item.id === id && item.kind === 'topic');
  return topic && ancestry(topic, items).some(item => item.kind === 'branch' || ['sub-metabolomica', 'sub-volatilomica'].includes(item.id)) ? topic : undefined;
}

export type Presentation = {id: string; title: string; pages: number};
