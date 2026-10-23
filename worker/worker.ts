export interface Env { AUTOMATIONROOM_DO: DurableObjectNamespace; }
export class AutomationRoomDO {
  private state: DurableObjectState;
  private workflows: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/workflows' && request.method === 'GET') {
      return Response.json(Array.from(this.workflows.values()));
    }
    if (url.pathname === '/workflow' && request.method === 'POST') {
      const data = await request.json();
      const workflow = { ...data, id: crypto.randomUUID(), runs: 0, successRate: 100 };
      this.workflows.set(workflow.id, workflow);
      this.broadcast(JSON.stringify({ type: 'workflow', data: workflow }));
      return Response.json({ success: true, workflow });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.AUTOMATIONROOM_DO.idFromName(url.pathname);
    const stub = env.AUTOMATIONROOM_DO.get(id);
    return stub.fetch(request);
  }
}