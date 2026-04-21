import { RoadmapStep } from "@/types/roadmap";

export interface ContextNode {
  id: string;
  name: string;
  type: string;
}

export const MOCK_CONTEXT_NODES: ContextNode[] = [
  { id: 'ctx-1', name: 'Personal Finance Strategy', type: 'AREA' },
  { id: 'ctx-2', name: 'Q2 Goals: Wealth Building', type: 'GOAL' },
  { id: 'ctx-3', name: 'Reference: Tax Optimization', type: 'RESOURCE' },
];

export const MOCK_ROADMAP_DATA: RoadmapStep[] = [
  {
    id: 'step-1',
    title: 'Audit Current Financial Statements',
    status: 'completed',
    parentStepId: null,
    definitionOfDone: 'All bank accounts and investment portals have been reviewed for the last 30 days.',
    prompt: 'Analyze the provided bank statements and identify recurring expenses that can be eliminated.',
    contextNodes: [MOCK_CONTEXT_NODES[0]],
  },
  {
    id: 'step-2',
    title: 'Identify High-Interest Debt',
    status: 'todo',
    parentStepId: 'step-1', // Child of Audit
    definitionOfDone: 'List of all debts with interest rates > 5% consolidated.',
    prompt: 'Review the debt spreadsheet and rank them by interest rate. Suggest a snowball vs. avalanche approach.',
    contextNodes: [MOCK_CONTEXT_NODES[0]],
  },
  {
    id: 'step-3',
    title: 'Set Up Automated Savings Transfer',
    status: 'todo',
    parentStepId: null,
    definitionOfDone: 'A recurring transfer of at least 15% of income is active.',
    prompt: 'Draft a message to the bank representative to initiate a monthly sweep to the high-yield savings account.',
    contextNodes: [MOCK_CONTEXT_NODES[1]],
  },
  {
    id: 'step-4',
    title: 'Review Investment Allocation',
    status: 'todo',
    parentStepId: null,
    definitionOfDone: 'Current portfolio matches the 80/20 risk profile established in Q1.',
    prompt: 'Compare current asset distribution against the target 80% equities / 20% bonds split.',
    contextNodes: [MOCK_CONTEXT_NODES[1], MOCK_CONTEXT_NODES[2]],
  },
  {
    id: 'step-5',
    title: 'Finalize Retirement Projection',
    status: 'todo',
    parentStepId: 'step-4', // Child of Review Investment
    definitionOfDone: 'projection model updated with new savings rate and tax assumptions.',
    prompt: 'Run the Monte Carlo simulation based on the updated $5k/mo savings rate and 7% annual return.',
    contextNodes: [MOCK_CONTEXT_NODES[0], MOCK_CONTEXT_NODES[2]],
  },
];
