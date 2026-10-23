"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('webhook');
  const [action, setAction] = useState('http');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://automationroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'workflow') {
        setWorkflows(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://automationroom.devdynamo713.com/room/${params.id}/workflows`);
      if (res.ok) setWorkflows(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addWorkflow = async () => {
    const data = { name, trigger, action, status: 'active' };
    await fetch(`https://automationroom.devdynamo713.com/room/${params.id}/workflow`, { method: 'POST', body: JSON.stringify(data) });
    setName('');
  };
  const statusColor: Record<string, string> = { active: '#4ade80', paused: '#fbbf24', error: '#f87171', draft: '#a1a1aa' };
  const healthScore = workflows.length > 0 ? Math.round(workflows.reduce((s, w) => {
    if (w.status === 'error') return s;
    if (w.status === 'draft') return s + 25;
    if (w.status === 'paused') return s + 50;
    return s + w.successRate;
  }, 0) / workflows.length) : 100;
  const totalRuns = workflows.reduce((s, w) => s + w.runs, 0);
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>AutomationRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, border: `1px solid ${healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171'}`, borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Fleet Health</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171' }}>{healthScore}%</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Total Runs</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>{totalRuns}</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Workflows</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a78bfa' }}>{workflows.length}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="workflow name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className="trigger-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="schedule">schedule</option>
          <option value="webhook">webhook</option>
          <option value="event">event</option>
          <option value="manual">manual</option>
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="action-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="http">http</option>
          <option value="email">email</option>
          <option value="database">database</option>
          <option value="notification">notification</option>
          <option value="script">script</option>
        </select>
        <button className="add-btn" onClick={addWorkflow} disabled={!name.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Create Workflow</button>
      </div>
      <div className="workflow-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {workflows.map(w => (
          <div key={w.id} style={{ padding: 16, border: `1px solid ${statusColor[w.status]}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: statusColor[w.status] }}>{w.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>{w.trigger} → {w.action}</div>
            <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>Runs: {w.runs} | Success: {w.successRate}%</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: statusColor[w.status], textTransform: 'uppercase' }}>{w.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}