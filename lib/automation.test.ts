import { describe, it, expect } from 'vitest';
import { workflowHealth, fleetHealth, totalRuns, formatWorkflow } from './automation';
describe('automation', () => {
  it('workflowHealth active with 95% success = 95', () => {
    const w = { id: '1', name: 'deploy', trigger: 'webhook', action: 'http', status: 'active', runs: 100, successRate: 95 };
    expect(workflowHealth(w)).toBe(95);
  });
  it('workflowHealth error = 0', () => {
    const w = { id: '2', name: 'deploy', trigger: 'webhook', action: 'http', status: 'error', runs: 50, successRate: 60 };
    expect(workflowHealth(w)).toBe(0);
  });
  it('workflowHealth paused = 50', () => {
    const w = { id: '3', name: 'deploy', trigger: 'webhook', action: 'http', status: 'paused', runs: 50, successRate: 90 };
    expect(workflowHealth(w)).toBe(50);
  });
  it('fleetHealth averages correctly', () => {
    const workflows = [
      { id: '1', name: 'w1', trigger: 'schedule', action: 'email', status: 'active', runs: 100, successRate: 100 },
      { id: '2', name: 'w2', trigger: 'webhook', action: 'http', status: 'error', runs: 50, successRate: 50 }
    ];
    expect(fleetHealth(workflows)).toBe(50);
  });
  it('totalRuns sums correctly', () => {
    const workflows = [
      { id: '1', name: 'w1', trigger: 'schedule', action: 'email', status: 'active', runs: 100, successRate: 100 },
      { id: '2', name: 'w2', trigger: 'webhook', action: 'http', status: 'active', runs: 50, successRate: 90 }
    ];
    expect(totalRuns(workflows)).toBe(150);
  });
  it('formats correctly', () => {
    const w = { id: '1', name: 'deploy-prod', trigger: 'webhook', action: 'http', status: 'active', runs: 250, successRate: 98 };
    expect(formatWorkflow(w)).toBe('deploy-prod [webhook→http] active runs:250 98%');
  });
});