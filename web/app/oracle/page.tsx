'use client';

import { useState } from 'react';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default function OraclePage() {
  const [endpoint, setEndpoint] = useState(
    typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : 'https://margins-mcp.example.com/api/mcp'
  );
  const [copied, setCopied] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoBusy, setDemoBusy] = useState(false);

  const configSnippet = `// claude_desktop_config.json
{
  "mcpServers": {
    "margins": {
      "command": "npx",
      "args": ["-y", "margins-mcp"],
      "env": { "MARGINS_ENDPOINT": "${endpoint}" }
    }
  }
}`;

  const exampleCall = `# Discover the oracle manifest
$ curl ${endpoint.replace('/api/mcp', '')}/.well-known/mcp.json

# Call it from any external AI agent
$ curl -X POST ${endpoint} \\
    -H "Content-Type: application/json" \\
    -d '{
      "jsonrpc": "2.0",
      "method": "tools/call",
      "params": {
        "name": "fair_price_band",
        "arguments": { "gtin": "8901058851649", "city": "Madurai" }
      },
      "id": 1
    }'`;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function tryIt() {
    setDemoBusy(true);
    try {
      const r = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          id: Date.now(),
          params: { name: 'fair_price_band', arguments: { gtin: '8901058851649', city: 'Madurai' } },
        }),
      });
      const data = await r.json();
      setDemoResult(data);
    } catch (e) {
      setDemoResult({ error: String(e) });
    } finally {
      setDemoBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <SiteNav />

      <div className="max-w-md sm:max-w-xl mx-auto px-4 pt-6 pb-2 space-y-4">
        {/* HEADER */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-semibold mb-2">
            <span>⚡ Model Context Protocol (MCP)</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            margins-mcp Server
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            The oracle as <em>infrastructure</em>. Any AI agent in India can call MARGINS as a tool via JSON-RPC 2.0.
          </p>
        </div>

        {/* ENDPOINT CARD */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Public Tool Endpoint
          </span>
          <div className="flex gap-2">
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => copy(endpoint)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-mono text-xs hover:bg-slate-800 transition"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* CLAUDE DESKTOP CONFIG */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Wire into Claude Desktop / External Agent
          </span>
          <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
{configSnippet}
          </pre>
        </div>

        {/* LIVE TESTER */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Interactive Test Harness
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Amul Butter 500g
            </span>
          </div>

          <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
{exampleCall}
          </pre>

          <button
            onClick={tryIt}
            disabled={demoBusy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {demoBusy ? (
              <>
                <span className="live-dot" />
                <span>Executing JSON-RPC Call…</span>
              </>
            ) : (
              '▶ Run Live JSON-RPC Call to /api/mcp'
            )}
          </button>

          {demoResult && (
            <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
              {JSON.stringify(demoResult, null, 2)}
            </pre>
          )}
        </div>

        {/* THREE EXPOSED TOOLS */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Callable Tools Registered
          </span>
          <div className="space-y-2">
            {[
              {
                name: 'fair_price_band',
                desc: 'Compute fair-price band for any Indian product given GTIN + city + quantity. Backed by GS1, Agmarknet, ONDC.',
                badge: 'Primary Oracle',
              },
              {
                name: 'place_beckn_order',
                desc: 'Place an order through the ONDC Beckn network at the verified fair price.',
                badge: 'Commerce Action',
              },
              {
                name: 'query_margins_ledger',
                desc: 'Query a merchant history. "What did I buy last Tuesday?" answered with provenance.',
                badge: 'Fintech Memory',
              },
            ].map((t) => (
              <div key={t.name} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600">{t.name}</span>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {t.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}