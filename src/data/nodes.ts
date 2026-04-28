import rawData from '../../assets/data.json';
import type { StoryNode } from './types';

const nodes = rawData as StoryNode[];
const byId = new Map<number, StoryNode>(nodes.map((n) => [n.nodeId, n]));

export function getNode(nodeId: number): StoryNode | undefined {
  return byId.get(nodeId);
}

export function isEnding(node: StoryNode | undefined): boolean {
  if (!node) return false;
  return node.choices.length === 0;
}

export const TOTAL_NODES = nodes.length;
