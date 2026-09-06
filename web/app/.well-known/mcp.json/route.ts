/**
 * /.well-known/mcp.json — MCP server discovery
 *
 * Other agents discover our MCP server via this well-known file.
 * Spec: https://modelcontextprotocol.io/
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    schema_version: '1.0',
    name: 'margins-mcp',
    display_name: 'MARGINS — fairness oracle for Indian commerce',
    description: 'Returns fair-price bands for Indian products by GTIN. Backed by GS1 India, Agmarknet, ONDC Beckn live quotes, and Gemini reasoning.',
    endpoint: '/api/mcp',
    transport: 'http',
    tools: [
      {
        name: 'fair_price_band',
        description: 'Compute a fair-price band for an Indian product by GTIN, city, and quantity.',
        input_schema: {
          type: 'object',
          properties: {
            gtin: { type: 'string' },
            city: { type: 'string' },
            quantity: { type: 'number', default: 1 },
          },
          required: ['gtin', 'city'],
        },
      },
      {
        name: 'place_beckn_order',
        description: 'Place an order through the ONDC Beckn network at the cheapest fair price.',
        input_schema: {
          type: 'object',
          properties: {
            gtin: { type: 'string' },
            city: { type: 'string' },
            acceptPrice: { type: 'number' },
          },
          required: ['gtin', 'city'],
        },
      },
      {
        name: 'query_margins_ledger',
        description: 'Query a merchant\'s margins ledger for past transactions.',
        input_schema: {
          type: 'object',
          properties: {
            merchantId: { type: 'string' },
            limit: { type: 'number', default: 10 },
          },
          required: ['merchantId'],
        },
      },
    ],
    authentication: 'none (free tier)',
    rate_limits: 'fair use — Gemini API free tier',
    contact: 'hackathon entry — see README',
  });
}