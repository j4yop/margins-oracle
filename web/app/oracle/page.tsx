'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OraclePage() {
  const [endpoint, setEndpoint] = useState(typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : 'https://margins-mcp.example.com/api/mcp');
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

  const exampleCall = `# Discover the oracle
$ curl ${endpoint.replace('/api/mcp', '')}/.well-known/mcp.json

# Call it from any agent (raw JSON-RPC)
$ curl -X POST ${endpoint} \\
    -H "Content-Type: application/json" \\
    -d '{
      "jsonrpc": "2.0",
      "method": "tools/call",
      "params": {
        "name": "fair_price_band",
        "arguments": {
          "gtin": "8901058851649",
          "city": "Madurai",
          "quantity": 1
        }
      },
      "id": 1
    }'

# → { "band": { "low": 248, "median": 252, "high": 258 },
#      "verdict": "fair",
#      "sources": [...] }`;

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
    <main className="min-h-screen bg-bone text-ink">
      <header className="px-5 py-6 border-b-2 border-ink flex items-baseline justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl">margins-mcp</h1>
            <span className="px-2 py-0.5 bg-signal text-bone font-mono text-[10px] uppercase tracking-widest">★ the killer beat</span>
          </div>
          <p className="mt-1 font-mono text-xs text-ghost">
            The oracle, as <em>infrastructure</em>. Any other AI agent in India can call MARGINS as a tool.
          </p>
        </div>
        <Link href="/" className="font-mono text-xs underline">← home</Link>
      </header>

      <section className="px-5 py-8 max-w-4xl mx-auto">
        <div className="slab p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-ghost">endpoint</div>
          <div className="mt-2 flex gap-2">
            <input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-ink font-mono text-sm bg-paper"
            />
            <button
              onClick={() => copy(endpoint)}
              className="px-3 py-2 border-2 border-ink font-mono text-xs"
            >
              {copied ? '✓' : 'copy'}
            </button>
          </div>
        </div>
      </section>

      <section className="px-5 pb-8 max-w-4xl mx-auto">
        <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-2">configure in your agent</div>
        <pre className="bg-ink text-bone p-5 font-mono text-xs overflow-x-auto whitespace-pre border-2 border-ink">
{configSnippet}
        </pre>
      </section>

      <section className="px-5 pb-8 max-w-4xl mx-auto">
        <div className="font-mono text-xs uppercase tracking-widest text-ghost mb-2">call it (live demo)</div>
        <pre className="bg-ink text-bone p-5 font-mono text-xs overflow-x-auto whitespace-pre border-2 border-ink">
{exampleCall}
        </pre>
        <button
          onClick={tryIt}
          disabled={demoBusy}
          className="mt-3 px-4 py-2 bg-signal text-bone font-display border-2 border-ink shadow-brutal-sm disabled:opacity-40"
        >
          {demoBusy ? 'Calling…' : '▶ run live call to /api/mcp'}
        </button>
        {demoResult && (
          <pre className="mt-3 bg-bone border-2 border-ink p-4 font-mono text-xs overflow-x-auto">
            {JSON.stringify(demoResult, null, 2).slice(0, 1500)}
            {JSON.stringify(demoResult).length > 1500 ? '\n… (truncated)' : ''}
          </pre>
        )}
      </section>

      <section className="px-5 py-10 max-w-4xl mx-auto border-t-2 border-ink">
        <h2 className="font-display text-2xl">What is this?</h2>
        <p className="mt-3 leading-relaxed">
          <strong>Model Context Protocol (MCP)</strong> is the open standard for tool-calling between AI agents.
          MARGINS exposes its fairness-oracle as an MCP server. The three tools it ships:
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="border-2 border-ink p-3 bg-paper">
            <div className="font-display text-base">fair_price_band</div>
            <div className="mt-1 text-ink/70">Compute a fair-price band for any Indian product by GTIN + city. Returns verdict + sources.</div>
          </div>
          <div className="border-2 border-ink p-3 bg-paper">
            <div className="font-display text-base">place_beckn_order</div>
            <div className="mt-1 text-ink/70">Order the product through ONDC Beckn at the cheapest fair price. Real round-trip.</div>
          </div>
          <div className="border-2 border-ink p-3 bg-paper">
            <div className="font-display text-base">query_margins_ledger</div>
            <div className="mt-1 text-ink/70">Query a merchant's transaction history. "What did I sell last Tuesday?" answered in plain language.</div>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed">
          This is the reframe: <em>not a chatbot, not a buyer app, not a shopping assistant — infrastructure for the entire Indian commerce agent ecosystem.</em>
        </p>
      </section>

      <footer className="px-5 py-8 max-w-4xl mx-auto border-t-2 border-ink font-mono text-xs text-ghost">
        Spec: <a href="https://modelcontextprotocol.io" className="underline">modelcontextprotocol.io</a> ·
        Discovery: <a href="/.well-known/mcp.json" className="underline">/.well-known/mcp.json</a>
      </footer>
    </main>
  );
}