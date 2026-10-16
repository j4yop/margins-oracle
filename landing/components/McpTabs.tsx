'use client';

import { useState } from 'react';
import { CopyIcon, CheckCheckIcon, ServerIcon, LinkIcon, StarIcon } from './Icons';

export default function McpTabs({
  mcpUrl,
  discoveryUrl,
}: {
  mcpUrl: string;
  discoveryUrl: string;
}) {
  const [tab, setTab] = useState<'claude' | 'cursor' | 'curl' | 'python'>('claude');
  const [copied, setCopied] = useState<boolean>(false);

  const SNIPPETS = {
    claude: `{
  "mcpServers": {
    "margins-oracle": {
      "command": "curl",
      "args": ["-s", "-X", "POST", "${mcpUrl}"]
    }
  }
}`,
    cursor: `{
  "mcpServers": {
    "margins": {
      "url": "${mcpUrl}",
      "transport": "http"
    }
  }
}`,
    curl: `curl -X POST ${mcpUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 1,
    "params": {
      "name": "fair_price_band",
      "arguments": {
        "gtin": "8901058851649",
        "city": "Bengaluru"
      }
    }
  }'`,
    python: `import requests

payload = {
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 1,
    "params": {
        "name": "fair_price_band",
        "arguments": {"gtin": "8901058851649", "city": "Bengaluru"}
    }
}
resp = requests.post("${mcpUrl}", json=payload)
print(resp.json()["result"])`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-950 p-6 sm:p-8 shadow-2xl text-white">
      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          <button
            onClick={() => setTab('claude')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              tab === 'claude'
                ? 'bg-orange-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Claude Desktop
          </button>
          <button
            onClick={() => setTab('cursor')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              tab === 'cursor'
                ? 'bg-orange-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cursor IDE
          </button>
          <button
            onClick={() => setTab('curl')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              tab === 'curl'
                ? 'bg-orange-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            cURL (HTTP)
          </button>
          <button
            onClick={() => setTab('python')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              tab === 'python'
                ? 'bg-orange-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Python SDK
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition border border-slate-700"
        >
          {copied ? (
            <>
              <CheckCheckIcon size={14} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon size={14} />
              <span>Copy Config</span>
            </>
          )}
        </button>
      </div>

      {/* Code window */}
      <div className="mt-4 relative">
        <div className="text-[11px] font-mono text-slate-500 mb-2 flex items-center justify-between">
          <span>
            {tab === 'claude' && 'Path: ~/Library/Application Support/Claude/claude_desktop_config.json'}
            {tab === 'cursor' && 'Path: ~/.cursor/mcp.json'}
            {tab === 'curl' && 'Terminal Command (Direct JSON-RPC 2.0)'}
            {tab === 'python' && 'Python 3 Integration'}
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">JSON-RPC 2.0 · Live</span>
        </div>

        <pre className="font-mono text-xs sm:text-[13px] text-slate-200 bg-slate-900/90 rounded-2xl p-4 sm:p-5 overflow-x-auto border border-slate-800/80 leading-relaxed">
          <code>{SNIPPETS[tab]}</code>
        </pre>
      </div>

      {/* Exposed tools footnote */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-orange-400 font-bold">fair_price_band</div>
          <div className="text-[10px] text-slate-400 mt-0.5">GS1 + Mandi median rates</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-orange-400 font-bold">audit_parchi_invoice</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Gemini Multimodal OCR</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-orange-400 font-bold">place_beckn_order</div>
          <div className="text-[10px] text-slate-400 mt-0.5">4-step Ed25519 ONDC ACK</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-orange-400 font-bold">query_margins_ledger</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Real-time savings store</div>
        </div>
      </div>
    </div>
  );
}
