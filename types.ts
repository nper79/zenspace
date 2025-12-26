
export interface FengShuiReport {
  overallScore: number;
  potentialScore: number; 
  energyFlow: string;
  positives: string[];
  issues: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  elementalBalance: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  visualMapPrompt: string;
}

export interface WallImage {
  id: number;
  data: string;
  name: string;
  editedData?: string;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT',
  KEY_REQUIRED = 'KEY_REQUIRED'
}
