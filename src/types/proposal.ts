export interface ScopeItem {
  deliverable: string;
  description: string;
}

export interface TimelineItem {
  phase: string;
  duration: string;
  description: string;
}

export interface PricingItem {
  item: string;
  qty: number;
  rate: number;
  total: number;
}

export interface ProposalStructure {
  title: string;
  clientName: string;
  freelancerName: string;
  date: string;
  executiveSummary: string;
  problem: string;
  solution: string;
  scopeOfWork: ScopeItem[];
  timeline: TimelineItem[];
  pricing: PricingItem[];
  currency: string;
  terms: string;
  nextSteps: string;
}
