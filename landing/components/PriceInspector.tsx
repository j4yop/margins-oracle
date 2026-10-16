'use client';

import { useState } from 'react';
import {
  BoxIcon,
  FileTextIcon,
  CheckIcon,
  ArrowRightIcon,
  Volume2Icon,
  ShieldCheckIcon,
  RupeeIcon,
} from './Icons';

interface SkuItem {
  id: string;
  type: 'barcode' | 'parchi';
  name: string;
  brand: string;
  gtin: string;
  category: string;
  mrp: number;
  quotedPrice: number;
  fairPrice: number;
  mandiRange: string;
  unitsPerCarton: number;
  marginSavings: number;
  verdict: 'OVERCHARGED' | 'FAIR' | 'AUDIT_ALERT';
  haggleHindi: string;
  haggleTamil: string;
  haggleEnglish: string;
  note: string;
}

const ITEMS: SkuItem[] = [
  {
    id: 'amul-butter',
    type: 'barcode',
    name: 'Amul Salted Butter 500g',
    brand: 'GCMMF · Amul Dairy',
    gtin: '8901058851649',
    category: 'Dairy FMCG',
    mrp: 280,
    quotedPrice: 275,
    fairPrice: 252,
    mandiRange: '₹248 – ₹254',
    unitsPerCarton: 20,
    marginSavings: 23,
    verdict: 'OVERCHARGED',
    haggleHindi: 'भैया, आज अमूल बटर का फेयर मंडी रेट ₹252 चल रहा है। आप ₹275 लगा रहे हैं। ₹252 पर बिल करिए या हम ONDC से सीधे मंगा रहे हैं।',
    haggleTamil: 'அண்ணா, இன்றைய அமுல் வெண்ணெய் நியாயமான மண்டி விலை ₹252. நீங்கள் ₹275 பில் செய்கிறீர்கள். ₹252-க்கு பில் போடுங்கள், இல்லை என்றால் ONDC-யில் ஆர்டர் செய்கிறேன்.',
    haggleEnglish: 'Bro, verified mandi benchmark for Amul 500g today is ₹252. You are billing ₹275. Match ₹252 or I dispatch directly via ONDC Beckn.',
    note: 'Distributor withholding regional summer rebate (+₹23/unit markup).',
  },
  {
    id: 'fortune-oil',
    type: 'barcode',
    name: 'Fortune Kachi Ghani 1L Pouch',
    brand: 'Adani Wilmar Ltd',
    gtin: '8906007280014',
    category: 'Edible Oils',
    mrp: 165,
    quotedPrice: 158,
    fairPrice: 142,
    mandiRange: '₹140 – ₹145',
    unitsPerCarton: 15,
    marginSavings: 16,
    verdict: 'OVERCHARGED',
    haggleHindi: 'फॉर्च्यून 1L का सरकारी एगमार्कनेट रेट ₹142 है। ₹16 प्रति पाउच ज्यादा मत लीजिए। 15 पाउच की पेटी पर ₹240 का नुकसान है।',
    haggleTamil: 'பார்ச்சூன் 1L மண்டி விலை ₹142 தான். ஒரு பாக்கெட்டுக்கு ₹16 அதிகமாக வசூலிக்கிறீர்கள். 15 பாக்கெட் அட்டைப்பெட்டிக்கு ₹240 மிச்சமாகும்.',
    haggleEnglish: 'Agmarknet wholesale benchmark is ₹142. Billed ₹158. Overcharging ₹16/pouch, causing ₹240 margin leakage per carton.',
    note: 'Wholesale mandi price fell 6% this week, but distributor did not pass discount.',
  },
  {
    id: 'parchi-bill',
    type: 'parchi',
    name: 'Handwritten Mandi Parchi #4092',
    brand: 'Sri Balaji Wholesale Depot',
    gtin: 'DOC-PARCHI-4092',
    category: 'Delivery Slip Audit',
    mrp: 12500,
    quotedPrice: 12500,
    fairPrice: 11660,
    mandiRange: 'Multi-SKU Basket',
    unitsPerCarton: 1,
    marginSavings: 840,
    verdict: 'AUDIT_ALERT',
    haggleHindi: 'पर्ची #4092 में 3 आइटमों पर पुरानी स्कीम लगा दी है। ₹840 का अधिक बिल बना है। तुरंत क्रेडिट नोट जारी करें।',
    haggleTamil: 'ரசீது #4092-ல் 3 பொருட்களுக்கு பழைய விலை போடப்பட்டுள்ளது. மொத்தம் ₹840 அதிகம். உடனடியாக கிரெடிட் நோட் கொடுங்கள்.',
    haggleEnglish: 'Gemini Multimodal OCR detected 3 line-item discrepancies on Parchi #4092. Total overcharge: ₹840. WhatsApp dispute claim generated.',
    note: 'Crumpled paper invoice audited in 2.3 seconds with Gemini 2.5 Vision OCR.',
  },
  {
    id: 'parle-g',
    type: 'barcode',
    name: 'Parle-G Gold Biscuits 1kg',
    brand: 'Parle Products',
    gtin: '8901030865278',
    category: 'Packaged Snacks',
    mrp: 110,
    quotedPrice: 104,
    fairPrice: 96,
    mandiRange: '₹95 – ₹98',
    unitsPerCarton: 24,
    marginSavings: 8,
    verdict: 'OVERCHARGED',
    haggleHindi: 'पार्ले-जी गोल्ड का होलसेल भाव ₹96 है। पेटी पर ₹192 का फालतू मार्जिन काटा जा रहा है। ONDC कोटेशन सामने है।',
    haggleTamil: 'பார்லே-ஜி கோல்ட் மொத்த விலை ₹96. அட்டைப்பெட்டிக்கு ₹192 அதிக கட்டணம். ONDC மேற்கோள் காட்டுகிறது.',
    haggleEnglish: 'Verified ONDC distributor quote is ₹96. Direct margin recovery of ₹8/unit (₹192 per 24-pack carton).',
    note: 'Distributor bypassed trade promotional allowance of ₹8/pack.',
  },
  {
    id: 'tata-salt',
    type: 'barcode',
    name: 'Tata Iodized Salt 1kg',
    brand: 'Tata Consumer Products',
    gtin: '8901058850925',
    category: 'Pantry Staples',
    mrp: 25,
    quotedPrice: 22,
    fairPrice: 22,
    mandiRange: '₹21.5 – ₹22.5',
    unitsPerCarton: 30,
    marginSavings: 0,
    verdict: 'FAIR',
    haggleHindi: 'टाटा नमक का ₹22 का भाव बिल्कुल सही और निष्पक्ष है। रेट को वेरिफाई कर लिया गया है।',
    haggleTamil: 'டாடா உப்பு ₹22 விலை சரியானது மற்றும் நியாயமானது. சரிபார்க்கப்பட்டது.',
    haggleEnglish: 'Price verified fair! Distributor quote matches verified mandi wholesale benchmark exactly.',
    note: 'GS1 India registered MRP ₹25. Fair distributor rate verified at ₹22.',
  },
];

export default function PriceInspector({ demoUrl }: { demoUrl: string }) {
  const [activeId, setActiveId] = useState<string>('amul-butter');
  const [lang, setLang] = useState<'hi' | 'ta' | 'en'>('hi');

  const item = ITEMS.find((i) => i.id === activeId) || ITEMS[0];
  const cartonSavings = item.marginSavings * item.unitsPerCarton;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-card">
      {/* Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-100">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            onClick={() => setActiveId(it.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-sans font-semibold shrink-0 transition-all flex items-center gap-2 ${
              it.id === activeId
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            {it.type === 'parchi' ? (
              <FileTextIcon size={14} className={it.id === activeId ? 'text-orange-400' : 'text-slate-500'} />
            ) : (
              <BoxIcon size={14} className={it.id === activeId ? 'text-orange-400' : 'text-slate-500'} />
            )}
            <span>{it.name.split(' ')[0]} {it.name.split(' ')[1]}</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                it.verdict === 'FAIR'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {it.verdict === 'FAIR' ? 'FAIR' : `+₹${it.marginSavings}`}
            </span>
          </button>
        ))}
      </div>

      {/* Main Inspector Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Product & Pricing Metrics */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                {item.category}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                GTIN: {item.gtin}
              </span>
            </div>
            <h3 className="mt-2 font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              {item.brand} · {item.note}
            </p>
          </div>

          {/* Pricing Comparison Bento */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
              <div className="text-[10px] font-mono uppercase font-semibold text-slate-500 tracking-wider">
                Distributor Quote
              </div>
              <div className="mt-1 font-display font-extrabold text-2xl text-slate-900">
                ₹{item.quotedPrice}
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-slate-400 line-through">
                MRP ₹{item.mrp}
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 ring-1 ring-orange-300/40">
              <div className="text-[10px] font-mono uppercase font-semibold text-orange-700 tracking-wider">
                Fair Mandi Rate
              </div>
              <div className="mt-1 font-display font-extrabold text-2xl text-orange-600">
                ₹{item.fairPrice}
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-orange-700/80 font-medium">
                band {item.mandiRange}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 ring-1 ring-emerald-300/40">
              <div className="text-[10px] font-mono uppercase font-semibold text-emerald-700 tracking-wider">
                Recovered Margin
              </div>
              <div className="mt-1 font-display font-extrabold text-2xl text-emerald-600">
                {item.marginSavings > 0 ? `₹${item.marginSavings}` : '0'}
              </div>
              <div className="mt-0.5 text-[11px] font-mono text-emerald-700/80 font-medium">
                {item.unitsPerCarton > 1 ? `₹${cartonSavings}/carton` : 'Audit match'}
              </div>
            </div>
          </div>

          {/* Price Range Visual Bar */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-600 mb-2">
              <span>Fair Wholesale: ₹{item.fairPrice}</span>
              <span>Billed Price: ₹{item.quotedPrice}</span>
              <span>Pack MRP: ₹{item.mrp}</span>
            </div>
            <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (item.fairPrice / item.mrp) * 100)}%` }}
              />
              <div
                className="absolute left-0 top-0 bottom-0 bg-amber-500/80 rounded-full"
                style={{
                  left: `${(item.fairPrice / item.mrp) * 100}%`,
                  width: `${Math.max(0, ((item.quotedPrice - item.fairPrice) / item.mrp) * 100)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mandi Baseline
              </span>
              {item.marginSavings > 0 && (
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Distributor Leakage (+₹{item.marginSavings})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Haggle Voice Copilot & Direct Action */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Volume2Icon size={16} />
                </div>
                <div>
                  <div className="font-sans font-bold text-sm text-slate-900">
                    Dialect Negotiation Co-pilot
                  </div>
                  <div className="font-mono text-[10px] text-slate-500">
                    Powered by Gemini Audio TTS
                  </div>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-mono font-semibold">
                <button
                  onClick={() => setLang('hi')}
                  className={`px-2 py-0.5 rounded transition ${
                    lang === 'hi' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLang('ta')}
                  className={`px-2 py-0.5 rounded transition ${
                    lang === 'ta' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  தமிழ்
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded transition ${
                    lang === 'en' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Speech Dialogue Bubble */}
            <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200/90 shadow-subtle">
              <div className="text-[10px] font-mono uppercase tracking-wider text-orange-600 font-bold mb-1.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                Whispered Counter-Argument:
              </div>
              <p className="text-sm font-sans font-medium text-slate-800 leading-relaxed italic">
                &ldquo;
                {lang === 'hi'
                  ? item.haggleHindi
                  : lang === 'ta'
                  ? item.haggleTamil
                  : item.haggleEnglish}
                &rdquo;
              </p>
            </div>

            {/* Quick Proof Pills */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                <ShieldCheckIcon size={14} className="text-emerald-600 shrink-0" />
                <span className="text-slate-700 truncate">GS1 India verified</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
                <CheckIcon size={14} className="text-emerald-600 shrink-0" />
                <span className="text-slate-700 truncate">ONDC Beckn quotes</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
            <a
              href={`${demoUrl}/camera?${item.type === 'parchi' ? 'mode=parchi' : `gtin=${item.gtin}`}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs sm:text-sm font-bold shadow transition"
            >
              <span>Audit this SKU in Camera</span>
              <ArrowRightIcon size={14} />
            </a>
            <a
              href={`${demoUrl}/haggle`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-sans text-xs sm:text-sm font-semibold transition"
            >
              <span>Try Live Audio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
