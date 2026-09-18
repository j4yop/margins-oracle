# MARGINS — Strategic Product & Architectural Specification

**System:** MARGINS (Multimodal Autonomous Retail Grounding & Intelligence Network for Shopkeepers)  
**Domain:** Unorganized Retail, Wholesale Trade Scheme Auditing, ONDC Open Commerce  
**Target Users:** 63 Million Indian MSME Retailers (Kiranas, General Stores, Paan Shops)  

---

## 1. Executive Summary & Problem Statement

India’s 63 million unorganized retail merchants (Kiranas) form the backbone of the domestic retail economy, generating over $800 billion in annual gross merchandise value. Yet, these shopkeepers operate under extreme information and power asymmetry:

1. **Wholesale Information Asymmetry:** When purchasing inventory from FMCG truck distributors, shopkeepers lack real-time benchmark wholesale pricing. They frequently pay arbitrary surcharges ranging from 8% to 25% over fair mandi or primary distributor rates.
2. **Trade Spend & Scheme Leakage (₹45,000 Cr Annual Loss):** Consumer brands allocate massive trade promotion budgets ("Buy 10 boxes get 1 free", cash rebates, volume discounts). Unscrupulous intermediate distributors routinely withhold these free goods and margin rebates, delivering handwritten slips (*parchis*) that omit statutory schemes.
3. **The Udhaar Credit Trap:** Shopkeepers are forced to accept vendor credit terms without knowing their implicit annual percentage yield (APY), while distributor disputes result in immediate delivery blacklisting.
4. **Tooling Desert:** Existing commerce platforms are almost exclusively buyer-facing consumer apps (e.g. quick commerce, consumer chatbots). There has been no autonomous, merchant-side fairness oracle.

**MARGINS** solves this by providing an autonomous, multimodal wholesale intelligence rail:
- **Dual-Mode Intake:** Shopkeepers point their mobile camera at either retail barcodes (EAN-13 / UPC) or grease-stained handwritten delivery invoices (*parchis*).
- **Multimodal Intelligence:** Gemini 2.5 multimodal vision extracts line items, quantities, and rates, comparing them against official trade scheme matrices and mandi wholesale benchmarks.
- **Instant Dispute Leverage:** 1-tap WhatsApp statutory dispute notices generated in native regional languages (Tamil, Hindi, Marathi, etc.) with legal backing.
- **Open Commerce Execution:** Direct multi-distributor quotation discovery over ONDC Beckn v1.2 with automated fair-settlement payment locks over dynamic UPI.
- **Programmable Infrastructure:** The entire intelligence layer is exposed as a standardized Model Context Protocol (`margins-mcp`) server, making it callable by any AI agent, ERP, or conversational assistant.

---

## 2. Core Architectural Pillars

```
┌─────────────────────────────────────────────────────────────┐
│  Pillar 1: PERCEPTION & INTAKE                              │
│  - Mobile Camera Barcode Scanner (BarcodeDetector API)       │
│  - Gemini 2.5 Flash Vision OCR for crumpled delivery parchis│
│  - GS1 India Verified Product Master Registry               │
│  - Real-time Agmarknet Govt Mandi Price Benchmarks          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│  Pillar 2: REASONING & SCHEME AUDIT ENGINE                  │
│  - Multimodal Line-Item Extraction & Scheme Gap Detection   │
│  - 5-Source Statistical Wholesale Price Band Estimation    │
│  - Trade Spend Leakage Calculation (Stolen Freebies/Margin) │
│  - Structured Zod Schema & JSON-LD Object Modeling          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│  Pillar 3: ACTION & OPEN COMMERCE SETTLEMENT                │
│  - 1-Tap WhatsApp Regional Dispute Generator                │
│  - Dynamic UPI Fair Amount Settlement Lock                  │
│  - ONDC Beckn v1.2 Protocol Client (Search/Select/Init/Conf)│
│  - Dialect Haggling & Udhaar Credit Interest Estimator      │
│  - JSON-RPC 2.0 Model Context Protocol (MCP) Server         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Operational Capability & Verification Matrix

| Architectural Capability | Layer / Scope | Operational Status | Production Verification |
|---|---|---|---|
| **Autonomous Merchant Oracle** | Strategic Design | Verified | Completely seller-centric architecture designed around merchant cash flows rather than consumer cart checkout. |
| **Dual-Mode Intake** | Ingestion Engine | Verified | Browser-native barcode detection paired with robust Gemini 2.5 multimodal vision for crumpled handwritten slips. |
| **FMCG Trade Scheme Auditor** | Business Logic | Verified | Automatically checks manufacturer trade promotion policies, highlights missing promo freebies, and calculates exact ₹ leakage. |
| **Regional Dispute Automation** | Action Protocol | Verified | Dispatches structured dispute notifications directly to distributor WhatsApp numbers in Hindi, Tamil, and English. |
| **Dynamic UPI Settlement Lock** | Financial Layer | Verified | Generates dynamic UPI links (NPCI format) pre-filled with the calculated fair price minus unapplied scheme credits. |
| **ONDC Beckn v1.2 Client** | Commerce Protocol | Verified | Canonical JSON-LD handshake across Discovery, Provider Selection, Initialization, and Confirmation states. |
| **Model Context Protocol (MCP)** | Extensibility | Verified | Standard JSON-RPC 2.0 interface exposing `/api/mcp` and `/.well-known/mcp.json` for external autonomous agent orchestration. |
| **Zero-Cost Infra Footprint** | Cloud Economics | Verified | Operates with zero paid cloud dependencies, utilizing serverless Next.js edge handlers and optimized Gemini API calls. |

---

## 4. Perception & Multimodal Intelligence Tier

### Multimodal Vision for Handwritten Parchi Invoices
Paper delivery slips in Indian wholesale markets are written in ballpoint pen on carbon paper or receipt pads, frequently smeared with grease, stamped with distributor seals, and mixed with bilingual notations.

MARGINS utilizes Gemini 2.5 Flash's high-resolution vision reasoning to:
- Segment tabular line items, unit rates, quantities, and totals.
- Reconcile colloquial brand names (e.g., "Surf Smal 500" &rarr; *Surf Excel Quick Wash 500g*).
- Compare delivered quantities against brand trade discount matrices (e.g., *Cadbury 10+1 Scheme*, *Parle 5% Cash Rebate*).
- Flag discrepancies in bold red badges: missing free units, uncredited wholesale discounts, and computed rupee losses.

### Voice Negotiation & Udhaar Intelligence
The negotiation co-pilot equips shopkeepers with concrete counter-offers:
- Calculates the true annual interest rate (APY) when distributors offer extended credit (*udhaar*) at higher inventory unit prices.
- Formulates respectful yet firm dialect-specific counter-arguments (e.g. *"Mandi rate is ₹245, your invoice shows ₹270 with no 10+1 free carton. Check agmarknet and match it."*).

---

## 5. Open Commerce (ONDC Beckn) & Data Rails

MARGINS interfaces directly with India's digital public infrastructure:

1. **ONDC Beckn v1.2:**
   - Emits canonical JSON-LD payloads for `search`, `select`, `init`, and `confirm`.
   - Discovers alternative local distributors within the same pin code to break single-supplier monopolies.
2. **GS1 India Global Trade Item Number (GTIN):**
   - High-confidence product identification, packaging dimensions, manufacturer licensing, and Maximum Retail Price (MRP).
3. **Agmarknet (Ministry of Agriculture & Farmers Welfare):**
   - Daily wholesale agricultural commodity mandi price bulletins across Indian districts.
4. **Dynamic NPCI UPI Rails:**
   - Formulates instant UPI payment intents locking payment to the audited fair invoice amount.

---

## 6. Programmable Agent Infrastructure (`margins-mcp`)

MARGINS functions both as an interactive mobile application and as a foundational agentic tool for external systems. Any external LLM (Claude Desktop, Cursor, local agent runtimes) can query MARGINS using the Model Context Protocol:

### Registered MCP Tools

1. `audit_parchi_invoice`:
   - Inputs: Base64 image of handwritten slip or delivery invoice.
   - Outputs: Line items, scheme compliance status, stolen rebate amount, and WhatsApp dispute message.
2. `get_fair_procurement_price`:
   - Inputs: Product GTIN (barcode) and city name.
   - Outputs: Mandi benchmarks, ONDC multi-supplier quotes, calculated fair price band, and retail margin spread.
3. `resolve_udhaar_haggle`:
   - Inputs: Product name, distributor quote, payment terms (cash vs 30-day udhaar).
   - Outputs: True annualized credit cost and tactical negotiation script in requested dialect.
4. `order_via_beckn`:
   - Inputs: Selected supplier BPP ID, GTIN, quantity, delivery pin code.
   - Outputs: Full Beckn v1.2 JSON-LD order confirmation object.

---

## 7. Security, Resiliency & Verification

- **Hardened Security Rules:** Production Firestore security rules strictly isolate ledger records by merchant identity and validate schema payloads against injection attacks.
- **Failover & Graceful Degradation:** Automatic model fallback (Gemini 2.5 Flash with structured Zod parsing) ensures deterministic latency under high network jitter.
- **Mobile-First Touch Architecture:** Safe-area responsive navigation, thumb-zone quick actions, high-contrast daylight visibility, and offline-resilient local caches ensure usability on budget Android and iOS smartphones in noisy wholesale markets.