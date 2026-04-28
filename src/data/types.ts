export type EndingType = 'good' | 'bad' | 'neutral';

export interface Choice {
  label: string;
  nextNodeId: number;
  requiredItem: string | null;
  grantItem?: string | null;
}

export interface StoryNode {
  nodeId: number;
  text: string;
  choices: Choice[];
  endingType?: EndingType;
  endingTitle?: string;
}
