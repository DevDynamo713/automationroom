export type TriggerType = 'schedule' | 'webhook' | 'event' | 'manual';
export type ActionType = 'http' | 'email' | 'database' | 'notification' | 'script';
export type WorkflowStatus = 'active' | 'paused' | 'error' | 'draft';
export interface Workflow { id: string; name: string; trigger: TriggerType; action: ActionType; status: WorkflowStatus; runs: number; lastRun?: string; successRate: number }
export function workflowHealth(w: Workflow): number {
  if (w.status === 'error') return 0;
  if (w.status === 'draft') return 25;
  if (w.status === 'paused') return 50;
  return Math.round(w.successRate);
}
export function fleetHealth(workflows: Workflow[]): number {
  if (workflows.length === 0) return 100;
  return Math.round(workflows.reduce((s, w) => s + workflowHealth(w), 0) / workflows.length);
}
export function totalRuns(workflows: Workflow[]): number {
  return workflows.reduce((s, w) => s + w.runs, 0);
}
export function formatWorkflow(w: Workflow): string { return `${w.name} [${w.trigger}→${w.action}] ${w.status} runs:${w.runs} ${w.successRate}%`; }